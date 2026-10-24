import { createPlayGame, fmtMinus, shuffle, weightedPick } from "./playEngine.js?v=1";

const RECORD_MODE = "power-play";

const UI = {
    postman: { title: "📮 Hatványok a postán", done: "📮 Kézbesítve!" },
    racing: { title: "🏎️ Hatványok a pályán", done: "🏁 Célban értél!" },
    football: { title: "⚽ Hatványok a pályán", done: "⚽ Vége a meccsnek!" },
    cooking: { title: "🍳 Hatványok a konyhában", done: "🍳 Tálkák készen!" },
    animals: { title: "🦁 Hatványok az állatkertben", done: "🦁 Mindig jó!" },
    space: { title: "🤖 Hatványok az űrhajón", done: "🤖 Küldetés teljesítve!" },
    tram: { title: "🚋 Hatványok a villamoson", done: "🚋 Mindenütt megálltál!" }
};

const LEVELS = [
    { id: "easy", label: "🌱 Könnyű", forms: ["square", "cube", "power-ten"] },
    { id: "hard", label: "🔥 Kőkemény", forms: ["square", "cube", "neg-square", "neg-cube", "power-ten", "power-mix"] }
];

const FORMS = {
    "square": () => {
        const a = random(1, 12);
        return { expression: `${a}^2`, answer: a * a, traps: [a * a + 1, a * a - 1, a + 2, 2 * a] };
    },
    "cube": () => {
        const a = random(1, 5);
        return { expression: `${a}^3`, answer: a * a * a, traps: [a * a, a * a * a + 1, a * a * a - 1, Math.pow(a + 1, 3)] };
    },
    "neg-square": () => {
        const a = random(2, 9);
        return { expression: `(-${a})^2`, answer: a * a, traps: [-(a * a), a * a + 1, a * a - 1] };
    },
    "neg-cube": () => {
        const a = random(2, 5);
        const ans = -(a * a * a);
        return { expression: `(-${a})^3`, answer: ans, traps: [a * a * a, -(a * a * a) + 1, -(a * a * a) - 1] };
    },
    "power-ten": () => {
        const n = random(1, 4);
        const ans = Math.pow(10, n);
        return { expression: `10^${n}`, answer: ans, traps: [Math.pow(10, n - 1) || 1, Math.pow(10, n + 1) || 100000, ans + 1, ans - 1] };
    },
    "power-mix": () => {
        const a = random(2, 6);
        const n = random(2, 4);
        const ans = Math.pow(a, n);
        return { expression: `${a}^${n}`, answer: ans, traps: [Math.pow(a, n - 1), Math.pow(a + 1, n), ans + 1, ans - 2] };
    }
};

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildOptions(answer, traps) {
    const options = [answer];
    const add = (value) => {
        if (options.length < 4 && Number.isInteger(value) && !options.includes(value)) options.push(value);
    };
    for (const trap of traps) add(trap);
    for (const value of shuffle([-answer, answer + 1, answer - 1, answer + 2, answer - 2, answer + 10, answer - 10, answer + 20, answer - 20])) add(value);
    let extra = 3;
    while (options.length < 4) {
        add(answer + options.length + extra);
        extra++;
    }
    return shuffle(options);
}

function buildTask(form) {
    const task = FORMS[form] ? FORMS[form]() : FORMS["square"]();
    return { form, expression: task.expression, answer: task.answer, options: buildOptions(task.answer, task.traps || []) };
}

function formsFor(level) {
    return LEVELS.find(l => l.id === level)?.forms ?? LEVELS[0].forms;
}

export function renderPowerPlay(step, root, next, progress) {
    return createPlayGame({
        recordMode: RECORD_MODE,
        ui: UI,
        levels: LEVELS,
        defaultLevel: "easy",
        fmt: fmtMinus,
        subtitleIdle: "🧮 Egyperces játék · hatványok",
        lead: "Milyen szinten számolsz? Egy perc alatt annyi hatványos feladatot oldasz meg helyesen, amennyit bírsz!",
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
                expression: task.expression
            };
        },

        successMessage: (task) => `${task.expression} = ${fmtMinus(task.answer)}!`,
        failMessage: (task) => `💡 ${task.expression} = ${fmtMinus(task.answer)}. Figyelj a hatványkitevőre és az előjelre!`,
        correctDelay: () => 600,
        wrongDelay: () => 2200,
        chipText: (task) => task.expression,
        allGoodText: "Minden feladatot elsőre találtál! 🌟",
        showBestWhenEqual: false
    }, step, root, next, progress);
}
