function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function fmt(n) {
    return n < 0 ? `−${Math.abs(n)}` : String(n);
}

function buildOptions(answer, candidates, count, min, max) {
    const options = [answer];
    const seen = new Set([answer]);

    for (const value of candidates) {
        if (options.length >= count) break;
        if (value < min || value > max || seen.has(value)) continue;
        seen.add(value);
        options.push(value);
    }

    let fill = min;
    while (options.length < count && fill <= max) {
        if (!seen.has(fill)) {
            seen.add(fill);
            options.push(fill);
        }
        fill++;
    }

    return shuffle(options);
}

function nonzero(min, max) {
    let value = 0;
    while (value === 0) {
        value = randInt(min, max);
    }
    return value;
}

function makeSingle(mode, interaction, min, max) {
    const n = nonzero(min, max);
    const answer = mode === "opposite" ? -n : Math.abs(n);

    const question = mode === "opposite"
        ? `Mi a ${fmt(n)} ellentettje?`
        : `Mennyi a |${fmt(n)}| értéke?`;

    const task = { mode, n, answer, question, interaction };

    if (interaction === "choice") {
        const candidates = mode === "opposite"
            ? [n, answer + 1, answer - 1, -(n + 1), -(n - 1)]
            : [n, -answer, answer + 1, answer - 1, -n];
        task.options = buildOptions(answer, candidates, 4, min, max);
    }

    return task;
}

function makePlain(min, max) {
    const value = nonzero(min, max);
    return { expr: fmt(value), value };
}

function makeAbsolute(min, max) {
    const n = nonzero(min, max);
    return { expr: `|${fmt(n)}|`, value: Math.abs(n) };
}

function makeOpposite(min, max) {
    const n = nonzero(min, max);
    return { expr: `−(${fmt(n)})`, value: -n };
}

function makeNegAbsolute(min, max) {
    const n = nonzero(min, max);
    return { expr: `−|${fmt(n)}|`, value: -Math.abs(n) };
}

function makeSum(min, max) {
    for (let i = 0; i < 30; i++) {
        const a = randInt(-9, 9);
        const b = randInt(-9, 9);
        const value = a + b;
        if (a === 0 || b === 0) continue;
        if (value === 0 || value < min || value > max) continue;
        const expr = b < 0 ? `${fmt(a)} − ${Math.abs(b)}` : `${fmt(a)} + ${b}`;
        return { expr, value };
    }
    return makePlain(min, max);
}

function makeDiff(min, max) {
    for (let i = 0; i < 30; i++) {
        const a = randInt(-9, 9);
        const b = randInt(-9, 9);
        const value = a - b;
        if (a === 0 || b === 0) continue;
        if (value === 0 || value < min || value > max) continue;
        const expr = b < 0 ? `${fmt(a)} + ${Math.abs(b)}` : `${fmt(a)} − ${b}`;
        return { expr, value };
    }
    return makePlain(min, max);
}

const COMPARE_STYLES = {
    plain: ["plain"],
    mixed: ["plain", "absolute", "opposite", "absolute", "negabs"],
    all: ["absolute", "opposite", "negabs", "absolute", "opposite", "sum", "diff"]
};

function makeCompareSide(styles, min, max) {
    const style = styles[Math.floor(Math.random() * styles.length)];
    switch (style) {
        case "absolute": return makeAbsolute(min, max);
        case "opposite": return makeOpposite(min, max);
        case "negabs": return makeNegAbsolute(min, max);
        case "sum": return makeSum(min, max);
        case "diff": return makeDiff(min, max);
        default: return makePlain(min, max);
    }
}

function makeEqualSide(value, avoidExpr) {
    const candidates = [
        fmt(value),
        `−(${fmt(-value)})`
    ];
    if (value >= 0) candidates.push(`|${fmt(-value)}|`);
    else candidates.push(`−|${fmt(value)}|`);

    const pool = candidates.filter(expr => expr !== avoidExpr);
    if (pool.length === 0) return null;

    const expr = pool[Math.floor(Math.random() * pool.length)];
    return { expr, value };
}

function makeCompare(min, max, expressions) {
    const styles = COMPARE_STYLES[expressions] ?? COMPARE_STYLES.plain;

    const left = makeCompareSide(styles, min, max);
    let right = makeCompareSide(styles, min, max);

    if (expressions !== "plain" && Math.random() < 0.2) {
        const equal = makeEqualSide(left.value, left.expr);
        if (equal) right = equal;
    }

    let guard = 0;
    while (left.expr === right.expr && guard < 40) {
        right = makeCompareSide(styles, min, max);
        guard++;
    }

    const operator = left.value > right.value ? ">" : left.value < right.value ? "<" : "=";

    return {
        mode: "compare",
        leftValue: left.value,
        rightValue: right.value,
        leftExpr: left.expr,
        rightExpr: right.expr,
        operator,
        answer: operator,
        question: `Hasonlítsd össze: ${left.expr} ⬜ ${right.expr}`,
        interaction: "choice"
    };
}

export function generateInteger(options = {}) {

    const {
        count = 6,
        mode = "opposite",
        interaction = "choice",
        min = -50,
        max = 50,
        expressions = "plain"
    } = options;

    const tasks = [];
    const seen = new Set();

    let guard = 0;
    while (tasks.length < count && guard < count * 60) {
        guard++;

        const task = mode === "compare"
            ? makeCompare(min, max, expressions)
            : makeSingle(mode, interaction, min, max);

        const key = task.mode === "compare"
            ? `${task.leftExpr}|${task.rightExpr}`
            : `${task.mode}|${task.n}`;

        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push(task);
    }

    return tasks;
}
