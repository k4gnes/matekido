# Matekidő – 3. osztály manuális tesztforgatókönyv

Ennek a dokumentumnak a célja, hogy a **3. osztályos tananyagot** (48 lecke, 7 világ, számkör 1000-ig + szorzás/osztás 6, 7, 8, 9-es táblákkal) a böngészőben kézzel végigteszteljük: minden lecke helyesen épül fel, a feladatok a megjelölt tartományban vannak, a jó/rossz válasz kezelése helyes, és a lecke a celebrációval zárul.

- **Szerver:** `make start` (localhost:8000) – a `src/` mappát szolgálja ki.
- **Böngésző:** Asztali (Chrome / Firefox / Edge) + legalább egyszer telefon méretű nézet.
- **Jelölések:** ✅ működik · ❌ hibás · ⚠️ kisebb hiba / megjegyzés · ➖ nem érinti / átugorható.

---

## 0. Előkészítés

1. Indítsd el a szervert: `make start`, nyisd meg: <http://localhost:8000>.
2. DevTools → Application → Local Storage: töröld a `matekido-users` és `matekido-profile` kulcsokat (vagy tesztelj inkognitóban).
3. Hozz létre egy tesztjátékost (pl. „Teszt 3”).

---

## 1. Általános lecke-folyamat (minden leckére érvényes)

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 1.1 | Menüben válaszd ki a leckét | Scene (jelenet) szöveggel indul, világfüggő címmel és emojival | |
| 1.2 | Kattints a „Kezdés” gombra | Megjelenik az első feladat a progress-szal | |
| 1.3 | Válaszolj helyesen néhány feladatra | Pozitív visszajelzés, a számláló nő, a számok a lecke tartományán belül vannak (max. 1000) | |
| 1.4 | Válaszolj helytelenül valahol | Nincs büntetés, a lecke folytatódik | |
| 1.5 | Fejezd be a leckét | Celebráció jelenik meg, a profil statisztikái frissülnek | |
| 1.6 | Indítsd újra ugyanazt a leckét | Más feladatok jönnek (véletlenszerű generálás) | |
| 1.7 | Kilépés gomb (📚 jobb felső) | Megerősítő párbeszéd, „Mégse” visszavisz a leckébe | |

---

## 2. Lecke-ellenőrző táblázatok

A sorok sorszáma **1–48, folytonos** – megegyezik a menüben és a lecke fejlécében látott „x/48” jelzéssel. A🌟 Mester kihívás és a 🎲 Egypercesek nem szerepelnek ebben a táblázatban (a menüben sincs rájuk x/N jelzés). A szekciók csak csoportosítás, a sorszámok a tananyag (curriculum) sorrendjét követik.

### 2.1 Számfogalom 1000-ig

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 1 | Helyiérték 1000-ig | `place-value-hundreds` / 1000 | Százasok/tízesek/egyesek bontása (pl. 847 = 8 százas + 4 tízes + 7 egyes); a válasz `100·sz + 10·t + e` | |
| 2 | Számnevek 1000-ig | `number-name` | Szám ↔ szó párosítás mindkét irányban (pl. 542 = „ötszáznegyvenkettő”) | |
| 3 | Szomszédok 1000-ig | `neighbor-single` / 1000 | Egy adott szám szomszédai megadhatók | |
| 4 | Összehasonlítás 1000-ig | `comparison` / 1000 | Az értékek 1000-en belül, a jel illik az értékekhez | |
| 5 | Rendezzük sorainkat! 1000-ig | `order` / 1000 | A sor a kért irányba rendezhető 1000-ig | |
| 6 | Páros és páratlan 1000-ig | `even-odd` / 1000 | Besorolás helyes 1000-ig | |
| 7 | Kerekítsük kerekre! | `rounding` / 1000 | A kerekítés **tízesre és százasra** is (célfelirat követi: „tízesre”/„százasra”) | |
| 8 | Római számok | `roman` / 100 | I, V, X, L, C jelek; mindkét irány (szám → római, római → szám) | |
| 9 | Becslés 1000-ig | `estimate` / 500 (százas kerekítés) | A válasz százasra kerekített összeg/különbség; a legjobb becslés kiválasztható | |
| 10 | Számsorozatok 1000-ig | `pattern` / 1000 | Jól felismerhető szabály (pozitív lépés 2–200); a „?” mindig 1000 alatt marad | |
| 11 | Váltakozó számsor 1000-ig | `sequence` (váltakozó) / 1000 | Két lépés váltakozik (pl. +3/+4, +5/+10, +10/+20); a következő tag 1000 alatt marad | |

