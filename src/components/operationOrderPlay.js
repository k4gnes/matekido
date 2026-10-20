import { createPlayGame, shuffle, weightedPick } from "./playEngine.js";

const RECORD_MODE = "operation-order-play";

const UI = {
    postman: { title: "📮 Műveleti sorrend a postán", done: "📮 Kézbesítve!" },
    racing: { title: "🏎️ Műveleti sorrend a boxutcában", done: "🏁 Célban értél!" },
    football: { title: "⚽ Műveleti sorrend a pályán", done: "⚽ Vége a meccsnek!" },
    cooking: { title: "🍳 Műveleti sorrend a konyhában", done: "🍳 Tálkák készen!" },
    animals: { title: "🦁 Műveleti sorrend az állatkertben", done: "🦁 Mindig jó!" },
    space: { title: "🤖 Műveleti sorrend az űrhajón", done: "🤖 Küldetés teljesítve!" },
    tram: { title: "🚋 Műveleti sorrend a villamoson", done: "🚋 Mindenütt megálltál!" }
};

const LEVELS = [
    { id: "easy", label: "🌱 Könnyű", forms: ["mult-add", "mult-sub", "div-add", "paren-add", "paren-sub"] },
    { id: "hard", label: "🔥 Kőkemény", forms: ["mult-add", "mult-add", "mult-sub", "div-add", "div-sub", "two-mult", "paren-add", "paren-sub", "chain", "paren-two"] }
];

const FORM_WEIGHT = {
    "mult-add": 3,
    "mult-add-rev": 3,
    "mult-sub": 3,
    "div-add": 3,
    "div-sub": 2,
    "two-mult": 2,
    "paren-add": 3,
    "paren-sub": 2,
    "chain": 2,
    "paren-two": 1
};

