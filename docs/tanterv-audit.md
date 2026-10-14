# Tanterv-audit – Nat 2020 / kerettanterv

Ez a dokumentum a Matekidő jelenlegi leckekínálatát veti össze a
**2020-as Nat-hoz illeszkedő kerettanterv** matematika tantárgyának
témaköreivel.

## Forrás és módszer

- Forrás: Oktatási Hivatal, *Kerettanterv az általános iskola 1–4. évfolyama
  számára* (`Matematika_A.docx`) és *Kerettanterv az általános iskola 5–8.
  évfolyama számára* (`Matematika_F.docx`), 2020-as Nat.
  - 1–2. évfolyam: 272 óra, 22 témakör.
  - 3–4. évfolyam: 272 óra, 26 témakör.
  - 5–6. évfolyam: 272 óra, 18 témakör.
- A repó oldala: `src/data/lessons/index.json` (lecke-regiszter), a
  `skill` és `title` mezők, illetve `docs/{elso,masodik,harmadik,negyedik,otodik,hatodik}-osztaly.md`.
- A leképezés **készség/leckeszintű** (nem óraszám-pontos), ezért az állapot
  jelölése tájékoztató.

**Jelölések:**
- ✅ **lefedett** – van önálló, a témakört érdemben körüljáró lecke.
- 🟡 **részben** – van kapcsolódó lecke, de a témakör több eleme hiányzik.
- ❌ **hiányzik** – nincs a témakört érdemben lefedő lecke.

---

## 1–2. évfolyam (22 témakör)

| Témakör (óra) | Repó-leckék | Állapot |
|---|---|---|
| Válogatás, halmazok alkotása, vizsgálata (8) | `sets` (Válogatás), `shapes` (alakzatválogatás) | 🟡 |
| Rendszerezés, rendszerképzés (8) | `ordering`, `pattern`, `sequence` | 🟡 |
| Állítások (8) | `true-false-01`, `find-error-01` | 🟡 |
| Problémamegoldás (8) | `mixed`, `missing-number`, `missing-operand` | 🟡 |
| Szöveges feladatok megoldása (11) | `word-problems-01`, `word-problems-multiply-01`, `word-problems-divide-01`, `word-problems-two-step-01` | ✅ |
| Szám és valóság kapcsolata (19) | `number-name`, `money-*`, `measure-*`, `calendar-01`, `data-chart-01` | ✅ |
| Számlálás, becslés (12) | `estimate-01-grade1`, `sequence-01` | 🟡 |
| Számok rendezése (12) | `order-01`, `comparison-01/02`, `neighbor-01`, `sequence-01` | ✅ |
| Számok tulajdonságai (18) | `decomposition-01`, `even-odd-01`, `pattern-01`, `place-value-01/02` | ✅ |
| Számok helyi értékes alakja (10) | `place-value-01/02` | ✅ |
| Mérőeszköz használata, mérési módszerek (20) | `measure-compare-01`, `measure-squares-01`, `measure-units-01`, `volume-01`, `weight-01`, `time-01` | ✅ |
| Alapműveletek értelmezése (20) | `addition-01`, `subtraction-01`, `mult-prep-01/02/03`, `division-01` | ✅ |
| Alapműveletek tulajdonságai (16) | `mixed-01`, `missing-operand-01`, `multiplication-link-01` | 🟡 |
| Szóbeli számolási eljárások (20) | `round-tens-addition-01/02`, `round-tens-subtraction-01/02`, `bridge-ten-01` | ✅ |
| Fejben számolás (18) | `multiplication-01/02/03`, `division-02/03`, `addition-play-01` | ✅ |
| Alkotás térben és síkon (8) | `shape-sort-01`, `solid-shapes-01` | 🟡 (nincs építés/alkotás) |
| Alakzatok geometriai tulajdonságai (12) | `shape-sort-01`, `shape-compare-01`, `solid-shapes-01` | 🟡 |
| Transzformációk (6) | `transform-01`, `mirror-01` | 🟡 |
| Tájékozódás térben és síkon (8) | `spatial-01` | 🟡 |
| Összefüggések, kapcsolatok, szabályszerűségek (18) | `pattern-01`, `sequence-01`, `alternating-sequence-01`, `multiplication-link-01` | ✅ |
| Adatok megfigyelése (6) | `data-chart-01` | 🟡 |
| Valószínűségi gondolkodás (6) | `probability-01` | 🟡 |

---

## 3–4. évfolyam (26 témakör)

