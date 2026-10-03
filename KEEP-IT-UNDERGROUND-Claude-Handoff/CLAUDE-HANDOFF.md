# KEEP IT UNDERGROUND — üleandmine Claude’ile

**Versioon 1.0 · koostatud 02.10.2026 · arenduse üleandmine, mitte avaldamis- ega maksekinnitus.**

## 0. Loe see kõigepealt

Jätka olemasolevat projekti. Ära alusta uuest ärimudelist, uuest brändist, uuest poest ega ühenduste seadistamisest.

Kasutaja viimane sisuline soov: **„liigume edasi ja kujundame e-poe täpselt nagu hetkel keepitunderground.com lehel kujundus on”.** Nüüd antakse töö Claude’ile üle, et see saaks jätkuda ühe tervikliku töövoona.

**Esimese töövooru tulemus peab olema kaitstud, brauseris kontrollitud e-poe kujunduseelvaade olemasolevas Next.js/Verceli projektis.** See hõlmab kataloogi, kahte tootelehte, ostukorvi ja ausalt märgistatud kassasse suunamise kavandit. Lähtefondid peavad päriselt laadima. Avalik tootmisveeb, Fourthwalli toodete nähtavus, hinnad, trükifailid ja maksed jäävad selles voorus muutmata.

Koostatud on toimiv kohalik kujunduspakett; seda tuleb kasutada lähtealusena, mitte lihtsalt uuesti kirjeldada. Samas ei tohi kohalikku maketti esitada töötava makse- või tellimussüsteemina.

### Loe järjekorras

1. Käesolev `CLAUDE-HANDOFF.md` — praegune ülesanne, piirid ja seis.
2. `state/current-state.json` ning `state/product-manifest.json` — identiteedid ja tõendite liigid.
3. `design/README.md`, ava `design/index.html`; seejärel `design/CODEX-IMPLEMENTATION.md` — nimi viitab eelmisele täitjale, tööjuhis kehtib ka Claude’ile.
4. Kasutaja tegeliku repo `CLAUDE.md`, vajadusel `AGENTS.md`, `package.json` ja asjakohased lähtefailid. Selle üleandmise fail **ei ole** repo `CLAUDE.md` asendus.
5. Kohalikud olemasolevad `execution-report.md` ja `execution-record.json`, kui Claude’i lubatud tööruumis kättesaadavad. Neid kasutaja arvuti faile üleandmise koostaja siin ei lugenud.

**Ülimuslikkuse reegel:** uus kasutaja juhis määrab volituse; praeguse objekti tegelik vastus määrab selle hetkeseisu; varasem raport tõendab ainult oma kontrollhetke. Ajalooline juhis või PR-i vana kirjeldus ei tühista hilisemat kinnitatud tulemust. Lahknevus tuleb välja tuua, mitte vaikselt ära parandada.

## 1. Äriline eesmärk ja kinnitatud piirangud

KEEP IT UNDERGROUND on Eestis juhitav bränd. Esimene sihtturg on USA. Alguses puudus raha kauba etteostmiseks; mudel peab seetõttu töötama ilma oma laovaruta ja tellimuspõhise tootmisega. Fourthwall valiti esimese täitmis- ja makseplatvormina. Oma kujundusega tooteid ei saadeta iga USA tellimuse puhul kasutaja kodust Eestist.

Algse veebilehe rõivakollektsioon ja artistifond ei ole selle uue tootekatse kinnitatud ärimudel. Esimene päris katse on kaks sama baastoote ja hinnasihiga lauamatti, mille ostupõhjus on originaalne kujundus ning sobivus töölauale. Klient ei pea olema juba tuntud artisti või brändi fänn.

Kinnitatud valik: **SIGNAL / 01** ja **SUBSURFACE / 02**. Planeeritud USA jaehind on **34 USD mõlemale**, maksud ja tarne eraldi. See on hinnasiht, mitte tõendatud turuhind ega praegu avalikult kehtiv jaehind. Müügihiti potentsiaali pole tehingutega tõestatud.

Hilisem praktiline valideerimissiht: viis tasutud ja edukalt täidetud klienditellimust, neist vähemalt kolm väljaspool lähimat sõpruskonda. Näidiseid, enda oste ja demoklikke selle eesmärgi sisse ei loeta. See arv pole statistilise olulisuse piir ega käibeprognoos.

**Praegu ei lisata** uusi rõivaid, seinaprinte, märkmikke, liikmelisust, artistide tulujagamist, lojaalsusprogrammi, mitme tarnija arhitektuuri ega uut andmebaasi. Seinaprindid ja kuue kujundatava sisulehega märkmik olid varasemad järgmise laine kandidaadid; nende arendamine ei kuulu praegusse kujundusetappi. [R1, R2]

## 2. Üleandmise hetke seis ja tõendite tugevus

| Osa | Seis | Millel see põhineb? |
|---|---|---|
| Õige Fourthwalli pood | Kinnitatud | Selle üleandmise käigus tehtud `get-current-shop` lugemine. |
| Poe nähtavus | `COMING_SOON` | Sama värske poe vastus. |
| Kaks olemasolevat matti | Mõlemad `PRIVATE`, üks variant kummalgi | Värske päring kahe kindla offer ID järgi. |
| Ingliskeelsed kirjeldused | Mõlemal põhjalik tekst koos mõõtude ja visualiseeringu täpsustusega | Värske tootevastus. |
| Kujunduste õige seos | Kasutaja teatas brauseris kontrollitud tulemusest | Toote ID-d ja kolm renderdus-URL-i kummalgi kinnitati uuesti; selle üleandmise käigus trükikihte ega pilte visuaalselt uuesti ei auditeeritud. |
| Väljamaksed | `ACTIVE` | Värske väljamaksekonto päring; ühendatud 29.09.2026. |
| Server → Fourthwall lugemisühendus | `PASS`, kasutaja esitatud päris JSON | Kasutaja/Codexi täitmisraport. Selles üleandmises päringut uuesti ei käivitatud. |
| Diagnostika PR #1 | Suletud ja ühendatud `main`-harusse | Värske GitHubi metadata. |
| Praegune `main` | `99d224189757db3fad1882085fe43f7ff6508ccf` | Värske GitHubi harupäring. |
| Avatud PR-id | Tagastatud loend tühi | Repo avatud PR-ide päring üleandmise ajal. Kohalikke avaldamata muudatusi see ei välista. |
| Uus e-poe kujundus | Kohalik interaktiivne pakett olemas | Failid on selle ZIP-i `design/` kaustas. |
| Kujunduse avaldamine | Pole selle paketiga teostatud | Verceli kontrollitud ajavahemiku vastus ei sisaldanud uuemat kujundusdeployment’i. Kohalikku kasutaja tööpuud ei loetud. |
| Näidistellimus | Maksmine ja tellimuse kinnitus pole tõendatud | Viimane pilt on kassa, mitte kinnitus. Kahe offer ID tellimuspäring tagastas `items[0]`. |
| Füüsiline kvaliteet | Kontrollimata | Saadetud ja üle vaadatud näidiste tõend puudub. |
| Müügi avamine | Tegemata | Private-tooted, Coming Soon, hinnasiht ja testimata ostuteekond. |

