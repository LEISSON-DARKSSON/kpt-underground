# Codex: e-poe kujundus täpselt olemasoleva KEEP IT UNDERGROUND visuaalsüsteemi järgi

## 0. Ülesanne ja lõpptulemus

Kasutaja soovib jätkata e-poega sama kujunduse järgi, mis on tema keepitunderground.com viitepildil. Ära tee uut brändi, uut värvipaletti ega üldist valgete kaartidega e-poe malli. Säilita must pind, acid-green aktsent, kitsas suur pealkiri, monospace-märgistus, peen taustaruudustik, CRT-tekstuur ja tehniline graafikastiil.

Väljund on **kaitstud eelvaates toimiv kujundus** ja kontrollitud rakendusplaan Fourthwalli kassale. Selle töö käigus ei avata müüki ega muudeta tooteid avalikuks. Tee tegelikud lubatud muudatused ise; ära anna pärast iga klõpsu kasutajale uut käsitsi juhendit. Sisselogimisel lase kasutajal autentida samas brauseris.

Esimene kasutatav artefakt on kaasasolev `index.html`. See on kohalik klikitav prototüüp, mitte päris kassarakendus. `next-preview/` sisaldab sama demonstratsiooni eraldi kaitstud Next.js marsruudina. Mõlemad peavad jääma kujunduse ülevaatuseks. Tegelik e-pood tuleb ehitada olemasolevate komponentide ja päris Fourthwalli andmete peale, mitte kopeerida demonstratsiooni hinnad või sünteetiline ostukorv tootmisesse.

## 1. Lubatud ja keelatud tegevused

**Lubatud:** õige konto/repo lugemine, varukoopia, uus feature-haru, eraldatud Preview-koodi arendus, selle haru kontrollitud Preview-avalduse loomine, brauseri testid, Fourthwalli teema eelvaate seadistamine kui muudatused saab tõendatult avaldamata jätta, aruanded. Kasuta juba toimivat Verceli projekti ja autentimist.

**Keelatud selles etapis:** maksed ja tellimused, uued tooted, toodete Private-oleku muutmine, hinnamuudatused kontol, näidiste kujunduse asendamine, krediidi kulutamine, DNS-muutused, avalehe tootmisversiooni asendamine, PR-i ühendamine main-harusse, Production-seadistuste muutmine, kaitsete eemaldamine, autentimisandmete avaldamine.

Varasem 80,49 USD kululuba EI KATA uuel pildil nähtavat 80,67 USD. Ära kasuta kujundustööd selle 0,18 USD ületuse kinnitamisena.

Ära palu uut Fourthwalli tokenit, ära seadista MCP-d uuesti ega korda lõpetatud Storefront-ühenduse tõrkeotsingut. Serveri lugemiskontroll oli kasutaja tööraporti järgi PASS. Käesolev ülesanne on disaini teostus.

## 2. Lähteolukorra kontroll ja varundamine

Repo: `LEISSON-DARKSSON/kpt-underground`. Kontrollimise hetkel oli main `99d224189757db3fad1882085fe43f7ff6508ccf`; varasem PR #1 oli juba ühendatud. Ära eelda, et vana diagnostikaharu on endiselt õige arenduse alus. Tee värske repo lugemine ja kontrolli olemasolevaid PR-e/harusid.

Kohalik kasutaja töökaust on varasemate raportite järgi `C:\PROJECTS\kpt-underground`. Kontrolli tegelikku teed ja git remote'i, ära loo juhuslikku uut projekti. Säilita kasutaja pooleliolevad failid. Ära käivita `git reset --hard`, puhastavat kustutamist ega force-push'i.

Uue haru soovitus: `feat/commerce-design-parity-20261001`; loo praeguse kinnitatud main'i põhjal või jätka sama eesmärgiga olemasolevat haru. Enne muutmist salvesta commit, `git status`, algse avalehe ekraanipilt ja mõjutatavate failide nimekiri. Loe projekti agent-juhised; need ei tühista käesolevaid makse- ja avaldamispiire.

