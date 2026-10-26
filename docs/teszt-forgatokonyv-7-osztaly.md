# Matekidő – 7. osztály manuális tesztforgatókönyv

Ennek a dokumentumnak a célja, hogy a **7. osztályos tananyagot** (41 lecke: 36 tervezett + mester kihívás + 2 kiegészítő lecke + 2 egyperces, 7 világ, számkör 1000-ig, racionális számok, algebra, egyenletek, geometria) a böngészőben kézzel végigteszteljük: minden lecke helyesen épül fel, a feladatok a megjelölt tartományban és formában jelennek meg, a jó/rossz válasz kezelése helyes, és a lecke a celebrációval zárul.

- **Szerver:** `make start` (localhost:8000) – a `src/` mappát szolgálja ki.
- **Böngésző:** Asztali (Chrome / Firefox / Edge) + legalább egyszer telefon méretű nézet.
- **Jelölések:** ✅ működik · ❌ hibás · ⚠️ kisebb hiba / megjegyzés · ➖ nem érinti / átugorható.

---

## 0. Előkészítés

1. Indítsd el a szervert: `make start`, nyisd meg: <http://localhost:8000>.
2. DevTools → Application → Local Storage: töröld a `matekido-users` és `matekido-profile` kulcsokat (vagy tesztelj inkognitóban).
3. Hozz létre egy tesztjátékost (pl. „Teszt 7”), és az osztályválasztóban válaszd a **7. osztályt**. A 7. osztály nincs zárolva, bármikor kiválasztható.
4. A menüben a `🎓 Évfolyam` gombbal ellenőrizd, hogy a 7. osztályos leckék látszanak, és a fejléc a 7. osztályt mutatja.

---

## 1. Általános lecke-folyamat (minden leckére érvényes)

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 1.1 | Menüben válaszd ki a leckét | Scene (jelenet) szöveggel indul, világfüggő címmel és emojival | |
| 1.2 | Kattints a „Kezdés” gombra | Megjelenik az első feladat a progress-sávval | |
| 1.3 | Figyeld a blokkokat | A lecke 2–7 blokkból áll, a blokkokon belül nehezedő sorrendben (a legtöbb lecke 3–5 blokk) | |
| 1.4 | Nézd meg a számokat és műveleteket | A számok a lecke saját tartományán belül vannak (leggyakrabban max. 1000, a hatványos egyperces 10 000); negatív szám `−` jellel, tört emeletes formában, tizedes tört **magyar tizedesvesszővel** (pl. `0,5`) jelenik meg | |
| 1.5 | Válaszolj helyesen néhány feladatra | Pozitív visszajelzés, a számláló nő | |
| 1.6 | Válaszolj helytelenül valahol | Nincs büntetés, a feladat újrapróbálható; a lecke nem lép tovább | |
| 1.7 | Nézd meg a súgót | Két hiba után megjelenik a „💡 Segítséget kérek” gomb, a súgó csak kattintásra nyílik ki | |
| 1.8 | Számbeviteles feladatnál nyomd meg az Entert | Az „Ellenőrzöm” gomb helyett az Enter is ellenőriz, a fókusz a beviteli mezőn marad | |
| 1.9 | Fejezd be a leckét | Celebráció jelenik meg, a profil statisztikái frissülnek | |
| 1.10 | Indítsd újra ugyanazt a leckét | Más feladatok jönnek (véletlenszerű generálás) | |
| 1.11 | Kilépés gomb (📚 jobb felső) | Megerősítő párbeszéd, „Mégse” visszavisz a leckébe | |

---

## 2. Lecke-ellenőrző táblázatok

### 2.1 Racionális számok

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.1.1 | 🔢 Racionális számok értelmezése | `rational` / 100 (parts, sign, opposite, absolute, forms) | Számláló/nevező kérdés, ellentett, abszolút érték, tört–tizedes–vegyes alak átváltása; minden válasz választógomb, nincs beírás | |
| 2.1.2 | ⚖️ Racionális számok összehasonlítása | `rational` / 100 (compare) | 10 feladat `< = >` jelekkel; negatív számnál a 0-tól távolabbi a kisebb (pl. `−3/4 < −1/2`) | |
| 2.1.3 | ➕ Racionális számok összeadása és kivonása | `rational` / 100 (add, sub; same/diff/mixed) | Közös nevező, egyszerűsítés, áltört → vegyes szám; negatív tagok is jönnek | |
| 2.1.4 | ✖️ Racionális számok szorzása és osztása | `rational` / 100 (mul, div; basic/sign/mixed) | Osztásnál a reciprokkal szorzunk; előjelszabályok: (+)·(−) = −, (−)·(−) = +; az eredmény egyszerűsítve | |
| 2.1.5 | 🧮 Racionális számok vegyes műveletei | `rational` / 100 (order, paren, mixops) | Műveleti sorrend: zárójel → szorzás/osztás → összeadás/kivonás, balról jobbra; a zárójel tényleg megváltoztatja az eredményt | |

