# Matekidő – 8. osztály manuális tesztforgatókönyv

Ennek a dokumentumnak a célja, hogy a **8. osztályos tananyagot** (39 lecke: 36 normál + mester kihívás + 2 egyperces, 7 világ, számkör 1000-ig, halmazok, számelmélet, hatvány és gyök, algebra, geometria, térgeometria, statisztika) a böngészőben kézzel végigteszteljük: minden lecke helyesen épül fel, a feladatok a megjelölt tartományban és formában jelennek meg, a jó/rossz válasz kezelése helyes, és a lecke a celebrációval zárul.

- **Szerver:** `make start` (localhost:8000) – a `src/` mappát szolgálja ki.
- **Böngésző:** Asztali (Chrome / Firefox / Edge) + legalább egyszer telefon méretű nézet.
- **Jelölések:** ✅ működik · ❌ hibás · ⚠️ kisebb hiba / megjegyzés · ➖ nem érinti / átugorható.

---

## 0. Előkészítés

1. Indítsd el a szervert: `make start`, nyisd meg: <http://localhost:8000>.
2. DevTools → Application → Local Storage: töröld a `matekido-users` és `matekido-profile` kulcsokat (vagy tesztelj inkognitóban).
3. Hozz létre egy tesztjátékost (pl. „Teszt 8”), és az osztályválasztóban válaszd a **8. osztályt**. A 8. osztály nincs zárolva, bármikor kiválasztható.
4. A menüben a `🎓 Évfolyam` gombbal ellenőrizd, hogy a 8. osztályos leckék látszanak, és a fejléc a 8. osztályt mutatja.

---

## 1. Általános lecke-folyamat (minden leckére érvényes)

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 1.1 | Menüben válaszd ki a leckét | Scene (jelenet) szöveggel indul, világfüggő címmel és emojival | |
| 1.2 | Kattints a „Kezdés” gombra | Megjelenik az első feladat a progress-sávval | |
| 1.3 | Figyeld a blokkokat | A lecke 3–10 blokkból áll, a blokkokon belül nehezedő sorrendben (a legtöbb lecke 3–6 blokk) | |
| 1.4 | Nézd meg a számokat és műveleteket | A számok a lecke saját tartományán belül vannak (max. 1000); negatív szám `−` jellel, tört emeletes formában, tizedes tört **magyar tizedesvesszővel** (pl. `0,5`) jelenik meg | |
| 1.5 | Válaszolj helyesen néhány feladatra | Pozitív visszajelzés, a számláló nő | |
| 1.6 | Válaszolj helytelenül valahol | Nincs büntetés, a feladat újrapróbálható; a lecke nem lép tovább | |
| 1.7 | Nézd meg a súgót | Két hiba után megjelenik a „💡 Segítséget kérek” gomb, a súgó csak kattintásra nyílik ki | |
| 1.8 | Számbeviteles feladatnál nyomd meg az Entert | Az „Ellenőrzöm” gomb helyett az Enter is ellenőriz, a fókusz a beviteli mezőn marad | |
| 1.9 | Fejezd be a leckét | Celebráció jelenik meg, a profil statisztikái frissülnek | |
| 1.10 | Indítsd újra ugyanazt a leckét | Más feladatok jönnek (véletlenszerű generálás) | |
| 1.11 | Kilépés gomb (📚 jobb felső) | Megerősítő párbeszéd, „Mégse” visszavisz a leckébe | |

---

## 2. Lecke-ellenőrző táblázatok

A sorok sorszáma **1–36, folytonos** – megegyezik a menüben és a lecke fejlécében látott „x/36” jelzéssel. A 🌟 Mester kihívás és a 🎲 Egypercesek „–” jelölésűek, mert a menüben nincs rájuk x/N jelzés. A szekciók csak csoportosítás, a sorszámok a tananyag (curriculum) sorrendjét követik.

### 2.1 Halmazok, számelmélet, hatvány, négyzetgyök

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 1 | 🗂 Halmazok és számhalmazok | `set-match` / 1000 (numbers) | 2 blokk, 8 feladat; ℕ/ℤ/ℚ halmazba illesztés; a ℚ-feladatnál a rossz opciók **π és √2** (nem 0,333…), a helyes válasz pontosan egy | |
| 2 | 🧮 Halmazműveletek | `set-ops` / 1000 | 5 feladat; metszet, unió, komplementer; a komplementernél az U alaphalmaz látszik; üres halmaz jele `{ }` | |
| 3 | 🧩 Prímszámok, prímtényezős felbontás | `prime` + `prime-factor` / 1000 | 3 blokk, 11 feladat; prím/összetett, prímfelbontás és hatványos alak (pl. `2³ · 113`); a kitevő felső indexben jelenik meg | |
| 4 | 🔢 LNKO és LKKT | `gcd-lcm` / 1000 | 3 blokk, 11 feladat; LNKO, LKKT, vegyes; a közös osztó és a többszörös fogalma ne keveredjen | |
| 5 | ⚡ Hatványozás | `power` / 1000 | 4 blokk, 15 feladat; négyzet, köb, hatványjelölés, alap keresése; kitevő max. 4, negatív kitevő nincs | |
| 6 | √ Négyzetgyök | `power` / 1000 (root) | 2 blokk, 12 feladat; négyzetszám, `√` jel, területből oldal; csak nemnegatív egész gyökök, irracionális gyök nincs | |