Vercel: team `leisson-creative`, team ID `team_AM95AHo0HzxOqVMyK8uCsfKw`; projekt `kpt-underground`, ID `prj_YJhnEFeOnrCoodkZ9k201ReLeGfq`. Kasuta ainult selle projekti Preview-keskkonda. Kontrolli enne avaldamist branch'i ja SHA-d, mitte ainult rohelist Ready-märki.

Fourthwall: `KEEP IT UNDERGROUND`, ID `sh_1f2e8f65-2b29-4be9-9167-7f42314361fb`, praegu `COMING_SOON`, põhivaluuta USD. Loe konto tegelik seis uuesti, kui hakkad selle seadistusi avama. Ära muuda poe nime ega staatust.

## 3. Üks kujunduse allikas

Peamised lähtefailid:

- `src/app/globals.css`: värvid, fondi muutujad, teksti mõõdud, ruudustik, scanline, paigutus, animatsioonid.
- `src/app/layout.tsx`: Bebas Neue / Space Mono, Navbar, Footer, CartProvider, CartDrawer, CursorEngine ja AudioToggle.
- `src/app/page.tsx`: kasutaja viitepildile vastav KEEP IT / UNDERGROUND hero.
- `src/components/shop/product-card.tsx`, `product-detail.tsx`, `shop-grid.tsx`, `cart-drawer.tsx`: olemasolevad e-poe komponendid.

Loe neid faile praegusest branch'ist. Ära kirjuta kogu `globals.css` faili prototüübi CSS-iga üle. `storefront.css` on iseseisva demo stiil, mitte Fourthwalli kassasse kopeeritav stylesheet.

Säilita:

| Roll | Väärtus |
|---|---|
| Taust | #050505 |
| Teine/kolmas pind | #090909 / #0e0e0e |
| Brändi roheline | #8ACE00 |
| Põhitekst | #E8E4DC |
| Sekundaarne tekst | #708090 |
| Joon | #333330 |
| Oranž sekundaaraktsent | #FF8C00 |
| Pealkiri | Bebas Neue 400 |
| Keha ja tehnilised sildid | Space Mono 400 / 700 |
| Hero pealkirja lähtereegel | clamp(52px, 9vw, 128px), line-height 0.86 |
| Sisu ümbris | max-width 1200px, ääred 40px / mobiilis 24px |
| Taustavõrk | 52 × 52px, peened rohelised jooned |
| Põhieasing | cubic-bezier(0.16, 1, 0.3, 1) |

Lõplik piksli- ja fondikontroll tehakse sama ekraanilaiuse ning laetud Bebas Neue / Space Mono fontidega. Varufondi kasutamine ei ole täielik vastavus. Kasuta repos juba seadistatud Next.js fonte, ära lisa teist konkureerivat fondivõrgustikku päris komponentidele.

Kohalik demo kasutab mõnes operatiivses tekstis loetavamat suurust ning native-fookust. Ära muuda makseinfot või veateateid raskesti loetavaks ainult screenshot'i tumedama ilme saavutamiseks. Säilita olemasoleva lehe kunstiline tunnetus, aga ära kata vorme scanline'i või cursor-kihiga. Animatsioonid peavad austama `prefers-reduced-motion` eelistust. Heli ei käivitu ostukorvis ega kassas automaatselt.

## 4. Esimene teostatav Preview

Kui eesmärk on kiiresti saada kinnitatav kujundus avalikku lehte muutmata, kopeeri `next-preview/src/` failid vastavatesse kohtadesse eraldi feature-harus. Kui samanimeline fail juba eksisteerib, võrdle seda enne; ära kirjuta pimesi üle.

Marsruut `/commerce-preview` tagastab ettevalmistatud HTML-i ainult `VERCEL_ENV=preview` või tuvastatud kohaliku arenduse korral. Production ja tundmatu hostitud keskkond peavad tagastama 404. **Uut Storefront-tokenit või diagnostika lippu ei ole selle kujundusdemo jaoks vaja.** Hoia Verceli olemasolev Deployment Protection aktiivne.

