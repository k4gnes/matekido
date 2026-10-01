const MAX_GENERATION_ATTEMPTS = 10000;

const MAX_DEN = 12;

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const KINDS = ["pizza", "torta", "csoki", "szendvics"];

const EXPAND_BASE = [
    [1, 2], [1, 3], [2, 3], [1, 4], [2, 4], [3, 4],
    [1, 5], [2, 5], [3, 5], [4, 5], [1, 6], [5, 6]
];
const EXPAND_TIMES = [2, 3];

const SIMPLIFY_BASE = [
    [1, 2], [1, 3], [1, 4], [2, 3], [3, 4], [1, 5], [2, 5], [3, 5], [3, 8], [5, 8]
];
const SIMPLIFY_TIMES = [2, 3, 4];

const COMPARE_BASE = [
    [1, 2], [1, 3], [2, 3], [1, 4], [2, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5],
    [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [1, 8], [3, 8], [5, 8], [7, 8]
];
const COMPARE_TIMES = [2, 3];

function scaledPairs(bases, times) {
    const pairs = [];
    for (const [num, den] of bases) {
        for (const t of times) {
            if (den * t <= MAX_DEN) {
                pairs.push([num, den, t]);
            }
        }
    }
    return pairs;
}

const EXPAND_PAIRS = scaledPairs(EXPAND_BASE, EXPAND_TIMES);
const SIMPLIFY_PAIRS = scaledPairs(SIMPLIFY_BASE, SIMPLIFY_TIMES);
const COMPARE_PAIRS = scaledPairs(COMPARE_BASE, COMPARE_TIMES);

function buildExpand() {
    const [baseNum, baseDen, times] = pick(EXPAND_PAIRS);
    const num = randint(1, baseDen - 1);
    const den = baseDen;
    return {
        type: "fraction-equal",
        mode: "expand",
        kind: pick(KINDS),
        num,
        den,
        targetDen: den * times,
        answer: num * times,
        explanation: `${den * times} : ${den} = ${times}, ezért a számlálót is ${times}-szorosára kell szorozni: ${num} × ${times} = ${num * times}`
    };
}

function buildSimplify() {
    const [baseNum, baseDen, times] = pick(SIMPLIFY_PAIRS);
    const num = baseNum;
    const den = baseDen;
    return {
        type: "fraction-equal",
        mode: "simplify",
        kind: pick(KINDS),
        num: num * times,
        den: den * times,
        targetDen: den,
        answer: num,
        explanation: `A nevező ${den * times} : ${times} = ${den}, a számláló pedig ${num * times} : ${times} = ${num}`
    };
}

function valueOf(fraction) {
    return fraction[0] / fraction[1];
}

function buildCompare() {
    const [baseNum, baseDen, times] = pick(COMPARE_PAIRS);
    const equal = Math.random() < 0.65;

    let fractionA = [baseNum, baseDen];
    let fractionB;

    if (equal) {
        fractionB = [baseNum * times, baseDen * times];
    } else {
        const candidates = COMPARE_BASE.filter(f => Math.abs(valueOf(f) - valueOf(fractionA)) > 0.0001);
        fractionB = pick(candidates.length ? candidates : COMPARE_BASE);
    }

    if (Math.random() < 0.5) {
        const swap = fractionA;
        fractionA = fractionB;
        fractionB = swap;
    }

    const [numA, denA] = fractionA;
    const [numB, denB] = fractionB;
    const left = numA * denB;
    const right = numB * denA;
    const operator = left === right ? "=" : left > right ? ">" : "<";

    return {
        type: "fraction-equal",
        mode: "compare",
        kind: pick(KINDS),
        numA,
        denA,
        numB,
        denB,
        operator,
        explanation: `${numA} × ${denB} = ${numA * denB}, ${numB} × ${denA} = ${numB * denA}`
    };
}

function buildTask(mode) {
    if (mode === "expand") return buildExpand();
    if (mode === "simplify") return buildSimplify();
    return buildCompare();
}

export function generateFractionEqual(options = {}) {

    const { count = 4, mode = "compare" } = options;

    const tasks = [];
    const seen = new Set();
    let attempts = 0;

    while (tasks.length < count) {
        attempts++;
        if (attempts > MAX_GENERATION_ATTEMPTS) {
            throw new Error("Nem sikerült elegendő feladatot generálni...");
        }

        const task = buildTask(mode);
        const key = task.mode === "compare"
            ? `${task.numA}/${task.denA}|${task.numB}/${task.denB}`
            : `${task.mode}-${task.num}/${task.den}-${task.targetDen}`;

        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push(task);
    }

    return tasks;
}

export function fractionEqualGcd(a, b) {
    return gcd(a, b);
}