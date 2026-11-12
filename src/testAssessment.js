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
    runTooltip,
    resolveAssessmentLessons,
    sortRunsByList
} = await import("./utils/assessment.js");
const { createPlayer } = await import("./profile/UserManager.js");
const { recordAssessment, getAssessments } = await import("./profile/Profile.js");
const {
    getAssessmentLists,
    createAssessmentList,
    removeAssessmentList,
    isInAssessmentList,
    toggleAssessmentLesson,
    migrateAssessmentLists,
    mergeAssessmentLists
} = await import("./profile/AssessmentLists.js");

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
check(summary.grade === null, "gyakorló/favorit futásban nincs évfolyam");

check(finishRun(60000) === null, "a futás egyszer zárható le");
recordRunLesson({ file: "c.json", seconds: 10, correct: 1, wrong: 0 });
check(finishRun(60000) === null, "lezárt futásba nem jön új lecke");

// A felmérő lista futása más felirattal ment, mint a kedvenc-listáé
beginRun(["a.json", "b.json"], 1000, "2 felmérő");
check(finishRun(60000).label === "2 felmérő", "a felmérő futás felirata");
check(finishRun(60000) === null, "a felmérő futás is egyszer zárható le");

// A felmérő futás magával viszi az évfolyamot: a szülői összesítés (minden gyerek
// eredménye egy listáról) csak így tud évfolyamonként szűrni, ugyanis egy névvel
// több évfolyamon is lehet lista
beginRun(["a.json", "b.json"], 1000, "Írásbeli számolás", 3);
const graded = finishRun(60000);
check(graded.grade === 3 && graded.label === "Írásbeli számolás", "a felmérő futás évfolyama tárolódik");

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

// A profil táblázatának sorrendje
const tableRuns = [
    { label: "12 válogatott", finishedAt: 5 },
    { label: "5 felmérő", finishedAt: 9 },
    { label: "4 kedvenc", finishedAt: 7 },
    { label: "6 kedvenc", finishedAt: 8 }
];

check(sortRunsByList(tableRuns).map(r => r.label).join(" · ")
    === "5 felmérő · 6 kedvenc · 4 kedvenc · 12 válogatott",
    "a táblázat a lista neve szerint csoportosul, azonos néven belül a legfrissebb felül");
check(tableRuns[0].label === "12 válogatott", "a bemeneti lista sorrendje nem változik");
check(sortRunsByList(null).length === 0, "üres lista nem hibázik");

// Profilba mentett lista: legelöl az új, legfeljebb 30 tétel
createPlayer("Felmérő", "🦊", 1);

// A régi, játékosonkénti pipák átvezetése az évfolyamszintű listákra
const usersRaw = JSON.parse(store["matekido-users"] ?? '{"players":[]}');
if (usersRaw.players?.[0]) {
    usersRaw.players[0].profile.assessmentLessons = ["place-01", "nincs-ilyen"];
    store["matekido-users"] = JSON.stringify(usersRaw);
}

migrateAssessmentLists([{ id: "place-01", grades: [3] }]);
check(getAssessmentLists(3).length === 1, "a régi pipákból felmérő lista készül");
check(getAssessmentLists(3)[0].name === "Felmérő", "a régi lista neve");
check(getAssessmentLists(3)[0].lessons.join() === "place-01", "csak a meglévő lecke-id kerül át");
check(getAssessmentLists(4).length === 0, "más évfolyam üres marad");

const migrated = getAssessmentLists(3)[0];
toggleAssessmentLesson(3, migrated.id, "other-01");
migrateAssessmentLists([{ id: "place-01", grades: [3] }]);
check(getAssessmentLists(3)[0].lessons.includes("other-01"), "a második indítás nem írja felül a listát");

// A szülői felmérő listák: évfolyamonként több, saját nevű, eszköz-szintű lista
const lista = createAssessmentList(3, "  Írásbeli számolás  ");
check(lista.name === "Írásbeli számolás", "a név nincs kitakarva");
check(getAssessmentLists(3).length === 2, "a lista az évfolyamhoz kerül");
check(createAssessmentList(3, "   ") === null, "üres név nem készít listát");
check(getAssessmentLists(5).length === 0, "más évfolyamon nincs lista");

