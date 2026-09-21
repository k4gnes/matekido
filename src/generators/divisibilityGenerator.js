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

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const SUFFIX = {
    4: "-nek",
    5: "-nek",
    6: "-nak",
    7: "-nek",
    8: "-nak",
    9: "-nek",
    10: "-nek",
    12: "-nek",
    15: "-nek",
    16: "-nak",
    18: "-nak",
    20: "-nak",
    24: "-nek",
    30: "-nak"
};

const MULTIPLE_BASES = [4, 5, 6, 7, 8, 9, 10, 12];
const DIVISOR_BASES = [12, 15, 16, 18, 20, 24, 30];

function divisorsOf(n) {
    const out = [];
    for (let d = 1; d <= n; d++) {
        if (n % d === 0) out.push(d);
    }
    return out;
}

function pickNumberOptions(correct, pool) {
    const unique = [...new Set(pool)].filter(v => v !== correct);
    const decoys = shuffle(unique).slice(0, 3);
    return shuffle([correct, ...decoys]).map(text => ({ text: String(text), correct: text === correct }));
}

function inRange(pool, center, spread) {
    return pool.filter(v => v >= center - spread && v <= center + spread);
}

function buildMultipleTask() {
    const base = pick(MULTIPLE_BASES);
    const correct = base * randint(2, 6);
    const pool = [];
    for (let v = 2; v <= 90; v++) {
        if (v % base !== 0) pool.push(v);
    }
    const near = inRange(pool, correct, 12);
    const options = pickNumberOptions(correct, near.length >= 3 ? near : pool);
    return {
        type: "divisibility",
        mode: "multiple",
        base,
        suffix: SUFFIX[base],
        question: `Melyik többszöröse a ${base}${SUFFIX[base]}?`,
        options
    };
}

function buildNotMultipleTask() {
    const base = pick([4, 5, 6, 7, 8, 9]);
    const factor = randint(3, 6);
    const m = base * factor;
    const non = m + pick([1, 2, 3, base - 1]);
    const multiples = [m - base, m, m + base];
    const options = shuffle([...multiples.map(v => ({ text: String(v), correct: false })), { text: String(non), correct: true }]);
    return {
        type: "divisibility",
        mode: "not-multiple",
        base,
        suffix: SUFFIX[base],
        question: `Melyik szám NEM többszöröse a ${base}${SUFFIX[base]}?`,
        options
    };
}

function buildDivisorTask() {
    const base = pick(DIVISOR_BASES);
    const divisors = divisorsOf(base).filter(d => d > 1 && d < base);
    const correct = pick(divisors);
    const pool = [];
    for (let v = 2; v <= base; v++) {
        if (base % v !== 0) pool.push(v);
    }
    const near = inRange(pool, correct, 8);
    const options = pickNumberOptions(correct, near.length >= 3 ? near : pool);
    return {
        type: "divisibility",
        mode: "divisor",
        base,
        suffix: SUFFIX[base],
        question: `Melyik osztója a ${base}${SUFFIX[base]}?`,
        options
    };
}

function buildCountTask() {
    const base = pick(DIVISOR_BASES);
    const correct = divisorsOf(base).length;
    const pool = [3, 4, 5, 6, 7, 8, 9];
    const options = pickNumberOptions(correct, pool);
    return {
        type: "divisibility",
        mode: "count",
        base,
        suffix: SUFFIX[base],
        divisors: divisorsOf(base),
        question: `Hány osztója van a ${base}${SUFFIX[base]}?`,
        options
    };
}

export function generateDivisibility(options = {}) {
    const { count = 4, mode = "mixed" } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        if (mode === "multiple") {
            tasks.push(buildMultipleTask());
        } else if (mode === "divisor") {
            tasks.push(buildDivisorTask());
        } else if (mode === "count") {
            tasks.push(buildCountTask());
        } else if (mode === "not-multiple") {
            tasks.push(buildNotMultipleTask());
        } else {
            tasks.push(pick([buildMultipleTask, buildDivisorTask, buildCountTask, buildNotMultipleTask])());
        }
    }
    return tasks;
}