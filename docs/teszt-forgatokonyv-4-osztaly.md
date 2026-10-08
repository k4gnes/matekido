# Matekidő – 4. osztály manuális tesztforgatókönyv

Ennek a dokumentumnak a célja, hogy a **4. osztályos tananyagot** (35 lecke, 7 világ, számkör 10 000-ig + kétjegyűvel való írásbeli szorzás és osztás) a böngészőben kézzel végigteszteljük: minden lecke helyesen épül fel, a feladatok a megjelölt tartományban vannak, a jó/rossz válasz kezelése helyes, és a lecke a celebrációval zárul.

- **Szerver:** `make start` (localhost:8000) – a `src/` mappát szolgálja ki.
- **Böngésző:** Asztali (Chrome / Firefox / Edge) + legalább egyszer telefon méretű nézet.
- **Jelölések:** ✅ működik · ❌ hibás · ⚠️ kisebb hiba / megjegyzés · ➖ nem érinti / átugorható.

---

## 0. Előkészítés

1. Indítsd el a szervert: `make start`, nyisd meg: <http://localhost:8000>.
2. DevTools → Application → Local Storage: töröld a `matekido-users` és `matekido-profile` kulcsokat (vagy tesztelj inkognitóban).
3. Hozz létre egy tesztjátékost (pl. „Teszt 4”).
4. A 4. osztály kiválasztásához a menüben előbb teljesítsd a 3. osztály egy leckéjét, ha az osztály gombolva van.

---

## 1. Általános lecke-folyamat (minden leckére érvényes)

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 1.1 | Menüben válaszd ki a leckét | Scene (jelenet) szöveggel indul, világfüggő címmel és emojival | |
| 1.2 | Kattints a „Kezdés” gombra | Megjelenik az első feladat a progress-szal | |
| 1.3 | Válaszolj helyesen néhány feladatra | Pozitív visszajelzés, a számláló nő, a számok a lecke tartományán belül vannak (max. 10 000) | |
| 1.4 | Válaszolj helytelenül valahol | Nincs büntetés, a lecke folytatódik | |
| 1.5 | Fejezd be a leckét | Celebráció jelenik meg, a profil statisztikái frissülnek | |
| 1.6 | Indítsd újra ugyanazt a leckét | Más feladatok jönnek (véletlenszerű generálás) | |
| 1.7 | Kilépés gomb (📚 jobb felső) | Megerősítő párbeszéd, „Mégse” visszavisz a leckébe | |

---

## 2. Lecke-ellenőrző táblázatok

### 2.1 Számfogalom 10 000-ig

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.1.1 | Helyiérték 10 000-ig | `place-value-thousands` / 10000 | Pl. 7145 = 7 ezer + 1 százas + 4 tízes + 5 egyes; az **első blokkban beírás**, a másodikban válaszlista | |
| 2.1.2 | Számnevek 10 000-ig | `number-name` / 10000 | Mindkét irány: „hétezer-háromszázharminckilenc" ↔ 7339; a hibás opciók a szomszédos számok | |
| 2.1.3 | Szomszédok 10 000-ig | `neighbor` (komponens: `neighbor-round`) / 10000 | **Két blokk:** az első csak tízesre és százasra kerekítve (pl. 7483 → 7400 / 7500), a másodikban megjelenik az **ezres** lépcső is | |
| 2.1.4 | Összehasonlítás 10 000-ig | `comparison` / 10000 | Két kifejezés összehasonlítása, a jel illik a nagyságokra | |
| 2.1.5 | Római számok bővítve | `roman` / 4000 | XL, L, C, M jelek (pl. 43 = XLIII); mindkét irány | |
| 2.1.6 | Kerekítés 10 000-ig | `rounding` / 10000 | A célfelirat követi a kért helyet (tízesre / százasre / ezresre); opciók és beírás vegyesen | |
| 2.1.7 | Osztó és többszörös – az oszthatóság kezdete | `divisibility` / 100 | Négy mód: többszörös, nem-többszörös, osztó, hányszoros; a „-nek” toldalék helyes | |
| 2.1.8 | 📊 Táblázatok és diagramok | `data-chart` / 100 | Oszlopdiagram emojikkal; a kérdés lehet összeg, különbség vagy a legnagyobb/legkisebb | |

