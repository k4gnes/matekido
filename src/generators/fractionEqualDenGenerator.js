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

const DEFAULT_DENOMS = [4, 6, 8];
const KINDS = ["pizza", "torta", "csoki", "szendvics"];

function buildCompareSymbol(denoms) {
    const denominator = pick(denoms);
    const numA = randint(2, denominator - 1);
    const rawB = randint(1, denominator - 1);
    const numB = rawB === numA ? (numA === 2 ? 1 : numA - 1) : rawB;
    return {
        type: "fraction-equal-den",
        mode: "compare-symbol",
        kind: pick(KINDS),
        denominator,
        numA,
        numB,
        operator: numA > numB ? ">" : "<"
    };
}

function buildComparePicture(denoms) {
    const denominator = pick(denoms);
    const numA = randint(2, denominator - 1);
    const numB = randint(1, numA - 1);
    return {
        type: "fraction-equal-den",
        mode: "compare-picture",
        kind: pick(KINDS),
        denominator,
        numA,
        numB
    };
}

function buildAdd(denoms) {
    const denominator = pick(denoms);
    const numA = randint(1, denominator - 2);
    const numB = randint(1, denominator - 1 - numA);
    return {
        type: "fraction-equal-den",
        mode: "add",
        kind: pick(KINDS),
        denominator,
        numA,
        numB,
        answer: numA + numB
    };
}

function buildSub(denoms) {
    const denominator = pick(denoms);
    const numB = randint(1, denominator - 2);
    const numA = randint(numB + 1, denominator - 1);
    return {
        type: "fraction-equal-den",
        mode: "sub",
        kind: pick(KINDS),
        denominator,
        numA,
        numB,
        answer: numA - numB
    };
}

export function generateFractionEqualDen(options = {}) {
    const { count = 6, mode = "mixed", denoms = DEFAULT_DENOMS } = options;

    const builders = {
        "compare-symbol": buildCompareSymbol,
        "compare-picture": buildComparePicture,
        add: buildAdd,
        sub: buildSub
    };

    const tasks = [];

    for (let i = 0; i < count; i++) {
        if (mode === "compare") {
            const fn = i % 2 === 0 ? builders["compare-symbol"] : builders["compare-picture"];
            tasks.push(fn(denoms));
        } else if (mode === "add") {
            tasks.push(buildAdd(denoms));
        } else if (mode === "sub") {
            tasks.push(buildSub(denoms));
        } else if (mode === "ops") {
            const fn = i % 2 === 0 ? builders.add : builders.sub;
            tasks.push(fn(denoms));
        } else if (mode === "mixed" || mode === "all") {
            const fn = pick([
                builders["compare-symbol"],
                builders["compare-picture"],
                builders.add,
                builders.sub
            ]);
            tasks.push(fn(denoms));
        } else if (builders[mode]) {
            tasks.push(builders[mode](denoms));
        } else {
            tasks.push(buildCompareSymbol(denoms));
        }
    }

    return tasks;
}