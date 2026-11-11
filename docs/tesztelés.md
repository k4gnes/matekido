# Matekidő – Manuális tesztforgatókönyv

Ez a dokumentum a Matekidő **teljes újbóli teszteléséhez** készült, előről indulva. Célja, hogy a böngészőben végighaladva minden fő képernyőt és a **legfontosabb feladattípusokat** ellenőrizzük.

- **Szerver:** `make start` (localhost:8000) – a `src/` mappát szolgálja ki.
- **Böngésző:** Asztali (Chrome / Firefox / Edge), egy lapon teszteljünk.
- **Jelölések:** ✅ működik · ❌ hibás · ⚠️ kisebb hiba / megjegyzés · ➖ nem érinti/átugorható.
- Az első indítás előtt **ürítsd a régi localStorage-t**, hogy tiszta állapotból induljunk.

---

## 0. Előkészítés – tiszta indulás

1. Indítsd el a szervert: `make start`.
2. Nyisd meg: <http://localhost:8000>.
3. A DevTools **Application → Local Storage** fülön töröld a `matekido-users` és `matekido-profile` kulcsokat (vagy inkognitó ablakban tesztelj), hogy friss profillal indulj.

---

## 1. Üdvözlő képernyő és játékoskezelés

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 1.1 | Nyisd meg az appot | „📚 Matekidő – Ki játszik ma?” üdvözlőképernyő, alul „Új játékos” (＋) kártya | |
| 1.2 | Kattints az „Új játékos”-ra | Megjelenik a modál: név input, avatar-rács, osztályválasztó („Melyik osztályos vagy?”), „Mégse” és „Hozzáadás” gomb | |
| 1.3 | A „Hozzáadás” gomb inaktív (disabled), amíg üres a név | Ha nincs név, a gomb szürke/letiltott | |
| 1.4 | Írj be egy nevet (pl. „Mezei Zsófi”), válassz avatart és osztályt, kattints „Hozzáadás”-ra | Bezárul a modál, megjelenik a játékoskártya a nevvel és az avatarral, ⭐0 📚0 🔥0 | |
| 1.4b | Ezután kattints a játékosra | A menü az **osztályválasztóban megadott osztály** feladatait mutatja (nem alapból az 1.) | |
| 1.5 | Adj hozzá egy második játékost is (pl. „Kiss Áron”) | Két játékoskártya jelenik meg, az első adatai változatlanok | |
| 1.6 | Kattints az első játékos kártyájára | A kártya kijelölésre kerül (aktív), és a menübe lép | |

**Megjegyzés:** a képernyő tetején lévő „👤 Játékos” gomb a menüben vált játékost (üdvözlőképernyőre visz vissza).

---

## 2. Lecke menü és szűrők

Menübe lépve van egy 📮-jellegű világcím (világfüggő), a logó (M ikon) melletti „atekidő” felirat, a támogató kiscsésze, felül a `👤 Profilom` gomb a játékosavatár-névvel, alatta három gomb: `🔍 Szűrők`, `📚 Készségek`, `❓ Súgó`.

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 2.1 | Nézd meg a menü felépítését | Osztályok szerinti szekciók: „1. osztály”, „2. osztály”, „3. osztály”, „4. osztály”, „5. osztály”, minden lecke kártyával (neve, globusz, csillag) | |
| 2.2 | Kövesd a „atekidő” címben lévő ☕ linket | Hoverre világosabb lesz, és megjelenik a „Támogatás” tooltip; kattintva új fülön a ko-fi.com oldal nyílik | |
| 2.3 | Kattints a `🔍 Szűrők` gombra | Megnyílik a szűrőpanel, a gomb „Szűrők ▲”-ra vált | |
| 2.4 | Szűrj „3. osztály” osztályra | Csak a 3. osztályos leckék látszanak, felül „N találat” | |
| 2.5 | Szűrj nehézségre/ típusra is (pl. „Szorzótábla”) | A találatok ennek megfelelően szűrődnek | |
| 2.6 | Kapcsold ki a szűrőket | Visszaáll az osztályos nézet | |
| 2.7 | Kattints a `📚 Készségek` gombra | Megnyílik a készségtérkép; a vissza gombbal a menübe térít | |
| 2.8 | Kattints a `❓ Súgó` gombra | Megnyílik a súgó; vissza gombbal a menübe térít | |

---

## 3. Új 3. osztályos leckék – szorzás-osztás 6, 7, 8, 9

