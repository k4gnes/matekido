const MAX_GENERATION_ATTEMPTS = 10000;
const MAX_ATTEMPTS = 400;

const DENOMS_WHOLE = [2, 3, 4, 5, 6, 8, 10];
const DENOMS_FRACTION = [2, 3, 4, 5, 6, 8, 9, 10, 12];

const MAX_FACTOR = 9;
const MAX_RAW_NUM = 96;
const MAX_RAW_DEN = 96;
const MAX_RATIO = 3;

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function sameValue(aNum, aDen, bNum, bDen) {
    return aNum * bDen === bNum * aDen;
}

function fractionOptions(answerNum, answerDen, candidates) {
    const values = [[answerNum, answerDen]];
    const options = [];

    const addable = (num, den) => {
        if (!Number.isInteger(num) || !Number.isInteger(den)) return false;
        if (num < 1 || den < 2) return false;
        if (num > den * MAX_RATIO) return false;
        if (num > MAX_RAW_NUM || den > MAX_RAW_DEN) return false;
        if (values.some(([vn, vd]) => sameValue(num, den, vn, vd))) return false;
        values.push([num, den]);
        return true;
    };

    for (const [num, den] of candidates) {
        if (options.length >= 3) break;
        if (!addable(num, den)) continue;
        options.push({ numerator: num, denominator: den, correct: false });
    }

    for (let step = 1; options.length < 3 && step <= 4; step++) {
        const round = [
            [answerNum + step, answerDen],
            [answerNum - step, answerDen],
            [answerNum, answerDen + step]
        ];
        for (const [num, den] of round) {
            if (options.length >= 3) break;
            if (!addable(num, den)) continue;
            options.push({ numerator: num, denominator: den, correct: false });
        }
    }

    if (options.length < 3) return null;

    return shuffle([
        { numerator: answerNum, denominator: answerDen, correct: true },
        ...options
    ]);
}

function timesWholeHint(num, den, factor) {
    return `Egész számmal szorozva csak a számlálót szorozzuk meg: ${num}/${den} × ${factor} = (${num} × ${factor})/${den}. Ha a kapott tört egyszerűsíthető, oszd el a számlálót és a nevezőt is a közös osztóval.`;
}

function divideWholeHint(num, den, divisor) {
    return `Egész számmal osztva a nevezőt szorozzuk meg, a számláló változatlan marad: ${num}/${den} ÷ ${divisor} = ${num}/(${den} × ${divisor}). Ezután egyszerűsíts, ha lehet.`;
}

function timesFractionHint(numA, denA, numB, denB) {
    return `Törteket úgy szorzunk, hogy a számlálókat és a nevezőket külön-külön összeszorozzuk: ${numA}/${denA} × ${numB}/${denB} = (${numA} × ${numB})/(${denA} × ${denB}). A végén egyszerűsítsd a kapott törtet!`;
}

function divideFractionHint(numA, denA, numB, denB) {
    return `Törttel osztani annyi, mint a reciprokával szorozni: ${numA}/${denA} ÷ ${numB}/${denB} = ${numA}/${denA} × ${denB}/${numB}. Utána már csak össze kell szorozni a számlálókat és a nevezőket.`;
}

