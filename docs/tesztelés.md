# Matekidő – Manuális tesztforgatókönyv

Ez a dokumentum a Matekidő **teljes újbóli teszteléséhez** készült, előről indulva. Célja, hogy a böngészőben végighaladva minden fő képernyőt és a **legfontosabb feladattípusokat** ellenőrizzük.

- **Szerver:** `make start` (localhost:8000) – a `src/` mappát szolgálja ki.
- **Böngésző:** Asztali (Chrome / Firefox / Edge), egy lapon teszteljünk.
- **Jelölések:** ✅ működik · ❌ hibás · ⚠️ kisebb hiba / megjegyzés · ➖ nem érinti/átugorható.
- Az első indítás előtt **ürítsd a régi localStorage-t**, hogy tiszta állapotból induljunk.

---

## 0. Előkészítés – tiszta indulás

1. Indítsd el a szervert: `make start`.
2. Nyisd meg: <http://localhost:8000>.
3. A DevTools **Application → Local Storage** fülön töröld a `matekido-users` és `matekido-profile` kulcsokat (vagy inkognitó ablakban tesztelj), hogy friss profillal indulj.

---

## 1. Üdvözlő képernyő és játékoskezelés

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 1.1 | Nyisd meg az appot | „📚 Matekidő – Ki játszik ma?” üdvözlőképernyő, alul „Új játékos” (＋) kártya | |
| 1.2 | Kattints az „Új játékos”-ra | Megjelenik a modál: név input, avatar-rács, „Mégse” és „Hozzáadás” gomb | |
| 1.3 | A „Hozzáadás” gomb inaktív (disabled), amíg üres a név | Ha nincs név, a gomb szürke/letiltott | |
| 1.4 | Írj be egy nevet (pl. „Mezei Zsófi”), válassz avatart, kattints „Hozzáadás”-ra | Bezárul a modál, megjelenik a játékoskártya a nevvel és az avatarral, ⭐0 📚0 🔥0 | |
| 1.5 | Adj hozzá egy második játékost is (pl. „Kiss Áron”) | Két játékoskártya jelenik meg, az első adatai változatlanok | |
| 1.6 | Kattints az első játékos kártyájára | A kártya kijelölésre kerül (aktív), és a menübe lép | |

**Megjegyzés:** a képernyő tetején lévő „👤 Játékos” gomb a menüben vált játékost (üdvözlőképernyőre visz vissza).

---

## 2. Lecke menü és szűrők

Menübe lépve van egy 📮-jellegű világcím (világfüggő), a „Matekidő” felirat, a támogató kiscsésze és három gomb: `🔍 Szűrők`, `📚 Készségek`, `❓ Súgó`. Lent: `👤 Profilom` és a játékosavatár-név.

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 2.1 | Nézd meg a menü felépítését | Osztályok szerinti szekciók: „1. osztály”, „2. osztály”, „3. osztály”, minden lecke kártyával (neve, globusz, csillag) | |
| 2.2 | Kövesd a „Matekidő” cimben lévő ☕ linket | Hoverre világosabb lesz, és megjelenik a „Tetszik? Támogasd!” tooltip; kattintva új fülön a ko-fi.com oldal nyílik | |
| 2.3 | Kattints a `🔍 Szűrők` gombra | Megnyílik a szűrőpanel, a gomb „Szűrők ▲”-ra vált | |
| 2.4 | Szűrj „3. osztály” osztályra | Csak a 3. osztályos leckék látszanak, felül „N találat” | |
| 2.5 | Szűrj nehézségre/ típusra is (pl. „Szorzótábla”) | A találatok ennek megfelelően szűrődnek | |
| 2.6 | Kapcsold ki a szűrőket | Visszaáll az osztályos nézet | |
| 2.7 | Kattints a `📚 Készségek` gombra | Megnyílik a készségtérkép; a vissza gombbal a menübe térít | |
| 2.8 | Kattints a `❓ Súgó` gombra | Megnyílik a súgó; vissza gombbal a menübe térít | |

---

## 3. Új 3. osztályos leckék – szorzás-osztás 6, 7, 8, 9

A 3. osztály „Szorzás és osztás bővítése” részében 5 új leckét kell látnod.

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 3.1 | Lépj a „3. osztály” szekcióba, keresd meg a „Szorzás 6, 7, 8, 9-es táblával” leckét | Megtalálható, kattintható | |
| 3.2 | Indítsd el a leckét | Scene (jelenet) szöveggel indul, majd feladatok: `a × b = ?` szorzások, a `a` a 6/7/8/9 táblából való | |
| 3.3 | Oldd meg a feladatokat vegyesen (jó és rossz) | A pontszám/progressz követi a válaszokat, a végén celebráció | |
| 3.4 | „❓ Hiányzó tényező 6, 7, 8, 9” lecke | `6 × ? = 42` típusú feladatok, a `?` helyes kitöltése | |
| 3.5 | „Szorzás és osztás kapcsolata 6-9” lecke | `56 ÷ 7 = ?` típusú (szorzásból osztás) feladatok | |
| 3.6 | „Osztás 6, 7, 8, 9-es táblával” lecke | `48 ÷ 6 = ?`, `56 ÷ 8 = ?` típusú feladatok | |
| 3.7 | „Vegyes szorzás és osztás 6-9” lecke | Szorzás és osztás feladatok keverve egy leckében | |
| 3.8 | Ellenőrizd a feladatok számát és a válaszok jóságát | Minden feladattípus helyesen ítéli meg a helyes/helytelen választ | |

**Hiba esetén** jegyezd le, melyik típus (table / missing-factor / link / division-table) rossz.

---

## 4. Lecke-futás: pontozás és feladattípusok

