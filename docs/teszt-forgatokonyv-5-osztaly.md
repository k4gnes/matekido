# Matekidő – 5. osztály manuális tesztforgatókönyv

Ennek a dokumentumnak a célja, hogy az **5. osztályos tananyagot** (36 lecke: 32 számozott + 1 mester kihívás + 3 egyperces, 9 témakör, számkör 1 000 000-ig) a böngészőben kézzel végigteszteljük: minden lecke helyesen épül fel, a feladatok a megjelölt tartományban és formában jelennek meg, a jó/rossz válasz kezelése helyes, és a lecke a celebrációval zárul.

- **Szerver:** `make start` (localhost:8000) – a `src/` mappát szolgálja ki.
- **Böngésző:** Asztali (Chrome / Firefox / Edge) + legalább egyszer telefon méretű nézet.
- **Jelölések:** ✅ működik · ❌ hibás · ⚠️ kisebb hiba / megjegyzés · ➖ nem érinti / átugorható.

> A táblázatok a regiszter és a leckefájlok alapján készültek; az „Eredmény” oszlop kitöltése a manuális végigtesztelés feladata.

---

## 0. Előkészítés

1. Indítsd el a szervert: `make start`, nyisd meg: <http://localhost:8000>.
2. DevTools → Application → Local Storage: töröld a `matekido-users` és `matekido-profile` kulcsokat (vagy tesztelj inkognitóban).
3. Hozz létre egy tesztjátékost (pl. „Teszt 5”), és az osztályválasztóban válaszd az **5. osztályt**. Az évfolyamok nincsenek zárolva, bármelyik kiválasztható.
4. A menüben a `🎓 Évfolyam` gombbal ellenőrizd, hogy az 5. osztályos leckék látszanak, és a fejléc az 5. osztályt mutatja.

---

## 1. Általános lecke-folyamat (minden leckére érvényes)

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 1.1 | Menüben válaszd ki a leckét | Scene (jelenet) szöveggel indul, világfüggő címmel és emojival | |
| 1.2 | Kattints a „Kezdés” gombra | Megjelenik az első feladat a progress-sávval | |
| 1.3 | Figyeld a blokkokat | A lecke 2–7 blokkból áll, a blokkokon belül nehezedő sorrendben (a legtöbb lecke 3–5 blokk) | |
| 1.4 | Nézd meg a számokat és a jelöléseket | A számok a lecke saját tartományán belül vannak (leggyakrabban max. 1 000 000); tizedes tört **magyar tizedesvesszővel** (`0,5`), a tört emeletes formában jelenik meg | |
| 1.5 | Válaszolj helyesen néhány feladatra | Pozitív visszajelzés, a számláló nő | |
| 1.6 | Válaszolj helytelenül valahol | Nincs büntetés, a feladat újrapróbálható; a lecke nem lép tovább | |
| 1.7 | Nézd meg a súgót | Két hiba után megjelenik a „💡 Segítséget kérek” gomb, a súgó csak kattintásra nyílik ki | |
| 1.8 | Számbeviteles feladatnál nyomd meg az Entert | Az „Ellenőrzöm” gomb helyett az Enter is ellenőriz, a fókusz a beviteli mezőn marad | |
| 1.9 | Fejezd be a leckét | Celebráció jelenik meg, a profil statisztikái frissülnek | |
| 1.10 | Indítsd újra ugyanazt a leckét | Más feladatok jönnek (véletlenszerű generálás) | |
| 1.11 | Kilépés gomb (📚 jobb felső) | Megerősítő párbeszéd, „Mégse” visszavisz a leckébe | |

---

## 2. Lecke-ellenőrző táblázatok

