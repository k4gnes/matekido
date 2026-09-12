# Matekidő – Félretétel / átugrás tesztforgatókönyv

Ennek a forgatókönyvnek a célja, hogy a **félretett (kihagyott / ⏭️ átugrott) feladatok** viselkedését a böngészőben kézzel végigellenőrizzük, és hogy mindenki számára érthető legyen: **miért éppen az a „következő feladat”, ami**. A dokumentum az aktuális (2026-09-12 utáni) viselkedést írja le.

- **Szerver:** `make start` (localhost:8000) – a `src/` mappát szolgálja ki.
- **Böngésző:** Asztali (Chrome / Firefox / Edge), egy lapon teszteljünk.
- **Jelölések:** ✅ működik · ❌ hibás · ⚠️ kisebb hiba / megjegyzés · ➖ nem érinti / átugorható.
- **Játékos:** hozz létre egy külön „Teszt Skip” profilt, hogy a kipróbálás ne keveredjen a saját haladással.

---

## 0. Előkészítés – tiszta indulás

1. Indítsd el a szervert: `make start`.
2. Nyisd meg: <http://localhost:8000>.
3. DevTools → Application → Local Storage: töröld a `matekido-users` és `matekido-profile` kulcsokat (vagy inkognitó ablakban tesztelj).
4. Hozz létre egy tesztjátékost, lépj a menübe, válaszd az **1. osztályt**.

---

## 1. A szabály – miért az a következő feladat?

Az **1. osztály** leckéi **rögzített sorrendben** vannak (1–42, lentebb a lista). Ezt hívjuk **„menet”-nek**. A félretétel szabálya:

> 1. Ha a jeleneten a **⏭️** gombbal kihagyod a feladatot, az a **kimaradt** listára kerül, és a következő feladat a menetben következő, **még meg nem oldott, nem kimaradt** feladat.
> 2. A kimaradt feladatok **ki vannak véve a menetből**: mindaddig **nem** jönnek vissza, amíg az összes nem kimaradt (a menetbeli) feladatot meg nem oldottad.
> 3. Amikor a menet összes feladata kész, a kimaradtak **a sorrendjük szerint** jönnek következőként.
> 4. Egy kimaradt feladat **megoldásával lekerül** a kimaradt listáról; ha még van másik kimaradt, az jön utána. Ha már semmi nincs hátra, a menet **elölről** folytatódik (ismétlés).

- A jeleneten a pozíciót az **„X. lecke a 42-ből”** felirat mutatja (X = pozíció az osztály sorrendjében).
- A menü **„➡️ Következő feladat”** kártyája ugyanezt a szabályt követi.
- **Osztályváltó (🔙 Osztály):** bármikor szabad – a kimaradt feladatok nem gátolják a váltást.

**A menet (1. osztály, 1–42):**

| # | Lecke | # | Lecke |
|---|---|---|---|
| 1 | 🧺 Halmazok és válogatás | 22 | Vegyes műveletek 20-ig |
| 2 | Kerek, szögletes és háromszög | 23 | ❓ Hiányzó tag 20-ig |
| 3 | Térbeli tájékozódás | 24 | ✅ Igaz vagy hamis? 20-ig |
| 4 | 🗓️ Naptár | 25 | 🕵️ Hibás számolás? 20-ig |
| 5 | Sorminta – mi a következő? | 26 | Melyik hosszabb? |
| 6 | Számok bontása 10-ig | 27 | Mérd meg négyzetekkel! |
| 7 | Keresd a kakukktojást! | 28 | Mennyi fér bele? 1. osztály |
| 8 | Kiegészítés 10-ig | 29 | Idő – egész és fél óra |
| 9 | Mi a következő? 50-ig | 30 | Fizesd ki pontosan! |
| 10 | Rendezzük sorainkat! 20-ig | 31 | Melyik pénztárcában van több? |
| 11 | Összehasonlítás 10-ig | 32 | Meg tudod venni? |
| 12 | Összehasonlítás 20-ig | 33 | Szöveges feladatok |
| 13 | Páros és páratlan 20-ig | 34 | 🧩 Egyenlő csoportok 20-ig |
| 14 | Helyiérték 100-ig | 35 | 🧩 Ismételt összeadás 20-ig |
| 15 | Helyiérték – tízes és egyes 100-ig | 36 | 🧩 Számolás kettesével, ötösével |
| 16 | Kiegészítés véletlen számig 20-ig | 37 | 📐 Hány oldala van? |
| 17 | Számok szomszédai 100-ig | 38 | 🧊 Térbeli testek |
| 18 | Összeadás 20-ig | 39 | 🌀 Forgatás |
| 19 | Összeadás 20-ig átlépéssel | 40 | Becslés 30-ig |
| 20 | Kivonás 20-ig | 41 | Kerekítés tízesre 100-ig |
| 21 | Tízesátlépés 20-ig | 42 | 📊 Melyikből van több? |

---

## 2. Gyors forgatókönyv (a lényeg, friss profilon)