| Témakör (óra) | Repó-leckék | Állapot |
|---|---|---|
| Válogatás, halmazok alkotása, vizsgálata (6) | – | ❌ |
| Rendszerezés, rendszerképzés (10) | `pattern-1000-01`, `ordering` | 🟡 |
| Állítások (8) | `true-false-01`, `find-error-01` | 🟡 |
| Problémamegoldás (10) | `word-problems-two-step-02`, `find-error` | 🟡 |
| Szöveges feladatok megoldása (16) | `word-problems-proportion-01/02`, `word-problems-remainder-01`, `word-problems-two-step-02` | 🟡 |
| Szám és valóság kapcsolata (8) | `number-name-*`, `length-units-01`, `money-*` | ✅ |
| Számlálás, becslés (10) | `estimate-1000-01`, `rounding-01` | 🟡 |
| Számok rendezése (6) | `order-1000-01`, `comparison-1000-01`, `neighbor-10000-01`, `rounding-02` | ✅ |
| Számok tulajdonságai (17) | `even-odd-1000-01`, `divisibility-01`, `roman-01/02` | 🟡 |
| Számok helyi értékes alakja (12) | `place-value-hundreds-01`, `place-value-thousands-01`, `number-name-02` | ✅ |
| Mérőeszköz használata, mérési módszerek (20) | `length-02/03`, `volume-02/03`, `weight-02/03`, `time-convert-01`, `elapsed-time-01`, `perimeter-01`, `area-01` | ✅ |
| Alapműveletek értelmezése (6) | `remainder-division-01/02`, `multiplication-link-6789-01` | 🟡 |
| Alapműveletek tulajdonságai (8) | `missing-factor-*`, `operation-order-01` | 🟡 |
| Szóbeli számolási eljárások (12) | `round-hundreds-addition/subtraction-*`, `addition-1000-*` | ✅ |
| Fejben számolás (15) | `multiplication-6789-01`, `division-6789-01`, `multiplication-play-01/02` | ✅ |
| Írásbeli összeadás és kivonás (12) | `written-add-1000-01`, `written-sub-1000-01`, `written-add-10000-01`, `written-sub-10000-01` | ✅ |
| Írásbeli szorzás és osztás (12) | `written-mul-1000-01`, `written-mul2-1000-01`, `written-div-1000-01`, `written-div2-1000-01` | ✅ |
| Törtrészek (10) | `fraction-big-1000-01`, `fraction-symbol2-20-01`, `fraction-eqden-20-01` | ✅ |
| Negatív számok (6) | – | ❌ (a negatívok a repóban a 6. osztályra tolódnak) |
| Alkotás térben és síkon (12) | `polygon-01`, `solid-shapes-01` | 🟡 (nincs szerkesztés/építés) |
| Alakzatok geometriai tulajdonságai (12) | `polygon-01`, `angle-measure-01`, `perimeter-01`, `area-01` | ✅ |
| Transzformációk (8) | `mirror-01` | 🟡 (csak tükrözés; eltolás/forgatás nincs) |
| Tájékozódás térben és síkon (6) | – | ❌ |
| Összefüggések, kapcsolatok, szabályszerűségek (18) | `pattern-1000-01`, `alternating-sequence-01-grade3`, `operation-order-01` | 🟡 |
| Adatok megfigyelése (6) | `data-chart-01` | 🟡 |
| Valószínűségi gondolkodás (6) | `probability-01` | 🟡 |

---

## 5–6. évfolyam (18 témakör)

| Témakör (óra) | Repó-leckék | Állapot |
|---|---|---|
| Halmazok (10) | – | ❌ |
| Matematikai logika, kombinatorika (10) | `open-sentence-01`, `true-false-01`; kombinatorika: `combinatorics-01-grade2` (2. o.) | 🟡 (5–6. szintű kombinatorika tervezett) |
| Természetes számok halmaza, számelméleti ismeretek (20) | `place-value-millions-01`, `roman-02`, `divisibility-rules-01/02`, `divisibility-multiples-01`, `prime-composite-01`, `prime-factor-01`, `gcd-lcm-01` | ✅ |
| Alapműveletek természetes számokkal (16) | `written-big-01`, `operation-order-02`, `rounding-millions-01` | ✅ |
| Egész számok; alapműveletek egész számokkal (18) | `integers-line-01`, `integers-opposite-01`, `integers-compare-01`, `integers-ops-01`, `integers-muldiv-01` | ✅ |
| Közönséges törtek, tizedes törtek, racionális számok (18) | `fraction-line-01`, `fraction-decimal-01`, `decimal-basics-01`, `fraction-equal-01` | ✅ |
| Alapműveletek közönséges törtekkel (18) | `fraction-common-den-01`, `fraction-times-int-01`, `fraction-times-frac-01`, `fraction-divide-01`, `fraction-muldiv-01` | ✅ |
| Alapműveletek tizedes törtekkel (14) | `decimal-addsub-01`, `decimal-times-01`, `decimal-div-01` | 🟡 (írásbeli osztás tizedessel részleges) |
| Arányosság, százalékszámítás (20) | `ratio-split-01`, `direct-proportion-01`, `percent-basics-01`, `percent-of-01`, `fraction-percent-01`, `ratio-01` | 🟡 (fordított arányosság hiányzik – tervezett 23.) |
| Egyszerű szöveges feladatok (20) | `direct-proportion-01`, `word-problems-*` (többnyire alsó tagozat) | 🟡 (kevés 5–6. szintű szöveges) |
| A függvény fogalmának előkészítése (10) | `coordinate-01` | 🟡 (grafikonfelismerés hiányos) |
| Sorozatok (8) | `pattern-1000-01`, `alternating-sequence-01` | 🟡 |
| Mérés és mértékegységek (16) | `unit-conversion-01`, `area-volume-units-01`, `time-speed-01`, `shape-formula-02`, `solid-measure-01`, `angle-measure-02` | ✅ |
| Síkbeli alakzatok (18) | `polygon-02`, `shape-formula-02` | 🟡 (háromszög-egyenlőtlenség, -csoportosítás hiányzik) |
| Transzformációk, szerkesztések (20) | `transform-02`, `angle-measure-02` | 🟡/❌ (szerkesztés – körző/vonalzó – nincs) |
| Térgeometria (16) | `solid-measure-01`, `solid-shapes-01` | 🟡 (nézet, alaprajz, háló hiányzik) |
| Leíró statisztika (10) | `average-01`, `data-chart-01` | 🟡 (kör-/vonaldiagram hiányzik) |
| Valószínűség-számítás (10) | `probability-01` (1–3. o.) | 🟡 (5–6. szintű nincs) |

