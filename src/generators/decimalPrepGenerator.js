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

function decimalForTenths(n) {
    return `0,${n}`;
}

function isCleanHundredths(n) {
    return n > 0 && n < 100 && n % 10 !== 0;
}

function decimalForHundredths(n) {
    return n < 10 ? `0,0${n}` : `0,${n}`;
}

function pickDecimalOptions(correct, pool) {
    const decoys = shuffle([...new Set(pool)].filter(v => v !== correct)).slice(0, 3);
    return shuffle([correct, ...decoys]).map(text => ({ text, correct: text === correct }));
}

function tenthsPool() {
    const out = [];
    for (let v = 1; v <= 9; v++) out.push(decimalForTenths(v));
    return out;
}

function tenthsDecoys(n) {
    const lower = Math.floor(n / 10);
    return [decimalForTenths(lower), decimalForTenths(Math.min(lower + 1, 9))];
}

function hundredthsPool(correct) {
    const out = [];
    const target = Number(correct.replace(",", "").padStart(3, "0"));
    for (let v = 1; v < 100; v++) {
        if (!isCleanHundredths(v)) continue;
        const d = decimalForHundredths(v);
        if (d === correct) continue;
        if (Math.abs(v - target) > 15) continue;
        out.push(d);
    }
    return out;
}

function buildTenthsTask() {
    const filled = randint(1, 9);
    const options = pickDecimalOptions(decimalForTenths(filled), tenthsPool());
    return {
        type: "decimal",
        mode: "tenths",
        total: 10,
        filled,
        question: "Mekkora részt színeztek be?",
        options
    };
}

function buildHundredthsTask() {
    const filled = pick([3, 7, 11, 14, 16, 23, 31, 42, 45, 58, 67, 71, 83, 96]);
    const correct = decimalForHundredths(filled);
    const pool = hundredthsPool(correct).concat(tenthsDecoys(filled));
    const options = pickDecimalOptions(correct, pool);
    return {
        type: "decimal",
        mode: "hundredths",
        total: 100,
        filled,
        question: "Mekkora részt színeztek be?",
        options
    };
}

function buildFractionToDecimalTask() {
    const denominator = pick([10, 100]);
    const fractionNums = denominator === 10 ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [3, 7, 11, 14, 16, 23, 31, 42, 45, 58, 67, 71, 83, 96];
    const numerator = pick(fractionNums);
    const correct = denominator === 10 ? decimalForTenths(numerator) : decimalForHundredths(numerator);
    const pool = denominator === 10
        ? tenthsPool()
        : hundredthsPool(correct).concat(tenthsDecoys(numerator));
    const options = pickDecimalOptions(correct, pool);
    return {
        type: "decimal",
        mode: "convert",
        direction: "fraction-to-decimal",
        numerator,
        denominator,
        symbol: `${numerator}/${denominator}`,
        question: "Mennyi ez tizedes törttel?",
        options
    };
}

function buildDecimalToFractionTask() {
    const denominator = pick([10, 100]);
    const fractionNums = denominator === 10 ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [3, 7, 11, 14, 16, 23, 31];
    const numerator = pick(fractionNums);
    const correct = `${numerator}/${denominator}`;
    const pool = [];
    for (const n of fractionNums) pool.push(`${n}/${denominator}`);
    for (const n of [3, 7, 11, 14, 16, 23]) pool.push(`${n}/${denominator === 10 ? 100 : 10}`);
    const options = pickDecimalOptions(correct, pool);
    return {
        type: "decimal",
        mode: "convert",
        direction: "decimal-to-fraction",
        numerator,
        denominator,
        symbol: denominator === 10 ? decimalForTenths(numerator) : decimalForHundredths(numerator),
        question: "Mennyi ez törttel?",
        options
    };
}

function buildCompareTask() {
    const k = randint(1, 9);
    const mode = pick(["equal", "cross"]);
    let left, right, relation;
    if (mode === "equal") {
        left = decimalForTenths(k);
        right = decimalForHundredths(10 * k);
        relation = "=";
    } else {
        const candidates = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31, 33, 35, 38, 41, 44, 47, 52, 56, 61, 67, 73, 79, 83, 91].filter(v => v !== 10 * k && Math.abs(10 * k - v) > 1);
        const m = pick(candidates);
        left = decimalForTenths(k);
        right = decimalForHundredths(m);
        relation = 10 * k > m ? ">" : "<";
    }
    if (Math.random() < 0.5) {
        [left, right] = [right, left];
        relation = relation === ">" ? "<" : relation === "<" ? ">" : "=";
    }
    const options = shuffle([">", "<", "="]).map(text => ({ text, correct: text === relation }));
    return {
        type: "decimal",
        mode: "compare",
        left,
        right,
        question: "Melyik jel illik a két szám közé?",
        options
    };
}

export function generateDecimalPrep(options = {}) {
    const { count = 4, mode = "mixed" } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        if (mode === "tenths") {
            tasks.push(buildTenthsTask());
        } else if (mode === "hundredths") {
            tasks.push(buildHundredthsTask());
        } else if (mode === "convert") {
            tasks.push(Math.random() < 0.5 ? buildFractionToDecimalTask() : buildDecimalToFractionTask());
        } else if (mode === "compare") {
            tasks.push(buildCompareTask());
        } else {
            tasks.push(pick([buildTenthsTask, buildHundredthsTask, buildFractionToDecimalTask, buildDecimalToFractionTask, buildCompareTask])());
        }
    }
    return tasks;
}