Egy korábbi (1. osztályos) leckén gyorsan ellenőrizd a játékmenetet:

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 4.1 | Indíts egy egyszerű 1. osztályos leckét | Cinematic scene indul, „Kezdés” gombbal a feladatra lépsz | |
| 4.2 | Válaszolj helyesen néhány feladatra | A progress (pl. „2 / 5”) nő, helyes válasznál pozitív visszajelzés | |
| 4.3 | Válaszolj helytelenül valahol | A játék nem büntet (csak rögzíti), a következő feladatra lép | |
| 4.4 | Ha van készségtérkép-gomb a leckén belül (súgó) | Megnyílik, vissza hozható, a lecke állapota nem vész el | | ez nem tudom hol fordulhat elő
| 4.5 | Fejezd be a leckét | Celebráció jelenik meg a csillag/feloldás jutalommal | |

Ezt a lépéskört **futtasd végig a főbb feladattípusokon is**, hogy mindegyik render módját ellenőrizd. Gyors lista:

- Összeadás / Kivonás (bevitel, választás)
- Hiányzó szám, Hiányzó tag
- Összehasonlítás (nagyobb/kisebb)
- Szomszédok, Sorba rendezés
- Páros-páratlan, Számsor/sorminta
- Helyi érték (1. és 3. o.)
- Idő, Pénz (fizetés/visszajáró/elég-e)
- Szöveges feladat, Becslés, Igaz-hamis
- Szorzás-osztás (2. o.: 2,3,4,5,10; 3. o.: 6,7,8,9)
- Geometria (alakzatok, téridomok)

---

## 5. Profil oldal

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 5.1 | Kattints a `👤 Profilom` gombra a menüben | Megnyílik a profiloldal: avatar, „Saját …” cím, név, 4 stat (📚 lecke, ⭐ csillag, 🔥 nap, ✨ hiba nélkül) | |
| 5.2 | Ellenőrizd a haladás-sávot | A „k Következő cél: X / Y” progress-sáv a teljesítéshez igazodik | |
| 5.3 | Ellenőrizd a „📅 Mai küldetés” részt | 3-pontos kvótasáv (0/3, 1/3 …), szöveg: „x/3 lecke teljesítve” | |
| 5.4 | „🏆 Teljesítmények” | Megjelennek a feloldott és lezárt teljesítmények, a feloldottak ✓ jellel | |
| 5.5 | „🌍 Világok” | Megjelennek a világok; a feloldott, de nem aktív világ kattintásra aktiválódik és újratölti az oldalt | |
| 5.6 | Válts világot | Ha elég ⭐ van, kattintással válts; a menü cím (pl. a „Matekidő” felirat enoji) is változik | |
| 5.7 | Az alsó gombok: `📋 Értékek`, `📚 Leckék`, `🎯 Gyakorlás`, `❓ Súgó` | Mind a megfelelő képernyőre visz | |

---

## 6. Statisztika

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 6.1 | Nyisd meg a `📋 Értékek` oldalt a profilból | A világ szerinti jelentés (pl. „📬 Postai jelentés”), napi statisztikák, készség-százalékok megjelennek | |
| 6.2 | Válts a statisztika és a profil között | A Vissza gomb a profilra, a „Leckék” a menüre visz | |

---

## 7. Gyakorlás

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 7.1 | Ha van gyenge lecke (hibás helyek) | A profilban megjelenik a `🎯 Gyakorlás (N)` gomb | |
| 7.2 | Kattints a Gyakorlás-ra | A gyenge leckék listája jelenik meg, indítható | |
| 7.3 | Indíts egy gyenge leckét, oldd meg újra | A lecke feladatai ismétlődnek, a statisztikák frissülnek | |

*(Ha nincs gyenge lecke, ezt a lépést át lehet ugrani.)*

---

## 8. Játékosváltás és profilok

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 8.1 | A menüből `👤 Játékos` gombbal térj vissza | Üdvözlőképernyő, a két játékos listája | |
| 8.2 | Válts a másik játékosra | A másik játékos önálló profilja (üres/korábbi adatok), a menü az ő nevét/Avatarját mutatja | |
| 8.3 | A játékoskártya „×” gombjával törölj egy játékost | Megerősítő párbeszéd jelenik meg; „Törlés”-re a játékos és adatai törlődnek | |

---

## 9. Offline / PWA (kiegészítő, ha fontos)

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 9.1 | Frissítsd a lapot (hard reload) | Nincs konzolhiba, az app betölt | |
| 9.2 | Érhető el a `/manifest.webmanifest` és a service worker | Telepíthetőség (ha HTTPS/localhost) | |
| 9.3 | Repülőgép-mód / offline | Az egész app (minden lecke) elérhető a cache-ből | |

---

## 10. Visszajelzés

A teszt végén gyűjtsd össze a tapasztalt hibákat az alábbi sablonnal:

- **Képernyő / lépés:** (pl. 3.5 – link feladat)
- **Elvárt:** …
- **Tapasztalt:** …
- **Konzolhiba / screenshot:** (ha van)

---

## Függelék – a tesztelendő új 3. osztályos leckék

| Azonosító (index) | Cím | Típus |
|---|---|---|
| `multiplication-6789-01` | Szorzás 6, 7, 8, 9-es táblával | `table` |
| `missing-factor-6789-01` | Hiányzó tényező 6, 7, 8, 9 | `missing-factor` |
| `multiplication-link-6789-01` | Szorzás és osztás kapcsolata 6-9 | `link` |
| `division-6789-01` | Osztás 6, 7, 8, 9-es táblával | `division-table` |
| `mixed-mult-div-6789-01` | Vegyes szorzás és osztás 6-9 | `table` + `division-table` |