function buildTimesWhole() {
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const den = pick(DENOMS_WHOLE);
        const num = randint(1, den - 1);
        const factor = randint(2, MAX_FACTOR);

        const rawNum = num * factor;
        const rawDen = den;

        if (rawNum > MAX_RAW_NUM) continue;

        const g = gcd(rawNum, rawDen);
        const answerNum = rawNum / g;
        const answerDen = rawDen / g;

        if (answerDen === 1) continue;
        if (answerNum > answerDen * MAX_RATIO) continue;

        const options = fractionOptions(answerNum, answerDen, [
            [num, den * factor],
            [num, den],
            [rawNum + den, den],
            [rawNum - den, den],
            [num * (factor + 1), den],
            [num + factor, den]
        ]);

        if (!options) continue;

        const explanation = g > 1
            ? `A számlálót megszorozzuk ${factor}-tal: ${num}/${den} × ${factor} = ${rawNum}/${den}. Ezt egyszerűsítjük ${g}-nel: ${answerNum}/${answerDen}.`
            : `A számlálót megszorozzuk ${factor}-tal: ${num}/${den} × ${factor} = ${rawNum}/${den}. Ez már nem egyszerűsíthető.`;

        return {
            type: "fraction-muldiv",
            op: "times",
            mode: "whole",
            left: { numerator: num, denominator: den },
            right: { whole: factor },
            rawNum,
            rawDen,
            answerNum,
            answerDen,
            question: "Mennyi a szorzat?",
            hint: timesWholeHint(num, den, factor),
            explanation,
            options
        };
    }

    return null;
}

function buildDivideWhole() {
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const den = pick(DENOMS_WHOLE);
        const num = randint(1, den - 1);
        const divisor = randint(2, MAX_FACTOR);

        const rawNum = num;
        const rawDen = den * divisor;

        if (rawDen > MAX_RAW_DEN) continue;

        const g = gcd(rawNum, rawDen);
        const answerNum = rawNum / g;
        const answerDen = rawDen / g;

        if (answerDen === 1) continue;
        if (answerNum > answerDen * MAX_RATIO) continue;

        const candidates = [
            [num * divisor, den],
            [num, den],
            [num, den / divisor],
            [num + divisor, den],
            [num, rawDen + divisor]
        ].filter(([, d]) => Number.isInteger(d));

        const options = fractionOptions(answerNum, answerDen, candidates);

        if (!options) continue;

        const explanation = g > 1
            ? `A nevezőt megszorozzuk ${divisor}-tal: ${num}/${den} ÷ ${divisor} = ${rawNum}/${rawDen}. Ezt egyszerűsítjük ${g}-nel: ${answerNum}/${answerDen}.`
            : `A nevezőt megszorozzuk ${divisor}-tal: ${num}/${den} ÷ ${divisor} = ${rawNum}/${rawDen}. Ez már nem egyszerűsíthető.`;

        return {
            type: "fraction-muldiv",
            op: "divide",
            mode: "whole",
            left: { numerator: num, denominator: den },
            right: { whole: divisor },
            rawNum,
            rawDen,
            answerNum,
            answerDen,
            question: "Mennyi a hányados?",
            hint: divideWholeHint(num, den, divisor),
            explanation,
            options
        };
    }

    return null;
}

function buildTimesFraction() {
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const denA = pick(DENOMS_FRACTION);
        const denB = pick(DENOMS_FRACTION);
        const numA = randint(1, denA - 1);
        const numB = randint(1, denB - 1);

        const rawNum = numA * numB;
        const rawDen = denA * denB;

        if (rawNum > MAX_RAW_NUM || rawDen > MAX_RAW_DEN) continue;

        const g = gcd(rawNum, rawDen);
        const answerNum = rawNum / g;
        const answerDen = rawDen / g;

        if (answerDen === 1) continue;
        if (answerNum > answerDen * MAX_RATIO) continue;

        const options = fractionOptions(answerNum, answerDen, [
            [numA * denB, denA * numB],
            [numA + numB, denA + denB],
            [numA + numB, rawDen],
            [rawNum + numB, rawDen],
            [numA, rawDen],
            [rawNum, denA]
        ]);

        if (!options) continue;

        const explanation = g > 1
            ? `A számlálók és a nevezők összeszorzódnak: ${numA}/${denA} × ${numB}/${denB} = ${rawNum}/${rawDen}. Ezt egyszerűsítjük ${g}-nel: ${answerNum}/${answerDen}.`
            : `A számlálók és a nevezők összeszorzódnak: ${numA}/${denA} × ${numB}/${denB} = ${rawNum}/${rawDen}. Ez már nem egyszerűsíthető.`;

        return {
            type: "fraction-muldiv",
            op: "times",
            mode: "fraction",
            left: { numerator: numA, denominator: denA },
            right: { numerator: numB, denominator: denB },
            rawNum,
            rawDen,
            answerNum,
            answerDen,
            question: "Mennyi a szorzat?",
            hint: timesFractionHint(numA, denA, numB, denB),
            explanation,
            options
        };
    }

    return null;
}

