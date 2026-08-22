# Második osztály – Következő lépések

## Jelenlegi állapot

**67 lecke** van regisztrálva összesen (**27** első + **40** második osztályos). Az 1–3. lépés **kész**.

---

## ✅ 2026-08-21 – Technikai frissítés (kész)

Részletes leírás: `docs/kod-racionalizalas.md`

### Kód-racionalizálás – mindhárom pont kész
- **Visszajelzés egységesítése:** 25 komponens migrálva a közös `components/ui/feedback.js`-re (`createFeedback` + `markCorrect`).
- **`makeOptions` duplikáció megszüntetve:** 8 fájlban közös `utils/options.js` (~190 sor duplikáció eltűnt).
- **Számolt feladattípusok:** `Game.js`-ben `COUNTED_TYPES` Set + `isCounted()` segéd (35 típus ellenőrizve).

### Technikai javítások
- `Game.js`: `RENDERERS` registry Map + `SKILL_BY_TYPE` (390 → 325 sor).
- Új `src/storage.js` util (`loadJSON` / `saveJSON` / `loadRaw` / `saveRaw` / `removeKeys`) – `UserManager.js`, `lessonMenu.js` átírva.
- `ui/exercise.js` → `ui/exerciseShell.js` átnevezés (névütközés a feladat-komponensekkel).
- Konzisztens `?v=` verzióparaméter minden `Game.js`-importon.
- `messageBox` kapott `aria-live="polite"` attribútumot.

