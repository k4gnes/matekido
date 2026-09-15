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

function buildOptions(answer, wrong) {
    const values = new Set([answer, wrong]);
    let guard = 0;
    while (values.size < 4 && guard < 30) {
        values.add(random(1, 90));
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

function generateTask() {
    const form = pick(FORMS);
    let p = params(form);
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

export function generateOperationOrder(opts = {}) {
    const { count = 6 } = opts;
    const tasks = [];
    for (let i = 0; i < count; i++) {
        tasks.push(generateTask());
    }
    return tasks;
}