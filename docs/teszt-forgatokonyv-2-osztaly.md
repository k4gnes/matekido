# Matekidő – 2. osztály manuális tesztforgatókönyv

Ennek a dokumentumnak a célja, hogy a **2. osztályos tananyagot** (55 lecke, 6 világ, számkör 100-ig + szorzás/osztás 2, 3, 4, 5, 10-es táblákkal) a böngészőben kézzel végigteszteljük: minden lecke helyesen épül fel, a feladatok a megjelölt tartományban vannak, a jó/rossz válasz kezelése helyes, és a lecke a celebrációval zárul.

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
| 1.1 | Menüben válaszd ki a leckét | Scene (jelenet) szöveggel indul, világfüggő címmel és emojival | |
| 1.2 | Kattints a „Kezdés” gombra | Megjelenik az első feladat a progress-szal | |
| 1.3 | Válaszolj helyesen néhány feladatra | Pozitív visszajelzés, a számláló nő, a számok a lecke tartományán belül vannak | |
| 1.4 | Válaszolj helytelenül valahol | Nincs büntetés, a lecke folytatódik | |
| 1.5 | Fejezd be a leckét | Celebráció jelenik meg, a profil statisztikái frissülnek | |
| 1.6 | Indítsd újra ugyanazt a leckét | Más feladatok jönnek (véletlenszerű generálás) | |
| 1.7 | Kilépés gomb (📚 jobb felső) | Megerősítő párbeszéd, „Mégse” visszavisz a leckébe | |

---

## 2. Lecke-ellenőrző táblázatok

### 2.1 Számfogalom

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.1.1 | Összehasonlítás 20-ig | `comparison` / 20 | Az előjeles döntés az értékeknek megfelel | |
| 2.1.2 | Számok szomszédai 100-ig | `neighbor` / 100 | `bal = válasz − 1`, `jobb = válasz + 1` | |
| 2.1.3 | Helyiérték 100-ig | `place-value` / 100 | Tízesek/egyesek bontása + összeállítás helyes | |
| 2.1.4 | Összehasonlítás 100-ig | `comparison` / 100 | Az értékek 100-on belül, a jel illik az értékekhez | |
| 2.1.5 | Hiányzó szám 100-ig | `missing-number` / 100 | `a + ? = cél`, a válasz konzisztens | |
| 2.1.6 | Szomszédok gyakorlása 100-ig | `neighbor-single` / 100 | Egy adott szám szomszédai megadhatók (nem „számból” indulva) | |
| 2.1.7 | Mi a következő? 100-ig | `sequence` / 100 | A sorozatlépés állandó, a következő tag helyes | |
| 2.1.8 | Rendezzük sorainkat! 100-ig | `order` / 100 | A sor a kért irányba rendezhető | |
| 2.1.9 | Páros és páratlan 100-ig | `even-odd` / 100 | Besorolás helyes 100-ig | |
| 2.1.10 | Sorminta – hosszabb minták | `pattern` / 100 | A minta hosszabb, a folytatás logikus | |
| 2.1.11 | 🧮 Becslés – Melyik lehet? | `estimate` / 50 | A legjobb becslés kiválasztható; a kapott eredmény 50-en belül van | |

### 2.2 Műveletek (összeadás, kivonás, vegyes)

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.2.1 | Összeadás kerek tízesekkel | `addition` / 100 | Mindkét tag kerek tízes; összeg ≤ 100 | |
| 2.2.2 | Véletlen szám + kerek tízes | `addition` / 100 | Egy kerek tízes tag, összeg ≤ 100 | |
| 2.2.3 | Kétjegyű + egyjegyű összeadás | `addition` / 100 | Egyjegyű hozzáadása, összeg ≤ 100 | |
| 2.2.4 | Összeadás 100-ig átlépés nélkül | `addition` / 100 | Az egyesek összege < 10 (nincs átlépés) | |
| 2.2.5 | Összeadás 100-ig átlépéssel is | `addition` / 100 | Van tízesátlépő feladat is (egyesek összege ≥ 10) | |
| 2.2.6 | Kivonás kerek tízesekkel | `subtraction` / 100 | Kerek tízesek, az eredmény ≥ 0 | |
| 2.2.7 | Véletlen szám − kerek tízes | `subtraction` / 100 | Kerek tízes kivonandó, maximum 100-ig | |
| 2.2.8 | Kétjegyű − egyjegyű kivonás | `subtraction` / 100 | Egyjegyű kivonás, eredmény ≥ 0 | |
| 2.2.9 | Kivonás 100-ig | `subtraction` / 100 | Kétjegyű kivonás, eredmény ≥ 0 | |
| 2.2.10 | Kétjegyű − kétjegyű átlépés nélkül | `subtraction` / 100 | Az egyesek csökkenése átlépés nélkül | |
| 2.2.11 | Kivonás 100-ig átlépéssel | `subtraction` / 100 | Van tízesátlépő feladat is (egyesek csökkenése átlépéssel) | |
| 2.2.12 | Vegyes műveletek 100-ig | `mixed` / 100 | + és − vegyesen, a jel a feladatnak felel meg | |
| 2.2.13 | ❓ Hiányzó tag | `missing-operand` / 20 | `? + b = c` alak, a válasz `c − b` | |

### 2.3 Igaz/hamis és hibás számolás

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.3.1 | ✅ Igaz vagy hamis? | `true-false` / 50 | Az állítás értéke valóban igaz/hamis | |
| 2.3.2 | 🕵️ Hibás számolás? | `find-error` / 50 | A hibás művelet megtalálható | |

