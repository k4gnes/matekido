// Szülői összefoglaló: nincs válaszadatnál (pl. csak játék/gyakorló hét)
// ne jelenjen meg NaN%, és a még sosem játszott profil ne állítson hamisat.
//
// Futtatás: make test

const { weekSummaryText, lastPlayedText, hasAnswerData, favoriteRowsFor } = await import("./components/parentDashboard.js");
const { isTaskStep, isNameOnlyStep, lessonLines, taskAnswer, taskText } = await import("./utils/taskText.js");

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

// Kedvencek szűrése évfolyamra a szülői PDF-listához (készség + nehézség a sorokban).
const favIndex = {
    lessons: [
        { file: "a", title: "Szorzótábla", grades: [2], skill: "multiplication", difficulty: 2 },
        { file: "b", title: "Válogatós feladat", grades: [1, 2], skill: "sets", difficulty: 1 },
        { file: "c", title: "Harmadikos lecke", grades: [3], skill: "addition", difficulty: 3 }
    ]
};
const favPlayer = { profile: { grade: 2, favorites: ["a", "b", "c"] } };
const favRows = favoriteRowsFor(favPlayer, favIndex);
check(favRows.length === 2, `2. osztály: két kedvenc jön (kapott: ${favRows.length})`);
check(favRows[0].title === "Szorzótábla", "a sor címe megvan");
check(favRows[0].difficulty.includes("Gyakorló"), `nehézség címke: ${favRows[0].difficulty}`);
check(favRows[1].skill === "Válogatás", "gyerekbarát készségcímke a sets-höz");
check(favoriteRowsFor({ profile: { favorites: ["a"] } }, favIndex).length === 1, "nincs évfolyam: minden kedvenc jön");
check(favoriteRowsFor({ profile: { grade: 2, favorites: [] } }, favIndex).length === 0, "üres kedvenc: üres lista");
check(favoriteRowsFor(favPlayer, { lessons: [] }).length === 0, "ismeretlen fájl kihagyva");
check(favRows[0].file === "a", "a sor fájlja megvan (letöltéshez)");

// Feladatszöveg és megoldás a szülői PDF-hez (a játék komponensei nélkül).
check(taskText({ type: "exercise", kind: "addition", a: 7, b: 5 }) === "7 + 5 = ?", "alapművelet szövege");
check(taskText({ type: "missing-number", a: 7, sum: 12 }) === "7 + ? = 12", "hiányzó szám szövege");
check(taskText({ type: "calendar", question: "Hány hét van egy évben (kb.)?" }) === "Hány hét van egy évben (kb.)?", "kérdésszöveg átadása");
check(taskText({ type: "word-problem", text: "Annak 5 levele volt.", question: "Hány levele volt összesen?" }) === "Annak 5 levele volt. Hány levele volt összesen?", "szöveg + kérdés együtt");
check(taskText({ type: "shape-sort" }) === "🟦 Alakzatok", "ismeretlen típus: címke, nincs undefined");
check(!isTaskStep({ type: "scene" }) && !isTaskStep({ type: "celebration" }) && isTaskStep({ type: "table" }), "nem feladat lépések kiszűrése");

check(taskAnswer({ type: "exercise", kind: "addition", a: 7, b: 5 }) === "12", "alapművelet megoldása");
check(taskAnswer({ type: "exercise", kind: "mixed", a: 7, b: 5, op: "+" }) === "12", "vegyes művelet megoldása");
check(taskAnswer({ type: "comparison", operator: "<" }) === "<", "operátor megoldása");
check(taskAnswer({ type: "calendar", options: [50, 52, 48], answer: 1 }) === "52", "index-válasz feloldása");
check(taskAnswer({ type: "rounding", options: [90, 70, 80], answer: 90 }) === "90", "érték-válasz átadása");
check(taskAnswer({ type: "true-false", answer: true }) === "Igaz", "igaz/hamis megoldása");
check(taskAnswer({ type: "table", tfAnswer: false, statement: "2 × 10 = 20" }) === "Hamis", "tf-válasz megoldása");
check(taskAnswer({ type: "even-odd", answer: [2, 4] }) === "2, 4", "tömbválasz");
check(taskAnswer({ type: "transform", options: [[1, 2], [3, 4]], answer: 1 }) === "—", "alakzat-válasz jelölése");
check(taskAnswer({ type: "decomposition" }) === "—", "nincs megoldás: jelölés");

// Nem nyomtatható feladatok: a PDF-ben csak a nevük jelenik meg (óra, törtes rajz, egyperces).
check(taskText({ type: "time", hour: 6, minute: 30 }) === "🕐 Idő", "órás feladat: csak a név");
check(taskText({ type: "fraction" }) === "🍕 Törtek", "törtes feladat: csak a név");
check(taskText({ type: "root-play" }) === "🎲 Egyperces játék", "egyperces: név fallback");
check(taskAnswer({ type: "time", answer: "fél hét" }) === "—", "képes feladat: nincs megoldás a lapon");
check(taskAnswer({ type: "fraction", answer: 3 }) === "—", "törtes feladat: nincs megoldás a lapon");
check(!isNameOnlyStep({ type: "table" }) && isNameOnlyStep({ type: "fraction-divide" }) && isNameOnlyStep({ type: "addition-play" }), "név-only típusok");

const lines = lessonLines([
    { type: "time" },
    { type: "time" },
    { type: "table", a: 3, b: 4, answer: 12 },
    { type: "fraction" }
]);
check(lines.length === 3, `lessonLines: összefűzés (kapott: ${lines.length})`);
check(lines[0].nameOnly && lines[0].count === 2 && lines[0].text === "🕐 Idő", "azonos név-only sorok összevonva");
check(!lines[1].nameOnly && lines[1].text === "3 × 4 = ?" && lines[1].answer === "12", "normál feladat soronként");
check(lines[2].nameOnly && lines[2].answer === "—", "végén név-only sor");

if (failures > 0) {
    process.exitCode = 1;
} else {
    console.log("testParentStats: minden rendben.");
}