### 2.1 Számfogalom 1 000 000-ig

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.1.1 | Helyiérték 1 000 000-ig | `place-value-thousands` / 1 000 000 | Három blokk: beírás, választás, majd átviteles feladat; a helyiérték-táblázatban a nullák helye és a milliós nagyságrend stimmeljen | |
| 2.1.2 | Számnevek 1 000 000-ig | `number-name` / 1 000 000 | Mindkét irány: szám → szöveg és szöveg → szám; a magyar számnév kötőjelezése, a kerek számok és az „egymillió” alak helyes legyen | |
| 2.1.3 | Számszomszédok 1 000 000-ig | `neighbor-round` / 1 000 000 | Két blokk: tízes/százas/ezres, majd ezres/tízezres/százzezres; az alsó és felső kerekített szomszéd a kért helyiértékhez igazodjon | |
| 2.1.4 | Összehasonlítás 1 000 000-ig | `comparison` / 1 000 000 | Két blokk; a `< = >` jel a nagyságrendhez illeszkedjen, az egyenlőség is előfordul (forceEqual), a nulla helye ne csússzon el | |
| 2.1.5 | Oszthatóság 2, 3, 4, 5, 6, 9, 10-zel | `divisibility` / 1 000 000 | Többszörös és nem-többszörös; a 3-as, 4-es, 6-os és 9-es szabály helyes legyen, a „nem többszörös” kérdés ne keveredjen a „többszörös” kérdéssel | |
| 2.1.6 | Kerekítés és becslés 1 000 000-ig | `rounding` + `estimate` / 1 000 000 | Kerekítés százasra, ezresre, tízezresre és százezresre; a becslés külön blokk, a nagyságrend és a kerekített érték összhangban legyen | |

### 2.2 Törtek

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.2.1 | Bővítés és egyszerűsítés | `fraction-equal` / 100 | Bővítés, egyszerűsítés és összehasonlítás; az egyenlő törtek értéke azonos, az egyszerűsített alak a legkisebb tagokkal szerepeljen | |
| 2.2.2 | Különböző nevezőjű törtek összeadása | `fraction-common-den` / 20 | Összeadás és kivonás; a közös nevező helyes, az eredmény egyszerűsítve vagy vegyes számként jelenik meg | |
| 2.2.3 | Törtek szorzása egész számmal | `fraction-times-int` / 20 | Egész számmal való szorzás, tört eredmény és vegyes eredmény; a nevező változatlan, a számláló szorzódik | |
| 2.2.4 | Törtek szorzása törttel | `fraction-times-frac` / 100 | Számláló × számláló, nevező × nevező; a területmodell és az egyszerűsítés is helyes legyen | |
| 2.2.5 | Törtek osztása | `fraction-divide` / 100 | Egésszel és törttel való osztás; az osztás a reciprokkal való szorzás, az eredmény egyszerűsítve | |

### 2.3 Tizedes törtek

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.3.1 | Tizedes törtek: írás, olvasás, összehasonlítás | `decimal-prep` / 100 | Szöveges olvasat → tizedes szám, tizedes szám → szöveges olvasat, összehasonlítás; a magyar tizedesvessző és a záró nullák helyesek | |
| 2.3.2 | Tizedes törtek összeadása és kivonása | `decimal-prep` / 100 | Vesszők igazítása, egész rész pótlása nullával, átvitel és kölcsönzés; az eredmény helyiértékei stimmeljenek | |
| 2.3.3 | Szorzás 10-zel, 100-zal, 1000-rel | `decimal-prep` / 1 000 | A vessző jobbra mozdul, a hiányzó helyekre nulla kerül; a 10, 100 és 1000 hatása különüljön el | |
| 2.3.4 | Osztás 10-zel, 100-zal, egésszel | `decimal-prep` / 1 000 | A vessző balra mozdul, szükség esetén nulla kerül a vessző elé; az egésszel való osztás külön blokk | |

### 2.4 Százalékszámítás

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.4.1 | Százalék fogalma: 10%, 20%, 25%, 50% | `percent` / 100 | Száz kockás rács, százalék ↔ egyszerű tört, hétköznapi szöveg; a színezett rész és a százalék egyezzen | |
| 2.4.2 | Mennyi az X százaléka? | `percent` / 1 000 | Először 10/20/25/50%, majd 5/15/30/40/75%; a „mennyi az X%-a” és a „hány százaléka” kérdés is helyes legyen, az eredmény egész | |

