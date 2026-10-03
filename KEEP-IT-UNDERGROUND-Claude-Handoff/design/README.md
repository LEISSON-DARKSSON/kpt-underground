# KEEP IT UNDERGROUND — olemasoleva kujunduse e-poe laiendus

**01.10.2026 · kohalik interaktiivne kujunduseelvaade, mitte avaldatud e-pood.**

## Ava esimesena

Ava `index.html` brauseris. HOME ja SHOP, mõlemad tootelehed, kohalik ostukorv ning kassa juurde suunamise kavand töötavad ilma kontota. Ostukorv on ajutine demonstratsioon ja kaob lehe värskendamisel. See ei loo Fourthwallis ostukorvi, kassaseanssi, tellimust ega makset.

Story, Artists ja Signal viivad eraldi vahekaardil olemasoleva avaliku lehe vastavatele osadele. Nende sisu pole selles paketis ümber kujundatud.

Bebas Neue ning Space Mono laaditakse Google Fontsist. Fondifaile paketis ei ole. Vajalik on internetiühendus. Ülemine riba näitab, kas kasutusel on lähtefondid või varufondid. Varufondiga pilti ei saa kasutada kirjatüüpide pikslitäpseks heakskiiduks.

## Mis on pärit olemasolevast lehest?

Kasutaja viitepilt, GitHubi kinnitatud `src/app/globals.css`, `src/app/layout.tsx` ja avalehe kompositsioon. Kontrollitud lähtecommit: `99d224189757db3fad1882085fe43f7ff6508ccf`. Värvide ja fondivalikute alus ei ole ekraanipildi oletuslik värvivalija. Täpsed väärtused on `spec/design.tokens.json`.

Kohalik makett tõlgib selle süsteemi kahe toote e-poeks. See pole olemasoleva saidi kogu koodi koopia ega kinnitatud üks-ühele renderdus. Kaubandusvaadete mõõdud, tekstid, klaviatuuritugi ja mobiilipaigutus on uue kujunduse osa. Avalikku veebilehte ei muudeta maketi avamisega.

## Mis on kaasa pandud?

- `index.html` — üks iseseisev HTML, pildid sees; põhieesmärk on otsustada kujunduse üle.
- `storefront.css`, `storefront.js`, `build_preview.py` — redigeeritav kujundus ja korduv genereerimine.
- `assets/` — varasemate kinnitatud kujunduste eelvaated ning neist tehtud WebP-koopiad; mitte tootmisfailid.
- `spec/products.preview.json` — kaks kindla ID-ga toodet, Private-olek ja 34 USD hinnahüpotees, mitte päris müügiandmebaas.
- `spec/design.tokens.json` — olemasoleva lähtekujunduse tokenid ning avalikustamata kujunduslaiendused.
- `spec/fourthwall-theme-map.json` — Fourthwalli seadistuste sihtväärtused, mitte juba rakendatud konfiguratsioon.
- `CODEX-IMPLEMENTATION.md` — tööjärjekord tegeliku repo ja brauseri jaoks.
- `next-preview/` — valikuline Next.js `/commerce-preview` marsruut ainult kohalikuks arenduseks / Verceli Preview-keskkonda. See ei ole päris kataloogimoodul.
- `evidence/` — kohalike testide tulemused ning varufontidega renderdatud vaated.
- `spec/source-register.json` — päritolu, kontrollitud allikad ja tõendite piirid.

## Mis ei ole tehtud?

Fourthwalli teemat, reaalset kassat, toodete hinda/nähtavust, GitHubi harusid ega Verceli avaldamisi pole selle töö käigus muudetud. Kogu rakenduse Next.js build ja reaalne ostuteekond on kontrollimata. Kaitstud Next.js eelvaate marsruudi failid on ette valmistatud, mitte serverisse paigaldatud.

Makett kasutab varasema tootearenduspaketi originaalseid kujunduseelvaateid. Need ei ole selles voorus Fourthwallist allalaaditud uued tooterenderdused ega füüsilised fotod. Päris poes tuleb kasutada õigete toodete kinnitatud hetkerenderdusi või kontrollitud näidiste fotosid. Kujunduse PNG-tootmisfaile ei ole vaja selle paketi tõttu uuesti trükitootesse laadida.

## Testid

Kohalikus Chromiumi kontrollis: **75 PASS, 0 FAIL, 3 BLOCKED**. Kolm kontrollimata asja on lähtefontide tegelik renderdus kolmes ekraanilaiuses, sest offline-test ei laadi väliseid fonte. Interaktsioonid, ekraanilaiused 320/390/1440, piltide proportsioonid, ostukorv ja maksete puudumine testiti varufontidega.

Preview-kaitsete Node-testid: **10/10 PASS**. Valikulise marsruudi eraldiseisev range TypeScripti kontroll: **PASS**. Need ei ole kogu rakenduse ega Fourthwalli ostuteekonna testid.

Kordamiseks (vajalik Python koos Pillow ja Playwrightiga, Node.js ning Chromium):

```sh
python build_preview.py
python automation/build_next_preview.py
node --check storefront.js
node --test automation/preview-guard.test.mjs
python automation/check_preview.py
```

Brauseritesti käivitaja leiab olemasoleva Chromiumi või kasutab Playwrighti installitud brauserit. Vajaduse korral sea `CHROMIUM_PATH` oma brauseri käivitatava faili teeks. Test ei laadi väliseid fonte ega saada kaubanduspäringuid.

## Rahaline piir

Uus kasutaja kassapilt näitas 80,67 USD. Varasem tellimisluba oli kuni 80,49 USD. Vahe on 0,18 USD. Käesolev kujundustöö ei suurenda ostulimiiti ega anna luba näidistellimuse kinnitamiseks.