A 3. osztály „Szorzás és osztás bővítése” részében 5 új leckét kell látnod.

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 3.1 | Lépj a „3. osztály” szekcióba, keresd meg a „Szorzás 6, 7, 8, 9-es táblával” leckét | Megtalálható, kattintható | |
| 3.2 | Indítsd el a leckét | Scene (jelenet) szöveggel indul, majd feladatok: `a × b = ?` szorzások, a `a` a 6/7/8/9 táblából való | |
| 3.3 | Oldd meg a feladatokat vegyesen (jó és rossz) | A pontszám/progressz követi a válaszokat, a végén celebráció | |
| 3.4 | „❓ Hiányzó tényező 6, 7, 8, 9” lecke | `6 × ? = 42` típusú feladatok, a `?` helyes kitöltése | |
| 3.5 | „Szorzás és osztás kapcsolata 6-9” lecke | `56 ÷ 7 = ?` típusú (szorzásból osztás) feladatok | |
| 3.6 | „Osztás 6, 7, 8, 9-es táblával” lecke | `48 ÷ 6 = ?`, `56 ÷ 8 = ?` típusú feladatok | |
| 3.7 | „Vegyes szorzás és osztás 6-9” lecke | Szorzás és osztás feladatok keverve egy leckében | |
| 3.8 | Ellenőrizd a feladatok számát és a válaszok jóságát | Minden feladattípus helyesen ítéli meg a helyes/helytelen választ | |

**Hiba esetén** jegyezd le, melyik típus (table / missing-factor / link / division-table) rossz.

---

## 4. Lecke-futás: pontozás és feladattípusok

Egy korábbi (1. osztályos) leckén gyorsan ellenőrizd a játékmenetet:

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 4.1 | Indíts egy egyszerű 1. osztályos leckét | Cinematic scene indul, „Kezdés” gombbal a feladatra lépsz | |
| 4.2 | Válaszolj helyesen néhány feladatra | A progress (pl. „2 / 5”) nő, helyes válasznál pozitív visszajelzés | |
| 4.3 | Válaszolj helytelenül valahol | A játék nem büntet (csak rögzíti), a következő feladatra lép | |
| 4.4 | Ha van készségtérkép-gomb a leckén belül (súgó) | Megnyílik, vissza hozható, a lecke állapota nem vész el | | ez nem tudom hol fordulhat elő
| 4.5 | Fejezd be a leckét | Celebráció jelenik meg a csillag/feloldás jutalommal | |
| 4.6 | 6 napocskás világban teljesítsd a napi küldetést (7. napocska) | A celebráció „🎖️ Jelvény megszerezve!” blokkot mutat a világikon + névvel, pop-animációval; kattintás a profilra visz, ahol a jelvény a sávban színes | |

Ezt a lépéskört **futtasd végig a főbb feladattípusokon is**, hogy mindegyik render módját ellenőrizd. Gyors lista:

- Összeadás / Kivonás (bevitel, választás)
- Hiányzó szám, Hiányzó tag
- Összehasonlítás (nagyobb/kisebb)
- Szomszédok, Sorba rendezés
- Páros-páratlan, Számsor/sorminta
- Helyi érték (1. és 3. o.)
- Idő, Pénz (fizetés/visszajáró/elég-e)
- Szöveges feladat, Becslés, Igaz-hamis
- Szorzás-osztás (2. o.: 2,3,4,5,10; 3. o.: 6,7,8,9)
- Geometria (alakzatok, téridomok)

---

## 5. Profil oldal

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 5.1 | Kattints a `👤 Profilom` gombra a menüben | Megnyílik a profiloldal: avatar, „Saját …” cím, név, 4 stat (📚 lecke, ⭐ csillag, 🔥 nap, ✨ hiba nélkül) | |
| 5.2 | Ellenőrizd a „🏅 Világjelvények · 7 napocska” sávot | 7 világikon a haladás-sáv felett; 7 napocskás világnál színre vált és karikát kap; hoverrel a tooltip „x/7 napocska” vagy „megszerezve ✓” | |
| 5.3 | Ellenőrizd a haladás-sávot | A „k Következő cél: X / Y” progress-sáv a teljesítéshez igazodik | |
| 5.4 | Ellenőrizd a „📅 Mai küldetés” részt | 3-pontos kvótasáv (0/3, 1/3 …), szöveg: „x/3 lecke teljesítve” | |
| 5.5 | „🏆 Teljesítmények” | Megjelennek a feloldott és lezárt teljesítmények, a feloldottak ✓ jellel | |
| 5.6 | „🌍 Világok” | Megjelennek a világok; a feloldott, de nem aktív világ kattintásra aktiválódik és újratölti az oldalt | |
| 5.7 | Válts világot | Ha elég ⭐ van, kattintással válts; a menü cím (pl. a „Matekidő” felirat enoji) is változik | |
| 5.8 | Az alsó gombok: `📋 Értékek`, `📚 Leckék`, `🎯 Gyakorlás`, `❓ Súgó` | Mind a megfelelő képernyőre visz | |

