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

function makeOptions(answer, min, max) {
    const candidates = [];
    for (let d = 1; d <= 40; d++) {
        if (answer - d >= min) candidates.push(answer - d);
        if (answer + d <= max) candidates.push(answer + d);
    }
    const options = new Set([answer]);
    for (const candidate of shuffle(candidates)) {
        if (options.size >= 4) break;
        options.add(candidate);
    }
    return shuffle([...options]);
}

function buildTrianglePerimeter() {
    const a = random(4, 40);
    const b = random(4, 40);
    const c = random(4, 40);
    const answer = a + b + c;
    return {
        mode: "triangle-perimeter",
        question: `Mekkora a háromszög kerülete? Oldalai: a = ${a} cm, b = ${b} cm, c = ${c} cm.`,
        a,
        b,
        c,
        answer,
        options: makeOptions(answer, 3, 1000)
    };
}

function buildTriangleArea() {
    const base = random(2, 20) * 2;
    const height = random(3, 30);
    const answer = base * height / 2;
    return {
        mode: "triangle-area",
        question: `Mekkora a háromszög területe? Alap = ${base} cm, magasság = ${height} cm. T = a × m ÷ 2`,
        base,
        height,
        answer,
        options: makeOptions(answer, 3, 1000)
    };
}

function buildRectanglePerimeter() {
    const a = random(5, 60);
    const b = random(5, 60);
    const answer = 2 * (a + b);
    return {
        mode: "rectangle-perimeter",
        question: `Mekkora a téglalap kerülete? Oldalai: ${a} cm és ${b} cm. K = 2 × (a + b)`,
        a,
        b,
        answer,
        options: makeOptions(answer, 4, 1000)
    };
}

function buildRectangleArea() {
    const a = random(5, 30);
    const b = random(5, 30);
    const answer = a * b;
    return {
        mode: "rectangle-area",
        question: `Mekkora a téglalap területe? Oldalai: ${a} cm és ${b} cm. T = a × b`,
        a,
        b,
        answer,
        options: makeOptions(answer, 4, 1000)
    };
}

function buildParallelogramArea() {
    const base = random(4, 40);
    const height = random(4, 25);
    const answer = base * height;
    return {
        mode: "parallelogram-area",
        question: `Mekkora a paralelogramma területe? Alap = ${base} cm, magasság = ${height} cm. T = a × m`,
        base,
        height,
        answer,
        options: makeOptions(answer, 4, 1000)
    };
}

function buildTrapezoidArea() {
    const a = random(2, 30);
    let c = random(2, 30);
    if ((a + c) % 2 !== 0) c += 1;
    const height = random(3, 20);
    const answer = (a + c) * height / 2;
    return {
        mode: "trapezoid-area",
        question: `Mekkora a trapéz területe? Párhuzamos oldalai a = ${a} cm és c = ${c} cm, magassága m = ${height} cm. T = (a + c) × m ÷ 2`,
        a,
        c,
        height,
        answer,
        options: makeOptions(answer, 3, 1000)
    };
}

function buildRhombusArea() {
    const e = random(2, 40);
    let f = random(2, 40);
    if ((e * f) % 2 !== 0) f += 1;
    const answer = e * f / 2;
    return {
        mode: "rhombus-area",
        question: `Mekkora a rombusz területe? Átlói e = ${e} cm és f = ${f} cm. T = e × f ÷ 2`,
        e,
        f,
        answer,
        options: makeOptions(answer, 2, 1000)
    };
}

const MODES = {
    "triangle-perimeter": buildTrianglePerimeter,
    "triangle-area": buildTriangleArea,
    "rectangle-perimeter": buildRectanglePerimeter,
    "rectangle-area": buildRectangleArea,
    "parallelogram-area": buildParallelogramArea,
    "trapezoid-area": buildTrapezoidArea,
    "rhombus-area": buildRhombusArea
};

const MIXED = [
    "triangle-perimeter",
    "triangle-area",
    "rectangle-perimeter",
    "rectangle-area",
    "parallelogram-area"
];

const MIXED_POLYGONS = [
    "triangle-area",
    "parallelogram-area",
    "trapezoid-area",
    "rhombus-area"
];

const MIX_GROUPS = {
    mixed: MIXED,
    "polygon-mixed": MIXED_POLYGONS
};

export function generateShapeArea(options = {}) {
    const { count = 6, mode = "mixed" } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        const pool = MIX_GROUPS[mode];
        const m = pool ? pool[Math.floor(Math.random() * pool.length)] : mode;
        const build = MODES[m];
        if (!build) throw new Error(`Ismeretlen shape-area mód: ${m}`);
        tasks.push(build());
    }
    return tasks;
}