Värsked vastused on normaliseeritud failis `state/current-state.json`; see ei ole muutmata toor-API dump. Kasutaja kontaktandmed, tokenid, küpsised ja aadress on välja jäetud. Allikate piirid on märgitud väljades `sourceKind` ja `limitations`. [R3–R8]

### Aegunud väited, mida EI tohi edasi kanda

- „Fourthwalle ei tööta” — selles üleandmises toimisid päris lugemistööriistad. Claude’i enda ühendust tuleb eraldi tuvastada.
- „Poes on null toodet” — kaks konkreetse ID-ga privaatset toodet on olemas; avalik Storefront-loend võib endiselt olla tühi.
- „Väljamaksed INACTIVE” — ajalooline tulemus, nüüd `ACTIVE`.
- „SUBSURFACE’il on ainult lühike kirjeldus” — hiljem parandatud ja nüüd uuesti kontrollitud.
- „PR #1 on Draft / merged=false” — vana PR-i tekst on aegunud; praegune metadata näitab merged=true.
- „Serveriühendus on endiselt SSO tõttu katki” — kasutaja saavutas pärast kohaliku projekti õiget sidumist päris JSON-i ja korduskontrolli. Ära ava lõpetatud tõrkeotsingut ilma uue regressiooni tõendita.
- „Kõik kujunduskontrollid on läbitud” — kohaliku prototüübi fontide tegelik renderdus jäi kontrollimata; kogu rakenduse ja päris maksete test puudub.

## 3. Fikseeritud kontod, repo ja tööruum

### Fourthwall

```text
Shop name: KEEP IT UNDERGROUND
Shop ID: sh_1f2e8f65-2b29-4be9-9167-7f42314361fb
Admin slug: keepitunderground
Primary domain: keepitunderground-shop.fourthwall.com
Internal domain: keepitunderground-shop
Primary currency: USD
Current status: COMING_SOON
```

Admini senine toodete loendi aadress: `https://admin.fourthwall.com/store/keepitunderground/products/all/`. Navigeeri tegeliku konto kaudu; ära konstrueeri uut tootekujundaja seansi URL-i. API `customDomains` loetelus olev `keepitunderground.com` ei tõenda, et DNS suunab sinna või et seda võib ümber seadistada.

### GitHub ja Vercel

```text
Repository: LEISSON-DARKSSON/kpt-underground
GitHub: https://github.com/LEISSON-DARKSSON/kpt-underground
Main at handoff: 99d224189757db3fad1882085fe43f7ff6508ccf
Main tree: ed7c327712dd8a47dabb1989c60b1e084b1cff49
PR #1: closed / merged=true
Merge time: 2026-09-24T04:41:30Z

Vercel team: leisson-creative
Team ID: team_AM95AHo0HzxOqVMyK8uCsfKw
Project: kpt-underground
Project ID: prj_YJhnEFeOnrCoodkZ9k201ReLeGfq
```

**Ära kasuta teist repot `LEISSON-DARKSSON/KEEP-IT-UNDERGROUND`:** see on varasemates otsingutes esile tulnud teine projekt, mitte selle veebipoe koodibaas.

Kasutaja viimane teadaolev kohalik töökaust on `C:\PROJECTS\kpt-underground`. Seal peaksid olema `execution-report.md` ja `execution-record.json`. Varasemates töövoorudes kasutati ka `C:\Users\gert\Documents\Codex\2026-09-24\files-pasted-by-the-user-keep\outputs\reports\`. Need on **kasutaja nimetatud kohalikud teed**, mitte siinse ZIP-i failid või pilvelingid. Kontrolli olemasolu ja remote’i enne kasutamist; ära väida, et said neid siit lugeda.

Repo agent-juhises leiduv vanem Desktopi tee või käsk kohe `main`-harusse push’ida ei ole praegune volitus. Selle töö jaoks säilivad feature-haru ja Preview piirid. [R4–R7]

## 4. Olemasolevate toodete register

| Väli | SIGNAL / 01 | SUBSURFACE / 02 |
|---|---|---|
| Offer ID | `74c2ace1-4f7c-469b-a607-5555432019b4` | `97704a85-a6b6-4090-894f-a7b5bc71a374` |
| Variant ID | `b28b8e38-0bd5-4303-8641-7aed66648b45` | `d479a574-d42e-4767-9725-f940ce0e165c` |
| Customization ID | `cud_6nZ6I9XbTF6ZWVLwPt6tFQ` | `cud_j0r1BZMxQbm2L1iyKP0jFg` |
| Source product ID | `pro_a0e4db25108747b496` | sama |
| Praegune nimi | KEEP IT UNDERGROUND Signal 01 Desk Mat | KEEP IT UNDERGROUND SUBSURFACE / 02 |
| Slug | `keep-it-underground-signal-01-desk-mat` | `keep-it-underground-subsurface-desk-mat` |
| SKU | `Q4K3-NC7G015` | `QRRN-M0UG015` |
| Olek | PRIVATE | PRIVATE |
| Variant | All-Over Print; 15.5″ × 31.5″ | sama |
| Täitja | FOURTHWALL | FOURTHWALL |
| Tagastatud `price` väli | 16 USD | 16 USD |
| Planeeritud jaehind | 34 USD, veel mitte avalik hinnastus | sama |
| Tootevisualiseeringuid | 3 | 3 |

`available=true` ei tühista `PRIVATE`-olekut. Praegust 16-dollarist variandivälja ei käsitleta automaatselt omahinna, näidise kogukulu ega rakendatud 34-dollarise jaehinnana.

**Ülesanne on nüüd veebiesituse kujundamine.** Ära loo uusi tooteid, muuda variante, sluge, SKU-sid, tollikoode, päritoluriiki või trükifaili selleks, et lehekaarti paremini paigutada. Praegused salvestatud kirjeldused on täies mahus `copy/product-descriptions.en.md` failis. [R3]

## 5. Trükifailid, visualiseeringud ja varasema vea vältimine

`product-assets/print/` sisaldab kahte originaalset üleslaadimis-PNG-d. Kohalikku arendusse on need antud kontrollitud varukoopiana, **mitte juhisena need uuesti Fourthwalli saata**.

```text
SIGNAL-Desk-Mat-Upload.png
9921 × 5197 px / RGB
SHA-256:
621a9f5e3a6de11fb71e9c7f9ebf44d378928ce1098db982b3bb41eee3e8e426

