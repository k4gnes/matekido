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

const FORMS_POWER = [
    "pow-add",
    "pow-sub",
    "pow-mul",
    "paren-pow",
    "paren-pow-sub"
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

function sup(c) {
    return c === 2 ? "²" : "³";
}

function powerParams(form) {
    const c = Math.random() < 0.5 ? 2 : 3;
    let a;
    let b;
    if (form === "pow-add") {
        b = random(2, 4);
        const maxA = c === 3 ? 10 - b : 9;
        if (maxA < 2) return null;
        a = random(2, maxA);
    } else if (form === "pow-sub") {
        if (c === 3) {
            b = 2;
            a = random(10, 12);
        } else {
            b = random(2, 4);
            const lo = Math.max(2, b * b + 2);
            const hi = b + 31;
            if (lo > hi) return null;
            a = random(lo, hi);
        }
    } else if (form === "pow-mul") {
        b = random(2, 4);
        const maxA = c === 3 ? Math.floor(10 / b) : Math.min(9, Math.floor(31 / b));
        if (maxA < 2) return null;
        a = random(2, maxA);
    } else if (form === "paren-pow") {
        a = random(2, 9);
        const maxB = c === 3 ? 10 - a : 9;
        if (maxB < 2) return null;
        b = random(2, maxB);
    } else if (form === "paren-pow-sub") {
        if (c === 3) {
            b = 2;
            a = random(9, 12);
        } else {
            b = random(2, 4);
            const lo = Math.max(3, b * b + 1);
            const hi = b + 31;
            if (lo > hi) return null;
            a = random(lo, hi);
        }
    } else {
        return null;
    }
    return { a, b, c };
}

function powerExpressionText(form, a, b, c) {
    const s = sup(c);
    switch (form) {
        case "pow-add": return `${b}${s} + ${a}`;
        case "pow-sub": return `${a} − ${b}${s}`;
        case "pow-mul": return `${b}${s} × ${a}`;
        case "paren-pow": return `(${a} + ${b})${s}`;
        case "paren-pow-sub": return `(${a} − ${b})${s}`;
        default: return "";
    }
}

function powerCompute(form, a, b, c) {
    switch (form) {
        case "pow-add": return b ** c + a;
        case "pow-sub": return a - b ** c;
        case "pow-mul": return b ** c * a;
        case "paren-pow": return (a + b) ** c;
        case "paren-pow-sub": return (a - b) ** c;
        default: return 0;
    }
}

function powerWrong(form, a, b, c) {
    switch (form) {
        case "pow-add": return (a + b) ** c;
        case "pow-sub": return (a - b) ** c;
        case "pow-mul": return (a * b) ** c;
        case "paren-pow": return a + b ** c;
        case "paren-pow-sub": return a - b ** c;
        default: return 0;
    }
}

function powerExplanation(form, a, b, c, answer) {
    const s = sup(c);
    const power = b ** c;
    switch (form) {
        case "pow-add":
            return `Először a hatvány: ${b}${s} = ${power}, majd hozzáadjuk: ${power} + ${a} = ${answer}`;
        case "pow-sub":
            return `Először a hatvány: ${b}${s} = ${power}, majd kivonjuk: ${a} − ${power} = ${answer}`;
        case "pow-mul":
            return `Először a hatvány: ${b}${s} = ${power}, majd megszorozzuk: ${power} × ${a} = ${answer}`;
        case "paren-pow":
            return `Először a zárójel: ${a} + ${b} = ${a + b}, majd hatványozunk: ${a + b}${s} = ${answer}`;
        case "paren-pow-sub":
            return `Először a zárójel: ${a} − ${b} = ${a - b}, majd hatványozunk: ${a - b}${s} = ${answer}`;
        default:
            return "";
    }
}

function powerOptions(answer, wrong) {
    const values = new Set([answer, wrong]);
    const lo = Math.max(1, answer - 15);
    const hi = answer + 15;
    let guard = 0;
    while (values.size < 4 && guard < 40) {
        values.add(random(lo, hi));
        guard++;
    }
    return shuffle([...values].slice(0, 4));
}

function generatePowerTask(form) {
    const forms = form === "mixed" ? FORMS_POWER : [form];
    for (let attempt = 0; attempt < 400; attempt++) {
        const f = pick(forms);
        const p = powerParams(f);
        if (!p) continue;

        const answer = powerCompute(f, p.a, p.b, p.c);
        if (!Number.isInteger(answer) || answer < 1 || answer > 1000) continue;

        const wrong = powerWrong(f, p.a, p.b, p.c);
        if (wrong === answer || !Number.isInteger(wrong) || wrong < 1 || wrong > 1000) continue;

        return {
            type: "operation-order",
            form: f,
            a: p.a,
            b: p.b,
            c: p.c,
            expression: powerExpressionText(f, p.a, p.b, p.c),
            answer,
            options: powerOptions(answer, wrong),
            explanation: powerExplanation(f, p.a, p.b, p.c, answer)
        };
    }

    throw new Error(`Nem sikerült hatványos műveleti sorrend feladatot generálni: ${form}`);
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
    const { count = 6, form } = opts;
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
        tasks.push(form ? generatePowerTask(form) : generateTask(bounds));
    }
    return tasks;
}