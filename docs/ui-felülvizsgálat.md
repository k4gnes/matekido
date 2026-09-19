# Matekidő – UI/UX egységességi felülvizsgálat

*Dátum: 2026-09-18. Terjedelem: egységesség, használhatóság és megjelenés a főbb oldalakon (welcome, menü, témakörök, súgó, százalék, profil, szülői nézet, lecke/ünnep).*

Nem rossz az alap, de van néhány jól körülhatárolt javítás. Az alábbiak prioritás szerint sorba rendezve találhatók; mindegyiknél: mi a probléma, hol van, mi a teendő.

---

## Szembeötlő (gyors nyeremények)

### 1. Két kék szín egységesen

A design token `--primary: #4F86F7` (src/css/base.css:1-6), mégis sok helyen hardcoded `#4a90d9` van:

- CSS: `mult-prep.css:97`, `money-change.css:34`, `spatial.css:89-91`, `time.css:78-80`, `multiplication.css:62,86`, `pattern.css:120-122`, `skill-map.css:37,67`
- JS inline: `bridgeTen.js:131`, `decomposition.js:178,226`, `decompositionFindWrong.js:211`, `timeConvert.js:222`, `division.js:231`, `fractionOf.js:328`, `missingNumber.js:51`, `mixed.js:53`

**Teendő:** mindegyiket `var(--primary)`-ra cserélni.

### 2. A „Tovább" gomb többféle jelölése

Ugyanaz az akció, több címke és kinézet:

| Címke | Hol |
|---|---|
| `Tovább ▶` | `scene.js:65` |
| `➡️ Tovább` | `feedback.js:33-41` (közös út) |
| `➡️ Következő` | `celebration.js:25` |
| `➡️ N. osztály feladatai` | `app.js:362` |

**Teendő:** egy címke/jelölésrendszerre egységesítés (gyereknek zavaró, ha ugyanaz az akció másképp néz ki).

### 3. Régebbi feladatok saját üzenet+Tovább építőelemet használnak

A `pattern.js`, `time.js`, `spatial.js`, `decomposition.js`, `bridgeTen.js`, `decompositionFindWrong.js` saját üzenet- és Tovább-gombot építenek (`.time-message/.time-next`, `.spatial-message/.spatial-next`, `.pattern-message/.pattern-next` – a `time.css:57-83`, `spatial.css:68-94`, `pattern.css:99-124`), `#4a90d9`-es gombbal és vörös hiba-színnel, míg a többség a közös `feedback.js`-t használja.

**Teendő:** átemelni a közös `feedback.js`-re (egységes visszajelzés + Tovább gomb).

### 4. Témakörök oldal aktív állapota hibás

A `skillMap.js:22` `current: "lessons"`-t ad át, így a „Témakörök" (Témakör) oldalon a „📚 Leckék" pill tűnik aktívnak. Nincs külön állapot a Témakörök lapra.

**Teendő:** a navbar kapjon külön `current` értéket a Témakörökhöz (1-2 sor).

---

## Tisztaság (kód / letöltött állomány)

### 5. Holtsúly a cache-ben

A `practicePage.js` renderelője (`renderPracticePage`, `practicePage.js:104`), a `ui/profileCard.js` és a `lessonCard.js` **sehol nincs importálva**, mégis benne vannak az SW-cache listán (`sw-cache.js:44,74,101`). Csak a `getNextPracticeLesson` importált (`app.js:9`).

**Teendő:** a használaton kívüli fájlok törlése az src-ből és a `sw-cache.js`-ből, majd `node src/generateSWCache.js`.

### 6. Két, szétcsúszott típus-címkéző tábla

A `lessonMenu.js:87-149,155-216` és a `statsPage.js:27-130` külön `TYPE_EMOJI`/`TYPE_LABEL` táblát tartanak, eltérő kulcsokkal és címkékkel (pl. „Helyi érték" `statsPage` vs „Helyiérték" `lessonMenu`; `fraction` vs `weight`/`grouping`).

**Teendő:** egy közös forrásba kiszervezés (pl. `src/data/`).

---

## Kisebb, gyerekkoros tételek

### 7. Segítség- (💡) gomb csak 7 komponensben

A „💡 Segítséget kérek" gomb csak `addition.js:69`, `subtraction.js:69`, `mixed.js:100`, `estimate.js:62`, `writtenOperation.js:226`, `writtenDivision.js:121`, `remainderDivision.js:247` feladatokban van (2 hiba után), a súgó mégis „sok feladatnál van"-t ír (src/docs/sugo.md:51).

**Teendő:** vagy bővíteni a többi feladattípusra, vagy igazítani a súgó szövegét.

### 8. ARIA hiányosságok

- `numberInput.js` számbemenetének nincs `aria-label` („?" placeholderre hagyatkozik).
- `statsPage.js:263-270` `◀`/`▶` navigációs nyilak címkézetlenek.
- `welcomeScreen.js:72-81` „×" törlésgomb címkézetlen.
- Fókuszkezelés következetlen: `feedback.js:42` fókuszál a Továbbra, de `pattern.js`/`time.js`/`spatial.js`/`decomposition.js` nem; `scene.js` soha nem fókuszálja a „Kezdjük!"-et.

**Teendő:** `aria-label` a címkézetlen ikon-gombokra és a számbemenetre; egységes fókusz a fő műveletre.

---

## Amit nem bántanék (szándékos kialakítás)

- A **welcome** és a **szülői nézet** navbar nélküliségét – ott a belépés/visszalépés az egyetlen logikus út.
- A menü `mode-tab` / `filter-btn` sajátos szókincsét – viszonylag jól megkülönbözteti a feladatgomboktól.
- A `Témakörök` menü gombjának másodlagos (szürke) stílusát – ha ez tudatos hierarchia.

---

## Javasolt sorrend

1. **1–4** (szín egységesítés, Tovább-címke, régi feladat-építőelemek, Témakörök navbar) – ezek adják a legtöbbet a gyermek-UX-nek.
2. **5–6** (holtsúly, duplikált táblák) – kód- és letöltés-tisztaság.
3. **7–8** (segítség-gomb, ARIA) – érettségi szempontból.