### Új funkció: helyes válasz jelölése
- Választós feladatoknál a jó válasz **zölden** kiemelődik (`.option-correct`), a hiányzó szám („?") helyére beíródik a helyes érték, majd jön a Tovább gomb.
- 18 komponens / 21 hívási pont; a húzásos és beírósos feladatoknál nem érintett.

### Hibajavítások
- „4 += 11" típusú felirat → „4 + ? = 11" választós módban (`missingNumber.js`, `mixed.js`).
- `missingNumber.js` scope-hiba: a kattintáskezelő blokkon kívülről nem látta a `placeholdert` → `ReferenceError` (zöld volt a gomb, de nem töltődött a szám és nem jött Tovább). Javítva függvényszintű `let placeholder = null`-lal.

### Emoji-támogatottság
- Nem mindenhol támogatott emojik cserélve régi, univerzálisakra: 🩶 → 🤖, 🛞 → ⚙️, 🧃 → 🥤.
- A hiányzó/összehasonlító/szomszéd sávok ⬜ négyzetei világspecifikus emojikra (verseny ⚙️, foci 🥅, konyha 🥄, állatkert 🦒, űr 🚀).

### PWA
- `sw-cache.js` újragenerálva (218 fájl), `CACHE` bump: `matekido-v4`.

---

## ✅ 2026-08-22 – Becslés-javítás + hibás számolás (kész)

### Hibajavítások
- **Becslés:** a helyes válasz eddig a *pontos eredmény* kerekítésével számolódott (`round10(48 − 34) = 10`), miközben a súgó a *tagok* kerekítését tanította (`50 − 30 = 20`) – a súgót követő jó választ elutasította az app. Mostantól a válasz is a tagok kerekítéséből készül (`round10(a) ± round10(b)`); kivonásnál újrapároztat, ha a kerekített különbség ≤ 0 lenne. `estimateGenerator.js` `?v=2`.
- **Alakzatok:** 🧱 (téglafal) emoji kivéve a téglalap kategóriából (`data/shapes.js`) – apró kockáknak látszik, nem egyértelmű téglalap.

### Új lecke: 10c. Hibás számolás
- Részletesen a **2. lépés** szekcióban lentebb. Új fájlok: `findErrorGenerator.js`, `findError.js`, `find-error.css`, `grade2/find-error-01.json`.

### Statisztika oldal
- A napi nézet „Feladatok bontásban" listáján a régebbi feladattípusok nyers angol azonosítóként jelentek meg (pl. `table`, `true-false`). A `statsPage.js` típuscímkéi szinkronban a `lessonMenu.js` magyar neveivel, plusz három kimaradót pótoltunk: `bridge-ten` → Tízes átlépés, `grouping` → Csoportosítás, `match-groups` → Csoportok párosítása.

### Egyéb
- Készségtérkép: 2. osztályos kártya „37 lecke" → „38 lecke" (`skillMap.js`).

### PWA
- `sw-cache.js` újragenerálva (235 fájl), `CACHE` bump: `matekido-v6`.

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
- **Design:** A helyes válasz a tagok tizesekre kerekítéséből adódik (pl. `48 − 34 ≈ 50 − 30 = 20`), ugyanúgy, ahogy a súgó mutatja. *(2026-08-22-ig az eredményt kerekítettük – 48 − 34 esetén ez 10-et adott volna, és a súgót követő jó választ elutasította. Javítva.)*
- **Státusz:** ✅ Kész, regisztrálva

### 10b. Igaz/Hamis műveletek
- **Generátor:** `trueFalseGenerator.js` (új) – összeadás/kivonás igaz/hamis
- **Komponens:** `trueFalse.js` (új) – nagy Igaz/Hamis gombok
- **Lecke:** `grade2/true-false-01.json` – 8 feladat
- **Státusz:** ✅ Kész, regisztrálva

### Javítások
- Osztás input fókusz javítva (`division.js` – `requestAnimationFrame` hozzáadva)

---

## ✅ 2. lépés – Kész

### 10c. Hibás számolás felismerése
- **Generátor:** `findErrorGenerator.js` (új) – két mód: `single` („Hibás-e a számolás?" Helyes/Hibás gombok) és `pick` (3 számolás közül melyik a hibás). Tipikus gyereki hibákat szimulál (elfelejtett átviitel ≈ ±10, eggyel tévedés)
- **Komponens:** `findError.js` (új) – választós; hibánál kiírja a helyes eredményt a sikeres válasz után
- **Lecke:** `grade2/find-error-01.json` – 8 feladat, vegyes összeadás/kivonás 50-ig
- **Nehézség:** haladó (difficulty 3)
- **Státusz:** ✅ Kész, regisztrálva

---

## ✅ 3. lépés – Kész

### 7.2. Alakzatok összehasonlítása
- **Generátor:** `shapeCompareGenerator.js` (új) – két mód: `sides` („Melyiknek van több oldala/sarka?" – háromszög, négyzet, ötszög, hatszög) és `size` (azonos alakzat két méretben: „Melyik a nagyobb?")
- **Komponens:** `shapeCompare.js` (új) – SVG síkidomok gombként kattinthatók; jó válasznál kiírja az oldal-/sarokszámokat
- **Lecke:** `grade2/shape-compare-01.json` – 8 feladat, vegyes módok
- **Státusz:** ✅ Kész, regisztrálva

### 7.4. Térbeli alakzatok
- **Generátor:** `solidShapeGenerator.js` (új) – két mód: `name` („Mi ez a test?" – kocka, téglatest, gömb, henger, kúp) és `faces` („Hány lapja van?" – csak egyértelmű testekre: kocka/téglatest 6, henger 3, kúp 2; a gömb kimarad)
- **Komponens:** `solidShape.js` (új) – SVG testábrázolások (kettős vonalas izometrikus rajz), választós
- **Lecke:** `grade2/solid-shapes-01.json` – 8 feladat, vegyes módok
- **Új készségek:** `shape-compare` és `solid-shapes` a `data/skills.js`-ben (geometria kategória) – statisztika és szűrők azonnal látják
- **Státusz:** ✅ Kész, regisztrálva

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
- `src/generators/weightGenerator.js`
- `src/generators/volumeGenerator.js`

### Komponensek (új)
- `src/components/weight.js`
- `src/components/volume.js`
- `src/components/moneyChange.js`

### Leckék (új)
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

*(2026-08-22-i állapot szerint ellenőrizve)*

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
| Alakzatok összehasonlítása | ✅ Kész | shape-compare-01 |
| Térbeli alakzatok | ✅ Kész | solid-shapes-01 |
| Idő | ⚠️ Részleges | time-02 (negyedóra kell) |
| Hosszúság | ⚠️ 1. osztályos | measure-compare-01, measure-squares-01 |
| Tömeg | ❌ Hiányzik | — |
| Űrtartalom | ❌ Hiányzik | — |
| Pénz (alap) | ⚠️ 1. osztályos | money-pay-01, money-compare-01, money-enough-01 |
| Pénz (visszajáró) | ❌ Hiányzik | — |
| Számérzék és becslés | ✅ Kész | estimate-01 |
| Igaz/Hamis műveletek | ✅ Kész | true-false-01 |
| Hibás számolás | ✅ Kész | find-error-01 |
