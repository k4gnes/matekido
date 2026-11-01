import { createPlayGame, fmtMinus, shuffle, weightedPick } from "./playEngine.js?v=1";

const RECORD_MODE = "root-play";

const UI = {
    postman: { title: "📮 Négyzetgyökök a postán", done: "📮 Kézbesítve!" },
    racing: { title: "🏎️ Négyzetgyökök a pályán", done: "🏁 Célban értél!" },
    football: { title: "⚽ Négyzetgyökök a pályán", done: "⚽ Vége a meccsnek!" },
    cooking: { title: "🍳 Négyzetgyökök a konyhában", done: "🍳 Tálkák készen!" },
    animals: { title: "🦁 Négyzetgyökök az állatkertben", done: "🦁 Mindig jó!" },
    space: { title: "🤖 Négyzetgyökök az űrhajón", done: "🤖 Küldetés teljesítve!" },
    tram: { title: "🚋 Négyzetgyökök a villamoson", done: "🚋 Mindenütt megálltál!" }
};

const LEVELS = [
    { id: "easy", label: "🌱 Könnyű", forms: ["sqrt", "sqrt-big", "cbrt"] },
    { id: "hard", label: "🔥 Kőkemény", forms: ["sqrt", "sqrt-big", "cbrt", "sqrt-product", "cbrt-big"] }
];

const FORMS = {
    "sqrt": () => {
        const a = random(2, 12);
        return { expression: `√${a * a}`, answer: a, traps: [a + 1, a - 1, a * 2] };
    },
    "sqrt-big": () => {
        const a = random(13, 20);
        return { expression: `√${a * a}`, answer: a, traps: [a + 1, a - 1, a * 2] };
    },
    "cbrt": () => {
        const a = random(2, 5);
        return { expression: `∛${a * a * a}`, answer: a, traps: [a + 1, a - 1, a * a] };
    },
    "sqrt-product": () => {
        const a = random(2, 9);
        const b = random(2, 9);
        return {
            expression: `√(${a * a} × ${b * b})`,
            answer: a * b,
            traps: [a + b, a * b + 1, a * b - 1, a * b * 2]
        };
    },
    "cbrt-big": () => {
        const a = random(6, 10);
        return { expression: `∛${a * a * a}`, answer: a, traps: [a + 1, a - 1, a * a] };
    }
};

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
    const task = FORMS[form] ? FORMS[form]() : FORMS.sqrt();
    return { form, expression: task.expression, answer: task.answer, options: buildOptions(task.answer, task.traps) };
}

function formsFor(level) {
    return LEVELS.find(l => l.id === level)?.forms ?? LEVELS[0].forms;
}

export function renderRootPlay(step, root, next, progress) {
    return createPlayGame({
        recordMode: RECORD_MODE,
        ui: UI,
        levels: LEVELS,
        defaultLevel: "easy",
        fmt: fmtMinus,
        subtitleIdle: "🧮 Egyperces játék · négyzetgyökök",
        lead: "Milyen szinten számolsz? Egy perc alatt annyi gyökös feladatot oldasz meg helyesen, amennyit bírsz!",
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
        failMessage: (task) => `💡 ${task.expression} = ${fmtMinus(task.answer)}. Keresd a számot, amelynek a négyzete vagy köbe az adott érték!`,
        correctDelay: () => 600,
        wrongDelay: () => 2200,
        chipText: (task) => task.expression,
        allGoodText: "Minden gyökös feladatot elsőre eltaláltál! 🌟",
        showBestWhenEqual: false
    }, step, root, next, progress);
}
