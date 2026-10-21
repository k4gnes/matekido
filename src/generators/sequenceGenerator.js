function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const SEQUENCE_MIN_TERMS = 4;
const SEQUENCE_MAX_TERMS = 7;

function buildStepped(max) {

    const count = Math.min(randint(SEQUENCE_MIN_TERMS, SEQUENCE_MAX_TERMS), Math.max(2, max - 1));

    const maxStep = Math.min(10, Math.max(1, Math.floor((max - 1) / count)));

    const step = randint(1, maxStep);

    const upLimit = max - count * step;
    const downLimit = count * step + 1;

    const direction = upLimit >= 1 ? (downLimit <= max && Math.random() < 0.5 ? -1 : 1) : -1;

    const start = direction === 1 ? randint(1, upLimit) : randint(downLimit, max);

    const terms = [];
    for (let t = 0; t < count; t++) {
        terms.push(start + direction * step * t);
    }

    return {
        type: "sequence",
        terms,
        answer: start + direction * step * count,
        step,
        direction
    };
}

const ALTERNATING_PAIRS = [
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [2, 3],
    [2, 4],
    [2, 5],
    [3, 4],
    [3, 5],
    [4, 5]
];

function alternatingSpan(terms, first, second) {
    return Math.ceil(terms / 2) * first + Math.floor(terms / 2) * second;
}

function alternatingOptions(pool, max) {
    const options = [];

    for (const [a, b] of pool) {
        const orders = a === b ? [[a, b]] : [[a, b], [b, a]];
        for (const [first, second] of orders) {
            for (let terms = SEQUENCE_MIN_TERMS; terms <= SEQUENCE_MAX_TERMS; terms++) {
                if (alternatingSpan(terms, first, second) <= max - 1) {
                    options.push({ first, second, terms });
                }
            }
        }
    }

    return options;
}

function buildAlternating(max, deltas, pairs) {

    const pool = deltas ? [deltas] : (pairs || ALTERNATING_PAIRS);

    let options = alternatingOptions(pool, max);

    if (options.length === 0) {
        options = alternatingOptions(ALTERNATING_PAIRS, max);
    }

    if (options.length === 0) {
        options = [{ first: 1, second: 2, terms: SEQUENCE_MIN_TERMS }];
    }

    const { first, second, terms: count } = pick(options);

    const span = alternatingSpan(count, first, second);

    const start = randint(1, Math.max(1, max - span));

    const terms = [];
    let current = start;
    for (let t = 0; t < count; t++) {
        terms.push(current);
        current += t % 2 === 0 ? first : second;
    }

    return {
        type: "sequence",
        terms,
        answer: current,
        step: first,
        direction: 1,
        alternating: true,
        deltas
    };
}

export function generateSequence(options = {}) {

    const {
        count = 5,
        max = 100,
        interaction = "mixed",
        alternate = false,
        deltas,
        pairs
    } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const task = alternate ? buildAlternating(max, deltas, pairs) : buildStepped(max);

        task.interaction = interaction === "mixed" ? pick(["input", "choice"]) : interaction;

        tasks.push(task);
    }

    return tasks;
}
