// Szülői összefoglaló: nincs válaszadatnál (pl. csak játék/gyakorló hét)
// ne jelenjen meg NaN%, és a még sosem játszott profil ne állítson hamisat.
//
// Futtatás: make test

const { weekSummaryText, lastPlayedText, hasAnswerData } = await import("./components/parentDashboard.js");

let failures = 0;

function check(cond, message) {
    if (!cond) {
        failures++;
        console.error(`HIBA: ${message}`);
    }
}

const emptyWeek = weekSummaryText(0, 0, 0, 0);
check(emptyWeek === "Ezen a héten még nem játszott.", `üres hét: ${emptyWeek}`);

const playOnlyWeek = weekSummaryText(1, 0, 0, 1);
check(!playOnlyWeek.includes("NaN"), `játék-only hét nem NaN-es: ${playOnlyWeek}`);
check(playOnlyWeek.includes("1 lecke"), `játék-only hét megmutatja a leckét: ${playOnlyWeek}`);
check(playOnlyWeek.includes("– pontosság"), `játék-only hét kötőjel a pontosságnál: ${playOnlyWeek}`);

const normalWeek = weekSummaryText(5, 8, 2, 3);
check(normalWeek.includes("80% pontosság"), `rendes hét: ${normalWeek}`);

check(lastPlayedText(null) === "Még nem játszott", `null lastPlayed: ${lastPlayedText(null)}`);

const today = new Date().toISOString().split("T")[0];
check(lastPlayedText(today) === "Ma játszott", `mai dátum: ${lastPlayedText(today)}`);

check(!hasAnswerData(null), "nincs profil: nincs válaszadat");
check(!hasAnswerData({}), "üres profil: nincs válaszadat");

// csak játék/gyakorló nap: van leckeszám, de nincs válasz → a gyakorlás-lista üres,
// és nem állíthatja, hogy minden rendben van
const playOnlyDay = { dailyStats: { "2026-11-08": { correct: 0, wrong: 0, lessonsPlayed: 1 } } };
check(!hasAnswerData(playOnlyDay), "csak játék nap: nincs válaszadat");

const answeredDay = { dailyStats: { "2026-11-08": { correct: 3, wrong: 1, lessonsPlayed: 1 } } };
check(hasAnswerData(answeredDay), "van válaszadat");

if (failures > 0) {
    process.exitCode = 1;
} else {
    console.log("testParentStats: minden rendben.");
}
