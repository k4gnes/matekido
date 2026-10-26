# Matekidő – 6. osztály manuális tesztforgatókönyv

Ennek a dokumentumnak a célja, hogy a **6. osztályos tananyagot** (42 lecke: 38 számozott + 1 mester kihívás + 3 egyperces, 10 témakör, egész számok, számelmélet, hatványok, egyenletek, geometria, kombinatorika) a böngészőben kézzel végigteszteljük: minden lecke helyesen épül fel, a feladatok a megjelölt tartományban és formában jelennek meg, a jó/rossz válasz kezelése helyes, és a lecke a celebrációval zárul.

- **Szerver:** `make start` (localhost:8000) – a `src/` mappát szolgálja ki.
- **Böngésző:** Asztali (Chrome / Firefox / Edge) + legalább egyszer telefon méretű nézet.
- **Jelölések:** ✅ működik · ❌ hibás · ⚠️ kisebb hiba / megjegyzés · ➖ nem érinti / átugorható.

> A táblázatok a regiszter és a leckefájlok alapján készültek; az „Eredmény” oszlop kitöltése a manuális végigtesztelés feladata.

---

## 0. Előkészítés

1. Indítsd el a szervert: `make start`, nyisd meg: <http://localhost:8000>.
2. DevTools → Application → Local Storage: töröld a `matekido-users` és `matekido-profile` kulcsokat (vagy tesztelj inkognitóban).
3. Hozz létre egy tesztjátékost (pl. „Teszt 6”), és az osztályválasztóban válaszd a **6. osztályt**. Az évfolyamok nincsenek zárolva, bármelyik kiválasztható.
4. A menüben a `🎓 Évfolyam` gombbal ellenőrizd, hogy a 6. osztályos leckék látszanak, és a fejléc a 6. osztályt mutatja.

---

## 1. Általános lecke-folyamat (minden leckére érvényes)

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 1.1 | Menüben válaszd ki a leckét | Scene (jelenet) szöveggel indul, világfüggő címmel és emojival | |
| 1.2 | Kattints a „Kezdés” gombra | Megjelenik az első feladat a progress-sávval | |
| 1.3 | Figyeld a blokkokat | A lecke 2–7 blokkból áll, a blokkokon belül nehezedő sorrendben (a legtöbb lecke 3–5 blokk) | |
| 1.4 | Nézd meg a számokat és a jelöléseket | A számok a lecke saját tartományán belül vannak; a negatív szám `−` jellel, a tört emeletes formában, a tizedes tört magyar tizedesvesszővel (`0,5`), a hatvány felső indexszel jelenik meg | |
| 1.5 | Válaszolj helyesen néhány feladatra | Pozitív visszajelzés, a számláló nő | |
| 1.6 | Válaszolj helytelenül valahol | Nincs büntetés, a feladat újrapróbálható; a lecke nem lép tovább | |
| 1.7 | Nézd meg a súgót | Két hiba után megjelenik a „💡 Segítséget kérek” gomb, a súgó csak kattintásra nyílik ki | |
| 1.8 | Számbeviteles feladatnál nyomd meg az Entert | Az „Ellenőrzöm” gomb helyett az Enter is ellenőriz, a fókusz a beviteli mezőn marad | |
| 1.9 | Fejezd be a leckét | Celebráció jelenik meg, a profil statisztikái frissülnek | |
| 1.10 | Indítsd újra ugyanazt a leckét | Más feladatok jönnek (véletlenszerű generálás) | |
| 1.11 | Kilépés gomb (📚 jobb felső) | Megerősítő párbeszéd, „Mégse” visszavisz a leckébe | |

---

## 2. Lecke-ellenőrző táblázatok

### 2.1 Egész számok, negatív számok

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.1.1 | 🌡️ Negatív számok a számegyenesen | `number-line` / 20 | Leolvasás és pont elhelyezése, hőmérséklet és adósság szövegkörnyezetben; a nulla és a negatív irány helyes | |
| 2.1.2 | ➖ Ellentett és abszolút érték | `integer` / 100 | Ellentett és abszolút érték, választás és beírás; a negatív szám zárójelezése és az abszolút érték nemnegatív eredménye stimmeljen | |
| 2.1.3 | ⚖️ Egész számok összehasonlítása | `integer` / 100 | Kifejezések összehasonlítása `< = >` jelekkel; a `−5 + 3` típusú kifejezések értéke és a negatív számok rendezése helyes | |
| 2.1.4 | 🧮 Előjeles összeadás és kivonás | `integer-ops` / 100 | Azonos és különböző előjelek, kivonás mint ellentett hozzáadása; a hőmérséklet- és adósságkontextus előjele stimmeljen | |
| 2.1.5 | ➗ Előjeles szorzás és osztás | `integer-muldiv` / 100 | Előjelszabályok szorzásnál és osztásnál, nulla szerepe, negatív osztó; a válasz előjele és nagysága helyes | |

