# Második osztály – Következő lépések

## Jelenlegi állapot

**39 lecke** készült a 2. osztályból. Az 1. lépés (első hullám befejezése + két új komponens) **kész**.

---

## ✅ 1. lépés – Kész

### 5.3. Szorzás és osztás kapcsolata
- **Generátor:** `multiplicationGenerator.js` bővítve `link` típussal
- **Komponens:** `multiplication.js` bővítve `link` rendereléssel (input + choice mód)
- **Lecke:** `grade2/multiplication-link-01.json` – 8 feladat, 2,3,4,5,10-es táblával
- **Státusz:** ✅ Kész, regisztrálva

### 6.7. Kétlépéses szöveges feladatok
- **Generátor:** `wordProblemGenerator.js` bővítve `two-step` fajtával
- **Komponens:** `wordProblem.js` bővítve – kétlépéses UI (első lépés megoldása után jelenik meg a második)
- **Lecke:** `grade2/word-problems-two-step-01.json` – 5 feladat, 20-ig
- **Nehézség:** haladó (difficulty 3)
- **Státusz:** ✅ Kész, regisztrálva

### 10a. Számérzék és becslés
- **Generátor:** `estimateGenerator.js` (új) – kerekítés-alapú becslés
- **Komponens:** `estimate.js` (új) – választós gombok + kerekítési segítség
- **Lecke:** `grade2/estimate-01.json` – 8 feladat
- **Design:** A helyes válasz a kerekített eredmény (pl. `23 + 18 ≈ 40`, nem 41). A segítség mutatja a kerekítést: `20 + 20 = ?`
- **Státusz:** ✅ Kész, regisztrálva

### 10b. Igaz/Hamis műveletek
- **Generátor:** `trueFalseGenerator.js` (új) – összeadás/kivonás igaz/hamis
- **Komponens:** `trueFalse.js` (új) – nagy Igaz/Hamis gombok
- **Lecke:** `grade2/true-false-01.json` – 8 feladat
- **Státusz:** ✅ Kész, regisztrálva

### Javítások
- Osztás input fókusz javítva (`division.js` – `requestAnimationFrame` hozzáadva)

---

## 🟠 2. lépés – Hibás számolás felismerése

### 10c. Hibás számolás felismerése
- **Generátor:** `findErrorGenerator.js` (új)
  - Adott: `24 + 17 = 31` (a helyes 41)
  - Kérdés: „Hibás-e a számolás?"
  - Vagy: „Melyik számolás hibás?" – 3 számolásból kell kiválasztani a hibásat
- **Komponens:** `findError.js` (új) – választós, 3 számolás jelenik meg
- **Lecke:** `grade2/find-error-01.json`

---

## 🟡 3. lépés – Geometria

### 7.2. Alakzatok összehasonlítása
- **Generátor:** `shapeCompareGenerator.js` (új)
  - Adott: 2 alakzat képe
  - Kérdés: „Melyiknek van több oldala?" / „Melyik a nagyobb?"
  - Választós
- **Komponens:** `shapeCompare.js` (új) – SVG alakzatok megjelenítése, választós gombok
- **Lecke:** `grade2/shape-compare-01.json`

### 7.4. Térbeli alakzatok
- **Generátor:** `solidShapeGenerator.js` (új)
  - Adott: kocka / téglatest / gömb / henger képe
  - Kérdés: „Mi ennek a neve?" vagy „Hány lapja van ennek?"
  - Választós
- **Komponens:** `solidShape.js` (új) – SVG 3D alakzatok, választós
- **Lecke:** `grade2/solid-shapes-01.json`

---

## 🟡 4. lépés – Mérés

### 8.2. Tömeg
- **Generátor:** `weightGenerator.js` (új)
  - Adott: 2 tárgy képe (pl. toll és tégla)
  - Kérdés: „Melyik nehezebb?"
  - Választós
- **Komponens:** `weight.js` (új) – egyszerű választós, képekkel
- **Lecke:** `grade2/weight-01.json`

### 8.3. Űrtartalom
- **Generátor:** `volumeGenerator.js` (új)
  - Adott: 2 edény képe (kisebb/nagyobb)
  - Kérdés: „Több fér bele?"
  - Választós
- **Komponens:** `volume.js` (új) – egyszerű választós
- **Lecke:** `grade2/volume-01.json`

### 8.4. Idő bővítése – negyedóra
- **Meglévő komponens:** `time.js` bővítése
  - Új generátor opció: `quarter: true` – negyedóra bevezetése
  - Új lecke: `grade2/time-02.json` (negyedóra)
- **Nincs új komponens kell**, csak a meglévő bővítése

---

## 🟡 5. lépés – Pénz bővítése

