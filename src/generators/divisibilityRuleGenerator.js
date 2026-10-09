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

const RULES = [2, 3, 4, 5, 6, 9, 10];
const REMAINDER_DIVISORS = [6, 7, 8, 9, 11, 12];

function instrumental(k) {
    return { 2: "2-vel", 3: "3-mal", 4: "4-gyel", 5: "5-tel", 6: "6-tal", 9: "9-cel", 10: "10-zel" }[k];
}

function divisible(n, k) {
    return n % k === 0;
}

function nonMultiples(k, from, to) {
    const out = [];
    for (let v = from; v <= to; v++) {
        if (!divisible(v, k)) out.push(v);
    }
    return out;
}

function buildWhich() {
    const k = pick(RULES);
    const qMin = Math.ceil(100 / k);
    const qMax = Math.floor(999 / k);
    const correct = k * randInt(qMin, qMax);

    let pool = nonMultiples(k, Math.max(100, correct - 30), Math.min(999, correct + 30));
    if (pool.length < 3) pool = nonMultiples(k, 100, 999);

    const decoys = shuffle([...new Set(pool)]).slice(0, 3);

    return {
        type: "divisibility-rule",
        mode: "which",
        divisor: k,
        answer: correct,
        word: instrumental(k),
        question: `Melyik szám osztható ${instrumental(k)}?`,
        options: shuffle([
            { text: String(correct), value: correct, correct: true },
            ...decoys.map(v => ({ text: String(v), value: v, correct: false }))
        ])
    };
}

function buildWith() {
    for (let i = 0; i < 200; i++) {
        const d = pick(RULES);
        const decoys = shuffle(RULES.filter(r => r !== d && d % r !== 0)).slice(0, 3);
        if (decoys.length < 3) continue;

        const qMin = Math.ceil(120 / d);
        const qMax = Math.floor(999 / d);

        for (let j = 0; j < 80; j++) {
            const n = d * randInt(qMin, qMax);
            if (decoys.some(r => divisible(n, r))) continue;

            return {
                type: "divisibility-rule",
                mode: "with",
                divisor: d,
                number: n,
                answer: d,
                word: instrumental(d),
                question: `A ${n} melyik számmal osztható?`,
                options: shuffle([
                    { text: instrumental(d), value: d, correct: true },
                    ...decoys.map(r => ({ text: instrumental(r), value: r, correct: false }))
                ])
            };
        }
    }
    return null;
}

function buildRemainder() {
    const b = pick(REMAINDER_DIVISORS);
    const qMax = Math.floor((999 - (b - 1)) / b);
    const q = randInt(9, qMax);
    const r = randInt(0, b - 1);
    const a = b * q + r;
    if (a < 100) return null;

    return {
        type: "divisibility-rule",
        mode: "remainder",
        a,
        b,
        quotient: q,
        answer: r,
        question: `Mennyi a maradék? (${a} ÷ ${b})`
    };
}

export function generateDivisibilityRule(options = {}) {

    const {
        count = 6,
        mode = "mixed",
        interaction = "choice"
    } = options;

    const tasks = [];
    const seen = new Set();

    let guard = 0;
    while (tasks.length < count && guard < count * 150) {
        guard++;

        const m = mode === "mixed" ? pick(["which", "with"]) : mode;

        let task = null;
        if (m === "which") task = buildWhich();
        else if (m === "with") task = buildWith();
        else task = buildRemainder();

        if (!task) continue;
        task.interaction = interaction;

        const key = m === "remainder"
            ? `remainder|${task.a}|${task.b}`
            : `${m}|${task.divisor}|${task.answer ?? task.number}`;
        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push(task);
    }

    return tasks;
}