### 2.5 Műveletek nagy számokkal

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.5.1 | Írásbeli műveletek nagy számokkal | `written-operation` + `written-division` / 100 000 | Ötjegyű összeadás és kivonás, négyjegyű szorzás 11–15-tel, ötjegyű osztás kétjegyűvel; az átvitel, a részszorzatok és a lépcsős osztás látszódjon | |
| 2.5.2 | Műveleti sorrend és zárójelek | `operation-order` / 1 000 | Két blokk: kisebb és nagyobb számok; a szorzás/osztás megelőzi az összeadást/kivonást, a zárójel tényleg megváltoztatja az eredményt | |
| 2.5.3 | Hiányzó tag és hiányzó tényező | `missing-operand` + `multiplication` / 1 000 | Fordított összeadás/kivonás és hiányzó tényező a 11, 12, 15, 20, 25, 40, 50, 100-as táblákból; az inverz művelet helyes | |

### 2.6 Geometria

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.6.1 | Síkidomok tulajdonságai | `polygon` / – | Ötszögtől nyolcszögig oldalak, csúcsok és átlók; az átlók száma a `n(n−3)/2` képlettel egyezzen | |
| 2.6.2 | Kerület és terület – négyzet és téglalap | `shape-formula` / 1 000 | `K = 2(a + b)` és `T = a × b`; a képlet, a méretjelölés és a mértékegység (cm, cm²) stimmeljen | |
| 2.6.3 | Kocka és téglatest felszíne és térfogata | `solid-measure` / 1 000 | `6a²`, `2(ab + ac + bc)`, `a³`, `a × b × c`; a felszín cm², a térfogat cm³ legyen | |
| 2.6.4 | Szögek mérése és szerkesztése | `angle-measure` / 360 | 5°-os lépések, teljes kör, szögösszehasonlítás; a szögmérő leolvasása és a szögfajta megnevezése helyes | |
| 2.6.5 | Koordináta-rendszer | `coordinate` / 100 | Pont leolvasása és kijelölése; **csak az első síknegyed, 0–9 közötti értékek**, a sorrend `(x; y)` | |
| 2.6.6 | Eltolás, forgatás és tükrözés | `transform` + `mirror` / – | Eltolás lépésekben, forgatás iránya és szöge, tükrözés tengelye; a tükrözött alakzat nem forgatott | |

### 2.7 Gyakorlati tudások

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.7.1 | 📏 Átváltások tisztán – hosszúság, tömeg és űrtartalom | `measure-units` / 10 000 | km/m/cm, t/kg/g, hl/l/dl; előre és visszafelé is, összehasonlításokkal és hétköznapi tárgyakkal | |
| 2.7.2 | 📐 Terület- és térfogategységek | `measure-units` / 10 000 | m² ↔ dm² ↔ cm² 100-zal, dm³ ↔ l 1:1; a visszafelé váltás és az összehasonlítás is helyes | |
| 2.7.3 | ⏱️ Idő, sebesség, út | `speed-trip` / 1 000 | `út = sebesség × idő`, valamint idő és sebesség kiszámítása; a km/h és m/perc egységek ne keveredjenek | |

### 2.8 Adatok

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.8.1 | 📊 Táblázatok, diagramok, átlag | `average` / 1 000 | Átlag = összeg ÷ darabszám; táblázatból és oszlopdiagramból is, valamint hiányzó adat adott átlagból | |

### 2.9 Szöveges feladatok

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.9.1 | 📐 Megosztás arányban | `word-problem` / 1 000 | Adott arány → részek, illetve adott rész → egész; az arány sorrendje, a részek összege és a mértékegység helyes | |
| 2.9.2 | 📐 Egyenes arányosság | `word-problem` / 1 000 | Adott mennyiség–érték párból a hiányzó érték vagy mennyiség; a skálázás mindkét irányban helyes | |

### 2.10 Mester kihívás

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.10.1 | 🌟 Mester kihívás | `master` / 1 000 | Hiányzó műveleti jel és kézfogás/párok; a megoldás egyértelmű, a kézfogásnál `n(n−1)/2`; a mester kihívás nem számít bele az osztály haladásába | |

### 2.11 Egypercesek

| # | Játék | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.11.1 | Szorzótábla-játék (gombokkal) | `multiplication-play` / 100 | 60 másodperc, négy gomb; rossz válasznál megmutatja a helyeset, a rekord mentése működik | |
| 2.11.2 | Szorzótábla-játék (beírással) | `multiplication-play` / 100 | Ugyanaz beírással; a numerikus billentyűzet és az Enter működik, a rekord mentése külön történik | |
| 2.11.3 | 🎲 Műveleti sorrend (egyperces) | `operation-order-play` / – | 60 másodperc, műveleti sorrend; a rossz válasz után a helyes megoldás látszik, a játék nem számít bele a haladásba | |

