# Matekidő – 3. osztály manuális tesztforgatókönyv

Ennek a dokumentumnak a célja, hogy a **3. osztályos tananyagot** (22 lecke, 6 világ, számkör 1000-ig + szorzás/osztás 6, 7, 8, 9-es táblákkal) a böngészőben kézzel végigteszteljük: minden lecke helyesen épül fel, a feladatok a megjelölt tartományban vannak, a jó/rossz válasz kezelése helyes, és a lecke a celebrációval zárul.

- **Szerver:** `make start` (localhost:8000) – a `src/` mappát szolgálja ki.
- **Böngésző:** Asztali (Chrome / Firefox / Edge) + legalább egyszer telefon méretű nézet.
- **Jelölések:** ✅ működik · ❌ hibás · ⚠️ kisebb hiba / megjegyzés · ➖ nem érinti / átugorható.

---

## 0. Előkészítés

1. Indítsd el a szervert: `make start`, nyisd meg: <http://localhost:8000>.
2. DevTools → Application → Local Storage: töröld a `matekido-users` és `matekido-profile` kulcsokat (vagy tesztelj inkognitóban).
3. Hozz létre egy tesztjátékost (pl. „Teszt 3”).

---

## 1. Általános lecke-folyamat (minden leckére érvényes)

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 1.1 | Menüben válaszd ki a leckét | Scene (jelenet) szöveggel indul, világfüggő címmel és emojival | |
| 1.2 | Kattints a „Kezdés” gombra | Megjelenik az első feladat a progress-szal | |
| 1.3 | Válaszolj helyesen néhány feladatra | Pozitív visszajelzés, a számláló nő, a számok a lecke tartományán belül vannak (max. 1000) | |
| 1.4 | Válaszolj helytelenül valahol | Nincs büntetés, a lecke folytatódik | |
| 1.5 | Fejezd be a leckét | Celebráció jelenik meg, a profil statisztikái frissülnek | |
| 1.6 | Indítsd újra ugyanazt a leckét | Más feladatok jönnek (véletlenszerű generálás) | |
| 1.7 | Kilépés gomb (📚 jobb felső) | Megerősítő párbeszéd, „Mégse” visszavisz a leckébe | |

---

## 2. Lecke-ellenőrző táblázatok

### 2.1 Számfogalom 1000-ig

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.1.1 | Helyiérték 1000-ig | `place-value-hundreds` / 1000 | Százasok/tízesek/egyesek bontása (pl. 847 = 8 százas + 4 tízes + 7 egyes); a válasz `100·sz + 10·t + e` | |
| 2.1.2 | Számnevek 1000-ig | `number-name` | Szám ↔ szó párosítás mindkét irányban (pl. 542 = „ötszáznegyvenkettő”) | |
| 2.1.3 | Szomszédok 1000-ig | `neighbor-single` / 1000 | Egy adott szám szomszédai megadhatók | |
| 2.1.4 | Összehasonlítás 1000-ig | `comparison` / 1000 | Az értékek 1000-en belül, a jel illik az értékekhez | |
| 2.1.5 | Rendezzük sorainkat! 1000-ig | `order` / 1000 | A sor a kért irányba rendezhető 1000-ig | |
| 2.1.6 | Páros és páratlan 1000-ig | `even-odd` / 1000 | Besorolás helyes 1000-ig | |
| 2.1.7 | Kerekítsük kerekre! | `rounding` / 1000 | A kerekítés **tízesre és százasra** is (célfelirat követi: „tízesre”/„százasra”) | |
| 2.1.8 | Római számok | `roman` / 100 | I, V, X, L, C jelek; mindkét irány (szám → római, római → szám) | |

### 2.2 Műveletek 1000-ig

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.2.1 | Összeadás kerek százasokkal | `addition` / 1000 | Mindkét tag kerek százas; összeg ≤ 1000 | |
| 2.2.2 | Véletlen szám + kerek százas | `addition` / 1000 | Egy kerek százas tag, összeg ≤ 1000 | |
| 2.2.3 | Összeadás 1000-ig átlépés nélkül | `addition` / 1000 | Az egyesek összege < 10, a tízesek összege < 10 (nincs átlépés) | |
| 2.2.4 | Összeadás 1000-ig átlépéssel | `addition` / 1000 | Van átlépő feladat is (egyesek vagy tízesek összege ≥ 10) | |
| 2.2.5 | Kivonás kerek százasokkal | `subtraction` / 1000 | Kerek százasok, az eredmény ≥ 0 | |
| 2.2.6 | Véletlen szám − kerek százas | `subtraction` / 1000 | Kerek százas kivonandó, maximum 1000-ig | |
| 2.2.7 | Kivonás 1000-ig átlépés nélkül | `subtraction` / 1000 | A kivonás átlépés nélkül elvégezhető | |
| 2.2.8 | Kivonás 1000-ig átlépéssel | `subtraction` / 1000 | Van átlépő feladat is | |
| 2.2.9 | Vegyes műveletek 1000-ig | `mixed` / 1000 | + és − vegyesen, nagyobb számkörben | |

### 2.3 Szorzás és osztás bővítése (6, 7, 8, 9)

| # | Lecke | Típus / tartomány | Amire figyelj | Eredmény |
|---|-------|-------------------|---------------|----------|
| 2.3.1 | Szorzás 6, 7, 8, 9-es táblával | `table` / 100 | Mindkét tényező a 6/7/8/9 (felcserélhető sorrend); a szorzat ≤ 81 | |
| 2.3.2 | Hiányzó tényező 6, 7, 8, 9 | `missing-factor` / 100 | `a × ? = c` alak 6–9-es táblán, a válasz `c ÷ a` | |
| 2.3.3 | Szorzás és osztás kapcsolata 6-9 | `link` / 100 | Szorzatból osztás (pl. 9 × 7 = 63 → 63 ÷ 9 = 7) | |
| 2.3.4 | Osztás 6, 7, 8, 9-es táblával | `division-table` / 100 | Az osztó 6/7/8/9, az eredmény egész | |
| 2.3.5 | Vegyes szorzás és osztás 6-9 | `mixed-mult-div` / 100 | Szorzás és osztás keverve (6–9-es tábla) | |

---

## 3. Világok és készségtérkép

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 3.1 | Válts világot a profilból | A leckék jelenetei az adott világ címét/emo-ját mutatják | |
| 3.2 | Válassz ki egy leckét több különböző világban | A `worldTitles`-ek megjelennek, a feladat ugyanaz marad | |
| 3.3 | 📚 Készségek oldal | A helyiérték/1000-es feladatok a megfelelő készséghez tartoznak | |

## 4. Weboldal- és telefonellenőrzés

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 4.1 | Ikon a fülön / PWA | Piros háttér, fehér M betű | |
| 4.2 | Telefonméret (DevTools 375px) | A ☕ „Tippelj meg!” link NEM jelenik meg, a jobb felső gombok (súgó, 📚) koppinthatók | |
| 4.3 | Asztali nézet | A ☕ „Tippelj meg!” link a jobb felső sarokban látható | |
| 4.4 | Hard reload / offline | Nincs konzolhiba; az app cache-ből is betölt | |

---

## 5. Visszajelzés sablon

- **Lecke / lépés:** (pl. 2.3.5 – Vegyes szorzás és osztás)
- **Elvárt:** …
- **Tapasztalt:** …
- **Konzolhiba / screenshot:** (ha van)