### 2.2 Logika, kombinatorika, gráfok

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 7 | 🧠 Igaz és hamis állítások | `logic` / 1000 | 6 állítás egy blokkban; „minden”, „van olyan”, következtetés, geometriai és számelméleti állítások; a hamis állítás indoklása a visszajelzésben | |
| 8 | 🕸️ Gráfok | `graph` / 1000 | 2 blokk, 9 feladat; kézfogás teljes gráfon, útvonal éleinek száma; az opciók között nincs ismétlődő szám | |
| 9 | 🎲 Kombinatorika | `combinatorics` / 100 | 4 blokk, 11 feladat; sorba rendezés (interaktív), permutáció, párosítás, szorzási elv; a `count`/`pair` feladatnál az indoklás is megjelenik | |

### 2.3 Algebra, egyenletek, arány, százalék

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 10 | 🧮 Algebrai kifejezések | `algebra` / 1000 | 4 blokk, 12 feladat; helyettesítés (negatív értékkel is), összevonás, zárójel, kiemelés; a zárójel előtti mínusz minden tag előjelét megfordítja | |
| 11 | 🟰 Elsőfokú egyenletek | `equation` / 1000 | 4 blokk, 12 feladat; mindkét oldalon ismeretlen, zárójel, törtes egyenlet; az `x` egész, a bevitel számbillentyűzetet nyit | |
| 12 | 🚦 Elsőfokú egyenlőtlenségek | `inequality` / 1000 | 4 blokk, 12 feladat; megoldáshalmaz szövegesen és számegyenesen; negatív együtthatónál **fordul a reláció**; nyílt `< >`, zárt `≤ ≥` végpont | |
| 13 | 🟰 Egyenlettel megoldható szöveges feladatok | `word-problem` / 1000 (equation) | 4 blokk, 12 feladat; két lépés: először az egyenlet kiválasztása, utána a megoldás beírása; a szöveg és az egyenlet ugyanazt jelenti | |
| 14 | 🔗 Arányosság és arányos osztás | `word-problem` / 1000 | 6 blokk, 12 feladat; arány felírása és egyszerűsítése, arányos felosztás (összesen/rész), egyenes és fordított arány; a `:` és a mértékegység helyes | |
| 15 | 💯 Százalékszámítás a gyakorlatban | `percent` + `word-problem` / 1000 | 4 blokk, 14 feladat; százalékérték, alap, százalékláb, növekedés/csökkenés; a 15% és a 15 százalékpont ne keveredjen | |

### 2.4 Függvények, grafikonok

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 16 | 📈 Megfeleltetések és grafikonok | `function` / 1000 | 4 blokk, 12 feladat; értéktáblázat pontjainak bejelölése, hiányzó `y`, lépésköz, grafikon leolvasása; a pontok száma egyezik a táblázattal | |
| 17 | 📈 Egyenes arányosság grafikonja | `function` / 1000 (throughOrigin) | 4 blokk, 12 feladat; `y = kx`, a grafikon átmegy az origón, a meredekség a lépésköz; pontbejelölésnél csak az összes pont után fogadja el | |
| 18 | 📈 Grafikonok jellemzése | `function` / 1000 (describe) | 4 blokk, 12 feladat; növekedés/csökkenés, legnagyobb `y`, `y`-tengelymetszet, leolvasás; a válasz a grafikonról ellenőrizhető | |

### 2.5 Síkbeli alakzatok

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 19 | 📐 A háromszög szögei | `triangle` / 180 | 4 blokk, 12 feladat; belső szögek összege, szögfajta, egyenlőszárú alapszög, külső szög; a harmadik szög 180°-ra egészít ki | |
| 20 | 🔷 Négyszögek rendszerezése | `polygon` | 4 blokk, 12 feladat; név, halmazba tartozás, tulajdonság, belső/külső szögek összege; a négyzet téglalap, rombusz és paralelogramma is, a trapéz nem az | |
| 21 | 🔷 Kerület és terület | `shape-area` + `compound-shape` / 1000 | 4 blokk, 12 feladat; háromszög, téglalap, paralelogramma, trapéz, rombusz, összetett alakzat; a belső illesztési varratok nem számítanak a kerületbe | |
| 22 | 📐 Pitagorasz-tétel | `pythagorean` | 4 blokk, 12 feladat; átfogó, befogó, derékszög ellenőrzése; pitagoraszi számhármasok, egész válaszok; a derékszög jelölése a rajzon | |
| 23 | ⭕ Kör részei, körcikk | `circle` / 1000 | 4 blokk, 15 feladat; felismerés: középpont, sugár, átmérő, húr, szelő, érintő, körlap (7 feladat, csak ebben a leckében), majd átváltás, körív és körcikk számítás; a válasz **π-vel** jelenik meg (pl. `8π cm`), nem 3,14-gyel kerekítve | |

