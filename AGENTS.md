# AGENTS.md

Interaktív matematikai tanulási platform magyar gyerekeknek (első osztálytól akár nyolcadik osztályig).

## Parancsok

- Nincs build lépés, nincs csomagkezelő, nincs lint/test keretrendszer.
- `make start` – Python http szerver a `src/`-ből (localhost:8000).
- `node src/testGenerator.js` – generatorok manuális tesztelése (ESM-et használ, node-dal futtatható).
- `node src/generateSWCache.js` – az offline precache-lista (`src/sw-cache.js`) újragenerálása; új/eltűnt fájlnál (pl. új lecke) mindig futtatni kell.
- Minden commit után manuálisan ellenőrizni kell a böngészőben (hibakereséshez nincs automatizált teszt).

## Web gyökér: `src/`

- A webalkalmazás gyökere a `src/` mappa: a böngészőben elérhető MINDEN fájl (HTML, CSS, JS, adatok, `assets/`, `manifest.webmanifest`, `sw.js`) a `src/` alatt van.
- Ha nem a `src/` a web gyökér (pl. GitHub Pages / Netlify esetén nem a `src/` a public mappa), akkor a látogatók nem érik el az oldalt és a PWA-fájlokat.
- A deploy tehát mindig a `src/` mappát szolgálja ki gyökérként. Ezen belül abszolút utak is használhatók (`/manifest.webmanifest`, `/assets/...`).
- `make start` ennek megfelelően már a `src/`-ből szolgál ki.

## Szerkezet

- `src/index.html` – az egyetlen HTML, minden CSS/JS verzióparaméterrel hivatkozott (`?v=9`).
- `src/app.js` – belépési pont, navigáció (welcome → menü → lecke → profil/statisztika).
- `src/data/lessons/index.json` – lecke-regiszter (47 lecke). Metaadatok: `id`, `title`, `grades`, `category`, `skill`, `difficulty`, `type`, `range`, `mission`, `subtitle`, `file`, `worldTitles`.
- `src/data/lessons/gradeN/*.json` – lecke-fájlok. `steps` listából állnak (`type: "scene"`, `"exercise"`, …), `worldTitles` a világok szerinti szövegek.
- `src/engine/` – `Game.js` (lecke futtatás), `LessonLoader.js` (JSON betöltés), `Renderer.js`.
- `src/builders/LessonBuilder.js` – nyers leckéből futtatható lecke.
- `src/generators/` – feladatgenerátorok (`XxxGenerator.js`), `index.js`-ben gyűjtve.
- `src/components/` – a feladattípusok renderelői (egy fájl = egy feladat), `ui/` és `hints/` kisebb építőelemek.
- `src/math/` – számolási segédek (`addition.js`, `subtraction.js`, `number.js`).
- `src/world/` – világok (`World.js`, `WorldRegistry.js`).
- `src/profile/` – játékosprofilok, statisztika, eredmények.
- `src/assets/` – ikonok (PWA), képek, (üres) hangok.
- `src/manifest.webmanifest`, `src/sw.js` – PWA fájlok a `src/` gyökerében.

## Konvenciók

- Tiszta ES modulok, nincs build. Import: `.js` kiterjesztéssel, helyenként `?v=N` verzióparaméterrel (pl. `Game.js`-ben a komponensek). Új komponens importjánál a meglévő `?v=` értékekhez igazodj.
- 4 szóköz behúzás, egyszeres idézőjelek, pontosvessző, camelCase.
- NE írj kommentet a kódba.
- UI szövegek magyarul. A küldetések/missziók emoji-kat használnak.
- Egy komponens = egy feladat. Egy commit = egy jól körülhatárolható változás.
- Fejlesztési elvek: a gyereket sosem büntetjük; segítséget csak kérésre adunk; a történet fontosabb, mint a pontszám; a sprint végén mindig működő állapot.

## Adatmentés

- `localStorage`:
  - `matekido-users` – játékosprofilok (a `UserManager.js` kezeli).
  - `matekido-profile` – régi/legacy kulcs, a migráció során törlődik.
  - `matekido-lesson-filters`, `matekido-lesson-filters-open` – szűrők a menüben.

## PWA

- `sw.js` és `manifest.webmanifest` a `src/` gyökerében – a web gyökér a `src/`, így a `/sw.js` scope a `/`-t, a `/assets/...`-t és az egész appot lefedi.
- A service worker network-first: online mindig friss tartalom, offline cache. Az install során az EGÉSZ appot precache-eli a generált `sw-cache.js` lista alapján, így offline rögtön az összes lecke elérhető.
- Új/eltűnt fájl (pl. új lecke) után futtatni kell a `node src/generateSWCache.js`-t. Nincs automatizált verzió-bump – nagy fájlstruktúra-változásnál a `sw.js` tetején lévő `CACHE` (`matekido-v2`) értékét növeld.
- Ha a `src/index.html`-ben `?v=` paramétert emelsz, a SW online módban automatikusan az új fájlt adja.
- Ikonok: `src/assets/icons/` (`icon-*`, `maskable-*`, `apple-touch-icon.png`, SVG források).
- Telepíthetőséghez HTTPS kell (localhoston a `make start` is jó). Deploy: nincs konfigurálva, pl. GitHub Pages / Netlify.