### 2.2 Műveletek 1000-ig

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 12 | Összeadás kerek százasokkal | `addition` / 1000 | Mindkét tag kerek százas; összeg ≤ 1000 | |
| 13 | Véletlen szám + kerek százas | `addition` / 1000 | Egy kerek százas tag, összeg ≤ 1000 | |
| 14 | Összeadás 1000-ig átlépés nélkül | `addition` / 1000 | Az egyesek összege < 10, a tízesek összege < 10 (nincs átlépés) | |
| 15 | Összeadás 1000-ig átlépéssel | `addition` / 1000 | Van átlépő feladat is (egyesek vagy tízesek összege ≥ 10) | |
| 16 | Írásbeli összeadás 1000-ig | `written-operation` (add) / 1000 | 8 feladat, **mindig van átlépés** (`carry: always`); egymás alá írva, jobbról balra, egyesekkel kezdve számolunk; az eredmény 100–999 között | |
| 17 | Kivonás kerek százasokkal | `subtraction` / 1000 | Kerek százasok, az eredmény ≥ 0 | |
| 18 | Véletlen szám − kerek százas | `subtraction` / 1000 | Kerek százas kivonandó, maximum 1000-ig | |
| 19 | Kivonás 1000-ig átlépés nélkül | `subtraction` / 1000 | A kivonás átlépés nélkül elvégezhető | |
| 20 | Kivonás 1000-ig átlépéssel | `subtraction` / 1000 | Van átlépő feladat is | |
| 21 | Írásbeli kivonás 1000-ig | `written-operation` (sub) / 1000 | 8 feladat, **mindig van kikölcsönzés** (`borrow: always`); a tízesektől való kölcsönzés a lépésekben látszik; az eredmény 100–899 | |
| 22 | Vegyes műveletek 1000-ig | `mixed` / 1000 | + és − vegyesen, nagyobb számkörben | |
| 23 | 🧮 Műveleti sorrend | `operation-order` / 100 | 6 feladat; a szorzás/osztás mindig előbb jön, mint az összeadás/kivonás, a zárójel mindenekelőtt; a helyes sorrend a visszajelzésben is látszik | |

### 2.3 Szorzás és osztás bővítése (6, 7, 8, 9)

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 24 | Szorzás 6, 7, 8, 9-es táblával | `table` / 100 | Mindkét tényező a 6/7/8/9 (felcserélhető sorrend); a szorzat ≤ 81 | |
| 25 | Hiányzó tényező 6, 7, 8, 9 | `missing-factor` / 100 | `a × ? = c` alak 6–9-es táblán, a válasz `c ÷ a` | |
| 26 | Szorzás és osztás kapcsolata 6-9 | `link` / 100 | Szorzatból osztás (pl. 9 × 7 = 63 → 63 ÷ 9 = 7) | |
| 27 | Osztás 6, 7, 8, 9-es táblával | `division-table` / 100 | Az osztó 6/7/8/9, az eredmény egész | |
| 28 | Vegyes szorzás és osztás 6-9 | `mixed-mult-div` / 100 | Szorzás és osztás keverve (6–9-es tábla) | |
| 29 | Maradékos osztás | `remainder-division` (notation) / 100 | 8 feladat; osztó 2–9, hányados ≤ 9, **nincs nulla maradék**; a maradék jelölése és a vegyes interakció (beírás és választás) helyes | |
| 30 | Maradékos osztás csoportokkal | `remainder-division` (groups) / 100 | 8 feladat; csoportokból kell kiolvasni a teljes csoportok számát és a maradékot; osztó 2–6, hányados ≤ 6 | |

### 2.4 Törtek – bevezetés

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 31 | 🍕 Tört jele – ½, ⅓, ¼ | `fraction` (symbol) / ¼ | 8 feladat; a kép alapján kell kiválasztani a jelet; csak ½, ⅓, ¼ szerepel | |
| 32 | 🍕 Kép a tört jeléhez | `fraction` (symbol-pick) / ¼ | 8 feladat; **fordított irány**: a jel alapján a megfelelő képet kell választani | |
| 33 | 🧮 Egész törtrészei | `fraction-of` / 48 | 10 feladat; egy egész szám (pl. 12) fele, harmada, negyede; a rész darabszáma a válasz | |

### 2.5 Valószínűség

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 34 | 🎲 Biztos, lehetséges, lehetetlen | `probability` / – | 6 feladat; az esemény besorolása három kategóriába; a dobókockás helyzet mindig hatoldalú | |