### 2.2 Osztók, többszörösök, prímek

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.2.1 | 🎯 Oszthatósági szabályok | `divisibility-rule` / 1 000 | Melyik számmal osztható, maradékos osztás és vegyes kérdés; a 2, 3, 4, 5, 6, 9, 10 szabálya helyes, a „with” kérdés egyértelmű | |
| 2.2.2 | ➗ Osztók és többszörösök | `divisibility` / 100 | Többszörös, osztó, darabszám és nem-többszörös; az „osztója” és a „többszöröse” iránya ne keveredjen, az 1 és a szám önmaga is osztó | |
| 2.2.3 | ⚛️ Prím- és összetett számok | `prime` / 100 | Prím/összetett besorolás, prím és összetett kiválasztása; az 1 nem prím, a 2 prím, a 9 összetett | |
| 2.2.4 | 🌳 Prímfelbontás | `prime-factor` / 100 | Felbontás kiválasztása, hiányzó tényező, kitevős alak és vegyes; a prímtényezők szorzata az eredeti szám legyen | |
| 2.2.5 | 🤝 LNKO és LKKT | `gcd-lcm` / 100 | LNKO, LKKT, közös osztó és közös többszörös; a relatív prím eset és a közös osztó/többszörös megkülönböztetése helyes | |

### 2.3 Hatványok

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.3.1 | ⚡ A hatványozás alapjai | `power` / 1 000 | Négyzetre és köbre emelés, hatványjelölés, alap és kitevő; a negatív alap zárójelezése és a kitevő felső indexe helyes | |
| 2.3.2 | 🔟 Tízes hatványok | `power-ten` / 1 000 000 | Érték, nullák száma, hatvány és név; a `10⁶` és az „egymillió” kapcsolata, a nullák száma stimmeljen | |
| 2.3.3 | ⚡ Hatványok a műveleti sorrendben | `operation-order` / 1 000 | Hatvány összeadással és szorzással, zárójeles hatvány és vegyes; a hatvány megelőzi a szorzást/összeadást, a zárójel tényleg módosít | |

### 2.4 Törtek és tizedes törtek

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.4.1 | 📍 Törtek a számegyenesen és vegyes számok | `fraction-line` / 20 | Leolvasás, pont elhelyezése, áltört → vegyes szám és vissza; a számegyenes beosztása és a vegyes szám alakja helyes | |
| 2.4.2 | 🔁 Tört és tizedes tört átváltása | `fraction-decimal` / 100 | Mindkét irány, alap és haladó szint; csak véges tizedes törtek, a legegyszerűbb tört alak és a magyar vessző helyes | |
| 2.4.3 | ✖️➗ Törtek szorzása és osztása – gyakorlás | `fraction-muldiv` / 100 | Szorzás és osztás, alap és haladó; a keresztbe egyszerűsítés, a reciprok és az eredmény legegyszerűbb alakja helyes | |
| 2.4.4 | 🔗 Törtrész, arány és százalék | `fraction-percent` / 100 | Tört → százalék és százalék → tört, alap és haladó; a százalék egész, a tört a legegyszerűbb alakban, az arány `rész : egész` | |

### 2.5 Nyitott mondatok, egyenletek és egyenlőtlenségek

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.5.1 | 🧩 Nyitott mondat – igaz vagy hamis? | `open-sentence` / 100 | Behelyettesítés és igazságérték, alapműveletenként és vegyesen; a megoldáshalmaz és a „nyitott mondat” fogalma stimmeljen | |
| 2.5.2 | 🟰 Egyenlet megoldása | `equation` / 100 | Összeadás, kivonás, szorzás, osztás és kétlépéses egyenlet; az inverz művelet és a megoldás ellenőrzése helyes | |
| 2.5.3 | 📈 Egyenlőtlenségek a számegyenesen | `inequality` / 100 | Leolvasás, választás, megoldás és vegyes; a nyílt/zárt végpont és a reláció iránya a számegyenesen is helyes | |

