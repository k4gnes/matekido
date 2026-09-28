# Matekidő – UI/UX egységességi felülvizsgálat

*Eredeti dátum: 2026-09-18. Felülvizsgálva: 2026-09-28 – minden pont lezárva.*

*Terjedelem: egységesség, használhatóság és megjelenés a főbb oldalakon (welcome, menü, témakörök, súgó, százalék, profil, szülői nézet, lecke/ünnep).*

---

## ✅ Szembeötlő (gyors nyeremények)

### 1. Két kék szín egységesen — ✅ kész
A hardcoded `#4a90d9` előfordulás megszűnt, mindenütt `var(--primary)`. (`base.css` design token.)

### 2. A „Tovább" gomb többféle jelölése — ✅ kész
Minden visszajelzési úton egységes `➡️ Tovább` (`ui/feedback.js`). A többi gomb más akciót jelöl, ezért más a felirata:
- `scene.js` – `Kezdjük!` (jelenet indítása) és `➡️ Tovább` (ugrás a következő feladatra)
- `lessonMenu.js` – `➡️ Következő feladat` (gyors ugrás a listán belül)
- `app.js` – `➡️ N. osztály feladatai` (menü-navigáció)

### 3. Régebbi feladatok saját üzenet+Tovább építőelemet használnak — ✅ kész
A `pattern.js`, `time.js`, `spatial.js`, `decompositionFindWrong.js` átállt a közös `ui/feedback.js`-re (0 saját `createButton`).
A `decomposition.js` és `bridgeTen.js` megtartja a saját gombját: ezek a *befejezés* gombja (minden bontás / összes tag megtalálva), nem a hibaválasz utáni visszajelzés.

### 4. Témakörök oldal aktív állapota hibás — ✅ kész, értelemszűnő lett
A `skillMap.js` már nem használ `createNavBar`-t, saját visszagombsorát építi, így nincs hamis „Leckék" aktív állapot.

---

## ✅ Tisztaság (kód / letöltött állomány)

### 5. Holtsúly a cache-ben — ✅ kész
A `ui/profileCard.js` és `lessonCard.js` már törölve van. A `practicePage.js` megmaradt, mert a `getNextPracticeLesson`-t az `app.js` importálja.

### 6. Két, szétcsúszott típus-címkéző tábla — ✅ kész
Mindkét oldal a közös `src/data/types.js`-ből (`TYPE_EMOJI`, `TYPE_LABEL`) olvas.

---

## ✅ Kisebb, gyerekkoros tételek

### 7. Segítség- (💡) gomb csak 7 komponensben — ✅ kész
Bővült 11 komponensre. A `docs/sugo.md` szövege pontosítva: a gomb a számolásos feladatoknál és néhány geometriai feladatnál érhető el, nem „sok feladatnál".

### 8. ARIA hiányosságok — ✅ kész
- `numberInput.js` – `aria-label="A válasz beírása"`
- `welcomeScreen.js` – `aria-label="Profil törlése"` a törlésgombon
- `statsPage.js` – nap-navigációs nyilak `aria-label`-lel
- `feedback.js` fókuszkezelés egységes (Tovább gomb), a `scene.js` fókuszál a `Kezdjük!`-re

---

## Amit nem bántottunk (szándékos kialakítás)

- A **welcome** és a **szülői nézet** navbar nélkülisége – ott a belépés/visszalépés az egyetlen logikus út.
- A menü `mode-tab` / `filter-btn` sajátos szókincse – jól megkülönbözteti a feladatgomboktól.
- A `Témakörök` menü gombjának másodlagos (szürke) stílusa.
