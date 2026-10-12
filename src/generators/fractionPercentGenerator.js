const MAX_GENERATION_ATTEMPTS = 10000;

const BASIC_DENOMS = [2, 4, 5, 10];
const ADVANCED_DENOMS = [2, 4, 5, 10, 20, 25, 50];

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

function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
}

function sameValue(aNum, aDen, bNum, bDen) {
    return aNum * bDen === bNum * aDen;
}

function buildValueList(denoms) {
    const values = [];
    for (const denominator of denoms) {
        for (let numerator = 1; numerator < denominator; numerator++) {
            if (gcd(numerator, denominator) !== 1) continue;
            values.push({ numerator, denominator, percent: numerator * 100 / denominator });
        }
    }
    return values;
}

const BASIC_VALUES = buildValueList(BASIC_DENOMS);
const ADVANCED_VALUES = buildValueList(ADVANCED_DENOMS);

function pickValue(level) {
    if (level === "basic") return pick(BASIC_VALUES);
    if (level === "advanced") return pick(ADVANCED_VALUES);
    return pick([...BASIC_VALUES, ...ADVANCED_VALUES]);
}

function percentPool(correct) {
    const pool = [];
    for (const delta of [-25, -20, -15, -10, -5, 5, 10, 15, 20, 25]) {
        const value = correct + delta;
        if (value >= 1 && value <= 99) pool.push(value);
    }
    for (const value of [correct * 2, correct / 2, 100 - correct]) {
        if (Number.isInteger(value) && value >= 1 && value <= 99) pool.push(value);
    }
    return shuffle([...new Set(pool.filter(value => value !== correct))]);
}

function percentOptions(percent) {
    const decoys = percentPool(percent).slice(0, 3);
    return shuffle([
        { text: `${percent}%`, percent, correct: true },
        ...decoys.map(value => ({ text: `${value}%`, percent: value, correct: false }))
    ]);
}

function fractionDistractors(numerator, denominator, level) {
    const pool = level === "basic" ? BASIC_VALUES : ADVANCED_VALUES;
    const candidates = [];

    const add = (num, den) => {
        if (!Number.isInteger(num) || !Number.isInteger(den)) return;
        const g = gcd(num, den);
        num /= g;
        den /= g;
        if (num < 1 || den < 2 || num >= den) return;
        if (num > 96 || den > 96) return;
        if (sameValue(num, den, numerator, denominator)) return;
        if (candidates.some(c => sameValue(num, den, c.numerator, c.denominator))) return;
        candidates.push({ numerator: num, denominator: den });
    };

    add(numerator, denominator + 1);
    add(numerator + 1, denominator);
    add(denominator - numerator, denominator);
    add(numerator, denominator - 1);
    add(numerator + 1, denominator + 1);
    add(numerator * 2, denominator);

    for (const value of shuffle(pool.slice())) add(value.numerator, value.denominator);

    return candidates.slice(0, 3);
}

function fractionOptions(numerator, denominator, level) {
    const decoys = fractionDistractors(numerator, denominator, level);
    if (decoys.length < 3) return null;
    return shuffle([
        { numerator, denominator, text: `${numerator}/${denominator}`, correct: true },
        ...decoys.map(c => ({
            numerator: c.numerator,
            denominator: c.denominator,
            text: `${c.numerator}/${c.denominator}`,
            correct: false
        }))
    ]);
}

function ratioDistractors(numerator, denominator) {
    const candidates = [];

    const add = (part, whole) => {
        if (!Number.isInteger(part) || !Number.isInteger(whole)) return;
        if (part < 1 || whole < 2) return;
        if (part > 96 || whole > 96) return;
        if (part * denominator === whole * numerator) return;
        if (candidates.some(c => c.part * whole === c.whole * part)) return;
        candidates.push({ part, whole });
    };

    add(numerator, denominator + 1);
    add(numerator + 1, denominator);
    add(denominator - numerator, denominator);
    add(numerator + 1, denominator + 1);
    add(denominator, numerator);
    add(numerator * 2, denominator);
    add(numerator, denominator * 2);
    add(numerator + 2, denominator);

    return candidates.slice(0, 3);
}

