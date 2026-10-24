import { createPlayGame, fmtMinus, shuffle, weightedPick } from "./playEngine.js?v=1";

const RECORD_MODE = "integer-play";

const UI = {
    postman: { title: "📮 Egész számok a postán", done: "📮 Kézbesítve!" },
    racing: { title: "🏎️ Egész számok a pályán", done: "🏁 Célban értél!" },
    football: { title: "⚽ Egész számok a pályán", done: "⚽ Vége a meccsnek!" },
    cooking: { title: "🍳 Egész számok a konyhában", done: "🍳 Tálkák készen!" },
    animals: { title: "🦁 Egész számok az állatkertben", done: "🦁 Mindig jó!" },
    space: { title: "🤖 Egész számok az űrhajón", done: "🤖 Küldetés teljesítve!" },
    tram: { title: "🚋 Egész számok a villamoson", done: "🚋 Mindenütt megálltál!" }
};

const LEVELS = [
    { id: "easy", label: "🌱 Könnyű", forms: ["add-neg", "sub-neg", "neg-add", "neg-sub", "neg-plus-neg", "small-minus-big"] },
    { id: "hard", label: "🔥 Kőkemény", forms: ["neg-mul-pos", "neg-mul-neg", "neg-div-pos", "pos-div-neg", "neg-div-neg", "mul-add", "neg-sub-neg", "sub-mul-neg"] }
];

const FORMS = {
    "add-neg": () => {
        const a = random(3, 15);
        const b = random(1, 12);
        return { expression: `${a} + (−${b})`, answer: a - b, traps: [a + b] };
    },
    "sub-neg": () => {
        const a = random(3, 15);
        const b = random(1, 12);
        return { expression: `${a} − (−${b})`, answer: a + b, traps: [a - b] };
    },
    "neg-add": () => {
        const a = random(2, 12);
        const b = random(1, 15);
        return { expression: `(−${a}) + ${b}`, answer: b - a, traps: [-(a + b)] };
    },
    "neg-sub": () => {
        const a = random(2, 12);
        const b = random(1, 12);
        return { expression: `(−${a}) − ${b}`, answer: -(a + b), traps: [b - a] };
    },
    "neg-plus-neg": () => {
        const a = random(2, 10);
        const b = random(2, 10);
        return { expression: `(−${a}) + (−${b})`, answer: -(a + b), traps: [a - b, b - a, a + b] };
    },
    "small-minus-big": () => {
        const a = random(1, 9);
        const b = random(a + 1, 15);
        return { expression: `${a} − ${b}`, answer: a - b, traps: [b - a] };
    },
    "neg-mul-pos": () => {
        const a = random(2, 9);
        const b = random(2, 9);
        return { expression: `${a} × (−${b})`, answer: -(a * b), traps: [a * b] };
    },
    "neg-mul-neg": () => {
        const a = random(2, 9);
        const b = random(2, 9);
        return { expression: `(−${a}) × (−${b})`, answer: a * b, traps: [-(a * b)] };
    },
    "neg-div-pos": () => {
        const b = random(2, 9);
        const q = random(2, 9);
        return { expression: `(−${b * q}) ÷ ${b}`, answer: -q, traps: [q] };
    },
    "pos-div-neg": () => {
        const b = random(2, 9);
        const q = random(2, 9);
        return { expression: `${b * q} ÷ (−${b})`, answer: -q, traps: [q] };
    },
    "neg-div-neg": () => {
        const b = random(2, 9);
        const q = random(2, 9);
        return { expression: `(−${b * q}) ÷ (−${b})`, answer: q, traps: [-q] };
    },
    "mul-add": () => {
        const a = random(2, 9);
        const b = random(2, 9);
        const c = random(2, 15);
        return { expression: `(−${a}) × ${b} + ${c}`, answer: -(a * b) + c, traps: [a * b + c, -(a * b) - c] };
    },
    "neg-sub-neg": () => {
        const a = random(2, 12);
        const b = random(2, 12);
        return { expression: `(−${a}) − (−${b})`, answer: b - a, traps: [-(a + b), a - b] };
    },
    "sub-mul-neg": () => {
        const a = random(5, 20);
        const b = random(2, 9);
        const c = random(2, 9);
        return { expression: `${a} − ${b} × (−${c})`, answer: a + b * c, traps: [a - b * c] };
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
    for (const value of shuffle([-answer, answer + 1, answer - 1, answer + 2, answer - 2, answer + 10, answer - 10])) add(value);
    let extra = 3;
    while (options.length < 4) {
        add(answer + options.length + extra);
        extra++;
    }
    return shuffle(options);
}

function buildTask(form) {
    const task = FORMS[form] ? FORMS[form]() : FORMS["add-neg"]();
    return { form, expression: task.expression, answer: task.answer, options: buildOptions(task.answer, task.traps) };
}

function formsFor(level) {
    return LEVELS.find(l => l.id === level)?.forms ?? LEVELS[0].forms;
}

export function renderIntegerPlay(step, root, next, progress) {
    return createPlayGame({
        recordMode: RECORD_MODE,
        ui: UI,
        levels: LEVELS,
        defaultLevel: "easy",
        fmt: fmtMinus,
        subtitleIdle: "🧮 Egyperces játék · egész számok",
        lead: "Milyen szinten számolsz? Egy perc alatt annyi előjeles feladatot oldasz meg helyesen, amennyit bírsz!",
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
        failMessage: (task) => `💡 ${task.expression} = ${fmtMinus(task.answer)}. Figyelj az előjelekre!`,
        correctDelay: () => 600,
        wrongDelay: () => 2200,
        chipText: (task) => task.expression,
        allGoodText: "Minden feladatot elsőre találtál! 🌟",
        showBestWhenEqual: false
    }, step, root, next, progress);
}
