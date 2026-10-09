function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function fmt(n) {
    return n < 0 ? `−${Math.abs(n)}` : String(n);
}

function fmtOperand(n) {
    return n < 0 ? `(−${Math.abs(n)})` : String(n);
}

const CONTEXTS = ["plain", "temperature", "debt"];

function contextInfo(context) {
    if (context === "temperature") {
        return {
            emoji: "🌡️",
            unit: "°C",
            story: (a, op, b) => {
                const change = op === "+"
                    ? (b < 0 ? `${Math.abs(b)} fokkal hidegebb lett` : `${b} fokkal melegebb lett`)
                    : (b < 0 ? `${Math.abs(b)} fokkal melegebb lett` : `${b} fokkal hidegebb lett`);
                return `A hőmérséklet ${fmt(a)} °C volt, majd ${change}.`;
            },
            question: "Mennyi lett a hőmérséklet?"
        };
    }
    if (context === "debt") {
        return {
            emoji: "💰",
            unit: "Ft",
            story: (a, op, b) => {
                const change = op === "+"
                    ? (b < 0 ? `${Math.abs(b)} Ft kifizettél a számláról` : `${b} Ft érkezett a számlára`)
                    : (b < 0 ? `${Math.abs(b)} Ft érkezett a számlára` : `${b} Ft kifizettél a számláról`);
                return `Az egyenleg ${fmt(a)} Ft volt, majd ${change}.`;
            },
            question: "Mennyi lett az egyenleg?"
        };
    }
    return {
        emoji: "🔢",
        unit: "",
        story: null,
        question: "Számold ki az értékét!"
    };
}

function randPair(mode, maxAbs) {
    for (let i = 0; i < 200; i++) {
        const a = randInt(-maxAbs, maxAbs);
        const b = randInt(-maxAbs, maxAbs);
        if (a === 0 || b === 0) continue;
        if (mode === "add" && a > 0 && b > 0) continue;
        if (mode === "sub" && a > 0 && b > 0 && a > b) continue;
        const value = mode === "add" ? a + b : a - b;
        if (value === 0) continue;
        return { a, b, value };
    }
    return { a: -maxAbs, b: -maxAbs, value: mode === "add" ? -2 * maxAbs : 0 };
}

function buildExpression(a, op, b) {
    return `${fmtOperand(a)} ${op} ${fmtOperand(b)}`;
}

function makeOptions(answer) {
    const candidates = shuffle([
        answer + 1, answer - 1, answer + 10, answer - 10, answer + 2, answer - 2, -answer
    ]);

    const options = [answer];
    const seen = new Set([answer]);

    for (const candidate of candidates) {
        if (options.length >= 4) break;
        if (seen.has(candidate)) continue;
        seen.add(candidate);
        options.push(candidate);
    }

    let delta = 3;
    while (options.length < 4) {
        for (const candidate of [answer + delta, answer - delta]) {
            if (options.length >= 4) break;
            if (seen.has(candidate)) continue;
            seen.add(candidate);
            options.push(candidate);
        }
        delta++;
    }

    return shuffle(options);
}

function makeTask(mode, context, interaction, maxAbs) {
    const info = contextInfo(context);
    const op = mode === "add" ? "+" : "−";
    const { a, b, value } = randPair(mode, maxAbs);

    const story = info.story ? info.story(a, op, b) : null;

    const task = {
        type: "integer-ops",
        mode,
        context,
        a,
        b,
        operator: op,
        expression: buildExpression(a, op, b),
        answer: value,
        question: story ? `${story} ${info.question}` : info.question,
        interaction
    };

    if (info.unit) task.unit = info.unit;
    if (interaction === "choice") task.options = makeOptions(value);

    return task;
}

export function generateIntegerOps(options = {}) {

    const {
        count = 6,
        mode = "add",
        context = "plain",
        interaction = "input",
        maxAbs = 50
    } = options;

    const tasks = [];
    const seen = new Set();

    let guard = 0;
    while (tasks.length < count && guard < count * 120) {
        guard++;

        const resolvedMode = mode === "mixed" ? (Math.random() < 0.5 ? "add" : "sub") : mode;
        const ctx = context === "mixed" ? CONTEXTS[randInt(0, CONTEXTS.length - 1)] : context;

        const task = makeTask(resolvedMode, ctx, interaction, maxAbs);

        const key = `${task.mode}|${task.a}|${task.operator}|${task.b}`;
        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push(task);
    }

    return tasks;
}