SUBSURFACE-Desk-Mat-Upload.png
9921 × 5197 px / RGB
SHA-256:
9a8237c6da81f374941626dccba73b60e9abafe1d4ee1510e8313d3a4c415c75
```

Sama kujunduse SVG-lähtefailid on `product-assets/source/` kaustas. Need on olemasolevad kontuuritud tekstiga graafikad. Fondibinaare ei ole kaasas.

SIGNAL on tume grafiit, heledad voolavad kontuurid, oranž ring paremal ning rahulikum keskosa. SUBSURFACE on hele soe pind, ruumiline võrk, oranž kontuur ja väike oranž ruut. **Veebi roheline ei ole põhjus nende oranži graafika roheliseks muutmiseks.**

Senise kujundaja nähtav lõuend 33.07″ × 17.32″ / 300 dpi vastab nende failide mõõtudele. Valmistoote 31.5″ × 15.5″ mõõt ei anna alust failide automaatseks kärpimiseks. Olulised tekstid olid safe area sees, dekoratsioon ulatus servani. Füüsilised peenjooned, värvid, serv ja materjal pole näidisega kinnitatud.

Varem valiti hele SUBSURFACE SIGNAL-i redaktoris. Hiljem raporteeris kasutaja mõlema õige salvestatud kujunduse kontrolli. **Seda riski hoitakse ID→faili kontrollreeglina, mitte oletusena, et toode on praegu endiselt rikutud.** `inspect-design` on lugemine; `edit-design`, `apply-draft-to-product` ja rerender võivad muuta kujunduse seisundit ning ei kuulu praegusse töövooru.

Veebi `design/assets/` pildid on eraldi väiksemad maketi visuaalid. Neid ei tohi kasutada tootmisfailina. Päris müügilehel kasutatakse õigete toodete heakskiidetud renderdusi või päris näidiste fotosid, mitte üldise AI-pildiga asendatud kaupa. [R1–R3]

## 6. Kujunduse kaanon: olemasolev sait on allikas

Kasutaja ei tellinud uut visuaalset identiteeti. Lähteallikad on tegelik `keepitunderground.com`, tema viitepilt ning olemasoleva repo `globals.css`, `layout.tsx` ja komponentide tegelik renderdus.

| Roll | Väärtus / reegel |
|---|---|
| `ink` | `#050505` |
| `ink-2` | `#090909` |
| `ink-3` | `#0e0e0e` |
| `green` | `#8ACE00` |
| `orange` | `#FF8C00` |
| `rust` | `#A0522D` |
| `slate` | `#708090` |
| `paper` | `#E8E4DC` |
| `muted` | `#606258` |
| `dim` | `#333330` |
| Display font | Bebas Neue 400 |
| Body / tehnilised sildid | Space Mono 400 / 700 |
| Hero display | `clamp(52px, 9vw, 128px)`; line-height `0.86` |
| Sisuümbris | max-width 1200 px; küljed 40 px, mobiilis 24 px |
| Võrk | 52 × 52 px; rohelised jooned rgba(138,206,0,0.026) |
| CRT-jooned | 4 px kordus, ühe piksli roheline rgba(138,206,0,0.012) |
| Põhieasing | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Snap | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Tavapärane lühisiire | 200 ms |

Säilita suur kitsas KEEP IT / UNDERGROUND pealkiri, must pind, roheline aktsent, tehnilised märgised, kandilised nupud ja õhukesed piirid. Ära asenda seda valgete ümardatud kaartide, uute gradientide ega teise sans-serif brändiga.

### Täpsus ja kasutatavus

„Täpselt sama” nõuab laetud õigeid fonte ja samal ekraanilaiusel võrdlust. Prototüübi varufont ei tõesta vastavust. Näita võrdlust 1440 px laiuses ja kontrolli 320/390/768 px vaateid. Olemasoleva lehe mõõte ei kirjutata ühegi uue maketi järgi tervikuna ümber.

Samas ei tohi dekoratiivse tumeduse nimel peita hindu, silte, vigu või maksuinfot. Väikesed tehnilised metaandmed võivad säilitada stiili, kuid põhiline ostuinfo peab jääma loetavaks. `prefers-reduced-motion`, klaviatuurifookus, Escape ja puutejuhtimine peavad töötama.

Repo custom-cursor’i kasutamisel peab native-kursor jääma töökindlaks varuvariandiks. Ära kopeeri `cursor:none` ilma toimiva kursori ja puuteseadme eristuseta. Ära kata pilte, vorme ega nuppe CRT-kihiga. Ostukorvis ega kassas ei käivitu heli automaatselt. Ära tee kogu avaliku saidi kursori-/helirefaktorit selle piiratud töö kõrval varjatult. [R1, R9]

## 7. Mida viimases kujunduspaketis tegelikult valmis tehti?

`design/index.html` on iseseisev klikitav prototüüp: Home, Shop, kaks tootelehte, galerii, kogusevalik, ostukorv, eemaldamine ja kassa juurde suunamise kavand. Pildid on HTML-is kaasas; Google Fonts vajab internetti. Ajutine demokorv ei ole Fourthwalli korv ja kaob lehe värskendamisel.

`design/next-preview/` sisaldab ettevalmistatud `/commerce-preview` marsruuti. See serveerib sama demonstratsiooni ainult kohaliku arenduse või tuvastatud Verceli Preview puhul. Production ja tundmatu hostitud keskkond peavad saama 404. See kontroll **ei asenda** Verceli ligipääsukaitset; mõlemad peavad säilima.

Failide põhirollid:

