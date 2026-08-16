# Feladat-hierarchia – 1. osztály

Ez a dokumentum azt írja le, hogyan épülnek egymásra a Matekidő feladatai
az 1. osztályban: mi mi alatt van a menüben, és miért.

## 1. A teljes hierarchia

```
Évfolyam (1. osztály)
└── Kategória (pl. 🔢 Számok)
    └── Készség / skill (pl. neighbours)
        └── Lecke (pl. Számok bontása 10-ig)
            └── Lépések (steps):
                scene → gyakorlatok (generált) → celebration
```

- **Évfolyam** – a `gradeConfig` szerint. Egy lecke több évfolyamhoz is
  tartozhat (`grades: [1]`, `grades: [1,2]`).
- **Kategória** – a `src/data/skills.js` `CATEGORIES` objektuma határozza meg
  a menü szakaszait és azok sorrendjét.
- **Készség (skill)** – mi történik a fejben közben (a valódi tudáselem).
  A statisztika ezt méri (`skillStats`).
- **Lecke** – egy konkrét feladat a `data/lessons/index.json`-ben,
  metaadatokkal (difficulty, type, range, mission, worldTitles).
- **Lépés (step)** – a lecke fájljának `steps` listája: történet-bekötő
  (`scene`), gyakorlatok (generátorral előállított, `exercise` típusú lépések),
  záró `celebration`. A `LessonBuilder` a nyers `exercise` lépéseket generált
  feladatokká bontja.

A **világok** (Postás, Verseny, Szakács, Foci, Állatkert, Űr) NEM tartalmi
szintjei a hierarchiának, hanem tematikus "bőrök" – lásd a 6. pontot.

## 2. Az 1. osztály menüje kategóriánként

A menü szakaszainak sorrendje a `CATEGORIES` kulcsai szerinti, a leckék sorrendje
a `index.json`-ben megadott sorrend (ez egyben a pedagógiai sorrend is).

### 🔢 Számok
1. **Számok bontása 10-ig** (decomposition-01) – alap, 10-ig
2. **Keresd a kakukktojást!** (decomposition-find-wrong-01) – alap, 10-ig
3. **Kiegészítés 10-ig** (missing-number-01) – alap, 10-ig
4. **Tízesátlépés 20-ig** (bridge-ten-01) – gyakorló (2), 20-ig
5. **Helyiérték 100-ig** (place-value-01) – alap, 100-ig
6. **Helyiérték – tízes és egyes 100-ig** (place-value-02) – alap, 100-ig
7. **Kiegészítés véletlen számig 20-ig** (missing-number-02) – alap, 20-ig
8. **Mi a következő? 50-ig** (sequence-01) – alap, 50-ig
9. **Rendezzük sorainkat! 20-ig** (order-01) – alap, 20-ig
10. **Páros és páratlan 20-ig** (even-odd-01) – alap, 20-ig
11. **Sorminta – mi a következő?** (pattern-01) – alap, 20-ig
12. **Számok szomszédai 100-ig** (neighbor-01) – alap, 100-ig (1–2. osztály)
13. **Összehasonlítás 10-ig** (comparison-01) – alap, 10-ig
14. **Összehasonlítás 20-ig** (comparison-02) – alap, 20-ig (1–2. osztály)

### ➕ Összeadás-Kivonás
1. **Összeadás 20-ig** (addition-01) – alap, 20-ig
2. **Összeadás 20-ig átlépéssel** (addition-02) – gyakorló (2), 20-ig
3. **Kivonás 20-ig** (subtraction-01) – alap, 20-ig
4. **Vegyes műveletek 20-ig** (mixed-01) – gyakorló (2), 20-ig

### 📐 Geometria
1. **Kerek, szögletes és háromszög** (shape-sort-01) – alap
2. **Térbeli tájékozódás** (spatial-01) – alap

### 🧮 Gyakorlati matek
1. **Fizesd ki pontosan!** (money-pay-01) – alap
2. **Melyik pénztárcában van több?** (money-compare-01) – alap
3. **Meg tudod venni?** (money-enough-01) – alap
4. **Melyik hosszabb?** (measure-compare-01) – alap
5. **Mérd meg négyzetekkel!** (measure-squares-01) – alap
6. **Idő – egész és fél óra** (time-01) – alap

### 📝 Szöveges feladatok
1. **Szöveges feladatok** (word-problems-01) – alap, 20-ig

(Megjegyzés: a `index.json`-ban a geometria két lecke a Számok blokk közepén
van, de a menü kategóriákba rendezve jeleníti meg őket, így a Geometria szakasz
ott jelenik meg, ahol a `CATEGORIES` sorrend diktálja.)

## 3. Miért mi alatt van – a tanulási logika

A sorrend nem véletlen: minden blokk épít az előző tudására. Ez a magyar
alsós tanterv számfogalom-építését követi (bővülő számkörök: 10-ig, majd 20-ig).

### 3.1 Számfogalom (a Számok kategória első fele)

1. **Bontás 10-ig** – a számok szerkezetének alapja: `7 = 3 + 4`. Ez minden
   későbbi stratégia (tízesátlépés, kivonás, hiányzó tag) építőköve.
2. **Kakukktojás** – ugyanaz a készség (neighbours), fordított irányból:
   a helyes bontást felismerni és a hibásat kiszűrni. Azért jön közvetlenül
   a bontás után, mert a felismerés erősíti a megértést.
3. **Kiegészítés 10-ig** – a bontás alkalmazása: `3 + ? = 10`. Ez a
   "mennyi hiányzik a tízeshez" gondolkodás, ami a kivonás és a tízesátlépés
   előkészítője.
