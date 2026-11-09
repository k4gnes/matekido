# Matekidő – 1. osztály manuális tesztforgatókönyv

Ennek a dokumentumnak a célja, hogy az **1. osztályos tananyagot** (44 lecke, 7 világ, számkör 100-ig) a böngészőben kézzel végigteszteljük: minden lecke helyesen épül fel, a feladatok a megjelölt tartományban vannak, a jó/rossz válasz kezelése helyes, és a lecke a celebrációval zárul.

- **Szerver:** `make start` (localhost:8000) – a `src/` mappát szolgálja ki.
- **Böngésző:** Asztali (Chrome / Firefox / Edge) + legalább egyszer telefon méretű nézet.
- **Jelölések:** ok működik · ❌ hibás · ⚠️ kisebb hiba / megjegyzés · ➖ nem érinti / átugorható.

---

## 0. Előkészítés

1. Indítsd el a szervert: `make start`, nyisd meg: <http://localhost:8000>.
2. DevTools → Application → Local Storage: töröld a `matekido-users` és `matekido-profile` kulcsokat (vagy tesztelj inkognitóban).
3. Hozz létre egy tesztjátékost (pl. „Teszt 1”).

---

## 1. Általános lecke-folyamat (minden leckére érvényes)

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 1.1 | Menüben válaszd ki a leckét | Scene (jelenet) szöveggel indul, világfüggő címmel és emojival | ok|
| 1.2 | Kattints a „Kezdés” gombra | Megjelenik az első feladat a progress-szal (pl. „1 / 5”) | ok|
| 1.3 | Válaszolj helyesen néhány feladatra | Pozitív visszajelzés, a számláló nő, a számok a lecke tartományán belül vannak |ok |
| 1.4 | Válaszolj helytelenül valahol | Nincs büntetés (nincs csillaglevonás/haladásvesztés), a lecke folytatódik |ok |
| 1.5 | Fejezd be a leckét | Celebráció jelenik meg, a profil statisztikái frissülnek (📚, ⭐) |ok |
| 1.6 | Indítsd újra ugyanazt a leckét | Más feladatok jönnek (véletlenszerű generálás) | ok|
| 1.7 | Kilépés gomb (📚 jobb felső) | Megerősítő párbeszéd („Kilépsz a feladatokhoz?”), „Mégse” visszavisz a leckébe |ok |

---

## 2. Lecke-ellenőrző táblázatok

A sorok sorszáma **1–44, folytonos** – megegyezik a menüben és a lecke fejlécében látott „x/44” jelzéssel. A🌟 Mester kihívás nem szerepel ebben a táblázatban (a menüben sincs rá x/N jelzés). A szekciók csak csoportosítás, a sorszámok a tananyag (curriculum) sorrendjét követik.

### 2.1 Számfogalom

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 1 | 🧺 Halmazok és válogatás | `set-match` | Megjelenik egy halmaz példaalakzatokkal + szabály; az illő alakzat kiválasztható a felkínáltakból | ok|
| 2 | Sorminta – mi a következő? | `pattern` / 20 | A minta legalább 2 elemből felismerhető, a folytatás logikus | ok|
| 3 | Számok bontása 10-ig | `decomposition` / 10 | A bontás két tagjának összege a tízes (pl. 10 = 7 + 3) | ok|
| 4 | Keresd a kakukktojást! | `decomposition-find-wrong` / 10 | Egyetlen hibás bontás található meg | ok|
| 5 | Kiegészítés 10-ig | `missing-number` / 10 | `a + ? = 10`, a válasz `10 − a` | ok|
| 6 | Mi a következő? 50-ig | `sequence` / 50 | A sorozatlépés állandó, a következő tag helyes | ok|
| 7 | Váltakozó számsor 20-ig | `sequence` (váltakozó) / 20 | Két lépés váltakozik (pl. +1/+2, +2/+3); a következő tag a tartományon belül helyes | ok|
| 8 | Rendezzük sorainkat! 20-ig | `order` / 20 | A számsor a kért irányba (növekvő/csökkenő) rendezhető | ok|
| 9 | Összehasonlítás 10-ig | `comparison` / 10 | A nagyobb/kisebb/egyenlő választás a két számnak megfelel | ok|
| 10 | Összehasonlítás 20-ig | `comparison` / 20 | Az értékek 20-on belül, a jel az értékekhez illik | ok|
| 11 | Páros és páratlan 20-ig | `even-odd` / 20 | A páros/páratlan besorolás helyes 20-ig | ok|
| 12 | Helyiérték 100-ig | `place-value` / 100 | A tízesek/egyesek a számot adják ki (pl. 47 = 4 tízes + 7 egyes) | ok|
| 13 | Helyiérték – tízes és egyes 100-ig | `place-value-two-input` / 100 | Két bevitel; `10 × tízes + egyes` = megjelenített szám | ok|
| 14 | Kiegészítés véletlen számig 20-ig | `missing-number` / 20 | A kiegészítés célja változik leckén belül is | ok|
| 15 | Számok szomszédai 100-ig | `neighbor` / 100 | `bal = válasz − 1`, `jobb = válasz + 1` | ok|
| 16 | Tízesátlépés 20-ig | `bridge-ten` / 20 | 3 lépéses megoldás (10-re kiegészítés, maradék hozzáadása, összeg) | ok|
| 17 | Becslés 30-ig | `estimate` / 30 | Kerekíthető eredmény, a legjobb becslés kiválasztható | ok|
| 18 | Kerekítés tízesre 100-ig | `rounding` / 100 | A szám tízesre kerekítése helyes (bemenet és választás) | ok|
| 19 | 📊 Melyikből van több? | `data-chart` | SVG oszlopdiagram; legtöbb/legkevesebb/összeolvasás | ok|
| 20 | 🎲 Biztos, lehetséges, lehetetlen | `probability` | Egyszerű események; a biztos/lehetséges/lehetetlen besorolás helyes | ok|

