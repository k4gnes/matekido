# Matekidő – 2. osztály manuális tesztforgatókönyv

Ennek a dokumentumnak a célja, hogy a **2. osztályos tananyagot** (58 lecke, 7 világ, számkör 100-ig + szorzás/osztás 2, 3, 4, 5, 10-es táblákkal, kombinatorika és valószínűség) a böngészőben kézzel végigteszteljük: minden lecke helyesen épül fel, a feladatok a megjelölt tartományban vannak, a jó/rossz válasz kezelése helyes, és a lecke a celebrációval zárul.

- **Szerver:** `make start` (localhost:8000) – a `src/` mappát szolgálja ki.
- **Böngésző:** Asztali (Chrome / Firefox / Edge) + legalább egyszer telefon méretű nézet.
- **Jelölések:** ✅ működik · ❌ hibás · ⚠️ kisebb hiba / megjegyzés · ➖ nem érinti / átugorható.

---

## 0. Előkészítés

1. Indítsd el a szervert: `make start`, nyisd meg: <http://localhost:8000>.
2. DevTools → Application → Local Storage: töröld a `matekido-users` és `matekido-profile` kulcsokat (vagy tesztelj inkognitóban).
3. Hozz létre egy tesztjátékost (pl. „Teszt 2”).

---

## 1. Általános lecke-folyamat (minden leckére érvényes)

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 1.1 | Menüben válaszd ki a leckét | Scene (jelenet) szöveggel indul, világfüggő címmel és emojival |✅ |
| 1.2 | Kattints a „Kezdés” gombra | Megjelenik az első feladat a progress-szal | ✅|
| 1.3 | Válaszolj helyesen néhány feladatra | Pozitív visszajelzés, a számláló nő, a számok a lecke tartományán belül vannak |✅ |
| 1.4 | Válaszolj helytelenül valahol | Nincs büntetés, a lecke folytatódik |✅ |
| 1.5 | Fejezd be a leckét | Celebráció jelenik meg, a profil statisztikái frissülnek |✅ |
| 1.6 | Indítsd újra ugyanazt a leckét | Más feladatok jönnek (véletlenszerű generálás) | ✅|
| 1.7 | Kilépés gomb (📚 jobb felső) | Megerősítő párbeszéd, „Mégse” visszavisz a leckébe | ✅|

---

## 2. Lecke-ellenőrző táblázatok

A sorok sorszáma **1–58, folytonos** – megegyezik a tanmenettel (`docs/masodik-osztaly.md`) és a menüben/a lecke fejlécében látott „x/58” jelzéssel. A szekciók csak csoportosítás, azon belül is a tanmenet sorrendje érvényes.

### 2.1 Számfogalom

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 1 | 🧮 Becslés – Melyik lehet? | `estimate` / 50 | A legjobb becslés kiválasztható; a kapott eredmény 50-en belül van |✅ |
| 2 | Páros és páratlan 100-ig | `even-odd` / 100 | Besorolás helyes 100-ig |✅ |
| 3 | Hiányzó szám 100-ig | `missing-number` / 100 | `a + ? = cél`, a válasz konzisztens | ✅|
| 4 | Számok szomszédai 100-ig | `neighbor` / 100 | `bal = válasz − 1`, `jobb = válasz + 1` |✅ |
| 5 | Szomszédok gyakorlása 100-ig | `neighbor-single` / 100 | Egy adott szám szomszédai megadhatók (nem „számból” indulva) |✅ |
| 6 | Mi a következő? 100-ig | `sequence` / 100 | A sorozatlépés állandó, a következő tag helyes |✅ |
| 7 | Váltakozó számsor | `sequence` (váltakozó) / 100 | Két lépés váltakozik (pl. +1, +3, +1, +3), 2 blokk: választós, majd beírós feladatok; a következő tag 100-on belül |✅ |
| 8 | Rendezzük sorainkat! 100-ig | `order` / 100 | A sor a kért irányba rendezhető |✅ |
| 9 | Sorminta – hosszabb minták | `pattern` / 100 | A minta hosszabb, a folytatás logikus |✅ |
| 10 | Helyiérték 100-ig | `place-value` / 100 | Tízesek/egyesek bontása + összeállítás helyes |✅ |
| 11 | Összehasonlítás 20-ig | `comparison` / 20 | Az előjeles döntés az értékeknek megfelel |✅ |
| 12 | Összehasonlítás 100-ig | `comparison` / 100 | Az értékek 100-on belül, a jel illik az értékekhez | ✅|
| 13 | 🍕 Törtek – fele, harmada, negyede | `fraction` / — | A kép és a tört jele társítható; **a menüben nem a Számok, hanem a külön „Törtek” szekcióban jelenik meg** (rajta a 13/58 jelzés) |✅ |
| 14 | 🔀 Sorrendbe! – 3 elem | `combinatorics` / — | 3 különböző elemből 6 sorrend; koppintással rakható sorba, ismétlődésnél jelzés jön, új sorrendnél nő a számláló; mind a 6 megtalálása után celebráció | ✅|
| 15 | 🎲 Mi valószínűbb? | `probability` (compare) / — | Zsák és pörgettyű vegyesen; a nagyobb/kisebb mennyiség (több golyó / nagyobb körcikk) felismerhető; néha ugyanannyi van, ilyenkor „Ugyanolyan eséllyel” a helyes | ✅|