| Fail | Roll |
|---|---|
| `design/storefront.css` / `storefront.js` | Redigeeritava iseseisva maketi stiil ja käitumine. |
| `design/build_preview.py` | Iseseisva HTML-i genereerimine. |
| `design/automation/build_next_preview.py` | HTML-ist Next.js eelvaate mooduli ja CSP vastavuse genereerimine. |
| `design/next-preview/src/app/commerce-preview/route.ts` | Serveripoolne piiratud eelvaatemarsruut. |
| `design/next-preview/src/lib/kiu-commerce-preview.mjs` | Genereeritud eelvaatesisu ja vastuse abifunktsioonid. |
| `design/spec/products.preview.json` | Märgistatud staatiline snapshot, mitte reaalne hinnastamise või nähtavuse autoriteet. |
| `design/spec/design.tokens.json` | Lähtekujunduse väärtused ja demo laienduste kirjeldus. |
| `design/spec/fourthwall-theme-map.json` | Soovitud native-seadistused, mitte kinnitatud konto konfiguratsioon. |
| `design/evidence/` | Eelmise lokaalse testimise tulemused ja varufontidega pildid. |

Ära kirjuta prototüübi `storefront.css` failiga repo `globals.css` üle. Ära kleebi seda tervikuna Fourthwalli kassasse. Ära lisa oma ostukorvi kõrvale teist provider’it, teist Navbar’i ja teist Footer’it.

**Tegemata:** selle kujunduse repo-/Preview-integratsioon, kogu rakenduse build ja regressioonikontroll, õigete fontidega pikslivõrdlus, hostitud Fourthwalli teema tegelik rakendamine ja päris ostuteekond. HTML-i olemasolu ei tähenda neid tehtuks. [R1]

## 8. Koodibaasi lähtekaart ja olemasolev risk

Stack on olemasoleva `package.json` järgi Next.js 16 / React 19 / TypeScript / Tailwind 4 / Vercel. Deklareeritud sõltuvused on vahemikud, mitte täpne installitõend: Next `^16.2.1`, React `^19.2.4`, TypeScript `^5.9.3`, Tailwind `^4.2.2`, Zod `^4.3.6`, Stripe `^20.4.1`. Installi täpsuse autoriteet on repo lockfile. Ära uuenda kogu stack’i selle kujundustöö raames.

Loe vähemalt:

```text
CLAUDE.md
package.json
package-lock.json
src/app/globals.css
src/app/layout.tsx
src/app/page.tsx
src/app/shop/page.tsx
src/app/shop/[slug]/page.tsx
src/components/layout/navbar.tsx
src/components/layout/footer.tsx
src/components/shop/product-card.tsx
src/components/shop/product-detail.tsx
src/components/shop/shop-grid.tsx
src/components/shop/cart-drawer.tsx
src/lib/cart-context.tsx
src/lib/products.ts
src/lib/fourthwall-storefront.ts
src/app/api/fourthwall/status/route.ts
src/app/api/checkout/route.ts
```

Ära eelda iga ajalooliselt nimetatud faili olemasolu: kontrolli tegelikku puud. Server Components on eelistatud; kliendikomponent ainult interaktsiooniks. Kasuta olemasolevat tüübisüsteemi ja stiilitokeneid, mitte uut framework’i.

### P0 — vana Stripe-kassa EI OLE Fourthwalli kassa

Praeguse main-snapshot’i `src/app/api/checkout/route.ts`:

- võtab osturea hinna ja tarnekulu kliendi esitatud andmetest;
- loob eraldi Stripe Checkout Session’i EUR-is;
- Stripe’i võtme puudumisel tagastab demo-suunamise `/confirmation` lehele;
- lisab vana artistifondi metadata.

See on koodilugemise leid, mitte tõend, et avalikus poes toimus selle kaudu makse või kuritarvitus. **Ära ühenda uusi lauamatte selle voo külge.** Vastasel juhul võib makse olla eraldi tootmise/tarne süsteemist või kinnituseleht näida ostuna ilma makseta.

Kujundusetapis ei muudeta avalikku vana kassat. Hilisemas eraldi kinnitatud päris integratsioonis tuleb see teekond asendada või ohutult eraldada, võtta hinnad ja variandid platvormi kinnitatud andmetest ning lubada ainult õige Fourthwalli kassasuunamine. „Checkout õnnestus” ei ole lubatud järeldus nupuklikist, `success`-URL-ist või kliendi state’ist. [R8, R10]

## 9. Järgmise töövooru täpne järjekord

### A. Algseis, varukoopia ja õige haru

Kontrolli tegelikku ligipääsu repo ja brauserini. Loe lubatud töökausta raportid. Salvesta `git status`, remote, aktiivne haru ja SHA. Ära tee `reset --hard`, `clean -fd`, sundpush’i ega kirjuta kasutaja muudatusi üle.

Loe värske main ja sama eesmärgiga olemasolevad harud/PR-id. Selle üleandmise hetkel open PR-ide loend oli tühi; see ei välista kohalikku pooleliolevat disainitööd. Jätka seda, kui olemas. Muidu loo eraldi feature-haru; `feat/commerce-design-parity-20261001` oli eelmise paketi **soovitus**, mitte loodud haru. Uue nime kuupäev võib vastata tegelikule tööpäevale.

Salvesta võrdlus olemasoleva saidi home/shop/detail/korvi vaadetest seal, kus need on kättesaadavad. Ära võta privaatseid kontakt- või makseandmeid screenshot’ile.

**A lõpetatud:** õige repo/projekt tõendatud, säilitatud kasutaja töö, lähtebaseline olemas.

### B. Kaasasolev kujundus kaitstud Preview’sse

Ava kohalik `design/index.html`, mõista tehtud vaateid. Käivita paketi kontrollid. Vali ettevalmistatud `/commerce-preview` marsruudi minimaalne integreerimine, kui sama eesmärgiga paremat kohalikku teostust pole.

Kopeeri ainult vajalikud `next-preview/src/` failid uue haru vastavatesse kohtadesse. Olemasoleva sama nimega faili puhul tee diff. See demo ei vaja uut Storefront-tokenit, uut andmebaasi ega vana diagnostikalipu seadistamist.

Kui HTML-i, CSS-i või JS-i muudad, genereeri HTML ja Next.js moodul uuesti; hoia CSP skriptihash kooskõlas. Säilita `connect-src 'none'`, `form-action 'none'` ja muud demonstratsiooni piirid. Ära ava makse-API ühendust selleks, et demo tunduks päris.