### 2.2 Műveletek

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 21 | Összeadás 20-ig | `addition` / 20 | Összeg 20-on belül, az elfogadott válasz `a + b` | ok|
| 22 | Összeadás 20-ig átlépéssel | `addition` / 20 | Legalább néhány feladat tízesátlépő (pl. 8 + 5) | ok|
| 23 | Kivonás 20-ig | `subtraction` / 20 | A kisebbítendő legalább akkora, mint a kivonandó | ok|
| 24 | Vegyes műveletek 20-ig | `mixed` / 20 | Összeadás és kivonás vegyesen, a műveleti jel a feladatnak felel meg | ok|
| 25 | ❓ Hiányzó tag 20-ig | `missing-operand` / 20 | `? + b = c` alak, a válasz `c − b` | ok|
| 26 | ✅ Igaz vagy hamis? 20-ig | `true-false` / 20 | Az állítás értéke valóban igaz vagy hamis | ok|
| 27 | 🕵️ Hibás számolás? 20-ig | `find-error` / 20 | A hibás/rossz művelet megtalálható | ok|

### 2.3 Szorzás-előkészítés

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 28 | 🧩 Egyenlő csoportok 20-ig | `equal-groups` / 20 | `csoportok × csoportonként` = összesen | ok|
| 29 | 🧩 Ismételt összeadás 20-ig | `repeated-addition` / 20 | Az ismételt összeadás összege helyes | ok|
| 30 | 🧩 Számolás kettesével, ötösével | `skip-counting` / 20 | A lépegetés (2/es, 5/ös) állandó, a hiányzó tag helyes | ok|

### 2.4 Geometria

| # | Lecke | Típus | Amire figyelj | Eredmény |
|---|-------|-------|---------------|----------|
| 31 | Kerek, szögletes és háromszög | `shape-sort` | Az alakzatok a tulajdonság (kerek/szögletes/háromszög) szerint válogathatók | ok|
| 32 | Térbeli tájékozódás | `spatial` | A relációk (bal/jobb, előtte/mögötte stb.) a képekhez illenek | ok|
| 33 | 📐 Hány oldala van? | `shape-compare` | 3–6 oldalú sokszögek; a több oldal/sarok és a nagyobb helyesen kiválasztható | ok|
| 34 | 🧊 Térbeli testek | `solid-shape` | A testek nevei (kocka, téglatest, henger, kúp, gömb) felismerhetők | ok|
| 35 | 🌀 Forgatás | `transform` | A forgatott/tükrözött alakzat kiválasztható | ok|

### 2.5 Gyakorlati tudások

| # | Lecke | Típus | Amire figyelj | Eredmény |
|---|-------|-------|---------------|----------|
| 36 | 🗓️ Naptár | `calendar` | Hét napjai, hónapok, évszakok, tegnap/ma/holnap | ok|
| 37 | Melyik hosszabb? | `measure-compare` | Világfüggő tárgykészlet; a hosszabb tárgy kiválasztható | ok|
| 38 | Mérd meg négyzetekkel! | `measure-squares` | A négyzetek száma = a mért hossz | ok|
| 39 | Mennyi fér bele? 1. osztály | `volume` | A nagyobb űrtartalmú edény kiválasztható | ok|
| 40 | Idő – egész és fél óra | `time` | Egész és fél óra olvasása helyes | ok|
| 41 | Fizesd ki pontosan! | `money-pay` | Az érmék összege pontosan az ár | ok|
| 42 | Melyik pénztárcában van több? | `money-compare` | A pénztárcák értéke helyesen összehasonlítható | ok|
| 43 | Meg tudod venni? | `money-enough` | Az elég/nem elég döntés az értéknek megfelel | ok|

### 2.6 Szöveges feladatok

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 44 | Szöveges feladatok | `word-problem` / 20 | Egy lépéses történet, a művelet a szöveghez illik | ok|

---

## 3. Világok és készségtérkép

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 3.1 | Válts világot a profilból | A leckék jelenetei az adott világ címét/emo-ját mutatják | ok|
| 3.2 | Válassz ki egy leckét több különböző világban | A `worldTitles`-ek megjelennek, a feladat ugyanaz marad | ok|
| 3.3 | 📚 Készségek oldal | A „📐 Hány oldala van?” az Alakzatok készséghez tartozik | ok|

## 4. Weboldal- és telefonellenőrzés

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 4.1 | Ikon a fülön / PWA | A fülön (favicon) és a telepített PWA-ban ugyanaz a tangram-M: kék és világosszürke háromszögekből álló M, fehér vonalakkal | |
| 4.2 | Telefonméret (DevTools 375px) | A ☕ „Támogatás” link NEM jelenik meg, a jobb felső gombok (súgó, 📚) koppinthatók | ok|
| 4.3 | Asztali nézet | A ☕ „Támogatás” link a bal alsó sarokban látható | ok|
| 4.4 | Hard reload / offline | Nincs konzolhiba; az app cache-ből is betölt | ok|

---

## 5. Visszajelzés sablon

- **Lecke / lépés:** (pl. 12 – Helyiérték 100-ig)
- **Elvárt:** …
- **Tapasztalt:** …
- **Konzolhiba / screenshot:** (ha van)