### 2.6 Térgeometria

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 24 | 📦 Testek és hálók | `solid-shape` | 3 blokk, 12 feladat; kocka, téglatest, hasáb, gúla, gömb, henger, kúp felismerése; háló és lapok száma | |
| 25 | 📦 Testek tulajdonságai | `solid-shape` + `solid-measure` | 5 blokk, 12 feladat; lap, él, csúcs, lapátló, testátló; az átlók pitagoraszi számhármasokkal egész választ adnak | |
| 26 | 📦 Felszín | `solid-measure` / 1000 | 3 blokk, 12 feladat; kocka, téglatest, egyenes hasáb felszíne; a képlet és a négyzetmértékegység stimmel | |
| 27 | 📦 Térfogat és űrtartalom | `solid-measure` + `measure-units` / 1000 | 4 blokk, 12 feladat; kocka, téglatest, hasáb térfogata, `1 dm³ = 1 l`, űrtartalom-átváltás és -összehasonlítás | |

### 2.7 Statisztika, valószínűség

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 28 | 📊 Adatok és diagramok | `data-chart` / 1000 | 4 blokk, 15 feladat; oszlop-, vonal-, pont-, piktogram-, táblázat- és kördiagram; legtöbb/legkevesebb, különbség, összeg, darabszám, százalék | |
| 29 | 📊 Középértékek és terjedelem | `average` / 1000 | 5 blokk, 14 feladat; átlag, medián, módusz, terjedelem, hiányzó érték; a medián előtt **sorba kell rendezni**, a módusz a leggyakoribb érték | |
| 30 | 🎲 Valószínűség és gyakoriság | `probability` / 100 | 4 blokk, 15 feladat; esély, egyenlő esély, relatív gyakoriság, biztos/lehetséges/lehetetlen; a kérdés nyelvtanilag helyes (pl. „piros golyót”, „zöldre áll meg”) | |

### 2.8 Transzformációk, szerkesztések

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 31 | 🪞 Tengelyes és középpontos tükrözés | `mirror` + `transform` (turn) | 3 blokk, 11 feladat; tengelyes tükörkép vízszintes és függőleges tengelyre, 180°-os forgatás; a tükörkép nem forgatás | |
| 32 | 🌀 Eltolás, forgatás, nagyítás és kicsinyítés | `transform` | 3 blokk, 11 feladat; eltolás jobbra/lefelé, 90°/180° forgatás; a kiválasztott alakzat tájolása és a lépésszám helyes | |
| 33 | 📏 Alapszerkesztések | `construction` | 3 blokk, 12 feladat; 1) mi a következő lépés (felezőmerőleges, szögfelező, merőleges, párhuzamos), 2) ábra alapján melyik szerkesztés eredménye, 3) háromszög szerkeszthetősége (oldalak, szögösszeg, SAS); statikus ábra, nem kell rajzolni | |

### 2.9 Összefoglalás, gyakorlás

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 34 | 🧮 Számok és algebra összefoglaló | `set-ops` + `prime-factor` + `power` + `algebra` + `equation` + `word-problem` / 1000 | 6 blokk, 16 feladat; a témák váltakoznak, a válaszformák (választás/beírás) a feladathoz illenek | |
| 35 | 📐 Geometria és mérés összefoglaló | `triangle` + `polygon` + `pythagorean` + `circle` + `shape-area` + `solid-measure` + `measure-units` / 1000 | 7 blokk, 17 feladat; minden blokk a saját képletét és rajzát használja; a terület- és térfogategységek nem keverednek | |
| 36 | 🎲 8. osztályos vegyes gyakorló | 10 blokk, 20 feladat | A leghosszabb lecke; a témák váltakoznak, a nehézség nem esik vissza a blokkok között | |

### 2.10 Mester kihívás

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| – | 🌟 Mester kihívás | `master` / 1000 (grade 8) | 2 blokk, 6 feladat; 3 szöveges (út–idő–sebesség) + 3 logikai (zoknis legrosszabb eset); a mester kihívás **nem számít bele az osztály haladásába** | |

### 2.11 Egypercesek