Käivita tegeliku repo typecheck/build ning sobiv lint. `package.json` sisaldab praegu `lint: next lint`; kontrolli käsu tegelikku toimivust kasutatava Next-versiooniga. Ebaõnnestumise korral raporteeri lähteprobleem või tee väike põhjendatud parandatud kontrollkäsk feature-harus. Ära märgi käivitamata lint’i läbituks.

Avalda ainult õige projekti feature-Preview. Kontrolli keskkond + branch + SHA + READY + tegelik lehevastus. Kasuta olemasolevat toimivat Verceli projekti/meeskonna seost. Ära loo uut projekti ega avalda Productionisse.

**B lõpetatud:** ligipääsukaitsega Preview, arusaadavalt demo, õige fontide kontroll või täpselt dokumenteeritud puudus; mitte pelgalt valmis build.

### C. Kujunduse ülekandmine päris React-komponentidesse

Kui aeg ja ligipääs võimaldavad, tee samas isoleeritud harus tegelik komponentide teostus. Esimene kohustuslik tulemus on B; komponendietappi ei tohi teeselda HTML-route’i lõpetamise põhjal.

**Kataloog:** kaks suurt tootekaarti, 2 veergu laial ekraanil / 1 mobiilis, õiged proportsioonid ja nimed. Avalikud tooted tulevad Storefronti päris vastusest. Private-andmete demonstratsioon tohib olla ainult kaitstud, selgelt märgistatud eelvaates. Tühi avalik kataloog on aus tühi olek, mitte luba välja mõelda laoseisu või hinnastust.

**Tooteleht:** suur pilt ja pisipildid, tegelik tootenimi, mõõt, kirjeldus, üks kogusekontroll, selge ühe põhitoimingu loogika, vajalikud infojaotised. Kogu matt peab mahtuma või detailvaade olema selgelt eristatav. Ära venita pilte; `width/height` atribuudid peavad sobima `height:auto` ja kuvasuhtega.

**Ostukorv:** üks provider; variant-ID kui identiteet. Ei vanade fiktiivsete rõivaste ja uute mattide juhuslikku segamist. Gated-demo hinnad on „planned price”. Päris adapteris tuleb vältida kliendi esitatud hinnatõe kasutamist. Kogusepiirid, tühi korv, eemaldamine, Escape, fookuse lõks ja tagastamine peavad töötama.

**Kassasse suunamise kavand:** ei küsi demolt aadressi/telefoninumbrit/kaardiandmeid. Ei näita fiktiivset edukat makset. Selgitab, et päris summa, maksud ja tarne arvutatakse Fourthwallis; link aktiveeritakse alles hilisema päris ostuteekonna kinnitamisel.

**C lõpetatud:** teostatud komponendid eristatavad prototüübist, testid vastavad tegelikule andmerežiimile, avalikule kliendile ei leki privaatseid tooteid või demo-ostuteekonda.

### D. Fourthwalli native-teema ja kassa brändimine

See alamtöö ei pea B/C edenemist peatama. Kasuta ainult tegelikult olemasolevaid native-tööriistu või kasutaja lubatud brauserit. Dokumentatsioonis kirjeldatud toiming ei ole tõend, et konkreetne MCP seda pakub.

Loe teema hetkeseis ja salvesta värvid/fondid/nupud/skin. Kontrolli, kas muudatused saab **päriselt isoleeritud avaldamata teema mustandisse** teha. Üks ametlik juhend ütleb, et muudetakse aktiivset teemat; teised varasemad juhised kirjeldasid draft-teemat. Ära peida seda lahknevust. Kontrolli tegelikku kontovaadet. `COMING_SOON` üksi ei taga, et näidiskassa või aktiivse teema välimus ei muutu.

Kui isoleeritud mustand on tõendatud ja see pole kellegi teise pooleliolev töö, võib seal muuta:

```text
Primary: #8ACE00
Background: #050505
Text: #E8E4DC
Text Over Primary: #050505
Heading: Bebas Neue 400
Body: Space Mono 400 / 700, kui toetatud
Buttons: Square
Checkout Skin: Dark mode
```

Kui isoleeritud mustandit ei ole, ära salvesta aktiivsele teemale: väljasta soovitud väärtused ja märgi see alamtöö BLOCKED. Ära muuda poe staatust, et kujundajat avada.

Kassa kohandatavus on platvormis piiratud. Eesmärk on sama identiteet toetatud piirides, mitte tõendamata 1:1 CSS-vabadus. Ära kasuta kaardiväljade iframe’i häkkimist, blokeeri partneri logosid, peida tax/shipping/veateateid ega lisa kontrollimatut JS-i. Pärast iga salvestust loe väärtused uuesti ja võrdle tegelikku checkout’i preview’d. [R11, R12]

### E. Lõppkontroll ja tõendatud üleandmine

Salvesta eri laiuste vaated, testitulemused, täpsed muudetud failid, branch/SHA, Preview link ja kõrvalmõjude kontroll. Loe võimalusel kahe toote ID-d/Private-olek ning shop-status lõpus uuesti. Ära tee selleks kirjutustoiminguid.

Kui login on ainus takistus, ava päris teenuse login ja lase kasutajal samas brauseris autentida. Ära palu iga tavalise klõpsu järel uut ekraanipilti. Sama ebaõnnestunud ligipääsusammu ei korrata lõputult; põhjendatud katse järel fikseeri takistus ja lõpeta teised sõltumatud osad.

**E lõpetatud:** üks eestikeelne aruanne, kus prototüüp, komponentteostus, serveripäring, theme-draft ja ostuvoog on eraldi hinnatud.

## 10. Serveriühenduse lahendatud osa

Tõendatud kasutaja/Codexi tulemus oli:

```json
{
  "connection": "ok",
  "identityPinned": true,
  "shop": {
    "id": "sh_1f2e8f65-2b29-4be9-9167-7f42314361fb",
    "name": "KEEP IT UNDERGROUND"
  },
  "salesReady": false
}
```

See oli HTTP 200 `application/json`, mitte HTML-sisselogimine. Õige töökausta sidumine olemasoleva Verceli projekti ja meeskonnaga lahendas kontrolli; kasutaja järgi õnnestus kordus ka kohaliku OIDC faili eemaldamisel. `VERCEL_AUTOMATION_BYPASS_SECRET` polnud vajalik. See on kasutaja esitatud päris tulemus; ülal olev minimaalne JSON ei ole uue kontrolli toorfail.

