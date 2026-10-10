function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const SUPERSCRIPT_DIGITS = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹"
};

function superscript(n) {
    return String(n).split("").map(d => SUPERSCRIPT_DIGITS[d]).join("");
}

function powerText(base, exponent) {
    return `${base}${superscript(exponent)}`;
}

function distinctNumbers(correct, candidates, count) {
    const out = [];
    for (const v of shuffle([...new Set(candidates)])) {
        if (!Number.isInteger(v) || v <= 0 || v === correct || out.includes(v)) continue;
        out.push(v);
        if (out.length >= count) break;
    }
    return out;
}

function numberOptions(correct, candidates) {
    const wrong = distinctNumbers(correct, candidates, 3);
    return shuffle([
        { text: String(correct), correct: true },
        ...wrong.map(v => ({ text: String(v), correct: false }))
    ]);
}

function buildSquare() {
    const base = randInt(2, 31);
    const answer = base * base;
    const candidates = [
        base * 2,
        answer - base,
        answer + base,
        (base - 1) * (base - 1),
        (base + 1) * (base + 1),
        answer + 1,
        answer - 1,
        answer + 10
    ];
    return {
        type: "power",
        mode: "square",
        base,
        exponent: 2,
        answer,
        display: powerText(base, 2),
        question: `Mennyi a ${base} négyzete?`,
        options: numberOptions(answer, candidates)
    };
}

function buildCube() {
    const base = randInt(2, 10);
    const answer = base * base * base;
    const candidates = [
        base * 3,
        base * base,
        answer - base,
        answer + base,
        (base - 1) ** 3,
        (base + 1) ** 3,
        answer + 1,
        answer - 1
    ];
    return {
        type: "power",
        mode: "cube",
        base,
        exponent: 3,
        answer,
        display: powerText(base, 3),
        question: `Mennyi a ${base} köbe?`,
        options: numberOptions(answer, candidates)
    };
}

function buildNotation() {
    const exponent = pick([2, 3]);
    const base = exponent === 2 ? randInt(2, 10) : randInt(2, 6);
    const answer = powerText(base, exponent);
    const repeated = Array(exponent).fill(base).join(" · ");
    const candidates = [
        powerText(exponent, base),
        powerText(base, exponent === 2 ? 3 : 2),
        powerText(base, exponent + 1),
        `${base} · ${exponent}`,
        String(base + exponent),
        String(base * exponent)
    ];
    const wrong = shuffle([...new Set(candidates)]).filter(t => t !== answer).slice(0, 3);
    return {
        type: "power",
        mode: "notation",
        base,
        exponent,
        answer,
        display: repeated,
        question: `Melyik hatvány jelöli a ${repeated} szorzatot?`,
        options: shuffle([
            { text: answer, correct: true },
            ...wrong.map(t => ({ text: t, correct: false }))
        ])
    };
}

function buildBase() {
    const exponent = pick([2, 3]);
    const base = exponent === 2 ? randInt(2, 12) : randInt(2, 6);
    const value = base ** exponent;
    const candidates = [base - 1, base + 1, base + 2, base - 2, base + 3];
    return {
        type: "power",
        mode: "base",
        base,
        exponent,
        value,
        answer: base,
        display: String(value),
        question: `Melyik szám ${exponent === 2 ? "négyzete" : "köbe"} a ${value}?`,
        options: numberOptions(base, candidates)
    };
}

export function generatePower(options = {}) {
    const { count = 4, mode = "mixed" } = options;

    const builders = {
        square: buildSquare,
        cube: buildCube,
        notation: buildNotation,
        base: buildBase
    };

    const tasks = [];
    const seen = new Set();

    let guard = 0;
    while (tasks.length < count && guard < count * 200) {
        guard++;
        const chosen = mode === "mixed" ? pick(Object.keys(builders)) : mode;
        const build = builders[chosen];
        if (!build) {
            throw new Error(`Ismeretlen hatvány mód: ${chosen}`);
        }
        const task = build();
        const key = `${task.mode}|${task.question}`;
        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push(task);
    }

    return tasks;
}
