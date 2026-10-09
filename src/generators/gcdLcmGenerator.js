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

export function gcd(a, b) {
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}

export function lcm(a, b) {
    return (a / gcd(a, b)) * b;
}

function divisorsOf(n) {
    const out = [];
    for (let d = 1; d <= n; d++) {
        if (n % d === 0) out.push(d);
    }
    return out;
}

function multiplesOf(n, limit) {
    const out = [];
    for (let m = n; m <= limit; m += n) out.push(m);
    return out;
}

const PAIRS = [];
for (let a = 2; a <= 20; a++) {
    for (let b = a + 1; b <= 20; b++) {
        if (lcm(a, b) <= 60) PAIRS.push([a, b]);
    }
}

function distinctNumbers(correct, candidates, count, isWrong) {
    const pool = [...new Set(candidates)].filter(v => v > 0 && v !== correct && isWrong(v));
    const out = shuffle(pool).slice(0, count);
    if (out.length < count) {
        const chosen = new Set(out);
        const extras = [];
        for (let v = 2; v <= 60 && extras.length < 20; v++) {
            if (v !== correct && isWrong(v) && !chosen.has(v)) extras.push(v);
        }
        for (const v of shuffle(extras)) {
            if (out.length >= count) break;
            out.push(v);
        }
    }
    return out;
}

function optionsFor(correct, wrong) {
    return shuffle([
        { text: String(correct), correct: true },
        ...wrong.map(v => ({ text: String(v), correct: false }))
    ]);
}

function buildGcd() {
    const [a, b] = pick(PAIRS);
    const g = gcd(a, b);
    const cands = [];
    for (const d of divisorsOf(a)) if (b % d === 0 && d !== g) cands.push(d);
    for (const d of divisorsOf(a)) if (b % d !== 0) cands.push(d);
    for (const d of divisorsOf(b)) if (a % d !== 0) cands.push(d);
    cands.push(g + 1, g - 1, g * 2, g * 3);
    return {
        type: "gcd-lcm",
        mode: "gcd",
        pair: [a, b],
        answer: g,
        question: `Mennyi a ${a} és a ${b} legnagyobb közös osztója?`,
        options: optionsFor(g, distinctNumbers(g, cands, 3, () => true))
    };
}

function buildLcm() {
    const [a, b] = pick(PAIRS);
    const l = lcm(a, b);
    const cands = [l * 2, l * 3];
    for (const m of multiplesOf(a, Math.max(6 * a, 60))) if (m % b !== 0) cands.push(m);
    for (const m of multiplesOf(b, Math.max(6 * b, 60))) if (m % a !== 0) cands.push(m);
    cands.push(l + 1, l - 1);
    return {
        type: "gcd-lcm",
        mode: "lcm",
        pair: [a, b],
        answer: l,
        question: `Mennyi a ${a} és a ${b} legkisebb közös többszöröse?`,
        options: optionsFor(l, distinctNumbers(l, cands, 3, () => true))
    };
}

function buildCommonDivisor() {
    const [a, b] = pick(PAIRS);
    const common = divisorsOf(a).filter(d => b % d === 0);
    const correct = pick(common);
    const cands = [];
    for (const d of divisorsOf(a)) if (b % d !== 0) cands.push(d);
    for (const d of divisorsOf(b)) if (a % d !== 0) cands.push(d);
    for (let v = 2; v <= 12; v++) if (!(a % v === 0 && b % v === 0)) cands.push(v);
    return {
        type: "gcd-lcm",
        mode: "common-divisor",
        pair: [a, b],
        answer: correct,
        question: `Melyik szám közös osztója a ${a}-nek és a ${b}-nek?`,
        options: optionsFor(correct, distinctNumbers(correct, cands, 3, v => !(a % v === 0 && b % v === 0)))
    };
}

function buildCommonMultiple() {
    const [a, b] = pick(PAIRS);
    const l = lcm(a, b);
    const common = [l, l * 2, l * 3, l * 4];
    const correct = pick(common);
    const cands = [];
    for (const m of multiplesOf(a, 6 * l)) if (m % b !== 0) cands.push(m);
    for (const m of multiplesOf(b, 6 * l)) if (m % a !== 0) cands.push(m);
    cands.push(l + 1, l - 1);
    return {
        type: "gcd-lcm",
        mode: "common-multiple",
        pair: [a, b],
        answer: correct,
        question: `Melyik szám közös többszöröse a ${a}-nek és a ${b}-nek?`,
        options: optionsFor(correct, distinctNumbers(correct, cands, 3, v => !(v % a === 0 && v % b === 0)))
    };
}

export function generateGcdLcm(options = {}) {
    const { count = 4, mode = "mixed" } = options;

    const builders = {
        gcd: buildGcd,
        lcm: buildLcm,
        "common-divisor": buildCommonDivisor,
        "common-multiple": buildCommonMultiple
    };

    const tasks = [];
    const seen = new Set();

    let guard = 0;
    while (tasks.length < count && guard < count * 200) {
        guard++;
        const chosen = mode === "mixed" ? pick(Object.keys(builders)) : mode;
        const build = builders[chosen];
        if (!build) {
            throw new Error(`Ismeretlen LNKO/LKKT mód: ${chosen}`);
        }
        const task = build();
        const key = `${task.mode}|${task.question}`;
        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push(task);
    }

    return tasks;
}
