# KEEP IT UNDERGROUND — tootepiltide ja vektorfailide üleandmine Claude'ile

**Kuupäev:** 02.10.2026  
**Eesmärk:** anda Claude'ile kõik vajalik uute strateegiliste toodete lisamiseks Fourthwalli poodi ja töö jätkamiseks ilma eelmist vestlust läbi töötamata.

## Mis selles paketis on?

See pakett sisaldab:

1. **päris vektor-SVG lähtefaile** (`assets/source/`),
2. **raster-tööfaile PNG kujul** (`assets/artwork/`),
3. **eelvaate- ja galeriipilte** (`assets/previews/`),
4. **tootemockup'e / kontseptsioonipilte** (`assets/exploratory-mockups/`),
5. **tooteregistrit hinnainfo, kataloogi-ID-de ja piirangutega** (`product-registry.json`),
6. **ingliskeelseid tootekirjelduste mustandeid** (`product-copy.en.md`),
7. **allika- ja failikontrolli materjale** (`research/`),
8. **Claude'i käivitusjuhist** (`CLAUDE-CONTINUATION-PROMPT.txt`).

## Kõige olulisem lühikokkuvõte

- Olemasolevad lauamatid **ei tohi muutuda**:
  - `KEEP IT UNDERGROUND Signal 01 Desk Mat` — offer ID `74c2ace1-4f7c-469b-a607-5555432019b4`
  - `KEEP IT UNDERGROUND Subsurface Desk Mat` — offer ID `97704a85-a6b6-4090-894f-a7b5bc71a374`
- Uued kavandid on **kohalikud disainivarad**, mitte veel loodud poe tooted.
- Poe väljamaksete seadistus oli viimases kontrollis **ACTIVE**.
- Uute toodete jaoks ei ole veel `offerId` väärtusi — need tuleb luua alles järgmises tööetapis.
- `canPublish` on kõigi uute toodete puhul **false**.
- Selle paketi eesmärk on **lisamise ettevalmistus ja turvaline teostus**, mitte automaatne avaldamine.

## Soovitatud uute toodete järjekord

### 1) Kõrgeim prioriteet
1. **SIGNAL — Studio Tote**
2. **PROJECT NOTES — SIGNAL / 01**
3. **PROJECT NOTES — SUBSURFACE / 02**

### 2) Teine laine
4. **OBJECT STUDIES — Six Marks** sticker sheet
5. **WALL STUDIES — SIGNAL / 01**
6. **WALL STUDIES — SUBSURFACE / 02**

### Miks selline järjekord?
- **Tote** ja **notebook** on funktsionaalsed, väiksema otsustuskuluga ning USA turule sobivad impulse / lifestyle tooted.
- **Sticker sheet** on madala hinnaga lisaost, mitte põhiprodukt.
- **Posterid** on visuaalselt tugevad, kuid sõltuvad rohkem reaalsest saadavusest ja tarnija seisust; registris on märkus, et avalik tooteleht näitas varem maintenance-olekut.

## Hinnainfo (testhüpotees, mitte live hinnakiri)

| Toode | Kataloogist loetud baasinfo | Soovitatud USA testhind |
|---|---:|---:|
| SIGNAL / SUBSURFACE wall poster | alates 5.50 USD | **29 USD / tk** |
| PROJECT NOTES notebook | 10.95 USD | **24 USD** |
| SIGNAL Studio Tote | alates 9.98 USD | **29 USD** |
| Six Marks sticker sheet | 5.05 USD | **12 USD** |

**Oluline:** need on ainult soovitatud testhinnad. Enne avaldamist tuleb kinnitada:
- tegelik baashind valitud variandile,
- USA kliendikassa lõpphind,
- saatmine,
- maksed / tasud,
- marginaal.

## Kuidas faile kasutada?

### `assets/source/`
Siin on **peamised vektor-SVG failid**. Need on parim lähtekoht Claude'ile, kui ta loob Fourthwallis uusi tooteid või kohandab kujundust tootemallidele.

### `assets/artwork/`
Siin on sama perekonna **PNG-rasterfailid**. Need sobivad eelvaateks, kiirtestiks või juhtudeks, kus tootja töövoog eelistab PNG üleslaadimist.

### `assets/previews/`
Need on **lamedad ülevaatepildid**, et Claude näeks kiiresti, milline fail millise tootega seotud on.

### `assets/exploratory-mockups/`
Need on **kontseptsiooni- ja tootevisualiseeringud**, mitte ametlikud trükifailid. Nende põhjal ei tohi väita, et toode on füüsiliselt testitud.

## Peamised failiseosed

- `wave02-signal-studio-tote-front.svg` → SIGNAL Studio Tote
- `wave02-signal-graph-notebook-cover.svg` → PROJECT NOTES — SIGNAL / 01
- `wave02-subsurface-graph-notebook-cover.svg` → PROJECT NOTES — SUBSURFACE / 02
- `wave02-signal-poster-v2.svg` → WALL STUDIES — SIGNAL / 01
- `wave02-subsurface-poster-v2.svg` → WALL STUDIES — SUBSURFACE / 02
- `wave02-sticker-01.svg` ... `wave02-sticker-06.svg` + `wave02-sticker-backer.svg` → OBJECT STUDIES — Six Marks

## Claude'ile tööreeglid

1. **Ära puuduta olemasolevaid desk mat tooteid.**
2. **Ära avalda uusi tooteid kohe.** Loo need Hidden / Private / draft-olekus vastavalt sellele, mida tegelik tööriist või UI võimaldab.
3. **Ära tee makseid ega tellimusi.**
4. **Ära muuda keepitunderground.com live-brändingut selle töö osana.**
5. **Ära väida kontrollimata tehnilisi omadusi.**
6. **Ära luba, et mockup = päris toode.**
7. **Kontrolli enne iga loomist kataloogi tegelik saadavus ja variant.**
8. **Dokumenteeri iga loodud toote uus offer ID, variant ID, staatus ja hind.**

## Järgmine konkreetne töö Claude'ile

- kontrollida Fourthwalli kataloogis toodete tegelik saadavus,
- valida õige baastoode / variant,
- laadida üles vastav kunstifail,
- koostada ingliskeelne listing olemasolevate copy-mustandite põhjal,
- määrata testhind,
- jätta tooted avaldamata,
- anda lõpus üle uute toodete ID-d ja kontrollitud seis.

Lisainfo on failides `product-registry.json`, `product-copy.en.md` ja `CLAUDE-CONTINUATION-PROMPT.txt`.
