# Claude’i stardijuhis

**Peamine fail:** `CLAUDE-HANDOFF.md`.

Paki kogu ZIP lahti ühte kausta. Anna Claude’ile ligipääs sellele kaustale ja olemasolevale `C:\PROJECTS\kpt-underground` repole, kui need on sinu lubatud töökeskkonnas olemas. Veebivestluses lisa vähemalt põhihandoff ja disainipakett; ära eelda, et Claude näeb teise vestluse failide või arvuti kohalikke teid.

Kopeeri `CLAUDE-CONTINUATION-PROMPT.txt` uue vestluse või Claude Code’i ülesandesse.

**Ära kopeeri seda kausta tervikuna repo juure peale.** Siin olev `CLAUDE-HANDOFF.md` ei asenda repo `CLAUDE.md`. Maketi näidishinnad ja ajutine korv pole tootmisintegratsioon.

## Kaustad

| Kaust | Milleks? |
|---|---|
| `state/` | Selle üleandmise normaliseeritud seis, püsivad toote-ID-d ja failihashid. |
| `design/` | Viimase e-poe kujunduspaketi muutmata koopia: HTML, CSS, JS, Next-preview, testid. |
| `product-assets/print/` | Kaks algset muutmata tootmis-PNG-d varukoopiana. Ära laadi neid uuesti üles, kui selleks pole vajadust ega luba. |
| `product-assets/source/` | Kahe mati olemasolevad SVG-lähtefailid; ei sisalda fondifaile. |
| `copy/` | Praegu salvestatud ingliskeelsed tootekirjeldused. |
| `evidence/` | Ainult näidiskassa finantslõige, isiku- ja autentimisandmeteta. |
| `reports/` | Selle üleandmise kontrollid ning tühjad mallid uue Claude’i jooksu jaoks. |
| `reference/` | Allikaregister ja selgelt ajalooline ärimemo. |
| `automation/` | Kohaliku paketi kontroll; ei muuda kontot ega ühendu võrku. |

Kohalik tervikluse kontroll: `python automation/verify_handoff.py` paketi juurkataloogis. Python 3.10+; lisapakette pole vaja. Kontroll ei käivita ühtki makset, veebipäringut ega repo muutmist.

**Järgmine tulemus:** kaitstud e-poe kujunduse Preview, mitte uus äriplaan ega SSO seadistusring.