Sisu turvapoliitika keelab ühendused API-dega, vormide saatmise ja raamid; JS-hash peab vastama generaatoriga loodud sisule. Kui HTML-i või JS-i muudad, käivita mõlemad generaatorid uuesti. Ära eemalda CSP-d mugavuse pärast.

Käivita repo olemasolevad typecheck/build/lint käsud, kontrollides enne `package.json` tegelikke skripte. Failipaketis tehtud eraldiseisev TypeScripti kontroll ei tõenda kogu Next.js build'i. Käivita ka `node --test automation/preview-guard.test.mjs` paketi juures. Kui lähterepo `lint`-käsk on vana/katki, raporteeri eraldi ja paranda ainult isoleeritud haru piires põhjendatud väikese muudatusena.

Avalda vaid feature-haru Preview, kontrolli õiget projekti, keskkonda ja SHA-d. Kasuta varasemas töös õnnestunud kohaliku Verceli projekti/meeskonna seost; ära asenda seda ühegi Production-deployment'iga.

## 5. Päris e-poe komponentide ülekandmine samasse süsteemi

Pärast esimese eelvaate toimimist või otse samas feature-harus võib portida kujunduse olemasolevatesse React-komponentidesse. Hoia see töö eraldatuna avalikust tootmiskeskkonnast ning säilita komponendipuus ainult üks päis, jalus ja ostukorvi provider.

### Kataloog

Kahe toote vaade: suur kondenseeritud kahevärviline pealkiri, peen tehniline märgistus, kaks tootekaar­ti laiemal ekraanil ja üks mobiilis. Kujunduspind ise jääb originaalvärvides. Ära muuda oranži graafikat roheliseks ega asenda alusmatte uute AI-piltidega.

Päris kataloogis tuleb kasutada Fourthwalli avalikke andmeid. Private-toodete staatust ei muudeta testimiseks. Avalik tühi kataloog peab jääma ausaks tühjaks olekuks. Kaitstud kujunduseelvaates võib kasutada failipaketi sõnaselgelt märgistatud staatilist snapshot'i. Seda fallback'i ei tohi avalikus serveris lubada.

### Tootelehed

Säilita kahe olemasoleva toote ID-d ja variandid:

| Kujundus | Offer ID | Variant ID |
|---|---|---|
| SIGNAL / 01 | 74c2ace1-4f7c-469b-a607-5555432019b4 | b28b8e38-0bd5-4303-8641-7aed66648b45 |
| SUBSURFACE / 02 | 97704a85-a6b6-4090-894f-a7b5bc71a374 | d479a574-d42e-4767-9725-f940ce0e165c |

Tootepilt peab vastama samale ID-le. Varasem eksimus oli hele kujundus SIGNAL-i redaktoris; disainitöö ei tohi seda korrata. Käesolev töö muudab veebiesitust, mitte toote trükifaili.

Näita suur tooterenderdus, pisipildid, loetav nimi, ühe variandi mõõt, üks ostutoiming, kogus ning kompaktsed infojaotised. Päris lehel kasuta live-kirjeldusi või nende kontrollitud koopiat, mitte suvalist teksti. Piltidel peab olema õige alternatiivtekst, füüsilisi näidiseid mitteolemasolevana ei esitata.

**34 USD on hinnasiht.** Kaitstud demos on see nähtavalt `planned price`. Variantide varem API-st loetud16USD pole tõend avaliku müügihinna kohta.13USD on näidise baaskulu, mitte jaehind. Tegeliku müügi avamisel tuleb hind võtta kinnitatud platvormi väärtusest, mitte brauseris kõvakodeeritud summast.

### Ostukorv

Kasuta olemasolevat CartDrawer'i visuaalse alusena. Preview kohalik JS-cart on demonstratsioon, mitte päris rakenduse andmemudel. Reaalses lahenduses seo kogused kindlate variantidega, ära sega vanu rõivatooteid uute mattidega. Säilita klaviatuurifookus, Escape, tühja ostukorvi olek ja korrektsed vahesummad.