### 2.2 Műveletek (összeadás, kivonás, vegyes)

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 16 | Összeadás kerek tízesekkel | `addition` / 100 | Mindkét tag kerek tízes; összeg ≤ 100 | |
| 17 | Véletlen szám + kerek tízes | `addition` / 100 | Egy kerek tízes tag, összeg ≤ 100 | |
| 18 | Kétjegyű + egyjegyű összeadás | `addition` / 100 | Egyjegyű hozzáadása, összeg ≤ 100 | |
| 19 | Összeadás 100-ig átlépés nélkül | `addition` / 100 | Az egyesek összege < 10 (nincs átlépés) | |
| 20 | Összeadás 100-ig átlépéssel is | `addition` / 100 | Van tízesátlépő feladat is (egyesek összege ≥ 10) | |
| 21 | ❓ Hiányzó tag | `missing-operand` / 20 | `? + b = c` alak, a válasz `c − b` | |
| 22 | Kivonás kerek tízesekkel | `subtraction` / 100 | Kerek tízesek, az eredmény ≥ 0 | |
| 23 | Véletlen szám − kerek tízes | `subtraction` / 100 | Kerek tízes kivonandó, maximum 100-ig | |
| 24 | Kétjegyű − egyjegyű kivonás | `subtraction` / 100 | Egyjegyű kivonás, eredmény ≥ 0 | |
| 25 | Kivonás 100-ig | `subtraction` / 100 | Kétjegyű kivonás, eredmény ≥ 0 | |
| 26 | Kétjegyű − kétjegyű átlépés nélkül | `subtraction` / 100 | Az egyesek csökkenése átlépés nélkül | |
| 27 | Kivonás 100-ig átlépéssel | `subtraction` / 100 | Van tízesátlépő feladat is (egyesek csökkenése átlépéssel) | |
| 28 | Vegyes műveletek 100-ig | `mixed` / 100 | + és − vegyesen, a jel a feladatnak felel meg | |

### 2.3 Igaz/hamis és hibás számolás

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 29 | ✅ Igaz vagy hamis? | `true-false` / 50 | Az állítás értéke valóban igaz/hamis | |
| 30 | 🕵️ Hibás számolás? | `find-error` / 50 | A hibás művelet megtalálható | |

### 2.4 Szorzás és osztás

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 31 | Egyenlő csoportok | `equal-groups` / 30 | `csoportok × csoportonként` = összesen | |
| 32 | Ismételt összeadás | `repeated-addition` / 50 | Az ismételt összeadás összege helyes | |
| 33 | Számolás kettesével, ötösével, tizesével | `skip-counting` / 50 | A lépegetés állandó, a hiányzó tag helyes | |
| 34 | Szorzás 2, 5, 10-es táblával | `table` / 100 | Csak 2/5/10-es szorzók; a sorrend felcserélhető (a×b = b×a) | |
| 35 | Szorzás 3, 4-es táblával | `table` / 100 | Csak 3/4-es szorzók | |
| 36 | Vegyes szorzásgyakorlás | `table` / 100 | 2, 3, 4, 5, 10 vegyesen | |
| 37 | ❓ Hiányzó tényező | `missing-factor` / 100 | `a × ? = c` alak, a válasz `c ÷ a` | |
| 38 | ✖️➗ Szorzás és osztás kapcsolata | `link` / 100 | Szorzatból osztás (pl. 6 × 7 = 42 → 42 ÷ 7 = 6) | |
| 39 | Egyenlő elosztás és csoportosítás | `sharing` / 100 | Elosztás/csoportosítás, az eredmény „darab per csoport” vagy „hány csoport” | |
| 40 | Osztás 2, 5, 10-es táblával | `division-table` / 100 | Az osztó 2/5/10, az eredmény egész | |
| 41 | Vegyes osztás | `division-table` / 100 | 2, 3, 4, 5, 10-es osztók vegyesen, egész eredmény | |

### 2.5 Geometria

