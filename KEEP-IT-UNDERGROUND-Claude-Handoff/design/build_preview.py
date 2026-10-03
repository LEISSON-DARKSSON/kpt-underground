from pathlib import Path
from PIL import Image
import io,base64,json,hashlib
root=Path(__file__).parent
products=[{
 'key':'signal','series':'SIGNAL','index':'01','title':'SIGNAL / 01','short':'Dark contours. A warm orange focal point.',
 'offerId':'74c2ace1-4f7c-469b-a607-5555432019b4','variantId':'b28b8e38-0bd5-4303-8641-7aed66648b45',
 'customizationId':'cud_6nZ6I9XbTF6ZWVLwPt6tFQ','platformState':'PRIVATE','plannedPriceCents':3400,
 'observedPrivateVariantPrice':16,'currency':'USD','purchasableInPrototype':False,
 'lead':'Make room for your next idea.',
 'description':'SIGNAL / 01 combines a charcoal background, flowing contour lines and a warm orange focal point. The artwork sits mainly to the right and along the lower edge, leaving a quieter center for your keyboard and everyday work.',
 'artAlt':'SIGNAL / 01: charcoal artwork with pale contour lines and an orange circle.',
 'artNote':'An original graphic composition. The contours are artwork, not a measured acoustic signal.'
},{
 'key':'subsurface','series':'SUBSURFACE','index':'02','title':'SUBSURFACE / 02','short':'Light surface. Architectural linework.',
 'offerId':'97704a85-a6b6-4090-894f-a7b5bc71a374','variantId':'d479a574-d42e-4767-9725-f940ce0e165c',
 'customizationId':'cud_j0r1BZMxQbm2L1iyKP0jFg','platformState':'PRIVATE','plannedPriceCents':3400,
 'observedPrivateVariantPrice':16,'currency':'USD','purchasableInPrototype':False,
 'lead':'A different perspective for your everyday workspace.',
 'description':'SUBSURFACE / 02 pairs a warm off-white background with an abstract architectural grid and an orange contour. The open center keeps the composition calm, while the geometry gives the right side a distinct visual focus.',
 'artAlt':'SUBSURFACE / 02: warm off-white artwork with a gray architectural grid and orange accents.',
 'artNote':'An original imagined surface, not a geographical map. The geometry is decorative artwork.'
}]
images={}
for p in products:
 for kind,stem in [('art','previews'),('mockup','mockups')]:
  path=root/'assets'/f'{p["key"]}-{stem}.jpg'
  im=Image.open(path).convert('RGB'); im.thumbnail((1600,1200))
  b=io.BytesIO();im.save(b,format='WEBP',quality=88,method=5)
  (root/'assets'/f'{p["key"]}-{kind}.webp').write_bytes(b.getvalue())
  images[p['key']+'-'+kind]='data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()
(root/'spec'/'products.preview.json').write_text(json.dumps({'mode':'design-preview-only','checkedAt':'2026-10-01','shopId':'sh_1f2e8f65-2b29-4be9-9167-7f42314361fb','products':products},ensure_ascii=False,indent=2))
css=(root/'storefront.css').read_text();js=(root/'storefront.js').read_text()
html='''<!doctype html><html lang="en" class="font-fallback"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#050505"><title>KEEP IT UNDERGROUND — Storefront design preview</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"><style>'''+css+'''</style></head><body><a class="skip" href="#main-content">Skip to content</a><div class="preview-bar"><span><strong>DESIGN PREVIEW</strong> · NOT FOR SALE · NO PAYMENT</span><span id="font-status" data-state="pending" class="secondary-preview-note">CHECKING SOURCE FONTS</span></div><header class="site-header"><a class="logo" href="#home" aria-label="Keep It Underground home">KPT</a><nav class="nav" aria-label="Main navigation"><a href="#home" data-route="home">Home</a><a href="https://keepitunderground.com/story" target="_blank" rel="noopener noreferrer">Story ↗</a><a href="https://keepitunderground.com/artists" target="_blank" rel="noopener noreferrer">Artists ↗</a><a href="#shop" data-route="shop">Shop</a><a href="https://keepitunderground.com/signal" target="_blank" rel="noopener noreferrer">Signal ↗</a></nav><div class="header-right"><span class="status-indicator">PREVIEW</span><button class="cart-toggle" data-open-cart aria-haspopup="dialog">CART / <span id="cart-count">00</span></button><button class="menu-toggle" data-menu aria-expanded="false" aria-label="Toggle navigation">☰</button></div></header><main id="main-content" tabindex="-1"></main><dialog id="cart-dialog" class="cart-dialog" aria-labelledby="cart-title"></dialog><div id="toast" class="toast" role="status" aria-live="polite" hidden></div><noscript><div class="wrap"><h1>KEEP IT UNDERGROUND</h1><p>This is an interactive design preview. Enable JavaScript to inspect it. It cannot accept orders or payments.</p></div></noscript><script type="application/json" id="kiu-product-data">'''+json.dumps({'products':products,'images':images},ensure_ascii=False).replace('</',r'<\/')+'''</script><script>'''+js+'''</script></body></html>'''
(root/'index.html').write_text(html,encoding='utf-8')
print('Preview bytes:',len(html.encode()))
print('Products:',len(products),'Font files bundled: 0')
