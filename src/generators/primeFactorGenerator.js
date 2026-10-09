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

export function isPrime(n) {
    if (n < 2) return false;
    for (let d = 2; d * d <= n; d++) {
        if (n % d === 0) return false;
    }
    return true;
}

export function factorize(n) {
    const out = [];
    let x = n;
    for (let p = 2; p * p <= x; p++) {
        while (x % p === 0) {
            out.push(p);
            x /= p;
        }
    }
    if (x > 1) out.push(x);
    return out;
}

const SUPERSCRIPTS = { 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };

function group(factors) {
    const groups = [];
    for (const p of factors) {
        const last = groups[groups.length - 1];
        if (last && last[0] === p) last[1]++;
        else groups.push([p, 1]);
    }
    return groups;
}

function formatFlat(factors) {
    return factors.join(" · ");
}

function formatPower(factors) {
    return group(factors)
        .map(([p, e]) => (e > 1 ? `${p}${SUPERSCRIPTS[e] ?? "^" + e}` : String(p)))
        .join(" · ");
}

function formatGroups(groups) {
    return groups
        .filter(g => g[1] > 0)
        .map(([p, e]) => (e > 1 ? `${p}${SUPERSCRIPTS[e] ?? "^" + e}` : String(p)))
        .join(" · ");
}

const NUMBERS = [];
for (let n = 4; n <= 100; n++) {
    if (!isPrime(n)) NUMBERS.push(n);
}

const WITH_POWER = [];
for (const n of NUMBERS) {
    const factors = factorize(n);
    if (new Set(factors).size < factors.length) WITH_POWER.push(n);
}

function distinct(correct, candidates, count) {
    const out = [];
    for (const c of shuffle(candidates.slice())) {
        if (c === correct || out.includes(c)) continue;
        out.push(c);
        if (out.length >= count) break;
    }
    return out;
}

function flatDistractors(n) {
    const factors = factorize(n);
    const cands = [];

    for (let i = 0; i < factors.length - 1; i++) {
        const merged = factors.slice();
        merged.splice(i, 2, factors[i] * factors[i + 1]);
        cands.push(formatFlat(merged));
    }

    for (const p of [2, 3, 5, 7]) {
        cands.push(formatFlat([...factors, p]));
    }

    for (let d = 1; d <= 6; d++) {
        for (const m of [n - d, n + d]) {
            if (m >= 4 && m <= 400) cands.push(formatFlat(factorize(m)));
        }
    }

    return cands;
}

function powerDistractors(n) {
    const groups = group(factorize(n));
    const cands = [];

    groups.forEach(([p, e], idx) => {
        const lower = groups.map((g, i) => (i === idx ? [p, e - 1] : g));
        const higher = groups.map((g, i) => (i === idx ? [p, e + 1] : g));
        if (e - 1 >= 1) cands.push(formatGroups(lower));
        if (e + 1 <= 9) cands.push(formatGroups(higher));
    });

    for (let d = 1; d <= 6; d++) {
        for (const m of [n - d, n + d]) {
            if (m >= 4 && m <= 200) cands.push(formatPower(factorize(m)));
        }
    }

    return cands;
}

function buildChoose() {
    const number = pick(NUMBERS);
    const factors = factorize(number);
    const correct = formatFlat(factors);
    const wrong = distinct(correct, flatDistractors(number), 3);
    return {
        type: "prime-factor",
        mode: "choose",
        number,
        answer: correct,
        question: `Melyik a ${number} prímfelbontása?`,
        options: shuffle([
            { text: correct, correct: true },
            ...wrong.map(t => ({ text: t, correct: false }))
        ])
    };
}

function buildExponents() {
    const number = pick(WITH_POWER);
    const factors = factorize(number);
    const correct = formatPower(factors);
    const wrong = distinct(correct, powerDistractors(number), 3);
    return {
        type: "prime-factor",
        mode: "exponents",
        number,
        answer: correct,
        question: `Melyik a ${number} prímfelbontása hatványokkal?`,
        options: shuffle([
            { text: correct, correct: true },
            ...wrong.map(t => ({ text: t, correct: false }))
        ])
    };
}

function buildMissing() {
    let number = 0;
    let factors = [];
    do {
        number = randInt(4, 100);
        factors = factorize(number);
    } while (factors.length < 2);

    const idx = randInt(0, factors.length - 1);
    const answer = factors[idx];
    const shown = factors.map((f, i) => (i === idx ? "?" : String(f)));
    const distractors = shuffle([2, 3, 5, 7, 11, 13].filter(p => p !== answer)).slice(0, 3);

    return {
        type: "prime-factor",
        mode: "missing",
        number,
        answer,
        factors,
        question: `Melyik szám kerül a ? helyére?  ${number} = ${shown.join(" · ")}`,
        options: shuffle([
            { text: String(answer), correct: true },
            ...distractors.map(p => ({ text: String(p), correct: false }))
        ])
    };
}

export function generatePrimeFactor(options = {}) {
    const { count = 4, mode = "mixed" } = options;

    const builders = {
        choose: buildChoose,
        missing: buildMissing,
        exponents: buildExponents
    };

    const tasks = [];
    const seen = new Set();

    let guard = 0;
    while (tasks.length < count && guard < count * 200) {
        guard++;
        const chosen = mode === "mixed" ? pick(Object.keys(builders)) : mode;
        const build = builders[chosen];
        if (!build) {
            throw new Error(`Ismeretlen prímfelbontás mód: ${chosen}`);
        }
        const task = build();
        const key = `${task.mode}|${task.question}`;
        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push(task);
    }

    return tasks;
}
