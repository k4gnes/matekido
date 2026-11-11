// Felmérés (⏱️ Időmérő) üzemmód: a futás összesítése, a korábbi futásokkal való
// összevetés és a profilba mentett lista.
//
// Futtatás: make test

const store = {};

globalThis.localStorage = {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; }
};

const {
    formatDuration,
    runKey,
    beginRun,
    recordRunLesson,
    runSeconds,
    finishRun,
    previousRuns,
    worstRunIndex,
    compareText,
    runTooltip
} = await import("./utils/assessment.js");
const { createPlayer } = await import("./profile/UserManager.js");
const { recordAssessment, getAssessments } = await import("./profile/Profile.js");

let failures = 0;

function check(cond, message) {
    if (!cond) {
        failures++;
        console.error(`HIBA: ${message}`);
    }
}

// Idő formázása
check(formatDuration(12) === "12 mp", "12 másodperc „12 mp”");
check(formatDuration(125) === "2:05", "125 másodperc „2:05”");
check(formatDuration(0) === "0 mp", "0 másodperc „0 mp”");
check(formatDuration(undefined) === "0 mp", "hiányzó idő nem NaN");

// A kedvenc-halmaz kulcsa a sorrendtől független
check(runKey(["b", "a"]) === runKey(["a", "b"]), "a lista sorrendje nem számít a kulcsnál");
check(runKey(["a"]) !== runKey(["a", "b"]), "más halmaz más kulcs");

// Futás: felhalmozódó idő és összesítés
beginRun(["a.json", "b.json"], 1000);
recordRunLesson({ file: "a.json", title: "A", seconds: 60, correct: 4, wrong: 1 });
recordRunLesson({ file: "b.json", title: "B", seconds: 45, correct: 5, wrong: 0 });
check(runSeconds(30) === 135, "a látható óra: elvégzett leckék + futó lecke");
check(runSeconds() === 105, "múlt leckék ideje összeadódik");

const summary = finishRun(60000);
check(summary.seconds === 105, "az összidő a leckék idejének összege");
check(summary.correct === 9 && summary.wrong === 1, "a helyes és hibás válaszok összege");
check(summary.lessons.length === 2 && summary.lessons[0].title === "A", "leckénkénti bontás");
check(summary.key === runKey(["b.json", "a.json"]), "a mentett kulcs ugyanaz a halmaz");
check(summary.date === new Date(60000).toISOString().slice(0, 10), "a dátum a befejezés napja");
check(summary.label === "2 kedvenc", "a lista felirata");

check(finishRun(60000) === null, "a futás egyszer zárható le");
recordRunLesson({ file: "c.json", seconds: 10, correct: 1, wrong: 0 });
check(finishRun(60000) === null, "lezárt futásba nem jön új lecke");

// Korábbi futások ugyanarra a halmazra
const older = [
    { key: summary.key, startedAt: 30, wrong: 3, seconds: 200 },
    { key: "másik", startedAt: 20, wrong: 5, seconds: 99 },
    { key: summary.key, startedAt: 10, wrong: 0, seconds: 120 }
];
const history = previousRuns(older, summary.key, summary.startedAt);
check(history.length === 2, "csak ugyanaz a kedvenc-halmaz jön ki");
check(history.every(r => r.key === summary.key), "nem keveredik más halmaz futása");
check(previousRuns(older, summary.key, 30).length === 1, "a mostani futás kimarad az összevetésből");
check(worstRunIndex(history) === 0, "a legtöbb hibás futás azonosítva");
check(worstRunIndex([{ wrong: 0 }, { wrong: 0 }]) === -1, "hiba nélkül nincs jelölés");
check(previousRuns(null, "x").length === 0, "üres lista nem hibázik");

// Semleges összehasonlítás az előző futással
check(compareText({ wrong: 1, seconds: 270 }, { wrong: 2, seconds: 300 }) === "hiba: 2 → 1 · idő: 5:00 → 4:30",
    "a szöveg a hibát és az időt is megmutatja");
check(compareText({ wrong: 1, seconds: 60 }, null) === null, "előző futás nélkül nincs összehasonlítás");

// Tooltip: mely kedvenc leckékből állt a felmérés
const tip = runTooltip({ lessons: [{ title: "Szorzótábla" }, { title: null, file: "b.json" }] }, "2026. 11. 11.");
check(tip.split("\n").length === 3, "a tooltip fejléce + a két lecke");
check(tip.includes("• Szorzótábla") && tip.includes("• b.json"), "a leckék címei a tooltipben");
check(runTooltip({ files: ["a.json"] }).includes("• a.json"), "cím nélküli futásnál a fájlnév marad");
check(runTooltip(null) === "", "adat nélkül üres tooltip");

// Profilba mentett lista: legelöl az új, legfeljebb 30 tétel
createPlayer("Felmérő", "🦊", 1);

for (let i = 0; i < 33; i++) {
    recordAssessment({ ...summary, startedAt: i });
}

const saved = getAssessments();
check(saved.length === 30, "legfeljebb 30 futás marad a profilban");
check(saved[0].startedAt === 32, "a legfrissebb futás van legelöl");

// A kedvencek-lista választója: három gomb, a lista címeivel, és a választás átadása
function fakeElement(tag) {
    return {
        tag,
        children: [],
        className: "",
        textContent: "",
        handlers: {},
        classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
        append(...nodes) { this.children.push(...nodes); },
        addEventListener(type, fn) { this.handlers[type] = fn; },
        setAttribute() {},
        remove() {},
        querySelector: () => null
    };
}

globalThis.document = {
    createElement: (tag) => fakeElement(tag),
    querySelector: () => null,
    body: fakeElement("body")
};

const { openFavoritesChooser } = await import("./components/favoritesChooser.js");

let chosen = null;
openFavoritesChooser({
    lessons: [{ file: "a.json", title: "Szorzótábla" }, { file: "b.json", title: "Osztás" }],
    onChoose: (mode) => { chosen = mode; }
});

const chooser = document.body.children[0];
check(chooser.className === "favorites-chooser", "a választó megjelenik");
check(chooser.children[1].children.length === 2, "a kedvencek listája címei olvashatók");

const chooserButtons = chooser.children[3].children;
check(chooserButtons.length === 3, "három gomb: időmérő, játék, bezárás");
check(chooserButtons[0].textContent === "⏱️ Időmérő", "az első gomb az időmérő");
check(chooserButtons[1].textContent === "🎲 Játék", "a második gomb a játék");
check(chosen === null, "még nincs választás gombnyomás nélkül");

chooserButtons[0].handlers.click();
check(chosen === "assessment", "az Időmérő felmérésként indul");

if (failures > 0) {
    console.error(`\nHIBA: ${failures} ellenőrzés bukott meg.`);
} else {
    console.log("\nFelmérés teszt OK ✔");
}
process.exit(failures > 0 ? 1 : 0);
