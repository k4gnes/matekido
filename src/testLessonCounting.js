// A profil (profile.lessonsCompleted) és a statisztika (dailyStats.lessonsPlayed)
// ugyanazt számlálja: a gyakorló/egyperces játék egyiket sem növeli, a valódi lecke
// mindkettőt. A számított lépés nélküli, de nem gyakorló lecke (decomposition) is
// valódi lecke.
//
// Futás: make test

const store = {};

globalThis.localStorage = {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; }
};

// A motor importálásához elég egy minimális DOM-hamisítás.
globalThis.document = {
    hidden: false,
    createElement: () => ({
        className: "",
        children: [],
        style: {},
        append() {},
        replaceChildren() {},
        setAttribute() {},
        querySelector: () => null,
        querySelectorAll: () => [],
        classList: { add() {}, contains: () => false, toggle() {} },
        addEventListener() {},
        textContent: ""
    }),
    addEventListener() {},
    removeEventListener() {}
};
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);

const { Game } = await import("./engine/Game.js");
const { createPlayer } = await import("./profile/UserManager.js");
const { loadProfile, getLessonStats } = await import("./profile/Profile.js");

let failures = 0;

function check(cond, message) {
    if (!cond) {
        failures++;
        console.error(`HIBA: ${message}`);
    }
}

const today = new Date().toISOString().split("T")[0];

function counts() {
    const profile = loadProfile();
    const day = profile.dailyStats?.[today] ?? { correct: 0, wrong: 0, lessonsPlayed: 0 };
    return { lessonsCompleted: profile.lessonsCompleted, lessonsPlayed: day.lessonsPlayed, correct: day.correct };
}

// A befejezési út minimális `this`-sel, DOM nélkül.
function finish(steps, lessonFile) {
    const game = {
        stopAssessmentTimer() {},
        mode: "lesson",
        lesson: { steps, completed: false },
        correct: 2,
        wrong: 1,
        byType: { exercise: { correct: 2, wrong: 1 } },
        lessonFile,
        skill: null,
        source: "curriculum",
        isGradeComplete: () => false,
        getLessonTitle: () => "Teszt lecke",
        elapsedSeconds: () => 0
    };
    return Game.prototype.finishLesson.call(game);
}

createPlayer("Teszt", "🦊", 1);

const start = counts();

// 1) Egyperces játék: scene / *-play / celebration lépések.
const play = finish(
    [{ type: "scene" }, { type: "addition-play" }, { type: "celebration" }],
    "egyperces.json"
);
const afterPlay = counts();
check(play.practice === true, "egyperces játék gyakorlónak számít");
check(afterPlay.lessonsCompleted === start.lessonsCompleted, "egyperces nem növeli a profil leckeszámát");
check(afterPlay.lessonsPlayed === start.lessonsPlayed, "egyperces nem növeli a statisztika leckeszámát");
check(afterPlay.correct === start.correct + 2, "egyperces válaszai beleszámítanak a napi statisztikába");
check(getLessonStats("egyperces.json")?.practice === true, "egyperces a gyakorló leckék közt van");

// 2) Valódi lecke: mindkét számláló nő.
const lesson = finish(
    [{ type: "scene" }, { type: "exercise" }, { type: "celebration" }],
    "valodi-lecke.json"
);
const afterLesson = counts();
check(lesson.practice === false, "valódi lecke nem gyakorló");
check(afterLesson.lessonsCompleted === start.lessonsCompleted + 1, "valódi lecke növeli a profil leckeszámát");
check(afterLesson.lessonsPlayed === start.lessonsPlayed + 1, "valódi lecke növeli a statisztika leckeszámát");

// 3) A decomposition lépés számított típus, így a lecke valódi lecke.
const decomposition = finish(
    [{ type: "scene" }, { type: "decomposition" }, { type: "celebration" }],
    "grade1/decompsition.json"
);
const afterDecomp = counts();
check(decomposition.practice === false, "a decomposition lecke nem gyakorló");
check(afterDecomp.lessonsCompleted === start.lessonsCompleted + 2, "a decomposition lecke növeli a profil leckeszámát");
check(afterDecomp.lessonsPlayed === start.lessonsPlayed + 2, "a decomposition lecke növeli a statisztika leckeszámát");
check(getLessonStats("grade1/decompsition.json")?.practice !== true, "a decomposition lecke nem gyakorló jelölésű");

if (failures > 0) {
    console.error(`\nHIBA: ${failures} ellenőrzés bukott meg.`);
} else {
    console.log("\nLeckeszám-teszt OK ✔");
}
process.exit(failures > 0 ? 1 : 0);