### 2.2 Algebrai kifejezések

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.2.1 | 🧮 Algebrai kifejezések alapjai | `algebra` / 100 (substitute; one/two) | Helyettesítési érték egy és két változóval; negatív behelyettesítésnél a zárójel és az előjel helyes (pl. `x = −2`, `3x + 5 = −1`) | |
| 2.2.2 | 🧮 Hasonló tagok összevonása | `algebra` / 100 (combine; one/two) | Csak az azonos változójú tagok vonhatók össze; a konstans külön marad (pl. `3x + 2y − x + 4y = 2x + 6y`) | |
| 2.2.3 | 🧮 Zárójel felbontása és összevonás | `algebra` / 100 (parenthesis; one/two) | A zárójel előtti mínusz **minden** tag előjelét megfordítja; utána összevonás | |
| 2.2.4 | 🧮 Egytag szorzása többtaggal | `algebra` / 100 (distribute; one/two) | Disztributivitás: a szorzót minden taggal megszorozzuk (pl. `3(2x − 4) = 6x − 12`) | |
| 2.2.5 | 🧮 Kiemelés | `algebra` / 100 (factor; one/two) | Közös tényező kiemelése után a zárójelben maradó tagok helyesek; visszaszorzással ellenőrizhető (pl. `6x + 9 = 3(2x + 3)`) | |

### 2.3 Egyenletek, egyenlőtlenségek, arányosság

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.3.1 | 🟰 Elsőfokú egyenletek | `equation` / 1000 (both-sides, paren, fraction-add, fraction-div) | Számbevitel; az ismeretlen átrendezése, zárójel felbontása, törtes egyenlet mindkét oldal szorzása; az `x` egész szám | |
| 2.3.2 | 🟰 Szöveges feladatok egyenlettel | `word-problem` / 1000 (equation) | A szövegből felírt egyenlet és a kérdés összhangja; választógombos válasz, a helyes érték a szövegbe visszahelyettesítve is stimmel | |
| 2.3.3 | 🚦 Elsőfokú egyenlőtlenségek | `inequality` / 1000 (solve, linear, linear-line) | Megoldáshalmaz szövegesen és számegyenesen; negatív együtthatónál **fordul a reláció**; nyílt végpont `< >`, zárt `≤ ≥` | |
| 2.3.4 | 📐 Arányosság | `word-problem` / 1000 (direct/inverse proportion; choice/input) | Egyenes arány: mindkettő ugyanannyiszorosára nő; fordított arány: az egyik nő, a másik csökken (pl. több munkás → kevesebb nap) | |
| 2.3.5 | 🧮 Egyenletek és egyenlőtlenségek vegyesen | `equation` + `inequality` / 1000 | Egy leckében váltakozik a két típus; a megoldás után a visszaellenőrzés is helyes | |

### 2.4 Koordináta-rendszer és függvények

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.4.1 | 📍 Koordináta-rendszer | `coordinate` / 100 (read/locate) | 6 leolvasás + 6 pont elhelyezése; a pont és a koordináta-pár sorrendje `(x; y)`; **csak az első síknegyed, 0–9 közötti értékek** jelennek meg | |
| 2.4.2 | 📈 Táblázat és grafikon kapcsolata | `function` / 100 (plot) | Értéktáblázat pontjait kell a grafikonon bejelölni; a pontok száma és helye a táblázattal egyezik, az „Ellenőrzöm” csak az összes pont után fogadja el | |
| 2.4.3 | 📈 Lineáris függvények felismerése | `function` / 100 (extend/rule) | Hiányzó `y` kiszámítása és a lépésköz felismerése; negatív meredekségnél a függvény csökken, a táblázat és a szöveg ezt tükrözi | |
| 2.4.4 | 📈 Függvények a mindennapban | `function` / 100 (read) | Grafikon leolvasása a világ történetében (pl. óra → levél); a kérdés egysége és a válasz nagysága illik egymáshoz | |