Viimane teadaolev kontrollitud deployment:

```text
Deployment: dpl_EkL3BikRbd6kH2bPQ2GSQ1PXg4Ws
Host: kpt-underground-ctoozrsr1-leisson-creative.vercel.app
Branch: feat/fourthwall-storefront-readonly-20260923
SHA: a524b3718565a5727d3f122682f2831922799e4d
Endpoint: /api/fourthwall/status
```

See pole uue kujunduse Preview. Vana diagnostikabranchi olemasolu ei ole põhjus alustada sealt main-merge’i uuesti; PR1 on ühendatud.

Keskkonnamuutujate **nimed**, väärtussaladusi paketis pole:

```text
FOURTHWALL_STOREFRONT_TOKEN
FOURTHWALL_READONLY_ENABLED
FOURTHWALL_EXPECTED_SHOP_ID
```

Storefronti avalik token ei ole Platform API parool ega Verceli autentimistõend. Neid ei saa üksteise asemel kasutada. Olemasolevat tokenit ei küsita uuesti, kui see on kasutaja lubatud seadistuses olemas. Ära otsi kogu arvutist saladusi ega kopeeri brauseriprofiili.

`/commerce-preview` HTML-demo ei vaja neid API-seadeid. Kui hilisem päris adapter vajab uue branch’i Preview-s samu seadeid, kontrolli harupõhist ulatust ja kasuta olemasolevat turvalist seadistust. Ära tee pimesi uut redeploy’d lihtsalt vana 302 raporti tõttu.

## 11. Näidiste tellimine ja range kulupiir

See on eraldi, praegu lõpetamata äriline töö. Kasutaja andis loa **ühele SIGNAL-ile ja ühele SUBSURFACE’ile**, samale juba kinnitatud Eesti aadressile, Standard-tarnega ning kogukuluga **kuni 80,49 USD**. See ei ole üldine ostuluba ega kujundustöö eelarve.

| Kassapakkumine | Tooted | Tarne | VAT | Toll | Töötlemine | Kokku |
|---|---:|---:|---:|---:|---:|---:|
| Varasem üks SIGNAL | 13.00 | 22.89 | 8.61 | 3.41 | 1.73 | 49.64 USD |
| Varasem kaks näidist | 26.00 | 31.29 | 13.75 | 6.82 | 2.63 | 80.49 USD |
| Hilisem kahe näidise ekraanipilt | 26.00 | 31.45 | 13.79 | 6.80 | 2.63 | **80.67 USD** |

Viimane pilt ületab loa **0,18 USD**. Ümardamine, disainiga edasi liikumine või üldine „tee kõik ära” ei suurenda seda limiiti. Viimase pildi summa ei ole praeguse kassa reaalajas uus pakkumine; see tuleb ostu juurde naastes üle kontrollida.

Selles disainitöövoorus **ei tellita ega maksta üldse**. Näidistellimuse juurde naasmine on eraldi töö. Seal tuleb esmalt kontrollida duplikaattellimuse puudumist, samu variante/koguseid/aadressi/tarnet, lõpphinda ja kasutaja makseviisi. Piiriületuse korral peatu enne makset. Ära saada sama ebamäärase maksetulemuse järel tellimust teist korda.

Kassast on lisatud ainult isikuandmeteta finantslõige `evidence/owner-quote-80.67-financial-crop.png`. Tarnija aadressi, telefoninumbrit, kliendi emaili ja kassa seansi URL-i ei ole selles paketis. Vajaduse korral kasuta sama kontrollitud kassaaadressi kasutaja lubatud lokaalses seansis, mitte oletuslikku ettevõtte aadressi.

Eesti näidise kogukulu ei ole USA klienditellimuse omahind. Planeeritud 34 minus tootebaasi 13 = 21 USD **enne** maksetasusid, saatmise katmist, reserve, turundust ja muid kulusid; see pole puhaskasum. Füüsiline kvaliteet ja USA tegelik jaekassa koguhind on tulevased kontrollid, mitte disainidemost tuletatud PASS. [R1, R13]

## 12. Hilisem päris ostuteekond — kavanda, ära aktiveeri selle loaga

Soovitud ülesehitus:

```text
Olemasolev Next.js veeb ja kujundus
→ päris avalikud Fourthwalli tooted/variandid
→ üks ostukorv
→ Fourthwalli hostitud checkout
→ platvormi kinnitatud makse ja tellimus
→ Fourthwalli tootmine ja tarne
```

Storefront API toetab kohandatud kataloogi/korvi ja hostitud kassasse suunamist. See ei tähenda, et praegune GET-diagnostika oleks juba ostukorviintegratsioon. Päris adapter nõuab eraldi teostust ja kontrolli. [R10]

Enne käivitamist on vaja kinnitatud tooteid, hinda, tagastus- ja tarneinfot, õigusi, veebiteksti ning makse/täitmisteekonda. Võõra või privaatse variandi ost peab blokeeruma serveris; kliendi esitatud hind, väide `salesReady` või sama nimega toode ei ole autoriteet.

Kassa suunamine ei tohi lubada kliendi määratud suvalist URL-i. Vana demo `/confirmation` ei tohi näida päris ostukinnitusena. Tellimuse sündmus ja tagasimakse tuleb mõõta platvormi tegelikust tulemusest, mitte `Add to cart` või redirect-klikkidest.

Nende teemade disain ja tehniline ettevalmistus võivad olla haru sees kavandatud; reaalse kassaseansi loomine, ost, avaldamine ja production-migratsioon vajavad vastava etapi selget luba. Ära tee proovimakset selleks, et kujunduskontroll läbida.

## 13. Sisu, brändihääl ja tõepärasus

Kliendile mõeldud tekstid on inglise keeles, kasutajale antavad tööraportid eesti keeles. Tone on tehniline, selge ja tootekeskne. Brändinimi jääb KEEP IT UNDERGROUND. KPT võib säilida olemasoleva graafilise lühendina, mitte uue eraldi äribrändina.

Päris toote kirjeldusteks kasuta `copy/product-descriptions.en.md` hetkesnapshot’i või uuesti loetud sama toote väärtust. Ära kirjuta vana lühikest SUBSURFACE kirjeldust tagasi. Ära nimeta üht toodet ümber teise järgi; ID seob faili, mitte ainult pealkiri.

Uue commerce-maketi tekstiettepanek:

> Original graphic objects for creative desks and home studios. Make room for your next idea.

