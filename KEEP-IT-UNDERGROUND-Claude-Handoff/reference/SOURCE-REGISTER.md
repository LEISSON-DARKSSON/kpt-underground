# Allikaregister ja tõendite piirid

**Koondatud 02.10.2026.** Kohalike failide puhul on kaasas tegelikud baidid. Konto- ja repolugemised on kokku võetud `state/current-state.json` failis. Need kokkuvõtted on normaliseeritud, mitte kogu tööriistaliikluse muutmata logi.

| ID | Allikas | Toetab / piirang |
|---|---|---|
| R1 | Kaasas `design/README.md`, `design/CODEX-IMPLEMENTATION.md`, `design/spec/` ja `design/evidence/`; pärit failist KEEP-IT-UNDERGROUND-Shop-Design-Handoff.zip (01.10.2026) | Viimane kujundusülesanne, maketi piirid, hinnasiht, testide senine seis. Dokumendid on eelvaate teostusjuhised, mitte hostitud poe tõend. |
| R2 | Vestluse kasutaja otsused ja `2026-09-23-business-memo-HISTORICAL.md` | USA tellimuspõhine katse, kaks disaini ja algne null-laovaru piirang. Ajaloolised hinnad, prognoosid ja ligipääsuseis ei ole värsked faktid. |
| R3 | Fourthwalle `ecommerce_get-current-shop`, `ecommerce_get-offers-by-ids`, `ecommerce_get-payout-info`, `ecommerce_get-orders` — üleandmise live-lugemised | Õige pood, Coming Soon, kaks Private-toodet, praegused kirjeldused, ACTIVE payout. Orders päring piirdus kahe offer ID-ga ja tagastas tühja loendi. Ei tõenda kogu kliendi makseajalugu ega füüsilist kvaliteeti. |
| R4 | https://api.github.com/repos/LEISSON-DARKSSON/kpt-underground/branches/main | Kontrollitud main SHA ja merge-commit. Tulevane töö peab kontrollima, kas seis on muutunud. |
| R5 | https://github.com/LEISSON-DARKSSON/kpt-underground/pull/1 ; GitHub get_pr_info | Metadata: closed, merged=true, draft=false, merge SHA99d224… . PR-i kirjelduses säilinud vana „draft/blocked” tekst on ajalooline, mitte praegune olek. |
| R6 | https://api.github.com/repos/LEISSON-DARKSSON/kpt-underground/pulls?state=open&per_page=10 | Tagastas tühja loendi. Ei välista kasutaja lokaalseid avaldamata harusid. |
| R7 | Vercel list_deployments, project prj_YJhnEFeOnrCoodkZ9k201ReLeGfq, team team_AM95AHo0HzxOqVMyK8uCsfKw, since1790226337000 | Tagastas ühe READY diagnostika-Preview: dpl_EkL3BikRbd6kH2bPQ2GSQ1PXg4Ws, SHAa524b3… . Ei olnud uus e-poe kujunduse Preview. Endpointi keha selles üleandmises uuesti ei loetud. |
| R8 | https://github.com/LEISSON-DARKSSON/kpt-underground/blob/99d224189757db3fad1882085fe43f7ff6508ccf/package.json ja src/app/api/checkout/route.ts | Deklareeritud stack/scripts; vana Stripe EUR/client-price/demo-return voog. Koodilugemine ei tõenda tegelikku makset ega kasutaja keskkonnas käivitatud build’i. |
| R9 | Sama SHA src/app/globals.css, src/app/layout.tsx ja src/app/page.tsx; väärtused säilitatud design/spec/design.tokens.json | Värvid, tüpograafia, ruudustik, layout ja lähteavalee äriväited. Makett ei ole kogu avalehe koodi üks-ühele koopia. |
| R10 | https://docs.fourthwall.com/storefront/overview | Ametlik kirjeldus: kohandatud storefront ja cart, hostitud checkout. Ei tõenda konkreetse poe juba töötavat kassaintegratsiooni. |
| R11 | https://help.fourthwall.com/getting-started/design-my-storefront/edit-checkout-page | Kassa piiratud kohandatavus ning Auto/Light/Dark skin. See ei anna piiramatu CSS/iframe-kohandamise võimalust. |
| R12 | https://help.fourthwall.com/getting-started/design-my-storefront/customizing-your-site-theme-and-styles | Native värvid/fondid/nupud; aktiivse teema muutmise kirjeldus. Varem tsiteeritud draft-juhendi kõrval tuleb kontrollida tegelikku UI-d, mitte eeldada, et Save on alati privaatne. |
| R13 | Kasutaja kassapakkumiste tabel, kasutaja piiratud 80.49 USD kululuba ja hilisem 80.67 USD kassapilt; pildist kaasas evidence/owner-quote-80.67-financial-crop.png | Mõlemad pakkumised on enne kinnitamist; hilisem on loast 0.18 USD suurem. Pilt ei ole maksekviitung ja pakis puudub aadress. |
| R14 | Selle sessiooni Fourthwalle’i avastatud tööriistaskeemid ja varasem tegelik sample-checkout skeemiviga | Account-read funktsioonid olemas; print/media/theme võimed sõltuvad avastatud skeemidest. Tekstiviide mõnele funktsioonile ei tee seda kasutatavaks. challengeDefinitionId nõude vastuolu ei tohi väljamõeldud ID-ga mööda minna. |
| R15 | Kasutaja esitatud „Lahendatud: PASS” raport ja HTTP200 application/json väljad | Serveripäring kinnitatud kasutaja töötavas Codexi seansis pärast õiget projekti sidumist. Kohalikke execution-report.md / execution-record.json faile siin ei loetud; see on teadlikult USER_REPORTED_PASS. |
| R16 | reports/preview-guard-rerun.txt ja reports/handoff-validation.json | Selles üleandmises tegelikult korratud kümme olemasolevat Node-kaitsetesti, failihashide/PNG mõõtude ja paketi valideerimine. Ei asenda kogu rakenduse QA-d või ostukatset. |

## Ajalooline memo

`2026-09-23-business-memo-HISTORICAL.md` on säilitatud muutmata, et Claude saaks algsete äriliste otsuste põhjendust lugeda. Selle vana konto-/PR-/payout-/ligipääsustaatust ei tohi rakendada praeguse ülesande seisuna. Praegune tööjärjekord on `CLAUDE-HANDOFF.md` failis.

## Millised kohalikud allikad pole kaasas?

Kasutaja `C:\PROJECTS\kpt-underground\execution-report.md` ja `execution-record.json` on nimetatud, kuid nende baite pole selle üleandmise koostamisel loetud. Claude peab need lubatud töökeskkonnas ise avama. Paketis olevad raportimallid on selgelt tühjad, mitte nende failide väljamõeldud koopia.

Varasemad tokenit sisaldavad Storefronti kontroll-HTML, .env ja seadistusZIP on teadlikult välja jäetud. Praegune pakett ei sisalda autentimisandmeid ega fondibinaare.