Preview-s ei pea koguma nime, aadressi, telefoninumbrit ega makseandmeid. Kassat imiteeriv fiktiivne maksekinnitus on keelatud.

## 6. Kassa: sama identiteet, mitte toetamata üks-ühele lubadus

Päris arhitektuur:

`olemasolev Next.js veeb → kinnitatud tootevariantidega ostukorv → Fourthwalli hostitud makseleht → platvormi kinnitatud tellimus`.

Fourthwalli dokumentatsioon kinnitab kohandatud kataloogi ja ostukorvi ning suunamise hostitud kassasse. Kassa ei ole suvaliselt ümber ehitatav React-leht. Ära ehita oma kaardivormi, ära kasuta iframe-kassat, ära püüa võõra domeeni CSS-i jõuga muuta.

**Oluline lähtekoodi risk:** kontrollitud `src/app/api/checkout/route.ts` kasutab eraldi Stripe EUR checkout'i, kliendilt saadud hinnavälju ja Stripe võtme puudumisel demo-suunamist `/confirmation`-ile. Ära ühenda Fourthwalli tooteid selle vana voo külge. Selle kasutamine ei taga Fourthwalli tootmist/tarnet. Ära nimeta demo-vastust tasutud tellimuseks.

Kujundusetapis ei ole vaja vana live-kassat muuta. Edasise päris integratsiooni jaoks kavanda eraldi Fourthwalli adapter, serveris kinnitatud toote ID/nähtavus/aktiivne hind ja üks lubatud hostitud kassasuunamine. Maksmine peab Private- või müügiks kinnitamata toodete korral olema blokeeritud. Vaikimisi ära tee live-kassaseansse selle disaini kontrollimiseks.

## 7. Fourthwalli teema sobitamine brauseris

Selles vestluses loetud tööriistad ei sisalda teema muutmise operatsioone. Kasuta Codexi päriselt ühendatud brauserit, mitte oletuslikke MCP-funktsioone või dokumenteerimata API-sid.

Loe enne muudatusi konto ja teema seis. Salvesta algsed värvid, fondid, nupud ja checkout skin. Kui teemat saab dubleerida, tee ainult kujunduse varukoopia; see ei muuda toodete arvu. Ära kirjuta üle teise tegija pooleliolevat draft'i.

Ametlikus juhendis on märkus, et redigeerida saab aktiivset teemat, ning teised juhised kirjeldavad draft-eelvaadet. **Kontrolli oma tegelikku UI-d.** Ära eelda, et Save tähendab alati avaldamata mustandit. Coming Soon ei ole iseenesest tõend, et aktiivne näidiskassa jääb muutmata. Kui päriselt eraldatud draft'i ei ole, koosta soovitud väärtused ja jäta salvestamine BLOCKED-iks; see ei peata kohaliku/Verceli eelvaate lõpetamist.

Sihtväärtused:

- Site design → Style → Colors: Primary #8ACE00, Background #050505, Text #E8E4DC, Text Over Primary #050505.
- Fonts: heading Bebas Neue400, base Space Mono400;700 rõhuasetustele kui toetatud.
- Buttons: square, täidetud green/ink primary, roheline piir secondary; kerge hover, mitte uus värvipalett.
- Checkout → Skin: Dark mode.

Kontrolli eraldi, millised seaded päris checkout'i edasi kanduvad. Dokumenteeri iga erinevus. Nelja globaalse värvi, fonte ja nuppe toetav teema ei tõenda kõigi kassaväljade pikslitäpset kontrolli.

Ära kleebi `storefront.css` tervikuna Fourthwalli kassasse. Ära muuda maksepakkujate kaubamärke, veateadete nähtavust, maksenupu teksti tähendust ega maksude/tarne esitust. Animatsioonide ja taustatekstuuri täpne kopeerimine pole väärt katkist checkout'i.