### 2.2 Írásbeli műveletek

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.2.1 | Írásbeli összeadás négyjegyűekkel | `written-operation` / 10000 | Átvitel több helyen is; az átviteli sor látható | |
| 2.2.2 | Írásbeli kivonás négyjegyűekkel | `written-operation` / 10000 | Négyjegyű − négyjegyű, az eredmény pozitív; **opció és beírás vegyesen** | |
| 2.2.3 | Írásbeli szorzás egyjegyűvel | `written-operation` / 1000 | Háromjegyű × egyjegyű | |
| 2.2.4 | Írásbeli szorzás kétjegyűvel | `written-operation` / 10000 | **Részszorzás** látható (pl. 21 × 14 → 84 és 21, összeg 294) | |
| 2.2.5 | Írásbeli osztás egyjegyűvel (maradékos) | `written-division` / 1000 | Lépcsős osztás: a közbenső részletek (8 → 2, majd 27 → 9) helyesek; a maradék megjelenik | |
| 2.2.6 | Írásbeli osztás kétjegyűvel (maradékos) | `written-division` / 10000 | Kétjegyű osztó (pl. 625 : 14 = 44 maradék 9); a lépcsők száma helyes | |
| 2.2.7 | Vegyes írásbeli műveletek | `written-operation` / 10000 | Kétjegyű számok, a 10 feladatos lecke a leghosszabb a műveletek között | |

### 2.3 Törtek

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.3.1 | Fele, harmada, negyede – nagyobb számok | `fraction-of` / 1000 | Pl. 820 fele = 410; a sávdiagram néha látható, a beírás mindig | |
| 2.3.2 | Törtek jelölése – számláló, nevező | `fraction` / 20 | A rajz (pl. 3/4 csoki) és a jelölés összhangja; **írásbeli és összehasonlító mód is van** | |
| 2.3.3 | Azonos nevezőjű törtek | `fraction-equal-den` / 20 | Azonos nevezővel a számláló dönt; összeadás és jelölés-összehasonlítás | |
| 2.3.4 | Tizedes törtek – a tized és a század | `decimal` / 100 | 3/10 = 0,3; a válasz **magyar tizedesponttal** (0,3) jelenik meg, a legegyszerűbb forma a helyes | |

### 2.4 Geometria

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.4.1 | 📐 Kerület | `perimeter` / 20 | Rácsos alakzat: a kerület a szegély, **nem** a terület (pl. 3×4 → 14) | |
| 2.4.2 | 🟦 Terület | `area` / 25 | A belső cellák száma (pl. 5×5 → 25) | |
| 2.4.3 | 🧱 Összetett alakzatok kerülete és területe | `compound-shape` / 100 | **A belső illesztési varratok nem számítanak a kerületbe** – ezt ellenőrizd a rajzon | |
| 2.4.4 | 🧮 Kerület és terület számolással | `shape-formula` / 100 | Négyzet, TEGLALAP, háromszög; a képlethez tartozó méretjelölés (a, b) helyes | |
| 2.4.5 | 📐 Szögek | `angles` / 180 | Derékszög / hegyes / tompa besorolás; a felirat szerinti kategória illik a számhoz | |
| 2.4.6 | Szögek mérése – szögmérővel és fokban | `angle-measure` / 180 | A rajz leolvasása: 0° és 180° körüli érték is jön | |
| 2.4.7 | 🪞 Tükrözés és szimmetria | `mirror` / – | Függőleges és vízszintes tengely; a tükrözött alakzat a helyes opció | |
| 2.4.8 | 🔷 Sokszögek és tulajdonságaik | `polygon` / – | Oldalak száma, átlók száma (pl. ötszög → 5 átló), tulajdonságok | |

### 2.5 Szöveges feladatok

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.5.1 | 📝 Többlépéses szöveges feladatok | `word-problem` / 1000 | Két lépés, a leképezés **világfüggő** (postás, konyha, foci…); a szöveg és a számok összhangja | |
| 2.5.2 | 📝 Arányos szöveges feladatok | `word-problem` / 1000 | Osztás arány szerint (pl. 738 levél harmada); a regiszterben `one-step` a skill, de tartalmilag arányos osztás | |

### 2.6 Gyakorlati tudások (mértékegységek, idő, pénz)

#### 2.6.1 Mértékegység-átváltás – a három lecke

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.6.1.1 | 📏 Hosszúság – a milliméterig, visszafelé is | `measure-units` / length / 1000 | 10 feladat: 4 + 4 + 2 | |
| 2.6.1.2 | 🥤 Űrtartalom – a milliliterig | `measure-units` / volume / 1000 | Ugyanígy 10 feladat | |
| 2.6.1.3 | ⚖️ Tömeg – a tonnáig, visszafelé is | `measure-units` / weight / 1000 | Ugyanígy 10 feladat | |

**Mindhárom leckében ellenőrizd ezeket:**

