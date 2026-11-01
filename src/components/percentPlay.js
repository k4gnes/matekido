import { createPlayGame, fmtMinus, shuffle, weightedPick } from "./playEngine.js?v=1";

const RECORD_MODE = "percent-play";

const UI = {
    postman: { title: "📮 Százalék a postán", done: "📮 Kézbesítve!" },
    racing: { title: "🏎️ Százalék a pályán", done: "🏁 Célban értél!" },
    football: { title: "⚽ Százalék a pályán", done: "⚽ Vége a meccsnek!" },
    cooking: { title: "🍳 Százalék a konyhában", done: "🍳 Tálkák készen!" },
    animals: { title: "🦁 Százalék az állatkertben", done: "🦁 Mindig jó!" },
    space: { title: "🤖 Százalék az űrhajón", done: "🤖 Küldetés teljesítve!" },
    tram: { title: "🚋 Százalék a villamoson", done: "🚋 Mindenütt megálltál!" }
};

const LEVELS = [
    { id: "easy", label: "🌱 Könnyű", forms: ["half", "ten", "quarter", "twenty"] },
    { id: "hard", label: "🔥 Kőkemény", forms: ["fifteen", "thirty", "five", "seventyfive", "more"] }
];

const FORMS = {
    "half": () => percentTask(50, random(2, 20) * 10),
    "ten": () => percentTask(10, random(2, 30) * 10),
    "quarter": () => percentTask(25, random(5, 50) * 4),
    "twenty": () => percentTask(20, random(5, 60) * 5),
    "fifteen": () => percentTask(15, random(2, 20) * 20),
    "thirty": () => percentTask(30, random(5, 30) * 10),
    "five": () => percentTask(5, random(5, 30) * 20),
    "seventyfive": () => percentTask(75, random(5, 50) * 4),
    "more": () => percentTask(120, random(4, 40) * 5)
};

function percentTask(percent, base) {
    const answer = base * percent / 100;
    return {
        percent,
        base,
        expression: `${percent}% × ${base}`,
        answer,
        traps: [answer + 1, answer - 1, answer + 10, answer - 10, answer * 2, base - answer]
    };
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildOptions(answer, traps) {
    const options = [answer];
    const add = (value) => {
        if (options.length < 4 && Number.isInteger(value) && value > 0 && !options.includes(value)) options.push(value);
    };
    for (const trap of traps) add(trap);
    for (const value of shuffle([answer + 1, answer - 1, answer + 2, answer - 2, answer + 10, answer - 10, answer * 2])) add(value);
    let extra = 1;
    while (options.length < 4) {
        add(answer + extra * 3);
        extra++;
    }
    return shuffle(options);
}

function buildTask(form) {
    const task = FORMS[form] ? FORMS[form]() : FORMS.half();
    return {
        form,
        expression: task.expression,
        answer: task.answer,
        options: buildOptions(task.answer, task.traps),
        percent: task.percent
    };
}

function formsFor(level) {
    return LEVELS.find(l => l.id === level)?.forms ?? LEVELS[0].forms;
}

export function renderPercentPlay(step, root, next, progress) {
    return createPlayGame({
        recordMode: RECORD_MODE,
        ui: UI,
        levels: LEVELS,
        defaultLevel: "easy",
        fmt: fmtMinus,
        subtitleIdle: "🧮 Egyperces játék · százalék",
        lead: "Milyen szinten számolsz? Egy perc alatt annyi százalékos feladatot oldasz meg helyesen, amennyit bírsz!",
        subtitleInGame: (state) => `🧮 Egyperces játék · ${LEVELS.find(l => l.id === state.level)?.label ?? ""}`,

        nextTask: (state) => {
            const forms = formsFor(state.level);
            const form = weightedPick(forms, f => state.weights.get(f) ?? 1);
            const task = buildTask(form);
            return {
                key: form,
                missedKey: task.expression,
                display: `${task.expression} = ?`,
                answer: task.answer,
                options: task.options,
                expression: task.expression,
                percent: task.percent
            };
        },

        successMessage: (task) => `${task.expression} = ${fmtMinus(task.answer)}!`,
        failMessage: (task) => `💡 ${task.expression} = ${fmtMinus(task.answer)}. A ${task.percent}% annyi, mint ${task.percent}/100.`,
        correctDelay: () => 600,
        wrongDelay: () => 2200,
        chipText: (task) => task.expression,
        allGoodText: "Minden százalékos feladatot elsőre eltaláltál! 🌟",
        showBestWhenEqual: false
    }, step, root, next, progress);
}