### 2.5 Geometria – háromszögek, négyszögek

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.5.1 | 📐 Háromszögek szerkeszthetősége | `triangle` / 100 (inequality, max-side, min-side) | Háromszög-egyenlőtlenség: a két kisebb oldal összege nagyobb a harmadiknál; max. harmadik oldal `a + b − 1`, min. a két oldal különbségének abszolút értéke + 1 | |
| 2.5.2 | 📐 A Pitagorasz-tétel | `pythagorean` / – (hypotenuse, leg, check, mixed) | Átfogó és befogó számítása, derékszögűség ellenőrzése; pitagoraszi számhármasok, egész válaszok; a derékszög jelölése a rajzon | |
| 2.5.3 | 🔷 A négyszögek családfája | `polygon` / – (inclusion, which, property, mixed-all) | Részhalmaz-viszonyok: minden négyzet téglalap, rombusz és paralelogramma is; a trapéz és deltoid nem paralelogramma | |
| 2.5.4 | 🔷 Sokszögek területe | `shape-area` / 1000 (triangle, parallelogram, trapezoid, rhombus, polygon-mixed) | Képletek: `a × m ÷ 2`, `a × m`, `(a + c) × m ÷ 2`, `e × f ÷ 2`; a magasság nem tévesztendő össze az oldallal | |
| 2.5.5 | 🔷 Kerület és terület vegyesen | `shape-area` + `compound-shape` / 1000 | A kérdés váltakozik kerület és terület között; összetett alakzatnál a **belső illesztési varratok nem számítanak a kerületbe** | |

### 2.6 Geometria – kör, hasonlóság, transzformációk

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.6.1 | ⭕ A kör kerülete és területe | `circle` / 1000 (convert, circumference, area, measure-mixed) | Sugár ↔ átmérő, `K = 2rπ`, `T = r²π`; a válasz **π-vel** jelenik meg (pl. `10π cm`), nem 3,14-gyel kerekítve | |
| 2.6.2 | 🥧 Körív és körcikk | `circle` / 100 (sector-arc, sector-area, sector) | Középponti szög aránya a teljes 360°-hoz; 90° a negyed, 180° a fél kör; a mértékegység `cm`, illetve `cm²` | |
| 2.6.3 | 🔺 Hasonlóság alapjai | `similarity` / 100 (missing-side, missing-side-small, scale-factor, area-ratio) | Megfelelő oldalak aránya; a terület a hasonlósági arány **négyzetével** változik (pl. kétszeres nagyítás → négyszeres terület) | |
| 2.6.4 | 🔺 Hasonló háromszögek alkalmazása | `similarity` / 1000 (application) | Térkép–valóság átváltás mindkét irányban; `1 m = 100 cm`; a méretarány és a válasz mértékegysége stimmel | |
| 2.6.5 | 🔄 Transzformációk rendszerezése | `transform` + `mirror` / – | Eltolás, forgatás, tükrözés; a kiválasztott alakzat tájolása és a tengely helye helyes, a tükrözés nem forgatás | |

### 2.7 Statisztika, valószínűség, szöveges feladatok

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.7.1 | 📊 Adatok, diagramok | `data-chart` / 100 (bar/pie; top, least, compare, diff, sum, sum2, count, percent) | Oszlop- és kördiagram; a kördiagram összege 100%, a kért százalék a megfelelő szelethez tartozik; a kérdés fajtája (összeg, különbség, legtöbb/legkevesebb) illik a válaszhoz | |
| 2.7.2 | 📈 Átlag, medián, módusz | `average` / 1000 (avg, median, mode; table/chart; input/choice) | Átlag = összeg ÷ darabszám; medián előtt **sorba kell rendezni**; módusz a leggyakoribb érték; az átlag és a diagramos medián beírásos, a táblázatos medián/módusz választós | |
| 2.7.3 | 🎲 Valószínűség gyakorlása | `probability` / 100 (compare, chance) | Kedvező esetek ÷ összes eset; egyenlő esély kezelése; a válasz tört alakban (pl. 3 piros, 2 kék → `3/5`); a kérdés szövege nyelvtanilag helyes | |
| 2.7.4 | 📝 Vegyes szöveges feladatok | `word-problem` / 1000 (two-step, remainder, ratio-split, proportion, direct-proportion) | Többlépéses feladatok, maradékos osztás, arányos felosztás és arányosság; a szöveg, a számok és a mértékegység összhangja; néhol beírás, néhol választógomb | |

### 2.8 Összefoglalás, gyakorlás

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.8.1 | 🧮 Algebra összefoglaló | `algebra` + `equation` / 1000 | Algebrai kifejezés és egyenlet egy leckében; a kétféle feladattípus jól elkülönül, a válaszformák helyesek | |
| 2.8.2 | 📐 Geometria összefoglaló | `triangle` + `shape-area` + `pythagorean` + `circle` + `similarity` / 1000 | Öt geometriai témakör egymás után; minden blokk a saját képletét és rajzát használja | |
| 2.8.3 | 🎲 7. osztályos vegyes gyakorló | `rational` + `equation` + `function` + `word-problem` + `shape-area` + `data-chart` + `probability` / 1000 | A leghosszabb lecke (7 blokk, 18 feladat); a témák váltakoznak, a nehézség nem esik vissza a blokkok között | |