---

## Rendszerszintű megállapítások

### 1. A tanmenet gerince illeszkedik, a hiányok a szakaszok peremén vannak
A számfogalom, a műveletek, a törtek/tizedes törtek, a szöveges feladatok
és a mérés–mértékegység blokkok **jól lefedettek**, sőt az írásbeli műveletek
(3–4. o.) külön leckéket kaptak.

### 2. Hiányzó, önálló témakörök (❌)
- **3–4. osztály – Negatív számok (6 óra):** a Nat már itt bevezeti
  (hőmérséklet, adósság, emeletek). A repó ezt a témát a 6. osztályra tolja.
- **3–4. osztály – Tájékozódás térben és síkon (6 óra):** csak 1. osztályos
  `spatial-01` van.
- **3–4. osztály – Válogatás, halmazok (6 óra):** nincs 3–4. szintű lecke.
- **5–6. osztály – Halmazok (10 óra):** nincs 5–6. szintű halmazábra/részhalmaz.
- **Szerkesztés** (5–6.: *Transzformációk, szerkesztések*, 20 óra): körző/vonalzó,
  szakaszfelező, szögfelezés – a feladatformátum (feleletválasztás) miatt nincs.

### 3. Részben lefedett témakörök (🟡) – a tipikus hiányok
- **Alkotás térben és síkon / Térgeometria:** építés, nézet, alaprajz, háló
  hiányzik; csak felismerés van.
- **Transzformációk (1–4. o.):** jórészt csak tükrözés; eltolás/forgatás kevés.
- **Leíró statisztika:** csak oszlopdiagram/jellegű; kör- és vonaldiagram nincs.
- **Valószínűség:** csak 1–3. osztályos „biztos/lehetséges/lehetetlen”.
- **Sorozatok, Összefüggések:** felismerés van, szabály megfogalmazása/alkotása
  kevésbé.
- **Szöveges feladatok (5–6.):** kevés a valódi ök 5–6. szintű, többlépéses feladat.
- **Logika, kombinatorika (5–6.):** a kombinatorika a 6. osztályra tervezett.

### 4. Formátum- és mélységszintű eltérés
- **121 komponensből ~15 használ szabad beírást**, ~35 feleletválasztós; a
  NAT több helyen *alkotást, szerkesztést, gyűjtést, becslést* kér – ezek
  jelenleg nem vagy csak részben valósulnak meg.
- A `difficulty` skála 1–4, de **4-es (mester) szint egyetlen leckén sincs**.
- Az 5–6. osztályban **17/24 lecke `range: 100`** – a Nat 20 órája az
  arányosság/számelmélet körül nagyobb számköröket is vár.

---

## Javasolt prioritás

1. **3–4. osztály Negatív számok** pótlása (kis lecke hőmérséklet/adósság;
   illeszkedik a `measure`/`data` vonalhoz) – ez a legnagyobb tartalmi hiány.
2. **Halmazok + logika/kombinatorika** önálló leckékké emelése (1–6. mindenütt),
   mert a Nat mindhárom szakaszban önálló témakörként kezeli.
3. **Térgeometria: nézet, alaprajz, háló** interaktív (nem szerkesztős) formában.
4. **Statisztika: kör- és vonaldiagram**, valamint 5–6. szintű valószínűség.
5. **Többlépéses szöveges feladatok** bővítése 5–6. osztályban.
6. **Formátum**: egy „mester” (4-es) nehézségi szint bevezetése és
   a szabad beírás arányának növelése.
7. **Szerkesztés**: hosszabb távon interaktív szerkesztő/szimuláció
   (a Nat 5–6.-ban 20 órát szán rá).

---

## Kapcsolódó dokumentumok

- `docs/hatodik-osztaly.md`, `docs/otodik-osztaly.md`, `docs/negyedik-osztaly.md`
- `docs/feladat-hierarchia.md`
- `docs/ROADMAP.md`