---

## 6. Statisztika

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 6.1 | Nyisd meg a `📋 Értékek` oldalt a profilból | A világ szerinti jelentés (pl. „📬 Postai jelentés”), napi statisztikák, készség-százalékok megjelennek | |
| 6.2 | Válts a statisztika és a profil között | A Vissza gomb a profilra, a „Leckék” a menüre visz | |
| 6.3 | Üres profillal nyisd meg a `📋 Értékek` → „📈 Összesített” fület | Pontosság „–” (nem 0%), a jegyzet „Még nincs adat – játssz egy leckét!”, és **nem** jelenik meg üres „📊 Készségek” szekció | |
| 6.4 | Egyperces játék után nézd meg ugyanezt a fület | „Van lecke, de nincs válaszadat – csak játék/gyakorlás volt.” (nem „játssz egy leckét!”) | |
| 6.5 | Válts a `📅 Napi` fület, és lépkedj `◀ ▶` napokkal | Pontosság üres napnál „–”; a jegyzet üres napnál „Erre a napra még nincs adat.”, csak játékos napnál „Erre a napra csak játék/gyakorlás volt, nincs válaszadat.” | |

---

## 6b. Szülői összefoglaló

A szülői nézet a profil oldalnavbarjából a `👪 Szülői` gombbal nyílik. Három állapotot érdemes végigpróbálni: **üres profil**, **csak egyperces játék** (ebben nincs válaszadat), **vegyes hét** (lecke + válasz).

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 6b.1 | Üres profillal nyisd meg a `👪 Szülői` oldalt | Játékoskártya: „Még nem játszott”, 🎯 pontosság helyett „–”, a heti összefoglaló „Ezen a héten még nem játszott.” | |
| 6b.2 | Ugyanitt nézd a „Gyakorlásra javasolt” részt | **Nem** állítja, hogy „Minden rendben”: „Nincs még válaszadat – a lista a válaszok alapján készül.” | |
| 6b.3 | Játssz végig egy egyperces játékot (pl. 🎲 Szorzótábla-játék), majd frissítsd a szülői oldalt | A heti összefoglalóban **nincs NaN%**: „📚 1 lecke · 🎯 – pontosság · 📅 1/7 nap”; a sáv mellett „1”, a szürke legenda felirata „nincs válaszadat” | |
| 6b.4 | Vidd az egeret a szürke sávra | Tooltip: „… – 1 lecke, nincs válaszadat” (nem „nem játszott”) | |
| 6b.5 | Nézd meg a játékos kártyáját és a szülői nézetet | Nincs nyomtató- és PDF-gomb sehol: a „📄 Kedvencek listája” belépő CSS-ből elrejtve (`.favorites-export-btn { display: none }`), „Mentés PDF-ként” gomb nincs, `@media print` szabály nincs – a honlap interaktív, nem nyomtatunk. A kedvencek listája kódban megmaradt (panel: cím, dátum, feladatsorok válaszvonallal, „☑ Megoldások” kapcsoló, „✗ Bezárás”), csak belépője nincs | |
| 6b.5 | Játssz egy valódi leckét (van számozott feladat), majd frissítsd | A heti összefoglalóban valós százalék (pl. „🎯 80% pontosság”), a sáv színe zöld/sárga/piros a pontosság szerint | |
| 6b.6 | Lapozz vissza `◀` hetekkel | A heti összefoglaló és a dátumcsík követi a lapozást; a legkorábbi rögzített dátumnál a `◀` letiltva | |
| 6b.7 | Olyan játékossal, akinek van kihagyott feladata | Megjelenik a „⏭️ Kihagyott feladatok (N): …” sor a kártya alján | |
| 6b.8 | Menj vissza a profilra | A „Legutóbb játszott” felirat valós („Ma játszott” / „Tegnap játszott” / „X napja játszott”), üres profilnál „Még nem játszott” | |

---

## 7. Gyakorlás

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 7.1 | Ha van gyenge lecke (hibás helyek) | A profilban megjelenik a `🎯 Gyakorlás (N)` gomb | |
| 7.2 | Kattints a Gyakorlás-ra | A gyenge leckék listája jelenik meg, indítható | |
| 7.3 | Indíts egy gyenge leckét, oldd meg újra | A lecke feladatai ismétlődnek, a statisztikák frissülnek | |

*(Ha nincs gyenge lecke, ezt a lépést át lehet ugrani.)*

---