function buildDivideFraction() {
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const denA = pick(DENOMS_FRACTION);
        const denB = pick(DENOMS_FRACTION);
        const numA = randint(1, denA - 1);
        const numB = randint(1, denB - 1);

        const rawNum = numA * denB;
        const rawDen = denA * numB;

        if (rawNum > MAX_RAW_NUM || rawDen > MAX_RAW_DEN) continue;
        if (rawNum > rawDen * MAX_RATIO) continue;

        const g = gcd(rawNum, rawDen);
        const answerNum = rawNum / g;
        const answerDen = rawDen / g;

        if (answerDen === 1) continue;

        const options = fractionOptions(answerNum, answerDen, [
            [numA * numB, denA * denB],
            [numA * denB, denA],
            [numA, denA * numB],
            [rawNum + numA, rawDen],
            [numA + numB, denA * denB]
        ]);

        if (!options) continue;

        const explanation = g > 1
            ? `Törttel osztva a reciprokkal szorzunk: ${numA}/${denA} ÷ ${numB}/${denB} = ${numA}/${denA} × ${denB}/${numB} = ${rawNum}/${rawDen}. Ezt egyszerűsítjük ${g}-nel: ${answerNum}/${answerDen}.`
            : `Törttel osztva a reciprokkal szorzunk: ${numA}/${denA} ÷ ${numB}/${denB} = ${numA}/${denA} × ${denB}/${numB} = ${rawNum}/${rawDen}. Ez már nem egyszerűsíthető.`;

        return {
            type: "fraction-muldiv",
            op: "divide",
            mode: "fraction",
            left: { numerator: numA, denominator: denA },
            right: { numerator: numB, denominator: denB },
            rawNum,
            rawDen,
            answerNum,
            answerDen,
            question: "Mennyi a hányados?",
            hint: divideFractionHint(numA, denA, numB, denB),
            explanation,
            options
        };
    }

    return null;
}

const BUILDERS = {
    "times-whole": buildTimesWhole,
    "divide-whole": buildDivideWhole,
    "times-fraction": buildTimesFraction,
    "divide-fraction": buildDivideFraction
};

export function generateFractionMulDiv(options = {}) {

    const { count = 3, op = "mixed", level = "mixed" } = options;

    const ops = op === "mixed" ? ["times", "divide"] : [op];
    const kinds = level === "mixed" ? ["whole", "fraction"] : level === "basic" ? ["whole"] : ["fraction"];

    const keys = [];
    for (const chosenOp of ops) {
        for (const kind of kinds) {
            const key = `${chosenOp}-${kind}`;
            if (!BUILDERS[key]) {
                throw new Error(`Ismeretlen tört művelet: ${key}`);
            }
            keys.push(key);
        }
    }

    const tasks = [];
    const seen = new Set();
    let attempts = 0;

    while (tasks.length < count && attempts <= MAX_GENERATION_ATTEMPTS) {
        attempts++;

        const task = BUILDERS[pick(keys)]();
        if (!task) continue;

        const rightKey = task.mode === "whole"
            ? `w${task.right.whole}`
            : `${task.right.numerator}/${task.right.denominator}`;
        const key = `${task.op}:${task.left.numerator}/${task.left.denominator}:${rightKey}`;

        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push(task);
    }

    if (tasks.length < count) {
        throw new Error("Nem sikerült elegendő feladatot generálni...");
    }

    return tasks;
}
