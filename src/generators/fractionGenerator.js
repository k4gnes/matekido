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

const KINDS = ["pizza", "csoki", "szendvics", "torta"];
const CIRCLE_DENOMS = [4, 5, 6, 8];
const STRIP_DENOMS = [4, 5, 6, 8, 10];

const FRACTION_NAMES = { 2: "fele", 3: "harmada", 4: "negyede" };
const FRACTION_ACCUS = { 2: "felét", 3: "harmadát", 4: "negyedét" };
const FRACTION_SYMBOLS = { 2: "½", 3: "⅓", 4: "¼" };

function gcd(a, b) {
    while (b) { [a, b] = [b, a % b]; }
    return a;
}

function canon(num, den) {
    const g = gcd(num, den);
    return `${num / g}/${den / g}`;
}

function denomsFor(kind) {
    return kind === "pizza" || kind === "torta" ? CIRCLE_DENOMS : STRIP_DENOMS;
}

function pickFraction(kind) {
    const denomRange = denomsFor(kind);
    const denominator = pick(denomRange);
    const numerator = randint(1, denominator - 1);
    return { numerator, denominator };
}

function fractionCandidates(kind) {
    const out = [];
    for (const denominator of denomsFor(kind)) {
        for (let numerator = 1; numerator < denominator; numerator++) {
            out.push({ numerator, denominator });
        }
    }
    return out;
}

function makeSymbolOptions(correctNum, correctDen, kind, count = 4) {
    const correctCanon = canon(correctNum, correctDen);
    const pool = fractionCandidates(kind).filter(f => canon(f.numerator, f.denominator) !== correctCanon);
    const chosen = shuffle(pool).slice(0, count - 1);
    const options = [...chosen, { numerator: correctNum, denominator: correctDen }];
    return shuffle(options).map(f => ({
        numerator: f.numerator,
        denominator: f.denominator,
        correct: f.numerator === correctNum && f.denominator === correctDen
    }));
}

function makePictureOptions(correctNum, correctDen, kind, count = 4) {
    const correctCanon = canon(correctNum, correctDen);
    const pool = fractionCandidates(kind).filter(f => canon(f.numerator, f.denominator) !== correctCanon);
    const chosen = shuffle(pool).slice(0, count - 1);
    const options = [...chosen, { numerator: correctNum, denominator: correctDen }];
    return shuffle(options).map(f => ({
        kind,
        total: f.denominator,
        filled: f.numerator,
        correct: f.numerator === correctNum && f.denominator === correctDen
    }));
}

function buildDeepSymbolTask() {
    const kind = pick(KINDS);
    const { numerator, denominator } = pickFraction(kind);
    return {
        type: "fraction",
        mode: "symbol",
        kind,
        total: denominator,
        numerator,
        denominator,
        drawing: { kind, total: denominator, filled: numerator },
        question: "Melyik jel mutatja a kiszínezett részt?",
        options: makeSymbolOptions(numerator, denominator, kind)
    };
}

function buildDeepSymbolPickTask() {
    const kind = pick(KINDS);
    const { numerator, denominator } = pickFraction(kind);
    return {
        type: "fraction",
        mode: "symbol-pick",
        kind,
        total: denominator,
        numerator,
        denominator,
        symbol: { numerator, denominator },
        question: `Melyik képen látszik a ${numerator}/${denominator}?`,
        options: makePictureOptions(numerator, denominator, kind)
    };
}

function buildWriteTask() {
    const kind = pick(KINDS);
    const { numerator, denominator } = pickFraction(kind);
    return {
        type: "fraction",
        mode: "write",
        kind,
        total: denominator,
        numerator,
        denominator,
        drawing: { kind, total: denominator, filled: numerator },
        question: "Hány részből áll az egész, és hány rész van kiszínezve?"
    };
}

function buildPickTask() {
    const kind = pick(KINDS);
    const total = pick([2, 3, 4]);
    const options = shuffle([2, 3, 4].map(t => ({
        kind,
        total: t,
        filled: 1,
        correct: t === total
    })));
    return {
        type: "fraction",
        mode: "pick",
        kind,
        total,
        question: `Melyik ${kind} mutatja a ${FRACTION_ACCUS[total]}?`,
        options
    };
}

function buildNameTask() {
    const kind = pick(KINDS);
    const total = pick([2, 3, 4]);
    const correct = FRACTION_NAMES[total];
    const options = shuffle(Object.keys(FRACTION_NAMES).map(t => ({
        text: FRACTION_NAMES[t],
        correct: FRACTION_NAMES[t] === correct
    })));
    return {
        type: "fraction",
        mode: "name",
        kind,
        total,
        drawing: { kind, total, filled: 1 },
        question: `A ${kind} mekkora része van kiszínezve?`,
        options
    };
}

function buildSymbolTask() {
    const kind = pick(KINDS);
    const total = pick([2, 3, 4]);
    const options = shuffle(Object.keys(FRACTION_SYMBOLS).map(t => ({
        text: FRACTION_SYMBOLS[t],
        correct: FRACTION_SYMBOLS[t] === FRACTION_SYMBOLS[total]
    })));
    return {
        type: "fraction",
        mode: "symbol",
        kind,
        total,
        drawing: { kind, total, filled: 1 },
        question: `Melyik jel illik a képre?`,
        options
    };
}

function buildSymbolPickTask() {
    const kind = pick(KINDS);
    const total = pick([2, 3, 4]);
    const options = shuffle([2, 3, 4].map(t => ({
        kind,
        total: t,
        filled: 1,
        correct: t === total
    })));
    return {
        type: "fraction",
        mode: "symbol-pick",
        kind,
        total,
        symbol: FRACTION_SYMBOLS[total],
        question: `Melyik képen látszik a ${FRACTION_NAMES[total]}?`,
        options
    };
}

export function generateFraction(options = {}) {
    const { count = 5, mode = "mixed", deep = false } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        if (deep) {
            if (mode === "symbol") {
                tasks.push(buildDeepSymbolTask());
            } else if (mode === "symbol-pick") {
                tasks.push(buildDeepSymbolPickTask());
            } else if (mode === "write") {
                tasks.push(buildWriteTask());
            } else {
                tasks.push(pick([buildDeepSymbolTask, buildDeepSymbolPickTask, buildWriteTask])());
            }
        } else if (mode === "symbol") {
            tasks.push(buildSymbolTask());
        } else if (mode === "symbol-pick") {
            tasks.push(buildSymbolPickTask());
        } else if (mode === "name") {
            tasks.push(buildNameTask());
        } else if (mode === "pick") {
            tasks.push(buildPickTask());
        } else {
            tasks.push(Math.random() < 0.55 ? buildPickTask() : buildNameTask());
        }
    }
    return tasks;
}