function isParenForm(form) {
    return form.startsWith("paren-");
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function normalize(src) {
    return src.replace(/−/g, "-").replace(/\s+/g, "");
}

function evaluate(raw) {
    const src = normalize(raw);
    let i = 0;

    function factor() {
        if (src[i] === "(") {
            i++;
            const value = sum();
            if (src[i] === ")") i++;
            return value;
        }
        const start = i;
        while (i < src.length && /\d/.test(src[i])) i++;
        return Number(src.slice(start, i));
    }

    function term() {
        let value = factor();
        while (src[i] === "×" || src[i] === "÷") {
            const op = src[i++];
            const right = factor();
            value = op === "×" ? value * right : value / right;
        }
        return value;
    }

    function sum() {
        let value = term();
        while (src[i] === "+" || src[i] === "-") {
            const op = src[i++];
            const right = term();
            value = op === "+" ? value + right : value - right;
        }
        return value;
    }

    return sum();
}

function evaluateLeftToRight(src) {
    const tokens = normalize(src).match(/\d+|[+\-×÷]/g) ?? [];
    let value = Number(tokens[0]);
    for (let k = 1; k < tokens.length; k += 2) {
        const op = tokens[k];
        const right = Number(tokens[k + 1]);
        if (op === "+") value += right;
        else if (op === "-") value -= right;
        else if (op === "×") value *= right;
        else value /= right;
    }
    return value;
}

function buildExpression(form) {
    switch (form) {
        case "mult-add":
            return `${random(2, 9)} + ${random(2, 9)} × ${random(2, 9)}`;
        case "mult-add-rev":
            return `${random(2, 9)} × ${random(2, 9)} + ${random(2, 9)}`;
        case "mult-sub": {
            const b = random(3, 9);
            const c = random(3, 9);
            return `${b * c + random(1, 9)} − ${b} × ${c}`;
        }
        case "div-add": {
            const c = random(2, 9);
            return `${random(2, 20)} + ${c * random(2, 9)} ÷ ${c}`;
        }
        case "div-sub": {
            const c = random(2, 9);
            const q = random(2, 9);
            return `${c * q + random(1, 9)} − ${c * q} ÷ ${c}`;
        }
        case "two-mult":
            return `${random(2, 9)} × ${random(2, 9)} + ${random(2, 9)} × ${random(2, 9)}`;
        case "paren-add":
            return `(${random(2, 20)} + ${random(2, 9)}) × ${random(2, 9)}`;
        case "paren-sub": {
            const a = random(5, 20);
            return `(${a} − ${random(2, a - 1)}) × ${random(2, 9)}`;
        }
        case "chain": {
            const b = random(2, 9);
            const c = random(2, 9);
            return `${b * c + random(1, 9)} − ${b} × ${c} + ${random(2, 9)}`;
        }
        case "paren-two": {
            const a = random(4, 12);
            return `(${random(2, 9)} + ${random(2, 9)}) × (${a} − ${random(2, a - 1)})`;
        }
        default:
            return `${random(2, 9)} + ${random(2, 9)} × ${random(2, 9)}`;
    }
}

function buildOptions(expression, answer) {
    const flat = evaluateLeftToRight(expression);
    const noParen = evaluate(expression.replace(/[()]/g, ""));
    const candidates = [flat, noParen, answer + 1, answer - 1, answer + 2, answer - 2, answer + 10, answer - 10];

    const options = [answer];
    for (const value of shuffle(candidates)) {
        if (options.length >= 4) break;
        if (!Number.isInteger(value) || value < 0 || options.includes(value)) continue;
        options.push(value);
    }
    while (options.length < 4) {
        const filler = answer + options.length + 3;
        if (!options.includes(filler)) options.push(filler);
    }
    return shuffle(options);
}

function buildTask(form) {
    let expression = buildExpression(form);
    let answer = evaluate(expression);

    let guard = 0;
    while ((!Number.isInteger(answer) || answer < 0) && guard < 25) {
        expression = buildExpression(form);
        answer = evaluate(expression);
        guard++;
    }
    if (!Number.isInteger(answer) || answer < 0) {
        expression = `${random(2, 9)} + ${random(2, 9)} × ${random(2, 9)}`;
        answer = evaluate(expression);
    }

    return { expression, answer, options: buildOptions(expression, answer) };
}

export function renderOperationOrderPlay(step, root, next, progress) {
    return createPlayGame({
        recordMode: RECORD_MODE,
        ui: UI,
        levels: LEVELS,
        defaultLevel: "hard",
        subtitleIdle: "🧮 Egyperces játék · műveleti sorrend",
        lead: "Milyen szinten számolsz? Egy perc alatt annyi feladatot oldasz meg helyesen, amennyit bírsz!",
        subtitleInGame: (state) => `🧮 Egyperces játék · ${LEVELS.find(l => l.id === state.level)?.label ?? ""}`,

        // A FORM_WEIGHT alapsúlyokat feltöltjük, hogy az első válaszok
        // súlyfrissítése is ugyanarról az értékről induljon.
        startRound: (state) => {
            for (const [form, weight] of Object.entries(FORM_WEIGHT)) state.weights.set(form, weight);
        },

        nextTask: (state) => {
            const forms = LEVELS.find(l => l.id === state.level)?.forms ?? LEVELS[1].forms;
            const forced = state.served === 1 ? forms.filter(isParenForm) : [];
            state.served++;
            const form = forced.length > 0 ? pick(forced) : weightedPick(forms, f => state.weights.get(f) ?? 1);
            const task = buildTask(form);
            return {
                key: form,
                missedKey: task.expression,
                display: `${task.expression} = ?`,
                answer: task.answer,
                options: task.options,
                form: form
            };
        },

        successMessage: (task) => `${task.expression} = ${task.answer}!`,
        failMessage: (task) => `💡 ${task.expression} = ${task.answer}. Először a zárójel, aztán a szorzás és az osztás, végül az összeadás és a kivonás.`,
        correctDelay: () => 600,
        wrongDelay: () => 2200,
        chipText: (task) => task.expression,
        allGoodText: "Minden feladatot elsőre találtál! 🌟",
        showBestWhenEqual: false
    }, step, root, next, progress);
}
