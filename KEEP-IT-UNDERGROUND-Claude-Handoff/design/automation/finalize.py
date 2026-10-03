"""Generate non-secret manifests for the local design handoff. No remote writes."""
from pathlib import Path
import json, hashlib
r=Path(__file__).resolve().parent.parent
source='99d224189757db3fad1882085fe43f7ff6508ccf'
def write(name,obj):
 (r/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
write('spec/design.tokens.json', {
 'mode':'unpublished-design-specification','sourceRepository':'LEISSON-DARKSSON/kpt-underground','sourceCommit':source,
 'sourceFiles':['src/app/globals.css','src/app/layout.tsx','src/app/page.tsx'],
 'sourceColors':{'ink':'#050505','ink2':'#090909','ink3':'#0e0e0e','green':'#8ACE00','orange':'#FF8C00','rust':'#A0522D','slate':'#708090','paper':'#E8E4DC','muted':'#606258','dim':'#333330'},
 'sourceFonts':{'display':{'family':'Bebas Neue','weight':400},'body':{'family':'Space Mono','weights':[400,700]},'fontBinariesIncluded':False},
 'sourceLayout':{'maxWidthPx':1200,'gutterDesktopPx':40,'gutterMobilePx':24,'sourceMobileBreakpointPx':768,'gridStepPx':52,'heroFontSize':'clamp(52px, 9vw, 128px)','heroLineHeight':0.86,'heroLetterSpacing':'0.01em'},
 'sourceTexture':{'gridLine':'rgba(138,206,0,0.026)','scanline':'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(138,206,0,0.012) 3px, rgba(138,206,0,0.012) 4px)'},
 'sourceMotion':{'ease':'cubic-bezier(0.16,1,0.3,1)','snap':'cubic-bezier(0.34,1.56,0.64,1)','midMs':200},
 'newCommerceDecisions':{'uiButtonCornerRadiusPx':0,'previewCardColumnsDesktop':2,'previewCardColumnsMobile':1,'previewMobileNavigationBreakpointPx':680,'actualProductColorsUnchanged':True,'statusLabelsNotSalesClaims':True,'doNotApplyAutomaticallyToProduction':True},
 'limits':['Prototype spacing and responsive layouts are commerce extensions, not a verbatim copy of every source rule.','Screenshots were tested offline with fallback fonts. Exact font geometry remains a separate online test.','Hosted Fourthwall checkout does not expose arbitrary page structure or payment-field CSS.']
})
write('spec/fourthwall-theme-map.json',{
 'status':'SPECIFICATION_ONLY_NOT_APPLIED','shopId':'sh_1f2e8f65-2b29-4be9-9167-7f42314361fb',
 'style':{'colors':{'Primary':'#8ACE00','Background':'#050505','Text':'#E8E4DC','Text Over Primary':'#050505'},'fonts':{'Heading font':'Bebas Neue','Base font':'Space Mono'},'buttons':{'primary':{'shape':'square','background':'#8ACE00','text':'#050505'},'secondary':{'shape':'square','background':'#050505','text':'#8ACE00','border':'#8ACE00'}}},
 'checkout':{'Skin':'Dark mode','fullPixelParity':'NOT_CLAIMED','paymentFieldsCustomCss':'DO_NOT_INJECT','brandInheritance':'VERIFY_IN_ACTUAL_EDITOR'},
 'writeGuard':{'readCurrentSettingsFirst':True,'backupCurrentThemeFirst':True,'requireIndependentUnpublishedDraft':True,'ifOnlyActiveThemeEditable':'STOP_NATIVE_WRITE_AND_REPORT_LIMITATION','keepShopStatus':'COMING_SOON','keepProducts':'PRIVATE','noOrdersPaymentsOrDnsChanges':True},
 'sources':['https://help.fourthwall.com/getting-started/design-my-storefront/customizing-your-site-theme-and-styles','https://help.fourthwall.com/getting-started/design-my-storefront/edit-checkout-page']
})
write('spec/source-register.json',{
 'preparedFor':'KEEP IT UNDERGROUND shop visual continuity','preparedDate':'2026-10-01','remoteChangesMade':False,
 'sourcePriority':['User-provided visual reference screenshot','Connected GitHub source at pinned commit','Connected Fourthwalle actual shop/product responses','Official public platform documentation','Clearly marked original design proposals'],
 'sources':[
 {'id':'REPO-CSS','url':f'https://github.com/LEISSON-DARKSSON/kpt-underground/blob/{source}/src/app/globals.css','retrieval':'GitHub.fetch_file','supports':'Existing canonical palette, typography rules, grid and motion values'},
 {'id':'REPO-LAYOUT','url':f'https://github.com/LEISSON-DARKSSON/kpt-underground/blob/{source}/src/app/layout.tsx','retrieval':'GitHub.fetch_file','supports':'Bebas Neue and Space Mono imports, existing shared shell'},
 {'id':'REPO-HOME','url':f'https://github.com/LEISSON-DARKSSON/kpt-underground/blob/{source}/src/app/page.tsx','retrieval':'GitHub.fetch_file','supports':'Reference composition and existing legacy business copy; does not validate that copy as real business facts'},
 {'id':'REPO-OLD-CHECKOUT','url':f'https://github.com/LEISSON-DARKSSON/kpt-underground/blob/{source}/src/app/api/checkout/route.ts','retrieval':'GitHub.fetch_file','supports':'Separate Stripe EUR flow and demo confirmation path; not a Fourthwall fulfillment integration'},
 {'id':'FW-READ','retrieval':'Fourthwalle.ecommerce_get-current-shop + ecommerce_get-offers-by-ids','supports':'Correct shop, COMING_SOON, both IDs PRIVATE, current descriptions and variant associations','limits':'No current sample order status, physical quality or theme-save result inferred'},
 {'id':'FW-THEME','url':'https://help.fourthwall.com/getting-started/design-my-storefront/customizing-your-site-theme-and-styles','supports':'Native color/font/button controls, active-theme editing limitation'},
 {'id':'FW-CHECKOUT','url':'https://help.fourthwall.com/getting-started/design-my-storefront/edit-checkout-page','supports':'Hosted checkout customization is limited; skin has Auto/Light/Dark options'},
 {'id':'FW-STOREFRONT','url':'https://docs.fourthwall.com/storefront/overview','supports':'Custom storefront and carts with hosted Fourthwall checkout'},
 {'id':'ARTWORK-ASSETS','source':'Existing KEEP-IT-UNDERGROUND-USA-Product-Kit-v1.zip','supports':'Original design preview JPEGs and concept mockups','limits':'Not freshly downloaded Fourthwall rendering, not physical photography, not print production masters'},
 {'id':'OWNER-SCREENSHOT','source':'Two screenshots in current user message','supports':'User visual direction and sample checkout total80.67USD','privacy':'No personal checkout fields or original checkout screenshot bundled'}
 ],
 'notVerified':['Actual Fourthwall draft-theme controls and saved theme state','Exact external-font visual match in an online browser','Complete Next.js application build','Actual hosted checkout styling and end-to-end retail payment','Physical sample quality']
})
write('spec/design-stage-receipt.json',{
 'outcome':'LOCAL_DESIGN_PREVIEW_READY_WITH_LIMITS','samplePayment':{'authorizedMaximumUsd':80.49,'latestOwnerScreenshotTotalUsd':80.67,'overLimitUsd':0.18,'action':'NO_PAYMENT'},
 'remoteMutations':{'fourthwallTheme':False,'products':False,'prices':False,'orderOrPayment':False,'github':False,'vercelDeploy':False,'dns':False},
 'artifacts':['index.html','storefront.css','storefront.js','next-preview/','CODEX-IMPLEMENTATION.md'],
 'remaining':['Online source-font visual verification','Feature-branch integration and full application QA','Actual native Fourthwall checkout-branding preview'],
 'userDataPolicy':'No address, phone, customer email, token, password, cookies or font binaries in package.'
})
records=[]
for p in sorted(r.rglob('*')):
 if p.is_file() and p.name!='file-manifest.json':
  if p.suffix.lower() in {'.woff','.woff2','.ttf','.otf','.env','.pyc'}: raise RuntimeError(f'Forbidden payload type: {p.suffix}')
  records.append({'path':p.relative_to(r).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
write('file-manifest.json',{'description':'Integrity manifest for authored handoff, not a platform transaction receipt.','files':records})
print('Manifest files:',len(records))