### 2.6 Arány és százalék

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.6.1 | 🔗 Arány és aránypár | `ratio` / 100 | Arány felírása, egyszerűsítés, hiányzó tag és vegyes; a tagok sorrendje és a legkisebb egész arány helyes | |
| 2.6.2 | 📐 Egyenes arányosság a gyakorlatban | `word-problem` / 1 000 | Hiányzó érték és mennyiség, választás és beírás; az arány mindkét mennyiségben ugyanannyiszorosára változik | |
| 2.6.3 | 📐 Fordított arányosság | `word-problem` / 1 000 | Hiányzó érték és mennyiség; az egyik nő, a másik csökken, a szorzat állandó, a mértékegység stimmel | |
| 2.6.4 | 💯 Százalékérték, százalékláb és alap | `percent` / 1 000 | A három alapeset és vegyes; a százalékérték, a százalékláb és az alap szerepe ne keveredjen, az eredmény egész | |

### 2.7 Geometria

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.7.1 | 🔺 A háromszögek tulajdonságai | `triangle` / 180 | Szögösszeg, oldalak szerinti osztályozás, háromszög-egyenlőtlenség és vegyes; a szögösszeg 180°, a két kisebb oldal összege nagyobb a harmadiknál | |
| 2.7.2 | 🔷 A négyszögek rendszerezése | `polygon` / – | Négyzet, téglalap, rombusz, paralelogramma, trapéz és deltoid; a részhalmaz-viszonyok és a tulajdonságok helyesek | |
| 2.7.3 | 📐 Szögek mérése és szerkesztése | `angle-measure` / 360 | 5°-os lépések, teljes kör, szögfajta és összehasonlítás; a szögmérő leolvasása és a szögfajta megnevezése helyes | |
| 2.7.4 | ⭕ A kör és részei | `circle` / – | Középpont, sugár, átmérő, húr és átváltás; a sugár–átmérő viszony 2, a kör részeinek megnevezése helyes | |
| 2.7.5 | 🔄 Tükrözés, eltolás, forgatás | `transform` / – | Eltolás lépésekben és forgatás; az irány, a szög és a kiinduló alakzat helyzete stimmeljen. **A lecke jelenleg nem tartalmaz külön tükrözésblokkot** | |
| 2.7.6 | 📦 Felszín és térfogat – téglatest, kocka | `solid-measure` / 1 000 | Felszín, térfogat és vegyes; a kocka és téglatest képlete, a cm²/cm³ mértékegység helyes | |
| 2.7.7 | 📏 Háromszög és négyszög kerülete, területe | `shape-area` / 1 000 | Háromszög kerülete és területe, paralelogramma területe, vegyes; a magasság nem tévesztendő össze az oldallal | |

### 2.8 Kombinatorika

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.8.1 | 🎲 Hányféleképpen? – sorba rendezés | `combinatorics` / 100 | Sorba rendezés, összeszámlálás és szorzás; a sorrend számít, a lehetőségek száma és a felsorolás egyezzen | |
| 2.8.2 | 🎲 Kiválasztás és párosítás | `combinatorics` / 100 | Párosítás és szorzás; a párok száma ne duplázódjon, a kiválasztásnál a sorrend ne számítson | |

### 2.9 Adatok és valószínűség

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.9.1 | 📊 Adatok, diagramok és átlag | `average` / 1 000 | Átlag és hiányzó adat táblázatból és diagramból; az átlag = összeg ÷ darabszám, a hiányzó érték helyes | |
| 2.9.2 | 🎲 Valószínűség és esély | `probability` / – | Biztos/lehetséges/lehetetlen, nagyobb/kisebb esély és egyenlő esély; a kedvező esetek aránya és a tört alak helyes | |

### 2.10 Szöveges feladatok

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.10.1 | 📐 Arányossági szöveges feladatok | `word-problem` / 1 000 | Egyenes és fordított arányosság, érték és mennyiség; a helyzet felismerése és a skálázás iránya helyes | |
| 2.10.2 | 💯 Százalékos szöveges feladatok | `percent` / 1 000 | Százalékérték, százalékláb és alap szövegben; a kérdés és a kiszámított érték szerepe stimmeljen | |
| 2.10.3 | 📝 Többlépéses szöveges feladatok | `word-problem` / 1 000 | Több művelet egy történetben; a műveletek sorrendje, a maradék és a mértékegység helyes | |

### 2.11 Mester kihívás

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.11.1 | 🌟 Mester kihívás | `master` / 1 000 | Hiányzó műveleti jel és két szám kitalálása; a megoldás egyértelmű, a mester kihívás nem számít bele az osztály haladásába | |

### 2.12 Egypercesek

