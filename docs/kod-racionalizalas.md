# Kód racionalizálás – javaslatok

Összegyűjtött duplikációk és egyszerűsítési lehetőségek. Sorrend érték/munka arány szerint.

---

## 1. Egységes sikeres-válasz kezelés (legnagyobb haszon)

**Probléma:** A „jó válasz" logika (`answered` / `reported` / `mistakes` zászlók, ugyanazok a magyar üzenetek, automatikus továbblépés) kb. 20 komponensben külön-külön példányban létezik. A `setTimeout(() => next(), ...)` hívások 26 helyen vannak, eltérő időzítéssel (800–1600 ms) – ez okozza a villámgyors továbblépést.

A **➡️ Tovább** gomb eddig csak a 3 új feladattípusnál van fent (`wordProblem.js`, `estimate.js`, `trueFalse.js`). A régebbi ~15 komponens továbbra is magától lép tovább.

**Javaslat:** Közös `src/components/ui/feedback.js` segéd, pl.:

```js
createExerciseFeedback({ message, onResult, onAttempt, onNext })
```

- `success(text)` → üzenet + kék „➡️ Tovább" gomb (nincs időzítő)
- `retry()` → egységes „🙂 Majdnem!…" / „🤔 Még nem sikerült." üzenetek
- Egy helyen kezelt `onResult` / `onAttempt` jelentés

**Haszon:** minden leckében azonos viselkedés, a Tovább gomb globálisan megjelenik, a korábbi „felvillan és továbblép" panasz véglegesen megoldódik.

**Kockázat:** közepes – sok fájlt érint, komponensenként kis igazítás kell. Lépésekben, feladattípus-csoportonként érdemes.

---

## 2. `makeOptions` kilencszer duplikálva

**Probléma:** A válaszlehetőség-generátor 8 komponensben helyi másolatként létezik, pedig kész van közös változat:

- Közös: `src/components/ui/optionHelper.js`
- Helyi másolat: `addition.js`, `subtraction.js`, `mixed.js`, `missingNumber.js`, `neighbor.js`, `neighborSingle.js`, `sequence.js`, `multPrep.js`
- Rokona: `wordProblem.js` saját `makeStepOptions`-ja

**Javaslat:** mindenhonnan az `optionHelper.js`-ből importálás, a helyi másolatok törlése (~80 sor).

**Megjegyzés:** apró viselkedésbeli különbség – a csali-válaszok távolsági listája eltér (`4,-4` vs `10,-10` lépések). Vizuálisan nem vehető észre, de teszteléskor számolni kell vele.

---

## 3. `Game.js` – `isCounted`

**Probléma:** `src/engine/Game.js:153` – egy 35 tagú `s.type === "..."` lánc.

**Javaslat:** modul-szintű `Set`, pl.:

```js
const COUNTED_TYPES = new Set(["exercise", "missing-number", "estimate", ...]);
const isCounted = s => COUNTED_TYPES.has(s.type);
```

Olvashatóbb, új típusnál egy sor hozzáadás. (Hosszabb távon a renderer-switch is lehet regisztrációs térkép, de az nagyobb átalakítás.)

---

## 4. Kisebb szépséghibák (lassan, érintésenként)

| Téma | Hol | Javaslat |
|---|---|---|
| Azonos opciólista-építés 4× | `wordProblem.js` (join/compare/multiply/divide) | egy belső segédfüggvény |
| ~90%-ban azonos komponensek | `estimate.js` + `trueFalse.js` | közös „választós feladat" alap, ha jön új típus |
| Inline `cssText` stílusok | `bridgeTen.js`, `decompositionFindWrong.js`, `profilePage.js`, `practicePage.js` | CSS osztályokba (egységes stíluskezelés) |
| localStorage try/catch boilerplate | `lessonMenu.js`, `UserManager.js`, `Profile.js` | kis `storage.js` util (`load`/`save` fallbackkel) |

---

## Elvégezett részlegesen (2026-08)

- ✅ **1. pont kész:** `src/components/ui/feedback.js` (`createFeedback`) – 25 komponens migrálva (`addition`, `subtraction`, `mixed`, `missingNumber`, `neighbor`, `neighborSingle`, `sequence`, `placeValue`, `placeValueTwoInput`, `missingOperand`, `multPrep`, `multiplication`, `division`, `comparison`, `moneyCompare`, `measureCompare`, `moneyEnough`, `evenOdd`, `order`, `shapeSort`, `moneyPay`, `measureSquares`, `wordProblem`, `estimate`, `trueFalse`). A `retry(customText)` opcionális egyedi üzenetet is fogad (pl. `moneyPay`, `measureSquares`). A `.wp-next` / `.est-next` / `.tf-next` CSS-osztályok törölve, helyette a közös `.next-btn` (`base.css`).
- ⚠️ Nem migrált (szándékosan): `bridgeTen.js` és `decompositionFindWrong.js` – saját kizárásos mechanikájuk van (rossz opció kiszürkül), a Tovább gomb náluk már korábban megvolt; `pattern.js`, `time.js`, `spatial.js` – saját Tovább-implementációval működnek, később egységesíthetők.
- ✅ Kék válaszgombok egységesen minden választós feladattípusnál
- ⚠️ `optionHelper.js` létezik, de csak részben használt (2. pont)

## Javasolt sorrend

**1 → 2 → 3**, a 4-es csoport lassan, funkció-érintéskor.
Minden lépés után manuális böngészős ellenőrzés (nincs automatizált teszt), és új fájl esetén `node src/generateSWCache.js`.