| # | Ellenőrzés | Várt eredmény | Eredmény |
|---|-----------|---------------|----------|
| a | Az 1. blokk (4 feladat) | Előre átváltás (nagyobb egység → kisebb): m→cm, l→dl, kg→g | |
| b | A 2. blokk (4 feladat) | Fordított átváltás: pl. 3000 g = 3 kg, 40 dl = 4 l, 30 cm = 3 dm. **Az összehasonlítás nem fordított**, ezért a visszafelé feladatok száma leckénként 0–4 a 10-ből (átlag 3, kb. 30%) – ez nem hiba | |
| c | A 3. blokk (2 feladat) | Csak egységválasztás: „🐜 Egy hangya hossza 5 ____” → mm | |
| d | Feladatformák | Mindegyik forma: válaszlista, beírás, egységválasztás, igaz-hamis, összehasonlítás (`< = >`). **A forma blokkonként véletlenül választott:** egy leckefuttatásban a négy vegyes forma mind az 5 csak kb. 90%-ban jelen meg (500 futásból mérve), a `unit` forma viszont mindig. Ha hiányzik egy, indítsd újra a leckét | |
| e | Összehasonlítás feladat | Két oldal különböző egységben, ahol az átváltás dönt: pl. `900 dkg > 4 kg` (90 kg vs 4 kg), `1 t = 1 000 000 g`. A kérdés fajtánként: „Melyik a hosszabb?" / „Melyik a nehezebb?" / „Melyikben van több?" | |
| f | Tárgyak | Minden kontextusos feladat előtt valós tárgy van, értelmes nagysággal (fa, vödör, elefánt, tojás…) | |
| g | Rejtett súgó | A súgó gomb **két hiba után** jelenik meg, a táblázat csak kattintásra | |
| h | Ugyanaz a lecke újra | Más feladatok jönnek (generátor véletlen) | |

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.6.2 | 📏 Távolságok és hosszúságok a valóságban | `length-units` | 10 feladat **két különböző formában**: 1. blokk kurált cm/m/km (3 opció, egységsúgó), 2. blokk a teljes mm–km létrával (4 opció) | |
| 2.6.3 | 🕐 Idő – óra és perc tartamok | `elapsed-time` / 60 | Kezdés/vég, eltelt idő számítása; az opciók nem a valós választ adják | |
| 2.6.4 | 💰 Vásárlás és visszajáró 10 000-ig | `money-change` / 10000 | 5000 vagy 10 000 Ft-tal fizet, 500–9800 Ft-os ár; a visszajáró **soha nem negatív** (2000 mintában 0 hiba) | |

---

## 3. Világok és készségtérkép

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 3.1 | Válts világot a profilból | A leckék jelenetei az adott világ címét/emo-ját mutatják | |
| 3.2 | Válassz ki egy leckét több különböző világban | A `worldTitles`-ek megjelennek, a feladat ugyanaz marad | |
| 3.3 | Válassz ki egy szöveges feladatot 3 világban | A feladat szövege világváltáskor is a világhoz igazodik (postás ≠ konyha) | |
| 3.4 | 📚 Készségek oldal | A leckék a megfelelő készséghez tartoznak; a törtek a „Törtek” kategóriában vannak, nem a „Számok” alatt | |

---

## 4. Weboldal- és telefonellenőrzés

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 4.1 | Ikon a fülön / PWA | Kék háttér, piros M betű gombszürke körvonallal | |
| 4.2 | Telefonméret (DevTools 375px) | A ☕ „Tippelj meg!” link NEM jelenik meg, a jobb felső gombok (súgó, 📚) koppinthatók | |
| 4.3 | Az összehasonlítás feladat mobilon | A két oldal és a `< = >` gombok nem csúsznak szét, a `min-width: 48px` érintési cél megmarad | |
| 4.4 | Asztali nézet | A ☕ „Tippelj meg!” link a jobb felső sarokban látható | |
| 4.5 | Hard reload / offline | Nincs konzolhiba; az app cache-ből is betölt (518 fájl, `matekido-v77`) | |

---

## 5. Ismert nyitott kérdések

| # | Kérdés | Megjegyzés |
|---|--------|------------|
| 5.1 | A 3. osztály leképezése a „Törtek” kategóriában | A `fraction-01/02/03` és `fraction-of-01` átkerült a `fractions` kategóriába; ellenőrizd, hogy a szűrő helyesen működik |
| 5.2 | A `length-units-01` súgója | Az 1. blokk egységsúgója a régi `length-units` komponensben van, a 2. blokk (`unit` mód) nem ad súgót |

---

## 6. Visszajelzés sablon

- **Lecke / lépés:** (pl. 2.2.4 – Írásbeli szorzás kétjegyűvel)
- **Elvárt:** …
- **Tapasztalt:** …