### 2.6 Adatok és diagramok

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 35 | 📊 Táblázatok és diagramok | `data-chart` / 100 | 6 feladat; oszlopdiagram, piktogram és táblázat; összeg, különbség és két oszlop összehasonlítása; az értékek ≤ 100 | |

### 2.7 Szöveges feladatok 3. osztály

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 36 | 📝 A felét, a harmadát… | `word-problem` (proportion) / 60 | 6 feladat; a szövegben a fele, harmada keresendő; a válasz ≤ 60 | |
| 37 | 📝 Osztás maradékkal | `word-problem` (remainder) / 60 | 6 feladat; kétlépésű: a hányados **és** a maradék is kérdés; a válasz ≤ 60 | |

### 2.8 Geometria 3. osztály

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 38 | 📐 Kerület | `perimeter` / 20 | 6 feladat; a kerület a szegély hossza, **nem** a belső rész; vegyes (kevert) alakzatok | |
| 39 | 🟦 Terület | `area` / 25 | 6 feladat; a belső kék négyzetek száma; vegyes alakzatok | |
| 40 | 📐 Szögek | `angles` / 180 | 6 feladat; hegyes / derékszög / tompa besorolás a szög nagysága szerint | |
| 41 | 🪞 Tükrözés és szimmetria | `mirror` / – | 5 feladat; a szaggatott tengely tükörképét kell megtalálni (közös a 2. osztállyal) | |
| 42 | ⭕ Kör – középpont, sugár, átmérő | `circle` / – | 6 feladat; a kör részeinek felismerése: középpont, sugár, átmérő | |

### 2.9 Gyakorlati tudások

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 43 | 📏 Hosszúság – centiméter, deciméter, méter | `measure-units` / length | m→dm, m→cm, dm→cm; 2. blokkban km és mm is (advanced) | |
| 44 | 🥤 Űrtartalom – liter, deciliter, centiliter | `measure-units` / volume | l→dl, l→cl, dl→cl; 2. blokkban ml is (advanced) | |
| 45 | ⚖️ Tömeg – kilogramm, dekagramm, gramm | `measure-units` / weight | kg→dkg, kg→g, dkg→g | |
| 45a | A három lecke feladatformái | `measure-units` | Mindháromban mind az 5 forma jelen van: válaszlista, beírás, egységválasztás, igaz-hamis, összehasonlítás (`< = >`) | |
| 45b | Valós tárgyak a feladatokban | `unitObjects.js` | Minden feladat előtt tárgy (fa, vödör, elefánt, tojás…), a tárgyhoz illő érték; a mondat egysége nem találgatás | |
| 45c | Összehasonlítás | `measure-units` / compare | Két oldal különböző egységben (`3 kg ? 3000 g`), a kiegyenlítés a cél | |
| 45d | Rejtett súgó | `measure-units` | A súgó gomb **két hiba után** jelenik meg, a táblázat csak kattintásra | |
| 46 | Idő – perc és óra | `time-convert` | perc ↔ óra átváltás | |
| 47 | Vásárlás 1000-ig | `money-pay` / 1000 | Fizetés 200/500 Ft-os bankjegyekkel | |
| 48 | Naptár és év | `calendar` (advanced) | Év hossza 365 (366 szökőév), kb. 52 hét; hónap napjai; egy hónap kb. 4 hét; évszakonként 3 hónap | |

---

## 3. Világok és készségtérkép

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 3.1 | Válts világot a profilból | A leckék jelenetei az adott világ címét/emo-ját mutatják | |
| 3.2 | Válassz ki egy leckét több különböző világban | A `worldTitles`-ek megjelennek, a feladat ugyanaz marad | |
| 3.3 | 📚 Készségek oldal | A helyiérték/1000-es feladatok a megfelelő készséghez tartoznak | |

## 4. Weboldal- és telefonellenőrzés

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 4.1 | Ikon a fülön / PWA | A fülön (favicon) és a telepített PWA-ban ugyanaz a tangram-M: kék és világosszürke háromszögekből álló M, fehér vonalakkal | |
| 4.2 | Telefonméret (DevTools 375px) | A ☕ „Támogatás” link NEM jelenik meg, a jobb felső gombok (súgó, 📚) koppinthatók | |
| 4.3 | Asztali nézet | A ☕ „Támogatás” link a bal alsó sarokban látható | |
| 4.4 | Hard reload / offline | Nincs konzolhiba; az app cache-ből is betölt | |

---

## 5. Visszajelzés sablon

- **Lecke / lépés:** (pl. 28 – Vegyes szorzás és osztás 6-9)
- **Elvárt:** …
- **Tapasztalt:** …
- **Konzolhiba / screenshot:** (ha van)