### 9.1–9.3. Pénz bővítése 2. osztályra
- **Meglévő komponensek:** `moneyPay.js`, `moneyCompare.js`, `moneyEnough.js`
- **Új leckék:**
  - `grade2/money-pay-02.json` – nagyobb összegek (100 Ft-ig)
  - `grade2/money-compare-02.json` – nagyobb összegek összehasonlítása
  - `grade2/money-enough-02.json` – nagyobb összegek
  - `grade2/money-change-01.json` – visszajáró számítás (új komponens kell hozzá)
- **Visszajáró komponens:** `moneyChange.js` (új) – „Fizetsz X Ft-ot, a termék Y Ft. Mennyi a visszajáró?"

---

## Hátralevő munka

### Generátorok (új)
- `src/generators/findErrorGenerator.js`
- `src/generators/shapeCompareGenerator.js`
- `src/generators/solidShapeGenerator.js`
- `src/generators/weightGenerator.js`
- `src/generators/volumeGenerator.js`

### Komponensek (új)
- `src/components/findError.js`
- `src/components/shapeCompare.js`
- `src/components/solidShape.js`
- `src/components/weight.js`
- `src/components/volume.js`
- `src/components/moneyChange.js`

### Leckék (új)
- `src/data/lessons/grade2/find-error-01.json`
- `src/data/lessons/grade2/shape-compare-01.json`
- `src/data/lessons/grade2/solid-shapes-01.json`
- `src/data/lessons/grade2/weight-01.json`
- `src/data/lessons/grade2/volume-01.json`
- `src/data/lessons/grade2/time-02.json`
- `src/data/lessons/grade2/money-pay-02.json`
- `src/data/lessons/grade2/money-compare-02.json`
- `src/data/lessons/grade2/money-enough-02.json`
- `src/data/lessons/grade2/money-change-01.json`

### Módosítandó meglévő fájlok
- `src/components/time.js` – negyedóra támogatás
- `src/engine/Game.js` – új case-ek a hátralevő típusokhoz
- `src/builders/LessonBuilder.js` – új generátor ágak
- `src/generators/index.js` – új importok + case-ek
- `src/data/lessons/index.json` – új leckék
- `src/css/` – új stílusok ha kell

---

## Készség → Lecke lefedettség (második osztály)

| Készség | Státusz | Leckék |
|---|---|---|
| Számszomszédok | ✅ Kész | neighbor-01, neighbor-02 |
| Összehasonlítás | ⚠️ Részleges | comparison-02 (20-ig kellene 100-ig is) |
| Hiányzó szám | ✅ Kész | missing-number-03 |
| Számsor | ✅ Kész | sequence-02 |
| Sorba rendezés | ✅ Kész | order-02 |
| Páros/páratlan | ✅ Kész | even-odd-02 |
| Sorminta | ✅ Kész | pattern-02 |
| Helyiérték | ⚠️ 1. osztályos | place-value-01, place-value-02 |
| Összeadás 100-ig | ✅ Kész | 5 lecke |
| Kivonás 100-ig | ✅ Kész | 6 lecke |
| Vegyes műveletek | ✅ Kész | mixed-02 |
| Hiányzó tag | ✅ Kész | missing-operand-01 |
| Számolási stratégiák | ✅ Kész | round-tens-*, bridge-ten |
| Szorzás előkészítés | ✅ Kész | mult-prep-01, 02, 03 |
| Szorzás | ✅ Kész | multiplication-01, 02, 03 |
| Hiányzó tényező | ✅ Kész | missing-factor-01 |
| Szorzás-osztás kapcsolat | ✅ Kész | multiplication-link-01 |
| Osztás | ✅ Kész | division-01, 02, 03 |
| Szöveges feladatok (alap) | ✅ Kész | word-problems-01 |
| Szöveges feladatok (szorzás) | ✅ Kész | word-problems-multiply-01 |
| Szöveges feladatok (osztás) | ✅ Kész | word-problems-divide-01 |
| Kétlépéses feladatok | ✅ Kész | word-problems-two-step-01 |
| Alakzatok | ✅ Kész | shape-sort-03 |
| Alakzatok összehasonlítása | ❌ Hiányzik | — |
| Térbeli alakzatok | ❌ Hiányzik | — |
| Idő | ⚠️ Részleges | time-02 (negyedóra kell) |
| Hosszúság | ⚠️ 1. osztályos | measure-compare-01, measure-squares-01 |
| Tömeg | ❌ Hiányzik | — |
| Űrtartalom | ❌ Hiányzik | — |
| Pénz (alap) | ⚠️ 1. osztályos | money-pay-01, money-compare-01, money-enough-01 |
| Pénz (visszajáró) | ❌ Hiányzik | — |
| Számérzék és becslés | ✅ Kész | estimate-01 |
| Igaz/Hamis műveletek | ✅ Kész | true-false-01 |
| Hibás számolás | ❌ Hiányzik | — |
