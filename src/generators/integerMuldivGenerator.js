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
            question: (a, op, b) => {
                if (op === "×") {
                    const direction = a < 0 ? "csökken" : "emelkedik";
                    return `A hőmérséklet óránként ${Math.abs(a)} °C-kal ${direction}. Mennyi a változás ${b} óra alatt?`;
                }
                const direction = a < 0 ? "csökkent" : "emelkedett";
                return `${b} óra alatt ${Math.abs(a)} °C-kal ${direction} a hőmérséklet. Mennyi volt az óránkénti változás?`;
            }
        };
    }
    if (context === "debt") {
        return {
            emoji: "💰",
            unit: "Ft",
            question: (a, op, b) => {
                if (op === "×") {
                    const direction = a < 0 ? "csökken" : "nő";
                    return `Az egyenleg havonta ${Math.abs(a)} Ft-tal ${direction}. Mennyi a változás ${b} hónap alatt?`;
                }
                const direction = a < 0 ? "csökkent" : "nőtt";
                return `${b} hónap alatt ${Math.abs(a)} Ft-tal ${direction} az egyenleg. Mennyi volt a havi változás?`;
            }
        };
    }
    return {
        emoji: "🔢",
        unit: "",
        question: (a, op, b) => "Számold ki az értékét!"
    };
}

function randPair(mode, maxAbs, story) {
    for (let i = 0; i < 300; i++) {
        if (mode === "mul") {
            const a = randInt(-maxAbs, maxAbs);
            const raw = randInt(-12, 12);
            if (Math.abs(a) < 2 || Math.abs(raw) < 2) continue;
            const b = story ? Math.abs(raw) : raw;
            if (Math.abs(a * b) > 100) continue;
            return { a, b, value: a * b };
        }
        const q = randInt(-maxAbs, maxAbs);
        const raw = randInt(-12, 12);
        if (Math.abs(q) < 2 || Math.abs(raw) < 2) continue;
        const b = story ? Math.abs(raw) : raw;
        if (Math.abs(q * b) > 100) continue;
        return { a: q * b, b, value: q };
    }
    return { a: 2, b: 2, value: mode === "mul" ? 4 : 1 };
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
    const op = mode === "mul" ? "×" : "÷";
    const story = context !== "plain";
    const { a, b, value } = randPair(mode, maxAbs, story);

    const task = {
        type: "integer-muldiv",
        mode,
        context,
        a,
        b,
        operator: op,
        expression: buildExpression(a, op, b),
        answer: value,
        question: info.question(a, op, b),
        interaction
    };

    if (info.unit) task.unit = info.unit;
    if (interaction === "choice") task.options = makeOptions(value);

    return task;
}

export function generateIntegerMuldiv(options = {}) {

    const {
        count = 6,
        mode = "mul",
        context = "plain",
        interaction = "input",
        maxAbs = 50
    } = options;

    const tasks = [];
    const seen = new Set();

    let guard = 0;
    while (tasks.length < count && guard < count * 120) {
        guard++;

        const resolvedMode = mode === "mixed" ? (Math.random() < 0.5 ? "mul" : "div") : mode;
        const ctx = context === "mixed" ? CONTEXTS[randInt(0, CONTEXTS.length - 1)] : context;

        const task = makeTask(resolvedMode, ctx, interaction, maxAbs);

        const key = `${task.mode}|${task.a}|${task.operator}|${task.b}`;
        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push(task);
    }

    return tasks;
}