Ära muuda olemasolevat DNS-i ega suuna keepitunderground.com domeeni ümber. Praegune Next.js sait jääb kujunduse ja sisu esipinnaks. Hetkel teadaolev Fourthwalli domeen on keepitunderground-shop.fourthwall.com. Võimalik tulevane shop-alamdomeen vajab eraldi otsust ja kontrolli.

## 8. Kujundus ei võrdu kinnitamata äriväidetega

Säilita KEEP IT UNDERGROUND nimi ja olemasolev graafiline hierarhia. Lähteavalee vana `10% artist fund`, soundsystem-workwear, nelja rõivarea ning salajase ligipääsu tekst ei ole kahe mati kinnitatud müügilubadus.

Käesolev prototüüp teeb eraldi uue copy-ettepaneku: `Original graphic objects for creative desks and home studios. Make room for your next idea.` See pole vana teksti tsiteerimine ega juba avaldatud muudatus.

Säilita avalik avaleht selles etapis muutmata. Uue commerce-vaate teksti jaoks kasuta tõendatavaid andmeid: kaks kujundust, mattide mõõt, üks variant, tootepildi päritolu. Ära lisa arvustusi, müüdud ühikuid, piiratud laoseisu, tasuta tarnet, dollarilist annetust ega lubatud saabumiskuupäeva ilma allikata.

## 9. Kontrollid ja tõendid

Kontrolli desktop1440, tablet768, mobile390 ja kitsas320. Põhiküsimused:

1. Laetud lähtefondid, sama värvisüsteem ja päise/pealkirja hierarhia kui viitelehel. Kasuta võrdluseks sama laiust; varufond tähendab fontide BLOCKED, mitte täielikku PASS-i.
2. Tootepilt ei venita vertikaalselt. HTML-i width/height peab olema ühendatud `height:auto` ja õige proportsiooniga. Kogu matt või selgelt märgitud detail peab nähtav olema.
3. Kataloog, mõlemad tootelehed, galerii, kogusepiirid, tühi korv, kahte toodet sisaldav korv, mobiilinavigatsioon, focus/Tab/Escape.
4. Päris ostunupp ei aktiveeru Private-toodetele. Kohalikul preview-cart'il on üheselt selge demonstratsiooni märgistus. Hinnahüpotees ei muutu avalikuks jaehinnaks.
5. Preview ei tee API-kassa-, tellimuse- ega maksepäringuid. Konsoolivead/ülevool tuleb parandada.
6. Reduced motion ja puuteseade: puudub kohustuslik helikäivitus või puuduv kursor. Sisu ei jää animatsiooni tõttu peidetuks.
7. Pärast Preview avaldamist on õige branch+SHA ja serveripoolne ligipääsupiir. Production `/commerce-preview` peab jääma404.
8. Mõlemad Fourthwalli tooted on pärast tööd endiselt sama ID all ja PRIVATE. Trükifailid/variandid/hinnad puutumata.

Salvesta ekraanipildid ilma isikuandmeteta, JSON-kontrolliraport ja täpne tehtud failide loend. Kui font puudub või kassal on platvormipiirang, erista seda disaini veast.

## 10. Lõpparuanne ja automaatika

Täida üks koondraport: muudetud failid, branch/commit, Preview link, iga vaate tulemus, fontide tulemus, checkout-teema tegelikud seaded vs soovitud, puuduvad kontrollid. Staatused PASS / FAIL / BLOCKED / NOT_RUN. Ära nimeta nupuklõpsu salvestatud tulemuseks; ava objekt uuesti.

Automaatika: lähte-tokenid → spetsifikatsioon → CSS/komponendid → toodete ID-seosed → eri ekraanilaiuste test → nähtavuse/kassa blokeeringu test. Ära loo uut andmebaasi, liikmelisust ega mitme tarnija süsteemi pelgalt kahe mati kujundamiseks.

Lõpetatud peab saama vähemalt kaitstud, kasutatav kujunduseelvaade. Fourthwalli eraldatud draft'i puudumine või kassa piiratud kohandatavus peab jääma selgeks piiranguks, mitte lõputuks infrastruktuuriülesandeks.