### 2.4 Szorzás és osztás

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.4.1 | Egyenlő csoportok | `equal-groups` / 30 | `csoportok × csoportonként` = összesen | |
| 2.4.2 | Ismételt összeadás | `repeated-addition` / 50 | Az ismételt összeadás összege helyes | |
| 2.4.3 | Számolás kettesével, ötösével, tizesével | `skip-counting` / 50 | A lépegetés állandó, a hiányzó tag helyes | |
| 2.4.4 | Szorzás 2, 5, 10-es táblával | `table` / 100 | Csak 2/5/10-es szorzók; a sorrend felcserélhető (a×b = b×a) | |
| 2.4.5 | Szorzás 3, 4-es táblával | `table` / 100 | Csak 3/4-es szorzók | |
| 2.4.6 | Vegyes szorzásgyakorlás | `table` / 100 | 2, 3, 4, 5, 10 vegyesen | |
| 2.4.7 | ❓ Hiányzó tényező | `missing-factor` / 100 | `a × ? = c` alak, a válasz `c ÷ a` | |
| 2.4.8 | ✖️➗ Szorzás és osztás kapcsolata | `link` / 100 | Szorzatból osztás (pl. 6 × 7 = 42 → 42 ÷ 7 = 6) | |
| 2.4.9 | Egyenlő elosztás és csoportosítás | `sharing` / 100 | Elosztás/csoportosítás, az eredmény „darab per csoport” vagy „hány csoport” | |
| 2.4.10 | Osztás 2, 5, 10-es táblával | `division-table` / 100 | Az osztó 2/5/10, az eredmény egész | |
| 2.4.11 | Vegyes osztás | `division-table` / 100 | 2, 3, 4, 5, 10-es osztók vegyesen, egész eredmény | |

### 2.5 Geometria

| # | Lecke | Típus | Amire figyelj | Eredmény |
|---|-------|-------|---------------|----------|
| 2.5.1 | Négyzet és téglalap | `shape-sort` | A négyzet/téglalap tulajdonság szerint válogatható | |
| 2.5.2 | 📐 Alakzatok összehasonlítása | `shape-compare` | **Fontos:** a 3–8 oldalú sokszögek (háromszög…nyolcszög) vegyesen, véletlenszerűen jönnek; a több oldal/sarok és a nagyobb helyesen kiválasztható | |
| 2.5.3 | 🧊 Térbeli alakzatok | `solid-shape` | „Mi ez a test?” **és** „Hány lapja van?” feladatok is (kocka 6, téglatest 6, henger 3, kúp 2) | |
| 2.5.4 | 🪞 Tükrözés és szimmetria | `mirror` | A tükörkép kiválasztható | |

### 2.6 Gyakorlati tudások

| # | Lecke | Típus | Amire figyelj | Eredmény |
|---|-------|-------|---------------|----------|
| 2.6.1 | Idő – negyedóra | `time` | Negyed/fél/háromnegyed óra olvasása helyes | |
| 2.6.2 | Idő – pontos idő olvasása | `time` | Perc pontos leolvasás | |
| 2.6.3 | 🗓️ Naptár 2. osztály | `calendar` | Hét/hónap/nap kérdések 2. osztályos szinten | |
| 2.6.4 | Melyik nehezebb? | `weight` | A nehezebb tárgy kiválasztható | |
| 2.6.5 | Melyikbe fér több? | `volume` | A nagyobb űrtartalmú edény kiválasztható | |
| 2.6.6 | Fizesd ki pontosan! 100-ig | `money-pay` | Az érmék összege pontosan az ár (50 forintossal is) | |
| 2.6.7 | Melyik pénztárcában van több? 100 felett | `money-compare` | A pénztárcák értéke helyesen összehasonlítható | |
| 2.6.8 | Meg tudod venni? 100 felett | `money-enough` | Az elég/nem elég döntés az értéknek megfelel | |
| 2.6.9 | Mennyi a visszajáró? | `money-change` | A visszajáró = fizetett − ár | |
| 2.6.10 | 📏 Hosszúság-mérés (m, dm, cm) | `measure-units` | Az átváltás/mérés helyes a mértékegységek között | |
| 2.6.11 | 🍕 Törtek – fele, harmada, negyede | `fraction` | A kép és a tört jele társítható | |

### 2.7 Szöveges feladatok

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.7.1 | 📝 Szorzásos szöveges feladatok | `word-problem` / 30 | A történet szorzással oldható meg, a válasz konzisztens | |
| 2.7.2 | 📝 Osztásos szöveges feladatok | `word-problem` / 30 | A történet osztással oldható meg, a válasz konzisztens | |
| 2.7.3 | 📝 Kétlépéses szöveges feladatok | `word-problem` / 20 | Két lépéses történet (összeadás+kivonás vagy szorzás+összeadás) | |

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
| 4.1 | Ikon a fülön / PWA | Kék háttér, piros M betű gombszürke körvonallal | |
| 4.2 | Telefonméret (DevTools 375px) | A ☕ „Tippelj meg!” link NEM jelenik meg, a jobb felső gombok (súgó, 📚) koppinthatók | |
| 4.3 | Asztali nézet | A ☕ „Tippelj meg!” link a jobb felső sarokban látható | |
| 4.4 | Hard reload / offline | Nincs konzolhiba; az app cache-ből is betölt | |

---

## 5. Visszajelzés sablon

- **Lecke / lépés:** (pl. 2.4.7 – Hiányzó tényező)
- **Elvárt:** …
- **Tapasztalt:** …
- **Konzolhiba / screenshot:** (ha van)