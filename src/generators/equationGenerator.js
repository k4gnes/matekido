function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function buildAdd() {
    const a = randint(2, 40);
    const c = randint(a + 2, 90);
    const answer = c - a;
    const equation = Math.random() < 0.5 ? `x + ${a} = ${c}` : `${a} + x = ${c}`;
    return { mode: "add", a, c, answer, equation };
}

function buildSub() {
    const a = randint(2, 30);
    const c = randint(2, 50);
    const answer = c + a;
    return { mode: "sub", a, c, answer, equation: `x − ${a} = ${c}` };
}

function buildMul() {
    const a = randint(2, 9);
    const answer = randint(2, 11);
    const c = a * answer;
    return { mode: "mul", a, c, answer, equation: `${a} × x = ${c}` };
}

function buildDiv() {
    const a = randint(2, 9);
    const c = randint(2, 11);
    const answer = a * c;
    return { mode: "div", a, c, answer, equation: `x ÷ ${a} = ${c}` };
}

function buildTwoStepAdd() {
    const a = randint(2, 8);
    const answer = randint(2, 9);
    const b = randint(1, 20);
    const c = a * answer + b;
    return { mode: "two-step", form: "mul-add", a, b, c, answer, equation: `${a} × x + ${b} = ${c}` };
}

function buildTwoStepSub() {
    const a = randint(2, 8);
    const answer = randint(3, 9);
    const b = randint(1, Math.min(20, a * answer - 1));
    const c = a * answer - b;
    return { mode: "two-step", form: "mul-sub", a, b, c, answer, equation: `${a} × x − ${b} = ${c}` };
}

function buildBothSides() {
    const answer = randint(2, 12);
    const a = randint(3, 9);
    const c = randint(1, a - 1);
    const b = randint(1, 15);
    const d = (a - c) * answer + b;
    return {
        mode: "both-sides",
        a,
        b,
        c,
        d,
        answer,
        equation: `${a}x + ${b} = ${c}x + ${d}`,
        expr: [`${a}x + ${b} = ${c}x + ${d}`]
    };
}

function buildParen() {
    const answer = randint(2, 12);
    const a = randint(2, 9);
    const b = randint(1, 9);
    if (Math.random() < 0.5) {
        const c = a * (answer + b);
        return {
            mode: "paren",
            form: "add",
            a,
            b,
            c,
            answer,
            equation: `${a}(x + ${b}) = ${c}`,
            expr: [`${a}(x + ${b}) = ${c}`]
        };
    }
    const s = Math.max(answer, b + 1);
    const c = a * (s - b);
    return {
        mode: "paren",
        form: "sub",
        a,
        b,
        c,
        answer: s,
        equation: `${a}(x − ${b}) = ${c}`,
        expr: [`${a}(x − ${b}) = ${c}`]
    };
}

function buildFractionAdd() {
    const a = randint(2, 9);
    const t = randint(1, 9);
    const answer = a * t;
    const b = randint(1, 9);
    const c = t + b;
    return {
        mode: "fraction-add",
        a,
        b,
        c,
        answer,
        equation: `x/${a} + ${b} = ${c}`,
        expr: [{ frac: ["x", String(a)] }, " + ", String(b), " = ", String(c)]
    };
}

function buildFractionDiv() {
    const a = randint(2, 9);
    const c = randint(2, 12);
    const b = randint(1, 9);
    const answer = a * c - b;
    if (answer < 1) return buildFractionDiv();
    return {
        mode: "fraction-div",
        a,
        b,
        c,
        answer,
        equation: `(x + ${b})/${a} = ${c}`,
        expr: [{ frac: [`x + ${b}`, String(a)] }, " = ", String(c)]
    };
}

const MODES = {
    add: buildAdd,
    sub: buildSub,
    mul: buildMul,
    div: buildDiv,
    "two-step": () => (Math.random() < 0.5 ? buildTwoStepAdd() : buildTwoStepSub()),
    "both-sides": buildBothSides,
    paren: buildParen,
    "fraction-add": buildFractionAdd,
    "fraction-div": buildFractionDiv
};

export function generateEquation(options = {}) {
    const { count = 4, mode = "mixed" } = options;
    const names = Object.keys(MODES);

    if (mode !== "mixed" && !names.includes(mode)) {
        throw new Error(`Ismeretlen egyenlet mód: ${mode}`);
    }

    const tasks = [];
    const seen = new Set();

    let guard = 0;
    while (tasks.length < count && guard < count * 200) {
        guard++;
        const chosen = mode === "mixed" ? pick(names) : mode;
        const task = MODES[chosen]();
        if (seen.has(task.equation)) continue;
        seen.add(task.equation);
        tasks.push({
            type: "equation",
            question: "Oldd meg az egyenletet! Mennyi az x értéke?",
            ...task
        });
    }

    return tasks;
}