See on uus ettepanek, mitte olemasoleva avalehe sõnasõnaline tekst ega juba avaldatud muutus. Avaliku avalehe vanad „Soundsystem workwear”, „4 equipment lines”, „10% artist fund” ja salajase ligipääsu lubadused ei ole kinnitatud kahe mati pakkumise osaks. Nende eemaldamine/tootmisse avaldamine toimub hilisemas kinnitatud sisumigratsioonis, mitte kõrvalise vaikse muudatusena.

Ära lisa väljamõeldud arvustusi, artistiväljamakseid, päritolusertifikaate, „Made in USA”, garanteeritud saabumispäeva, tervisekasu ega paremat materjali kui konkurentidel. „On demand” või „Unlimited” ei tõenda piiramatut kohe laos olevat füüsilist kaupa. „Ships within 3 days” ei tähenda kolmel päeval kliendini jõudmist.

## 14. Tööriistad ja autentimine: mida järgmine agent peab teadma?

Selles ChatGPT sessioonis töötasid nüüd Fourthwalle’i poe/toodete/väljamaksete/tellimuste lugemised ning GitHubi ja Verceli lugemised. **Ühendused ei kandu automaatselt Claude’ile.** Claude peab vaatama enda tegelikke tööriistu, mitte väitma ligipääsu ainult selle dokumendi järgi.

Fourthwalli MCP avalik endpoint oli `https://mcp.fourthwall.com`. Seda ei ole põhjust vaikimisi uuesti seadistada. Kui Claude’i ühendus on olemas, kasuta seda; kui ei, kasuta juba lubatud toimivat brauserit ja jäta ühenduse puudumine konkreetse alamtöö piiranguks. Ära käivita kogu projekti uuesti päevadepikkuse pluginatõrkeotsinguna.

Olulised võimete piirid:

- `get-offers-by-ids` tagastab päriselt Private-tooted, kuigi üldise listi/muutmise skeemid võivad loetleda ainult PUBLIC/HIDDEN/ARCHIVED. Otsene ID-päring on kindlam kui tühi üldloend.
- Tootestaatus PRIVATE ja kollektsioonistaatus PRIVATE pole sama. Ära muuda kollektsiooni, et varjata toote avaldamist.
- Toote muutmise skeem näitas PUBLIC/HIDDEN/ARCHIVED; privaatse oleku säilitamist ei tohi oletada massmuutmisel.
- Sample-checkout’i tööriist oli vastuolulise skeemiga: `challengeDefinitionId` kirjeldatud optional, kuid nõutud. Ära mõtle seda ID-d välja. See ei takista veebidisaini.
- Kujundustööriistade tekstides mainitud üleslaadimisfunktsioon ei tõenda, et funktsioon on Claude’i tööriistaloendis tegelikult olemas. Varem valmis toodete jaoks pole uut upload’i tarvis.
- Fourthwalli teema muutmise eraldi toimingut ei tuvastatud selles üleandmises. Kasuta tegelikku native UI-d või avastatud toetatud funktsiooni, mitte dokumenteerimata API-sid.
- Repo `CLAUDE.md` ei tohi tühistada kasutaja kitsaid makse-, avaldamis- ega saladusepiire.

Ära küsi paroole/kaardiandmeid vestlusse, loe brauseri küpsiseandmebaasi ega tõsta `.env` sisu raportisse. Kasutaja sisselogimine toimub teenuse päris lehel samas kontrollitavas seansis. [R14]

## 15. Testid: mis on läbitud, mis tuleb veel läbi teha?

### Eelmise kujunduspaketi säilinud tõendid

- Kohalikus UI-kontrollis **75 PASS, 0 FAIL, 3 BLOCKED** — 320/390/1440 px ja funktsionaalsed interaktsioonid.
- Kolm BLOCKED kontrolli puudutasid päris Bebas Neue / Space Mono renderdust. Testid kasutasid varufonte.
- Preview-kaitse Node-testid 10/10 PASS.
- Valikulise Next-marsruudi eraldiseisev TypeScripti kontroll PASS.
- Kogu Next.js projekti build/lint, hostitud kujundus ja päris checkout jäid selles paketis kontrollimata.

### Selle üleandmise käigus

- Mõlema PNG SHA-256 ja pikslimõõdud võrreldi oodatuga.
- Olemasolevad **10 preview-guard testi jooksutati uuesti**, kõik läbisid kontrolli; logi `reports/preview-guard-rerun.txt`.
- UI 75 kontrolli siin uuesti ei käivitatud ega fontide puudujääki lahendatuks ei loetud.
- Üleandmispaketi manifesti, PNG-headeri ja failide tervikluse kontroll on eraldi. See ei tõenda Fourthwalli üleslaadimist või füüsilist kvaliteeti.

### Claude’i uue Preview nõutav testimaatriks

| Valdkond | Nõue |
|---|---|
| Identiteet | Õige repo, team, project, branch, commit, kaks sama offer ID-d. |
| Fonteerimine | Bebas Neue ja Space Mono on tegelikult laaditud; fallback tuvastatav. |
| Layout | 1440 / 768 / 390 / 320 px; puudub horisontaalne ülejooks. |
| Tootevisuaalid | Õige tume/heleda kujunduse seos, korrektne kuvasuhe, ei venitamist ega uute trükifailide kasutuselevõttu. |
| Navigatsioon | Home/shop/detail/tagasi, mobiilimenüü ja aktiivne leht arusaadavad. |
| Korv | Tühi, üks, kaks toodet; koguse piirid; eemaldamine; kliendile ei lubata demomakset. |
| Klaviatuur | Tab, nähtav fookus, Escape, modaalfookus ja tagastamine. |
| Liikumine/heli | Reduced motion, puuteseade ja JS-tõrke korral kasutatav sisu; ei automaatset kassaheli. |
| Ohutus | Demonstratsioonist puuduvad päris kassaseansi-, makse- ja tellimuspäringud. |
| Piirid | Production ja tundmatu hostitud keskkond ei serveeri `/commerce-preview` sisu; noindex ja deployment protection säilivad. |
| Kontod | Ükski toode/hind/print/DNS/Production-seade ei muutunud kõrvalmõjuna. |
| Tõendid | Tegelik uus URL, branch/SHA ja testide toorfailid; mitte vaid „Save vajutatud”. |

Kohaliku paketi käsud (`design/` kataloogis):