function ratioOptions(numerator, denominator) {
    const decoys = ratioDistractors(numerator, denominator);
    if (decoys.length < 3) return null;
    return shuffle([
        { part: numerator, whole: denominator, text: `${numerator} : ${denominator}`, correct: true },
        ...decoys.map(c => ({ part: c.part, whole: c.whole, text: `${c.part} : ${c.whole}`, correct: false }))
    ]);
}

function toPercentHint(givenForm, numerator, denominator) {
    const factor = 100 / denominator;
    const start = givenForm === "ratio"
        ? `A ${numerator} : ${denominator} arány azt jelenti, hogy az egész ${denominator} részéből ${numerator} a részünk, tehát a törtrész ${numerator}/${denominator}.`
        : `A ${numerator}/${denominator} törtrészben a rész a ${numerator}, az egész a ${denominator}.`;
    return `${start} Bővítsd a törtet 100 nevezőre: ${denominator} · ${factor} = 100, és ${numerator} · ${factor} = ${numerator * factor}. A 100 nevezőről leolvasott számláló éppen a százalék.`;
}

function fromPercentHint(target, percent, numerator, denominator, g) {
    if (target === "fraction") {
        return `A ${percent}% annyi, mint a ${percent}/100. Ezt egyszerűsítsd: a ${percent} és a 100 közös osztója a ${g}, ezért ${percent}/100 = ${numerator}/${denominator}.`;
    }
    return `A ${percent}% annyi, mint a ${percent}/100. Egyszerűsítve ${numerator}/${denominator}, tehát a rész ${numerator}, az egész ${denominator}, azaz az arány ${numerator} : ${denominator}.`;
}

function buildToPercent(level, givenForm) {
    const value = pickValue(level);
    const { numerator, denominator, percent } = value;

    return {
        type: "fraction-percent",
        mode: "to-percent",
        given: givenForm,
        target: "percent",
        numerator,
        denominator,
        percent,
        ratio: { part: numerator, whole: denominator },
        question: givenForm === "fraction"
            ? `Hány százaléknak felel meg a ${numerator}/${denominator}?`
            : `Hány százaléknak felel meg a ${numerator} : ${denominator} arány?`,
        hint: toPercentHint(givenForm, numerator, denominator),
        explanation: `A ${numerator}/${denominator} = ${numerator} : ${denominator} = ${percent}%.`,
        options: percentOptions(percent)
    };
}

function buildFromPercent(level, targetForm) {
    const value = pickValue(level);
    const { numerator, denominator, percent } = value;
    const g = gcd(percent, 100);

    const options = targetForm === "fraction"
        ? fractionOptions(numerator, denominator, level)
        : ratioOptions(numerator, denominator);

    if (!options) return null;

    return {
        type: "fraction-percent",
        mode: "from-percent",
        given: "percent",
        target: targetForm,
        numerator,
        denominator,
        percent,
        ratio: { part: numerator, whole: denominator },
        question: targetForm === "fraction"
            ? `A ${percent}% melyik törtnek felel meg a legegyszerűbb alakban?`
            : `A ${percent}% milyen arányt jelent (rész : egész)?`,
        hint: fromPercentHint(targetForm, percent, numerator, denominator, g),
        explanation: `A ${percent}% = ${percent}/100 = ${numerator}/${denominator} = ${numerator} : ${denominator}.`,
        options
    };
}

export function generateFractionPercent(options = {}) {
    const { count = 3, mode = "mixed", level = "mixed" } = options;

    const builders = {
        "to-percent": () => buildToPercent(level, pick(["fraction", "ratio"])),
        "from-percent": () => buildFromPercent(level, pick(["fraction", "ratio"]))
    };

    const modes = mode === "mixed" ? Object.keys(builders) : [mode];

    for (const chosen of modes) {
        if (!builders[chosen]) {
            throw new Error(`Ismeretlen törtrész-százalék mód: ${chosen}`);
        }
    }

    const tasks = [];
    const seen = new Set();
    let attempts = 0;

    while (tasks.length < count && attempts <= MAX_GENERATION_ATTEMPTS) {
        attempts++;

        const task = builders[pick(modes)]();
        if (!task) continue;

        const key = `${task.mode}|${task.given}|${task.target}|${task.numerator}/${task.denominator}`;
        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push(task);
    }

    if (tasks.length < count) {
        throw new Error("Nem sikerült elegendő feladatot generálni...");
    }

    return tasks;
}