Az **első 5 feladat** környékén játsszuk le; ehhez nem kell sokat megoldani.

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 2.1 | Menü → „➡️ Következő feladat” | Az **1.** feladat jelenete indul („1. lecke a 42-ből”) | |
| 2.2 | Oldd meg az 1. feladatot (Kezdés → válaszok → jubiláció → Tovább) | A következő a **2.** feladat („2. lecke a 42-ből”) | |
| 2.3 | A **2.** feladat jelenetén nyomd meg a **⏭️** gombot | A következő a **3.** feladat, a **2.** nem marad „megoldott” | |
| 2.4 | Menübe vissza | Megjelenik a **„⏭️ Átugrott feladatok (1)”** szekció a **2.** feladattal | |
| 2.5 | Térj vissza a játékhoz (a 3. feladattól), a **3.** feladat jelenetén is ⏭️ | A következő a **4.** feladat – **NEM a 2.** ⚠️ *ez volt a korábbi hiba, ezt kell ellenőrizni* | |
| 2.6 | Menübe vissza | **„⏭️ Átugrott feladatok (2)”**: előbb a **2.**, utána a **3.** feladat | |
| 2.7 | Nézd meg a „➡️ Következő feladat” kártyát a menüben | A **4.** feladatot ajánlja (nem a 2.-t, nem a 3.-t) | |
| 2.8 | Oldd meg a **4.** feladatot | A következő az **5.** feladat | |
| 2.9 | Menüből kattints a **3.** feladatra (az Átugrott szekcióban) és oldd meg | Jubiláció után a következő az **5.** feladat; a menüben már csak **„Átugrott feladatok (1)”** (a **2.**) marad | |

**Értelmezés:** a 2. és 3. feladatot félretettük → a menet a 4., 5., … folytatta; a félretettek csak a legvégére maradnak (lásd 3. szakasz).

---

## 3. Végigmenet – a félretettek a legvégén jönnek vissza *(hosszú, de ez a végső ellenőrzés)*

Folytasd a menetet a 2. szakasz állásától: **oldd meg a 5–42. feladatot sorban** (többé ne hagyj ki semmit).

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 3.1 | Oldd meg a 5–41. feladatot | A menet végigmegy, mindig a következő sorszám jön | |
| 3.2 | A **42.** feladat jubilációja után „Tovább” | A következő a **2.** feladat („2. lecke a 42-ből”) – **NEM** az 1. (visszakanyarodás) és nem a 42. ismétlése | |
| 3.3 | Oldd meg a **2.** feladatot | A következő a **3.** feladat (a másik félretett, eredeti sorrendben) | |
| 3.4 | Oldd meg a **3.** feladatot | Mind a 42 kész → a következő az **1.** feladat („1. lecke a 42-ből”), a menet elölről kezdődik | |
| 3.5 | Menübe vissza | „➡️ Következő feladat” = az **1.** feladat; **nincs** Átugrott szekció | |

*Sorrend-ellenőrzéshez a jelenet „X. lecke a 42-ből” felirata a legegyszerűbb támpont.* Ha nincs időd a teljes 42-leckés futtatásra, a lényegi ellenőrzés már a **2. szakaszban** megvan (a hibaügylet a 2.5 lépés).

---

## 4. Egyéb ellenőrzések (nem a fő menet)

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 4.1 | A **🔁 Erősítő feladatok** listából ⏭️-zd az elsőt | NEM kerül a kimaradt listára (a menü Átugrott szekciója nem változik), a lista következő Erősítő feladata jön | |
| 4.2 | A **❤️ Kedvenceim** listából ⏭️-zd az elsőt | Ugyanaz, mint 4.1 – nem számít félretételnek | |
| 4.3 | A **🎯 Gyakorlás** oldalon ⏭️-zd az elsőt | A következő gyakorló feladat jön, nem kerül a kimaradt listára | |
| 4.4 | Maradjon félretett feladat, és a menüben **🔙 Osztály** gombbal válts 2. osztályra | **Nem gátolja semmi:** a váltás szabadon működik | |
| 4.5 | Szülői nézet (profilválasztó alján **👨‍👩‍👧 Szülőknek**) | „⏭️ Kihagyott feladatok (N): <címek>” sor látszik | |
| 4.6 | Ugyanazt a feladatot kétszer hagyd ki (⏭️ kétszer ugyanazon a jeleneten) | A listán **egyszer** szerepel (nem duplázódik) | |
| 4.7 | Egy **már megoldott** feladatot ⏭️-zz ki, majd nézd meg a menü Átugrott szekcióját | ⚠️ `megoldott` is megjelenik átugrottként; jegyezd fel, ha ez szerinted hiba (a szabályozás: a megoldás nem távolítja el, mert kivételekor már kész volt) | |

---

## 5. Visszajelzés sablon

- **Lépés:** (pl. 2.5 – 3. feladat ⏭️)
- **Elvárt:** …
- **Tapasztalt:** …
- **Konzolhiba / screenshot:** (ha van)