```sh
python build_preview.py
python automation/build_next_preview.py
node --check storefront.js
node --test automation/preview-guard.test.mjs
python automation/check_preview.py
```

Loe skriptid enne käivitamist. Brauseritest vajab Pillow/Playwrighti ja Chromiumi; ära paigalda pimesi tasulisi teenuseid või globaalseid sõltuvusi. Päris repo kontrollid käivita selle lockfile’i ja tegelike skriptide järgi.

## 16. Automaatika, mis vähendab järgmist käsitööringi

**Praegu pakis olemas:** redigeeritav makett → HTML genereerimine → Next-preview genereerimine → CSP/ligipääsukaitse test → lokaalne UI QA. Lisaks selle üleandmise tervikluse kontroll ja toote-ID/PNG manifest.

**Claude’i teostusülesanne:** siduda olemasolev disainikaannon ühe komponentide kihiga, kasutada üht toote-ID registrit ning käivitada sama kontrollmaatriks iga feature-Preview puhul. Kõrvale ei ehitata uut automaatikaplatvormi.

**Hilisem ettepanek, mitte praegu käivitatud taustatöö:** müügi avanemisel platvormi tellimuse/raha sündmus → raport → tagasimaksetega korrigeeritud kate. Näidiseid eraldi, topeltsündmusi ei loeta teist korda. Pelk ostunupu klikk pole revenue. Saatmise jälgimine ja perioodilised raportid vajavad eraldi kasutaja tellitud käivitamist; siin neid ei loodud.

## 17. Lubatud ulatus ja peatamiskohad

| Lubatud järgmises kujundustöövoorus | Vajab eraldi otsust või pole lubatud |
|---|---|
| Olemasoleva repo/konto lugemine ja vajalikud varukoopiad | Konto ümbernimetamine, uus pood või projekt |
| Kohalik/feature-haru kood ja testid | Force-push, kasutaja failide kustutamine, main-merge |
| Õige projekti kaitstud Preview | Production deploy, Promote, DNS-muutus |
| Täpselt isoleeritud draft-teema, kui UI seda tõendab | Aktiivse Fourthwalli teema avaldamine või Coming Soon staatuse vahetus |
| Tooteandmete lugemine samade ID-de järgi | Uued tooted, Private→Hidden/Public, hinnad, trükifailide/variantide muutmine |
| Näidiste hinna ajaloolise info dokumenteerimine | Makse/tellimus või 80.49 USD piiri ületamine |
| Päris renderduse/veebipildi kasutamine kaitstud disainis | Fiktiivsed füüsilised näidised, fake reviews, artistifondi lubadus |

Peatu ainult mõjutatud alamtöös, kui sihtobjekti ID on vale, kasutaja töös on konflikt, teema salvestuse nähtavus ebaselge, vajalik autentimine puudub või nõutakse ootamatut kulu. Jätka ülejäänud iseseisvaid lubatud töid. Puuduvat kontakti või tehnilist õigust ei täideta oletusega.

## 18. Claude’i lõpparuande leping

Väljasta üks eestikeelne koondraport. Lisa järgmised väljad:

```text
TULEMUS: PASS / PARTIAL / BLOCKED
Tööulatus ja kontrollimise aeg
Repo / lähte-SHA / uus haru / uus commit
Preview täpne URL / deployment ID / keskkond
Muudetud failide loend
Iga vaate tulemus eraldi
Fontide tegelik laadimine ja visuaalne võrdlus
Kohalik prototüüp vs päris React-komponentide teostus
API/ostukorvi/kassa tegelik ühendatus või nende puudumine
Fourthwalli teema: soovitud / tegelikult salvestatud / avaldatud või mitte
Toodete PRIVATE-olek ja muutmata identiteedid
Testid: PASS / FAIL / BLOCKED / NOT_RUN / NOT_APPLICABLE
Maksete, tellimuste, DNS-i ja Production-muudatuste tegelik puudumine
Järgmine üks otsus, kui seda tõesti on vaja
```

Ära kirjuta kasutaja vana `execution-record.json` struktuuri pimesi üle. Loe selle skeemi ja lisa uus ajatempliga kirje, säilitades varasema ajaloo. Kui fail puudub, kasuta selle paketi template’i uue eraldi raportina, mitte näilise jätkuna lugemata ajaloole.

## 19. Millal praegune töö on lõpetatud?

Lõpetatud on vähemalt üks kaitstud hostitud kujunduseelvaade õiges projektis, millel saab üle vaadata kaks õiget toodet, detailid ja korvi; kasutatud on olemasolevaid fonte/värve ning tegelikud kontrollid on kirjas. Puuduvad asjad on täpselt piiritletud, mitte varjatud üldise „valmis” sõnaga.

Täielikult kujunduse järgi toimiv **avalik müügipood** on hilisem tulemus. Selleni jõudmiseks tuleb eraldi lõpetada füüsilise kvaliteedi kontroll, kinnitatud hinnad, USA jaekassa lõppkulu ja tellimuse täitmine, vana checkout’i turvaline migratsioon, avaliku teksti tõepärasus ning kasutaja avaldamisluba. Disainiga võib praegu edasi minna ka tellimata näidiste korral; mõlema tööliini staatus jääb eraldi.

**Ära kuluta järgmist vooru juba lahendatud SSO-le ega loo kolmandat samasisulist plaanipaketti. Kasuta kaasa pandud teostust ja vii see kontrollitud Preview’sse.**

## 20. Allikad ja lugemispiirid

Viited [R1–R14] on lahti kirjutatud failis `reference/SOURCE-REGISTER.md`. Allikaregister eristab olemasolevaid faile, kasutaja raporteid, selle üleandmise live-lugemisi ja ametlikku dokumentatsiooni.

- Uued konto/repo andmed loeti ainult lugemistoimingutega; dokumentide koostamine ei muutnud neid.
- Kasutaja Windowsi kohalikke aruandeid ega nende JSON-toorvastuseid selles üleandmises ei loetud.
- Kassa finantslõige näitab pakkumist, mitte makset. Üldine tellimustühi vastus piirdub tehtud filtriga.
- Ajaloolist ärimemot hoitakse muutmata `reference/` all, kuid seda ei kasutata hetkeseisu autoriteedina.
- Väliste API-de ja platvormide võimed võivad muutuda; Claude peab enne kirjutamist kontrollima tegelikku skeemi ja sihtobjekti. Dokumentatsiooni näide pole automaatne volitus.