| # | Játék | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| – | 🎲 Négyzetgyökök (egyperces) | `root-play` / 1000 | 60 másodperc, könnyű és kőkemény szint; négyzetgyök, köbgyök, négyzetgyök-szorzat; rossz válasznál megmutatja a helyeset, és ugyanaz a feladattípus nagyobb eséllyel jön újra | |
| – | 🎲 Százalék (egyperces) | `percent-play` / 1000 | 60 másodperc, könnyű és kőkemény szint; 5%, 10%, 15%, 20%, 25%, 30%, 50%, 75%, 120% fejben; saját rekord mentése | |

---

## 3. Világok és készségtérkép

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 3.1 | Válts világot a profilból | A leckék jelenetei az adott világ címét/emojiját mutatják | |
| 3.2 | Válassz ki egy leckét több különböző világban | A `worldTitles`-ek megjelennek, a feladat tartalma ugyanaz marad | |
| 3.3 | Válassz ki egy szöveges feladatot 3 világban | A feladat szövege világváltáskor is a világhoz igazodik (postás ≠ konyha) | |
| 3.4 | 📚 Készségek oldal | A 8. osztályos leckék a megfelelő készséghez tartoznak (halmazok, számelmélet, logika, algebra, geometria, statisztika, valószínűség) | |
| 3.5 | Szűrők | A 8. osztályos nézetben 36 normál lecke, 1 mester kihívás és 2 egyperces érhető el; a szűrők a normál leckéket szűrik, és a 8. osztályra szűrve is helyes találatszámot adnak | |

---

## 4. Weboldal- és telefonellenőrzés

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 4.1 | Ikon a fülön / PWA | A fülön (favicon) és a telepített PWA-ban ugyanaz a tangram-M: kék és világosszürke háromszögekből álló M, fehér vonalakkal | |
| 4.2 | Telefonméret (DevTools 375px) | A ☕ „Támogatás” link NEM jelenik meg, a jobb felső gombok (súgó, 📚) koppinthatók | |
| 4.3 | Halmazfeladat és gráf mobilon | A halmazok kapcsos jelölése és a gráf élei nem csúsznak ki, a válaszgombok tördelhetők | |
| 4.4 | Koordináta-rács és függvénygrafikon mobilon | A rácspontok koppinthatók, a tengelyfeliratok nem lógnak ki, a pontok kijelölése látszik | |
| 4.5 | Számegyeneses egyenlőtlenség | A négy válaszlehetőség nem csúszik szét, a nyílt/zárt végpont megkülönböztethető | |
| 4.6 | Térgeometriai rajzok | A testek, hálók és átlók rajzai nem torzulnak, a lap/él/csúcs kérdésnél a modell felismerhető | |
| 4.7 | Számbeviteles feladatok | Mobilon is numerikus billentyűzet jön fel, az Enter/„Ellenőrzöm” működik | |
| 4.8 | Asztali nézet | A ☕ „Támogatás” link a bal alsó sarokban látható | |
| 4.9 | Hard reload / offline | Nincs konzolhiba; az app cache-ből is betölt (a `src/sw-cache.js` aktuális listája szerint) | |

---

## 5. Ismert nyitott kérdések

| # | Kérdés | Megjegyzés |
|---|--------|------------|
| 5.1 | Szerkesztések | A választós minimálváltozat elkészült (következő lépés, eredményfelismerés, háromszög-feltételek). Valódi körző–vonalzó rajzolás és interaktív lépéssorrend még nincs; ez későbbi fejlesztés |
| 5.2 | Nagyítás és kicsinyítés | Az „Eltolás, forgatás, nagyítás és kicsinyítés” cím szerepel, de a feladatokban csak eltolás és forgatás van; a nagyítás/kicsinyítés még hiányzik |
| 5.3 | Halmazok | A halmazlecke csak ℕ/ℤ/ℚ-ba tartozást kérdez; a részhalmaz, számegyenes és a tizedes törtek fajtái még nem szerepelnek |
| 5.4 | Gráfok | A gráflecke kézfogást és útvonalat kérdez; a csúcs/él fogalma és a körmérkőzés még nem önálló feladat |
| 5.5 | Százalék a gyakorlatban | A százaléklecke alap-, érték- és változásszámítást tartalmaz; a kamat, keverés, százalékpont és a pénzügyi döntések még nem |
| 5.6 | Henger és kúp | A testek és hálók leckében a henger/kúp lapjainak száma is kérdezhető; a tanmenet szerint ezek csak felismerési szinten szerepelnek |
| 5.7 | Szöveges feladatok | Az egyenletes szöveges feladatok mind „gondoltam egy számra” típusúak; a becslés és a változatos szövegkörnyezet még szűk |

---

## 6. Visszajelzés sablon

- **Lecke / lépés:** (pl. 12 – Elsőfokú egyenlőtlenségek)
- **Elvárt:** …
- **Tapasztalt:** …
- **Képernyőkép / konzolhiba:** …