4. **Tízesátlépés 20-ig** – `8 + 5 = 8 + 2 + 3`. CSAK a 10-es bontás után
   értelmes, ezért nehézsége 2 (gyakorló), és azért került a Számok
   kategóriába, mert lényegében szám-szerkezeti (bontási) tudást használ
   (készsége mégis `addition`).
5. **Helyiérték 100-ig** – tízesek és egyesek. A kétjegyű számok olvasásához,
   írásához kell; innen lesz bővíthető a számkör.
6. **Kiegészítés véletlen számig 20-ig** – a 3. pont kiterjesztése nagyobb
   számkörre, miután a helyiérték már ismert.

### 3.2 Számok tulajdonságai (a Számok kategória második fele)

1. **Számsor 50-ig** – a sorozat-logika (sorrend, rákövetkező szám).
2. **Rendezés 20-ig** – növekvő/csökkenő sorrend gyakorlása.
3. **Páros-páratlan 20-ig** – számparitás, oszthatóság-előkép.
4. **Sorminta** – a mintafelismerés, ami a sorozatok és később az algebrai
   gondolkodás alapja.
5. **Szomszédok 100-ig** – `n-1`, `n+1`, és tízes szomszédok; a számegyenes
   használatának gyakorlása.
6. **Összehasonlítás** – előbb 10-ig, majd 20-ig; a `<`, `>`, `=` relációk.
   Azért a blokk végén, mert már két szám ismeretére épít.

### 3.3 Műveletek (Összeadás-Kivonás)

A műveletek azért követik a számfogalmi blokkot, mert összeadáshoz/kivonáshoz
előbb érteni kell a számok szerkezetét.

1. **Összeadás 20-ig** – átlépés nélkül (a tízes kereteken belül).
2. **Összeadás átlépéssel** – a tízesátlépés-lecke (bridge-ten) alkalmazása
   szabad összeadásban, ezért nehézsége 2.
3. **Kivonás 20-ig** – az összeadás inverze; a tanításban hagyományosan az
   összeadás után jön.
4. **Vegyes műveletek 20-ig** – egyszerre összeadás és kivonás, ezért
   nehézsége 2: mindkettőt be kell tudni.

### 3.4 Alkalmazási területek (Gyakorlati matek, Geometria)

Ezek a való világbeli kontextusok, amelyek a szám- és műveleti tudást
használják. Az Idő, Pénz és Mérés egy közös **Gyakorlati matek** kategóriába
van összevonva a menüben (a skill-statisztikák ettől függetlenül külön maradnak):

- **Idő** – egész és fél óra leolvasása.
- **Pénz** – érmékkel pontosan fizetni, összehasonlítani, eldönteni,
  hogy elég-e a pénz.
- **Mérés** – hosszúság összehasonlítása, majd egység-négyzetekkel mérés
  (a mértékegység-eszme bevezetése).
- **Geometria** – alakzatválogatás és térbeli tájékozódás.

### 3.5 Szöveges feladatok (lezárás)

A szöveges feladatok a kategóriák végén a "nagy összefoglaló": a gyerek a
tanult műveleteket szövegben felismert helyzetre alkalmazza. Ehhez az összes
előző tudás kell, ezért a hierarchia csúcsán áll, jellemzően 20-as számkörben.

## 4. Nehézségi szintek és számkörök

- **Difficulty:** `1` = alap, `2` = gyakorló, `3` = haladó, `4` = mester
  (1. osztályban a leckék 1–2-esek).
- **Számkör (range):** a bővülő számköröket jelzi – `10`, `20`, `50`, `100`.
  Egy készség leckéi a nagyobb számkör felé haladnak (pl. kiegészítés 10-ig →
  20-ig; összehasonlítás 10-ig → 20-ig).

## 5. Egy lecke lépései belül

Minden lecke ugyanazt a sablont követi:

1. `scene` – a történet és a feladat bemutatása (világonként eltérő szöveg).
2. N darab gyakorlat-lépés – generátorral létrehozott feladatok
   (pl. 5 összeadás). A `LessonBuilder` minden `exercise` lépésből
   `count` darab feladatot készít.
3. `celebration` – záróoldal: pontozás, csillagok, mérföldkő, napi küldetés.

A készség-statisztika a lecke `skill` mezője alapján rögzül, a lecke-statisztika
pedig a fájl alapján – így ugyanaz a készség több leckén át mérhető.

## 6. Világok – tematikus bőr, nem tartalmi szint

A hat világ (📮 Postás, 🏎️ Verseny, 👨🍳 Szakács, ⚽ Foci, 🦁 Állatkert,
🤖 Űr) nem a feladatok szintje: minden lecke ugyanazt a matematikát adja,
csak más szöveggel és ikonokkal (`worldTitles`). A világokat csillagokkal
lehet megnyitni (`requiredStars`), a `setActiveWorld` pedig csak azt mondja meg,
melyik tematikával jelenjen meg a menü és a leckék.

## 7. Hivatkozott források

- Lecke-regiszter: `src/data/lessons/index.json`
- Kategóriák és készségek: `src/data/skills.js`
- Lecke-fájlok: `src/data/lessons/grade1/*.json`
- Menü-rendezés: `src/components/lessonMenu.js`
- Lépés-futtatás: `src/engine/Game.js`, generálás: `src/builders/LessonBuilder.js`
- Világok: `src/world/WorldRegistry.js`
- Csillag/fejlesztés: `src/profile/RewardService.js`, `src/profile/Profile.js`