| # | Játék | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.12.1 | Szorzótábla-játék (gombokkal) | `multiplication-play` / 100 | 60 másodperc, négy gomb; rossz válasznál megmutatja a helyeset, a rekord mentése működik | |
| 2.12.2 | Szorzótábla-játék (beírással) | `multiplication-play` / 100 | Ugyanaz beírással; a numerikus billentyűzet és az Enter működik, a rekord mentése külön történik | |
| 2.12.3 | 🎲 Műveleti sorrend (egyperces) | `operation-order-play` / – | 60 másodperc, műveleti sorrend; a rossz válasz után a helyes megoldás látszik, a játék nem számít bele a haladásba | |

---

## 3. Világok és készségtérkép

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 3.1 | Válts világot a profilból | A leckék jelenetei az adott világ címét/emojiját mutatják | |
| 3.2 | Válassz ki egy leckét több különböző világban | A `worldTitles`-ek megjelennek, a feladat tartalma ugyanaz marad | |
| 3.3 | Válassz ki egy szöveges feladatot 3 világban | A feladat szövege világváltáskor is a világhoz igazodik (postás ≠ konyha) | |
| 3.4 | 📚 Készségek oldal | A 6. osztályos leckék a megfelelő készséghez és kategóriához tartoznak (egész számok, számelmélet, hatvány, törtek, egyenlet, geometria, kombinatorika, adatok) | |
| 3.5 | Szűrők | A 6. osztályos nézetben 38 normál lecke, 1 mester kihívás és 3 egyperces érhető el; a szűrők a normál leckéket szűrik, a mester és az egypercesek külön jelennek meg | |

---

## 4. Weboldal- és telefonellenőrzés

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 4.1 | Ikon a fülön / PWA | Kék háttér, piros M betű gombszürke körvonallal | |
| 4.2 | Telefonméret (DevTools 375px) | A ☕ „Támogatás” link NEM jelenik meg, a jobb felső gombok (súgó, 📚) koppinthatók | |
| 4.3 | Negatív szám és számegyenes mobilon | A `−` jel nem tűnik el, a számegyenes feliratai és a pontok koppinthatók | |
| 4.4 | Hatványok és törtek mobilon | A kitevő felső indexe olvasható, a tört számlálója/nevezője nem csúszik szét | |
| 4.5 | Geometria mobilon | A szögmérő, a körrészek és a transzformációs ábra nem lóg ki, a válaszgombok tördelhetők | |
| 4.6 | Számbeviteles feladatok | Mobilon is numerikus billentyűzet jön fel, az Enter/„Ellenőrzöm” működik | |
| 4.7 | Asztali nézet | A ☕ „Támogatás” link a jobb felső sarokban látható | |
| 4.8 | Hard reload / offline | Nincs konzolhiba; az app cache-ből is betölt (az aktuális fájlszámot a `src/sw-cache.js` adja) | |

---

## 5. Ismert nyitott kérdések

| # | Kérdés | Megjegyzés |
|---|--------|------------|
| 5.1 | Tükrözés a 6. osztályos transzformációknál | A `transform-03` lecke címe „Tükrözés, eltolás, forgatás”, de a leckefájlban jelenleg csak `transform` blokkok vannak, `mirror` blokk nincs. Ellenőrizd, kell-e külön tükrözésfeladat |
| 5.2 | Valószínűség kérdésszövege | Zacskós húzásnál a generátor „pirosat golyót húzunk” formát is adhat; a helyes szöveg „piros golyót húzunk” lenne. Ez a 6. osztályban is előjöhet |
| 5.3 | Tört–tizedes átváltás | A `fraction-decimal` csak véges tizedes törteket használ (2, 4, 5, 10, 20, 25, 50 nevezők); ellenőrizd, hogy az 1/3 típusú végtelen tizedes tört szándékosan kimarad |
| 5.4 | Törtrész–százalék | A `fraction-percent` szintén csak a fenti nevezőket használja, így a százalékok egészek; ellenőrizd, hogy a haladó szinten sincs kerekítés |
| 5.5 | Oszthatósági szabályok | A `divisibility-rule` a 2, 3, 4, 5, 6, 9, 10 szabályait használja; a „with” mód kérdése egyértelmű-e, és a 4/6 szabály szövege helyes-e |
| 5.6 | Hatvány negatív alappal | A `power` generátor negatív alapot is adhat; ellenőrizd, hogy a zárójel és a kitevő együtt `(−2)² = 4` formában jelenik meg, nem `−2²`-ként |

---

## 6. Visszajelzés sablon

- **Lecke / lépés:** (pl. 2.1.4 – Előjeles összeadás és kivonás)
- **Elvárt:** …
- **Tapasztalt:** …
- **Képernyőkép / konzolhiba:** …
