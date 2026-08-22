# Leckeszűrők – Feladat vs. Készség vs. Típus

A menü szűrőpanele (`src/components/lessonMenu.js`) három különböző metaadat-rétegen szűr. Mindhárom a leckékhez tartozó mező (`src/data/lessons/index.json`), de más-más célt szolgál:

## 1. Feladat = kategória (`category`)

A legdurvább csoportosítás – ez adja a menü szekciócímeit is. Meghatározása: `src/data/skills.js` → `CATEGORIES`.

| Kulcs | Megjelenő név | Ikon |
|---|---|---|
| `numbers` | Számok | 🔢 |
| `operations` | Összeadás-Kivonás | ➕ |
| `multiplication` | Szorzás & Osztás | ✖️ |
| `practical` | Gyakorlati matek | 🧮 |
| `geometry` | Geometria | 📐 |
| `wordProblems` | Szöveges feladatok | 📝 |

## 2. Készség = tananyagi készség (`skill`)

Finomabb, tantervi bontás: egy kategórián belül több készség van (pl. Geometria → Alakzatok, Alakzatok összehasonlítása, Térbeli alakzatok). Definíció: `src/data/skills.js` → `SKILLS` + a kategória `skills` listája.

Ez a réteg jelenik meg:

- az összesítő fül „Készségek" szekciójában (`statsPage.js`),
- a „Gyakorolandó leckék" oldalon (`practicePage.js` – a 90% alatti készségek leckéi),
- és rögzítésre kerül a profilban (`recordSkillResult`, kulcs = a lecke `skill` mezője).

Fontos: minden leckében használt `skill` azonosítónak benne kell lennie a `SKILLS` regiszterben, különben a statisztika nem írja ki magyarul / egyáltalán nem jelenik meg.

## 3. Típus = feladatmechanika (`type`)

Technikai jellegű: melyik komponens/generátor futtatja a feladatokat (`estimate`, `shape-sort`, `table`, `missing-operand`, `shape-compare` stb.). Egy típushoz tartozik:

- a renderer (`Game.js` → `RENDERERS` registry),
- a generátor (`generators/index.js` → case),
- a napi statisztika bontása („Feladatok bontásban" – `statsPage.js` → `TYPE_LABEL` / `TYPE_EMOJI`),
- a menü emoji-badge (`lessonMenu.js` → `TYPE_EMOJI`).

Új típust mindhárom térképbe regisztrálni kell, plusz a `COUNTED_TYPES`-ba a `Game.js`-ben.

## Példa a három rétegre

A szorzás gyakorlásánál:

| Réteg | Érték |
|---|---|
| Feladat (kategória) | Szorzás & Osztás |
| Készség (skill) | multiplication |
| Típus (type) | a leckétől függ: `equal-groups` / `repeated-addition` / `skip-counting` / `table` / `missing-factor` / `link` |

Röviden: **kategória = hol mutatjuk, készség = mit tanul, típus = hogyan kérdezzük.**

## Kapcsolódó részletek

- A `Típus` szűrő csoportokat is tud: `TYPE_GROUPS` (pl. a Bontás gomb a `decomposition`, `decomposition-find-wrong` és `bridge-ten` típusokat fogja össze).
- A mentett szűrők visszamenőlegesen migrálódnak (`loadFilters`): a régi `time` / `money` / `measurement` kategóriák `practical`-ra, a `decomposition-find-wrong` típus `decomposition`-ra képződnek.