---

## 3. Világok és készségtérkép

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 3.1 | Válts világot a profilból | A leckék jelenetei az adott világ címét/emojiját mutatják | |
| 3.2 | Válassz ki egy leckét több különböző világban | A `worldTitles`-ek megjelennek, a feladat tartalma ugyanaz marad | |
| 3.3 | Válassz ki egy szöveges feladatot 3 világban | A feladat szövege világváltáskor is a világhoz igazodik (postás ≠ konyha) | |
| 3.4 | 📚 Készségek oldal | Az 5. osztályos leckék a megfelelő készséghez és kategóriához tartoznak (számok, törtek, műveletek, geometria, gyakorlati, szöveges) | |
| 3.5 | Szűrők | Az 5. osztályos nézetben 32 normál lecke, 1 mester kihívás és 3 egyperces érhető el; a szűrők a normál leckéket szűrik, a mester és az egypercesek külön jelennek meg | |

---

## 4. Weboldal- és telefonellenőrzés

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 4.1 | Ikon a fülön / PWA | Kék háttér, piros M betű gombszürke körvonallal | |
| 4.2 | Telefonméret (DevTools 375px) | A ☕ „Támogatás” link NEM jelenik meg, a jobb felső gombok (súgó, 📚) koppinthatók | |
| 4.3 | Helyiérték-táblázat és nagy számok mobilon | A táblázat nem csúszik ki, a számjegyek és a helyiérték-feliratok olvashatók | |
| 4.4 | Törtek és tizedes törtek mobilon | A tört számlálója/nevezője olvasható, a tizedesvessző nem tűnik el, a válaszgombok tördelhetők | |
| 4.5 | Koordináta-rács és transzformáció mobilon | A rácspontok koppinthatók, a tengelyfeliratok nem lógnak ki, a tükrözés/forgatás iránya látszik | |
| 4.6 | Számbeviteles feladatok | Mobilon is numerikus billentyűzet jön fel, az Enter/„Ellenőrzöm” működik | |
| 4.7 | Asztali nézet | A ☕ „Támogatás” link a jobb felső sarokban látható | |
| 4.8 | Hard reload / offline | Nincs konzolhiba; az app cache-ből is betölt (az aktuális fájlszámot a `src/sw-cache.js` adja) | |

---

## 5. Ismert nyitott kérdések

| # | Kérdés | Megjegyzés |
|---|--------|------------|
| 5.1 | Számnevek kötőjelezése | A `number-name` generátor magyar számnevei hosszúak; ellenőrizd a „háromszázezer-…” és az „egymillió” alakokat, különösen kerek számoknál |
| 5.2 | Számszomszédok terminológiája | A `neighbor-round` valójában a kért helyiértékre kerekített alsó/felső szomszédot adja; a felirat ne keverje a „szomszéd” és a „kerekítés” szót |
| 5.3 | Tizedes törtek megjelenítése | A generátor magyar tizedesvesszőt használ; ellenőrizd a záró nullákat és a `0,50 = 0,5` típusú egyenlőségeket |
| 5.4 | Koordináta-rendszer | A `coordinate` generátor csak az első síknegyedet használja (0–9). Erősítsd meg, hogy ez az 5. osztályban elég |
| 5.5 | Idő–sebesség egységek | A `speed-trip` `km/h` és `m/perc` családokat is használ; ellenőrizd, hogy a kérdés és a válasz mértékegysége mindig összhangban van |
| 5.6 | Átlag és hiányzó adat | Az `average` generátor egész átlagokat céloz; ellenőrizd, hogy a hiányzó adat kiszámítása nem kerekített értéket ad |

---

## 6. Visszajelzés sablon

- **Lecke / lépés:** (pl. 2.3.4 – Osztás 10-zel, 100-zal, egésszel)
- **Elvárt:** …
- **Tapasztalt:** …
- **Képernyőkép / konzolhiba:** …