| # | Lecke | Típus | Amire figyelj | Eredmény |
|---|-------|-------|---------------|----------|
| 42 | Négyzet és téglalap | `shape-sort` | A négyzet/téglalap tulajdonság szerint válogatható | |
| 43 | 📐 Alakzatok összehasonlítása | `shape-compare` | **Fontos:** a 3–8 oldalú sokszögek (háromszög…nyolcszög) vegyesen, véletlenszerűen jönnek; a több oldal/sarok és a nagyobb helyesen kiválasztható | |
| 44 | 🧊 Térbeli alakzatok | `solid-shape` | „Mi ez a test?” **és** „Hány lapja van?” feladatok is (kocka 6, téglatest 6, henger 3, kúp 2) | |
| 45 | 🪞 Tükrözés és szimmetria | `mirror` | A tükörkép kiválasztható | |

### 2.6 Gyakorlati tudások

| # | Lecke | Típus | Amire figyelj | Eredmény |
|---|-------|-------|---------------|----------|
| 46 | 📏 Hosszúság-mérés – méter, deciméter, centiméter | `measure-units` | 5 feladat, 2 blokkban: 3 vegyes (válaszlista / beírás / igaz-hamis / összehasonlítás) valós tárggyal, majd 2 egységválasztó („🚲 Egy kerékpár hossza 1 ____") | |
| 46a | ⚠️ Csak 2. osztályos egységek jöhetnek | `units: [m, dm, cm]` | **Sem milliméter, sem kilométer nem jöhet** – a hangya (mm) és a méh (mm) kimarad, az egységopciók is csak m/dm/cm. A 3–4. osztályon már van mm/km, itt még nincs | |
| 46b | Ugyanaz a lecke újra | | Más feladatok jönnek; a 3 vegyes feladatban a forma véletlenül választott, ezért nem mindig mind a 4 látható egyszerre | |
| 47 | Idő – pontos idő olvasása | `time` | Perc pontos leolvasás | |
| 48 | 🗓️ Naptár 2. osztály | `calendar` | Hét/hónap/nap kérdések 2. osztályos szinten | |
| 49 | Idő – negyedóra | `time` | Negyed/fél/háromnegyed óra olvasása helyes | |
| 50 | Melyik nehezebb? | `weight` | A nehezebb tárgy kiválasztható | |
| 51 | Melyikbe fér több? | `volume` | A nagyobb űrtartalmú edény kiválasztható | |
| 52 | Fizesd ki pontosan! 100-ig | `money-pay` | Az érmék összege pontosan az ár (50 forintossal is) | |
| 53 | Melyik pénztárcában van több? 100 felett | `money-compare` | A pénztárcák értéke helyesen összehasonlítható | |
| 54 | Meg tudod venni? 100 felett | `money-enough` | Az elég/nem elég döntés az értéknek megfelel | |
| 55 | Mennyi a visszajáró? | `money-change` | A visszajáró = fizetett − ár | |

### 2.7 Szöveges feladatok

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 56 | 📝 Szorzásos szöveges feladatok | `word-problem` / 30 | A történet szorzással oldható meg, a válasz konzisztens | |
| 57 | 📝 Osztásos szöveges feladatok | `word-problem` / 30 | A történet osztással oldható meg, a válasz konzisztens | |
| 58 | 📝 Kétlépéses szöveges feladatok | `word-problem` / 20 | Két lépéses történet (összeadás+kivonás vagy szorzás+összeadás) | |

---

## 3. Világok és készségtérkép

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 3.1 | Válts világot a profilból | A leckék jelenetei az adott világ címét/emo-ját mutatják | |
| 3.2 | Válassz ki egy leckét több különböző világban | A `worldTitles`-ek megjelennek, a feladat ugyanaz marad | |
| 3.3 | 📚 Készségek oldal | A szorzás/osztás/törtek/tükrözés leckék a megfelelő készséghez tartoznak | |

## 4. Weboldal- és telefonellenőrzés

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 4.1 | Ikon a fülön / PWA | A fülön (favicon) és a telepített PWA-ban ugyanaz a tangram-M: kék és világosszürke háromszögekből álló M, fehér vonalakkal | |
| 4.2 | Telefonméret (DevTools 375px) | A ☕ „Támogatás” link NEM jelenik meg, a jobb felső gombok (súgó, 📚) koppinthatók | |
| 4.3 | Asztali nézet | A ☕ „Támogatás” link a bal alsó sarokban látható | |
| 4.4 | Hard reload / offline | Nincs konzolhiba; az app cache-ből is betölt | |

---

## 5. Visszajelzés sablon

- **Lecke / lépés:** (pl. 37 – Hiányzó tényező)
- **Elvárt:** …
- **Tapasztalt:** …
- **Konzolhiba / screenshot:** (ha van)