### 2.9 Mester kihívás és kiegészítő leckék

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.9.1 | 🌟 Mester kihívás | `master` / 1000 (word, logic; grade 7) | 3 szöveges + 3 logikai feladat; kézfogás, zoknis logika, arányos osztás, munka–idő, sebesség; a mester kihívás **nem számít bele az osztály haladásába** | |
| 2.9.2 | 🔗 Arány és aránypár (kiegészítő) | `ratio` / 100 (write, simplify, missing) | Arány felírása, egyszerűsítés a legkisebb tagokra, hiányzó tag; a `:` jel és a tagok sorrendje helyes | |
| 2.9.3 | 💯 Százalékos növekedés és csökkenés (kiegészítő) | `percent` / 1000 (cases, change) | Százalékérték, százalékláb, alap, majd növekedés/csökkenés; a változás mértéke és az új érték is kiszámolható (pl. 200 + 15% = 230) | |

### 2.10 Egypercesek

| # | Játék | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.10.1 | 🎲 Egész számok (egyperces) | `integer-play` / 100 | 60 másodperc, könnyű és kőkemény szint; összeadás, kivonás, szorzás, osztás negatív számokkal; rossz válasznál megmutatja a helyeset, és ugyanaz a feladattípus nagyobb eséllyel jön újra | |
| 2.10.2 | 🎲 Hatványok (egyperces) | `power-play` / 10000 | Négyzet, köb, 10 hatványai, negatív alap, vegyes kitevő; a kitevő megjelenítése és az előjel helyes; saját rekord mentése | |

---

## 3. Világok és készségtérkép

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 3.1 | Válts világot a profilból | A leckék jelenetei az adott világ címét/emojiját mutatják | |
| 3.2 | Válassz ki egy leckét több különböző világban | A `worldTitles`-ek megjelennek, a feladat tartalma ugyanaz marad | |
| 3.3 | Válassz ki egy szöveges feladatot 3 világban | A feladat szövege világváltáskor is a világhoz igazodik (postás ≠ konyha) | |
| 3.4 | 📚 Készségek oldal | A 7. osztályos leckék a megfelelő készséghez tartoznak (racionális, algebra, egyenlet, geometria, statisztika, valószínűség) | |
| 3.5 | Szűrők | A 7. osztályos nézetben 38 normál lecke, 1 mester kihívás és 2 egyperces érhető el; a szűrők a normál leckéket szűrik, és a 7. osztályra szűrve is helyes találatszámot adnak | |

---

## 4. Weboldal- és telefonellenőrzés

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 4.1 | Ikon a fülön / PWA | Kék háttér, piros M betű gombszürke körvonallal | |
| 4.2 | Telefonméret (DevTools 375px) | A ☕ „Támogatás” link NEM jelenik meg, a jobb felső gombok (súgó, 📚) koppinthatók | |
| 4.3 | Hosszú algebrai kifejezés és tört | Nem csúszik ki a képernyőről, a tört számlálója/nevezője olvasható, a válaszgombok több sorba tördelhetők | |
| 4.4 | Koordináta-rács és függvénygrafikon mobilon | A rácspontok koppinthatók, a tengelyfeliratok nem lógnak ki, a pontok kijelölése látszik | |
| 4.5 | Számegyeneses egyenlőtlenség | A négy válaszlehetőség nem csúszik szét, a nyílt/zárt végpont megkülönböztethető | |
| 4.6 | Számbeviteles feladatok | Mobilon is numerikus billentyűzet jön fel, az Enter/„Ellenőrzöm” működik | |
| 4.7 | Asztali nézet | A ☕ „Támogatás” link a jobb felső sarokban látható | |
| 4.8 | Hard reload / offline | Nincs konzolhiba; az app cache-ből is betölt (723 fájl, `matekido-v206`) | |

---

## 5. Ismert nyitott kérdések

| # | Kérdés | Megjegyzés |
|---|--------|------------|
| 5.1 | Koordináta-rendszer síknegyedek | A generátor jelenleg csak az első síknegyedet használja (0–9), negatív koordináták nincsenek. Ellenőrizd, hogy a tanmenet szerint ez elég-e a 7. osztályban |
| 5.2 | Valószínűség kérdésszövege | Zacskós húzásnál a kérdés így jelenhet meg: „Mekkora a valószínűsége, hogy pirosat golyót húzunk…?” – a szöveg nyelvtanilag hibás, javítandó |
| 5.3 | Hatványok megjelenítése az egypercesben | A játékban a kitevő `^` jellel látszik (pl. `7^2`), miközben a leckékben felső index van; ellenőrizd, hogy ez a kívánt formátum-e |
| 5.4 | Racionális számok válaszformája | A racionális leckék minden válasza választógomb, nincs törtbeírás; erősítsd meg, hogy ez a 7. osztályban tervezett viselkedés |

---

## 6. Visszajelzés sablon

- **Lecke / lépés:** (pl. 2.3.3 – Elsőfokú egyenlőtlenségek)
- **Elvárt:** …
- **Tapasztalt:** …
- **Képernyőkép / konzolhiba:** …
