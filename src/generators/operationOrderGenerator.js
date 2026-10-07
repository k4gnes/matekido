function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const FORMS = [
    "mult-add",
    "mult-add-rev",
    "mult-sub",
    "paren-add",
    "paren-sub",
    "div-add"
];

function params(form) {
    let a, b, c;
    if (form === "mult-sub") {
        b = random(2, 9);
        c = random(2, 9);
        a = random(b * c + 1, b * c + 6);
    } else if (form === "div-add") {
        c = random(2, 9);
        b = c * random(1, 4);
        a = random(2, 9);
    } else if (form === "paren-add") {
        a = random(2, 9);
        b = random(2, 9);
        c = random(2, 5);
    } else if (form === "paren-sub") {
        a = random(3, 9);
        b = random(2, a - 1);
        c = random(2, 5);
    } else {
        a = random(2, 9);
        b = random(2, 9);
        c = random(2, 9);
    }
    return { a, b, c };
}

function paramsBounded(form, bounds) {
    const { aMin, aMax, bMin, bMax } = bounds;

    if (form === "mult-sub") {
        const fb = random(bMin, bMax);
        const fc = random(bMin, bMax);
        const lo = Math.max(aMin, fb * fc + 1);
        if (lo > aMax) return null;
        return { a: random(lo, aMax), b: fb, c: fc };
    }

    if (form === "div-add") {
        const c = random(bMin, bMax);
        const lo = Math.ceil(aMin / c) * c;
        const hi = Math.floor(aMax / c) * c;
        if (lo > hi) return null;
        return { a: random(lo, hi), b: c * random(1, 4), c };
    }

    if (form === "paren-add") {
        return { a: random(aMin, aMax), b: random(aMin, aMax), c: random(bMin, bMax) };
    }

    if (form === "paren-sub") {
        const a = random(aMin, aMax);
        const hi = Math.min(bMax, a - 1);
        if (hi < bMin) return null;
        return { a, b: random(bMin, hi), c: random(bMin, bMax) };
    }

    return { a: random(aMin, aMax), b: random(bMin, bMax), c: random(bMin, bMax) };
}

function expressionText(form, a, b, c) {
    switch (form) {
        case "mult-add": return `${a} + ${b} × ${c}`;
        case "mult-add-rev": return `${a} × ${b} + ${c}`;
        case "mult-sub": return `${a} − ${b} × ${c}`;
        case "paren-add": return `(${a} + ${b}) × ${c}`;
        case "paren-sub": return `(${a} − ${b}) × ${c}`;
        case "div-add": return `${a} + ${b} ÷ ${c}`;
        default: return "";
    }
}

function compute(form, a, b, c) {
    switch (form) {
        case "mult-add": return a + b * c;
        case "mult-add-rev": return a * b + c;
        case "mult-sub": return a - b * c;
        case "paren-add": return (a + b) * c;
        case "paren-sub": return (a - b) * c;
        case "div-add": return a + b / c;
        default: return 0;
    }
}

function computeWrong(form, a, b, c) {
    switch (form) {
        case "mult-add": return (a + b) * c;
        case "mult-add-rev": return a * (b + c);
        case "mult-sub": return (a - b) * c;
        case "paren-add": return a + b * c;
        case "paren-sub": return a - b * c;
        case "div-add": return (a + b) / c;
        default: return 0;
    }
}

function buildOptions(answer, wrong, near = false) {
    const values = new Set([answer, wrong]);
    const lo = near ? Math.max(1, answer - 12) : 1;
    const hi = near ? answer + 12 : 90;
    let guard = 0;
    while (values.size < 4 && guard < 30) {
        values.add(random(lo, hi));
        guard++;
    }
    return shuffle([...values].slice(0, 4));
}

function explanation(form, a, b, c, answer) {
    if (form === "mult-add") {
        return `Először a szorzás: ${b} × ${c} = ${b * c}, majd hozzáadjuk: ${a} + ${b * c} = ${answer}`;
    }
    if (form === "mult-add-rev") {
        return `Először a szorzás: ${a} × ${b} = ${a * b}, majd hozzáadjuk: ${a * b} + ${c} = ${answer}`;
    }
    if (form === "mult-sub") {
        return `Először a szorzás: ${b} × ${c} = ${b * c}, majd kivonjuk: ${a} − ${b * c} = ${answer}`;
    }
    if (form === "paren-add") {
        return `Először a zárójel: ${a} + ${b} = ${a + b}, majd megszorozzuk: ${a + b} × ${c} = ${answer}`;
    }
    if (form === "paren-sub") {
        return `Először a zárójel: ${a} − ${b} = ${a - b}, majd megszorozzuk: ${a - b} × ${c} = ${answer}`;
    }
    return `Először az osztás: ${b} ÷ ${c} = ${b / c}, majd hozzáadjuk: ${a} + ${b / c} = ${answer}`;
}

function generateTask(bounds) {
    if (!bounds) {
        const form = pick(FORMS);
        const p = params(form);
        const answer = compute(form, p.a, p.b, p.c);
        const wrong = computeWrong(form, p.a, p.b, p.c);
        let options = buildOptions(answer, wrong);

        if (!options.includes(answer)) {
            options = [answer, ...options.slice(0, 3)];
        }
        options = shuffle(options);

        return {
            type: "operation-order",
            form,
            a: p.a,
            b: p.b,
            c: p.c,
            expression: expressionText(form, p.a, p.b, p.c),
            answer,
            options,
            explanation: explanation(form, p.a, p.b, p.c, answer)
        };
    }

    for (let attempt = 0; attempt < 500; attempt++) {
        const form = pick(FORMS);
        const p = paramsBounded(form, bounds);
        if (!p) continue;

        const answer = compute(form, p.a, p.b, p.c);
        if (!Number.isInteger(answer) || answer < 1 || answer > bounds.answerMax) continue;

        const wrong = computeWrong(form, p.a, p.b, p.c);
        if (wrong === answer || !Number.isInteger(wrong) || wrong < 1) continue;

        let options = buildOptions(answer, wrong, true);
        if (!options.includes(answer)) {
            options = [answer, ...options.slice(0, 3)];
        }
        options = shuffle(options);

        return {
            type: "operation-order",
            form,
            a: p.a,
            b: p.b,
            c: p.c,
            expression: expressionText(form, p.a, p.b, p.c),
            answer,
            options,
            explanation: explanation(form, p.a, p.b, p.c, answer)
        };
    }

    throw new Error("Nem sikerült műveleti sorrend feladatot generálni a megadott tartományban.");
}

export function generateOperationOrder(opts = {}) {
    const { count = 6 } = opts;
    const bounded = ["aMin", "aMax", "bMin", "bMax", "answerMax"].some(k => opts[k] !== undefined);
    const bounds = bounded
        ? {
            aMin: opts.aMin ?? 2,
            aMax: opts.aMax ?? 9,
            bMin: opts.bMin ?? 2,
            bMax: opts.bMax ?? 9,
            answerMax: opts.answerMax ?? Infinity
        }
        : null;
    const tasks = [];
    for (let i = 0; i < count; i++) {
        tasks.push(generateTask(bounds));
    }
    return tasks;
}