check(toggleAssessmentLesson(3, lista.id, "place-01") === true, "a pipa bekapcsol");
check(isInAssessmentList(3, lista.id, "place-01"), "a kiválasztott lecke a listában van");
check(toggleAssessmentLesson(3, lista.id, "place-01") === false, "a pipa kikapcsol");
check(!isInAssessmentList(3, lista.id, "place-01"), "a kivett lecke nincs a listában");
check(getAssessmentLists(3)[0].lessons.includes("place-01"), "a másik lista érintetlen");

// Importkor a listák csak bővülhetnek, a hibás tételt kidobjuk
mergeAssessmentLists({
    "3": [
        { id: "bejovo", name: "Átvitt", lessons: ["place-01"] },
        { id: "bejovo", lessons: ["other-01"] },
        "rossz tétel"
    ],
    "4": "nem lista"
});
const bejovo = getAssessmentLists(3).find(l => l.id === "bejovo");
check(!!bejovo, "importkor bekerül a lista");
check(bejovo.name === "Átvitt", "a név megmarad");
check(bejovo.lessons.length === 2, "azonos id listák egyesülnek");
check(getAssessmentLists(4).length === 0, "hibás adat nem csinál listát");

mergeAssessmentLists({ "3": [{ id: "bejovo", name: "Átvitt", lessons: [] }] });
check(getAssessmentLists(3).find(l => l.id === "bejovo").lessons.length === 2, "az import nem távolít el elemet");

removeAssessmentList(3, lista.id);
check(getAssessmentLists(3).length === 2 && !getAssessmentLists(3).some(l => l.id === lista.id), "a törlés a saját listát viszi");

// A tárolt érték lecke-id, a menühöz leckefájllá kell alakulnia
const idxForIds = [{ id: "place-01", file: "./data/lessons/grade3/place-01.json", grades: [3] }];
check(resolveAssessmentLessons(["place-01"], idxForIds).length === 1, "a lecke-id leckévé válik");
check(resolveAssessmentLessons(["place-01"], idxForIds)[0].file.endsWith("place-01.json"), "a lecke fájlnévvel együtt jön ki");
check(resolveAssessmentLessons(["nincs-ilyen"], idxForIds).length === 0, "a hiányzó lecke kimarad a listából");
check(resolveAssessmentLessons(null, null).length === 0, "üres adat nem hibázik");

for (let i = 0; i < 33; i++) {
    recordAssessment({ ...summary, startedAt: i });
}

const saved = getAssessments();
check(saved.length === 30, "legfeljebb 30 futás marad a profilban");
check(saved[0].startedAt === 32, "a legfrissebb futás van legelöl");

// A felmérő lista választója: három gomb, a lista címeivel, és a választás átadása
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
check(chooser.children[1].children.length === 2, "a felmérő lista címei olvashatók");

const chooserButtons = chooser.children[3].children;
check(chooserButtons.length === 3, "három gomb: kezdjük, időmérő, bezárás");
check(chooserButtons[0].textContent === "Kezdjük!", "az első gomb a szokásos Kezdjük!");
check(chooserButtons[1].textContent === "⏱️ Időmérő", "a második gomb az időmérő");
check(chooserButtons[2].textContent === "✗ Bezárás", "a harmadik gomb a bezárás");
check(chosen === null, "még nincs választás gombnyomás nélkül");

chooserButtons[1].handlers.click();
check(chosen === "assessment", "az Időmérő felmérésként indul");

// A felmérő lista választója saját címmel nyílik
openFavoritesChooser({
    lessons: [{ file: "a.json", title: "Szorzótábla" }],
    heading: "📝 Felmérő (1)",
    onChoose: () => {}
});
check(document.body.children[1].children[0].textContent === "📝 Felmérő (1)", "a felmérő választó címe");

if (failures > 0) {
    console.error(`\nHIBA: ${failures} ellenőrzés bukott meg.`);
} else {
    console.log("\nFelmérés teszt OK ✔");
}
process.exit(failures > 0 ? 1 : 0);
