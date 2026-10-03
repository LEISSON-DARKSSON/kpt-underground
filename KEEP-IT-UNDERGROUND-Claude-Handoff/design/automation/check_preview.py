from pathlib import Path
from datetime import datetime, timezone
import json, os, shutil, sys
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
results=[]

def record(name,ok,**extra):
 results.append({'name':name,'status':'PASS' if ok else 'FAIL',**extra}); print(name, 'PASS' if ok else 'FAIL',flush=True)

with sync_playwright() as p:
 executable=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('google-chrome')
 browser=p.chromium.launch(executable_path=executable,headless=True)
 for width,height in [(1440,1000),(390,844),(320,800)]:
  page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
  page.set_default_timeout(5000)
  page.route('https://fonts.googleapis.com/**',lambda route:route.abort())
  page.route('https://fonts.gstatic.com/**',lambda route:route.abort())
  errors=[];commerce=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.on('request',lambda req:commerce.append(req.url) if ('fourthwall.com' in req.url and 'fonts' not in req.url) else None)
  page.set_content((root/'index.html').read_text(),wait_until='domcontentloaded')
  page.wait_for_timeout(700)
  record(f'{width}:home heading',page.locator('h1').inner_text()=='KEEP IT\nUNDERGROUND')
  overflow=page.evaluate('document.documentElement.scrollWidth > innerWidth')
  record(f'{width}:home no horizontal overflow',not overflow)
  page.screenshot(path=str(root/'evidence'/f'home-{width}.png'),full_page=False)
  page.evaluate("location.hash='shop'");page.wait_for_timeout(100)
  record(f'{width}:two product cards',page.locator('.product-card').count()==2)
  ratios=page.locator('.product-image-link img').evaluate_all('(imgs)=>imgs.map(el=>el.clientWidth / el.clientHeight)')
  record(f'{width}:artwork proportions preserved',all(abs(x-(1600/838))<0.03 for x in ratios),ratios=ratios)
  record(f'{width}:shop no horizontal overflow',not page.evaluate('document.documentElement.scrollWidth>innerWidth'))
  page.screenshot(path=str(root/'evidence'/f'shop-{width}.png'),full_page=True)
  page.locator('[data-filter="signal"]').click();record(f'{width}:filter signal',page.locator('.product-card').count()==1)
  page.locator('[data-filter="all"]').click()
  page.locator('.product-image-link[href="#product/signal"]').click();page.wait_for_timeout(100)
  record(f'{width}:product ID bound', 'SIGNAL' in page.locator('h1').inner_text())
  record(f'{width}:product no overflow',not page.evaluate('document.documentElement.scrollWidth>innerWidth'))
  page.screenshot(path=str(root/'evidence'/f'signal-{width}.png'),full_page=True)
  page.locator('[data-pdp-qty="1"]').click();record(f'{width}:quantity increments',page.locator('#pdp-quantity').inner_text()=='2')
  page.locator('[data-add="signal"]').click();record(f'{width}:cart opens',page.locator('#cart-dialog').evaluate('(el)=>el.open'))
  record(f'{width}:two items subtotal',page.evaluate('window.KIU_PREVIEW.subtotal()')==6800)
  page.locator('[data-cart-qty="signal:-1"]').click();record(f'{width}:quantity recalculates',page.evaluate('window.KIU_PREVIEW.subtotal()')==3400)
  page.keyboard.press('Escape');record(f'{width}:escape closes cart',not page.locator('#cart-dialog').evaluate('(el)=>el.open'))
  record(f'{width}:focus restored',page.evaluate('document.activeElement?.dataset.add')=='signal')
  page.evaluate("location.hash='product/subsurface'");page.wait_for_timeout(100)
  page.locator('[data-add="subsurface"]').click();record(f'{width}:distinct designs in cart',page.locator('.cart-row').count()==2)
  page.screenshot(path=str(root/'evidence'/f'cart-{width}.png'),full_page=False)
  # Native modal dialog must keep keyboard focus within the cart.
  for _ in range(18):page.keyboard.press('Tab')
  record(f'{width}:modal focus contained',page.evaluate('document.querySelector("#cart-dialog").contains(document.activeElement)'))
  page.locator('[data-preview-checkout]').click();page.wait_for_timeout(100)
  record(f'{width}:handoff correct subtotal',page.evaluate('window.KIU_PREVIEW.subtotal()')==6800)
  record(f'{width}:payment disabled',page.locator('.checkout-disabled').is_disabled())
  record(f'{width}:no payment/address inputs',page.locator('input').count()==0)
  record(f'{width}:handoff no overflow',not page.evaluate('document.documentElement.scrollWidth>innerWidth'))
  page.screenshot(path=str(root/'evidence'/f'handoff-{width}.png'),full_page=True)
  page.locator('[data-open-cart]').click();page.locator('[data-remove="signal"]').click();page.locator('[data-remove="subsurface"]').click()
  record(f'{width}:empty cart state',page.locator('.empty-cart').count()==1 and page.evaluate('window.KIU_PREVIEW.getCount()')==0)
  page.keyboard.press('Escape')
  if width<=680:
   page.locator('[data-menu]').click();record(f'{width}:mobile menu',page.locator('.nav').evaluate('(el)=>el.classList.contains("open")'))
  record(f'{width}:no JS errors',not errors,errors=errors)
  record(f'{width}:no commerce network calls',not commerce)
  record(f'{width}:noindex',page.locator('meta[name="robots"]').get_attribute('content')=='noindex,nofollow')
  page.wait_for_timeout(700)
  fontstate=page.locator('#font-status').get_attribute('data-state')
  results.append({'name':f'{width}:exact external font rendering','status':'PASS' if fontstate=='loaded' else 'BLOCKED','reason':None if fontstate=='loaded' else 'External fonts are disabled in this offline test suite. Exact source-font rendering requires a separate online browser check; it is NOT covered by these passing tests.'})
  page.close()
 page=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
 page.route('https://fonts.googleapis.com/**',lambda route:route.abort())
 page.route('https://fonts.gstatic.com/**',lambda route:route.abort())
 page.set_content((root/'index.html').read_text(),wait_until='domcontentloaded')
 record('Reduced motion CSS disables transition',page.locator('.btn-primary').first.evaluate('(el)=>getComputedStyle(el).transitionDuration')=='0s')
 page.close();browser.close()
report={'checkedAt':datetime.now(timezone.utc).isoformat(),'scope':'Local HTML prototype only. Not Fourthwall, deployed Next.js, payment, or full accessibility certification.','browser':'Chromium via Playwright set_content of authored HTML; file navigation blocked by runtime policy; agent-browser CLI not installed','checks':results,'passed':sum(r['status']=='PASS' for r in results),'failed':sum(r['status']=='FAIL' for r in results),'blocked':sum(r['status']=='BLOCKED' for r in results)}
(root/'evidence'/'preview-qa.json').write_text(json.dumps(report,indent=2))
print(json.dumps({k:report[k] for k in ['passed','failed','blocked']}))
for r in results:
 if r['status']=='FAIL':print(r)

sys.exit(1 if report['failed'] else 0)