## 7b. Felmérés – ⏱️ Időmérő üzemmód

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 7b.1 | Legyen legalább két kedvenc lecke, majd a menüben kattints a `❤️ Kedvenceim (N)` kártyára | Megnyílik a kedvencek listája (a leckék címei) és három gomb: `⏱️ Időmérő`, `🎲 Játék`, `✗ Bezárás` – lecke még nem indul | |
| 7b.2 | Válaszd a `🎲 Játék`-ot | Pontosan a régi viselkedés: ugyanaz a leckefutás, nincs külön óra, a celebráción van `🔁 Újra` | |
| 7b.3 | Nyisd meg újra, válaszd az `⏱️ Időmérő`-t | Jobb alul folyamatosan fut az összidő (`⏱️` pill), a kedvencek sorban jönnek | |
| 7b.4 | Nézd meg a leckék végén a celebrációs képernyőt | Nincs `🔁 Újra` gomb (csak `➡️ Tovább` és a navbar), az idő látszik | |
| 7b.5 | Az utolsó lecke celebrációján | `📝 Kiértékelés` doboz: összidő, helyes/hibás darabszám, leckénkénti idő és hibaszám; az első futásnál még nincs „Korábbi futások” | |
| 7b.6 | Indítsd el ugyanezt a kedvenc-listát másodszor, és fejezd be | A kiértékelésben „Korábbi futások” lista dátummal, idővel és hibaszámmal (a legtöbb hibás futás „· legtöbb hiba” jelöléssel), alatta „Előzőhöz képest: hiba: … → … · idő: … → …”; a sor fölé vive az egeret a tooltip kiírja, **mely kedvenc leckékből** állt az a futás | |
| 7b.7 | Nyisd meg a Profil oldalt | A `🏆 Teljesítmények` szekció **alatt, a bal oldali oszlopban** ott a `📝 Felmérések` lista, **kétoszlopos sorokkal**: balra a dátum + kedvencek száma, jobbra egybezártan `⏱ idő · ✅ helyes · ❌ hibás` (egyik szám sem törik át új sorra) – a sor fölé vive az egeret tooltip mutatja, **mely kedvenc leckékből** állt a felmérés (listajelöléssel); a korábbi futások visszanézhetők (legfeljebb 30) | |
| 7b.8 | Felmérés közben kattints a `📚 Leckék` (kilépés) gombra, és nézd a menüt | Az óra eltűnik, nem marad lebegő időmérő a menü felett | |

*(A felmérés csak a kedvencek listájáról indul; a szülői „Kedvencek listája” panel továbbra is rejtve.)*

---

## 8. Játékosváltás és profilok

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 8.1 | A menüből `👤 Játékos` gombbal térj vissza | Üdvözlőképernyő, a két játékos listája | |
| 8.2 | Válts a másik játékosra | A másik játékos önálló profilja (üres/korábbi adatok), a menü az ő nevét/Avatarját mutatja | |
| 8.3 | A játékoskártya „×” gombjával törölj egy játékost | Megerősítő párbeszéd jelenik meg; „Törlés”-re a játékos és adatai törlődnek | |
| 8.4 | Játékos A beállít egy osztályt és a Saját listában szűrőt; válts B-re, majd vissza A-ra | A saját osztálya, szűrői és a Saját lista nézete visszaáll B saját beállításai nélkül (nincs keveredés) | |

---

## 9. Offline / PWA (kiegészítő, ha fontos)

| # | Lépés | Várt eredmény | Eredmény |
|---|-------|---------------|----------|
| 9.1 | Frissítsd a lapot (hard reload) | Nincs konzolhiba, az app betölt | |
| 9.2 | Érhető el a `/manifest.webmanifest` és a service worker | Telepíthetőség (ha HTTPS/localhost) | |
| 9.3 | Repülőgép-mód / offline | Az egész app (minden lecke) elérhető a cache-ből | |

---

## 10. Visszajelzés

A teszt végén gyűjtsd össze a tapasztalt hibákat az alábbi sablonnal:

- **Képernyő / lépés:** (pl. 3.5 – link feladat)
- **Elvárt:** …
- **Tapasztalt:** …
- **Konzolhiba / screenshot:** (ha van)

---

## Függelék – a tesztelendő új 3. osztályos leckék

| Azonosító (index) | Cím | Típus |
|---|---|---|
| `multiplication-6789-01` | Szorzás 6, 7, 8, 9-es táblával | `table` |
| `missing-factor-6789-01` | Hiányzó tényező 6, 7, 8, 9 | `missing-factor` |
| `multiplication-link-6789-01` | Szorzás és osztás kapcsolata 6-9 | `link` |
| `division-6789-01` | Osztás 6, 7, 8, 9-es táblával | `division-table` |
| `mixed-mult-div-6789-01` | Vegyes szorzás és osztás 6-9 | `table` + `division-table` |
