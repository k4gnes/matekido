function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

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

const POLYGONS = {
    triangle: { label: "Háromszög", dative: "háromszögnek", sides: 3 },
    square: { label: "Négyszög", dative: "négyszögnek", sides: 4 },
    pentagon: { label: "Ötszög", dative: "ötszögnek", sides: 5 },
    hexagon: { label: "Hatszög", dative: "hatszögnek", sides: 6 },
    heptagon: { label: "Hétszög", dative: "hétszögnek", sides: 7 },
    octagon: { label: "Nyolcszög", dative: "nyolcszögnek", sides: 8 }
};

const ALL_KINDS = Object.keys(POLYGONS);

const QUADS = {
    square: {
        label: "Négyzet",
        dative: "négyzetre",
        definition: "minden oldala egyenlő, és minden szöge derékszög"
    },
    rectangle: {
        label: "Téglalap",
        dative: "téglalapra",
        definition: "minden szöge derékszög, de nem minden oldala egyenlő"
    },
    rhombus: {
        label: "Rombusz",
        dative: "rombuszra",
        definition: "minden oldala egyenlő, de nem minden szöge derékszög"
    },
    parallelogram: {
        label: "Paralelogramma",
        dative: "paralelogrammára",
        definition: "szemközti oldalai párhuzamosak, de nincs derékszöge és nem minden oldala egyenlő"
    },
    trapezoid: {
        label: "Trapéz",
        dative: "trapézra",
        definition: "pontosan az egyik pár szemközti oldala párhuzamos"
    },
    "isosceles-trapezoid": {
        label: "Húrtrapéz",
        dative: "húrtrapézra",
        definition: "a két szára egyenlő hosszú, az alapokon fekvő szögei egyenlők"
    },
    kite: {
        label: "Deltoid",
        dative: "deltoidra",
        definition: "két-két szomszédos oldala egyenlő, de nem minden oldala egyenlő"
    },
    concave: {
        label: "Konkáv négyszög",
        dative: "konkáv négyszögre",
        definition: "van 180°-nál nagyobb, azaz homorú szöge"
    }
};

const QUAD_KINDS = Object.keys(QUADS);
const DEFAULT_QUAD_KINDS = ["square", "rectangle", "rhombus", "parallelogram", "trapezoid", "kite"];

const QUAD_TRAITS = [
    { text: "Minden oldala egyenlő", shapes: ["square", "rhombus"] },
    { text: "Minden szöge derékszög", shapes: ["square", "rectangle"] },
    { text: "Szemközti oldalai párhuzamosak", shapes: ["square", "rectangle", "rhombus", "parallelogram"] },
    { text: "Szemközti oldalai egyenlők", shapes: ["square", "rectangle", "rhombus", "parallelogram"] },
    { text: "Szemközti szögei egyenlők", shapes: ["square", "rectangle", "rhombus", "parallelogram"] },
    { text: "Átlói egyenlő hosszúak", shapes: ["square", "rectangle", "isosceles-trapezoid"] },
    { text: "Átlói merőlegesek", shapes: ["square", "rhombus", "kite"] },
    { text: "Az átlói felezik egymást", shapes: ["square", "rectangle", "rhombus", "parallelogram"] },
    { text: "Van legalább egy pár párhuzamos oldala", shapes: ["square", "rectangle", "rhombus", "parallelogram", "trapezoid", "isosceles-trapezoid"] },
    { text: "Csak az egyik pár szemközti oldala párhuzamos", shapes: ["trapezoid", "isosceles-trapezoid"] },
    { text: "Két-két szomszédos oldala egyenlő", shapes: ["square", "rhombus", "kite"] },
    { text: "Szárai egyenlők", shapes: ["isosceles-trapezoid"] },
    { text: "Van homorúszöge", shapes: ["concave"] },
    { text: "Pontosan három oldala egyenlő hosszú", shapes: [] }
];

const INCLUSION_PAIRS = [
    { a: "square", b: "rectangle", truth: true },
    { a: "square", b: "rhombus", truth: true },
    { a: "square", b: "parallelogram", truth: true },
    { a: "rectangle", b: "parallelogram", truth: true },
    { a: "rhombus", b: "parallelogram", truth: true },
    { a: "isosceles-trapezoid", b: "trapezoid", truth: true },
    { a: "rectangle", b: "square", truth: false },
    { a: "rhombus", b: "square", truth: false },
    { a: "rectangle", b: "rhombus", truth: false },
    { a: "rhombus", b: "rectangle", truth: false },
    { a: "trapezoid", b: "isosceles-trapezoid", truth: false },
    { a: "parallelogram", b: "rectangle", truth: false },
    { a: "parallelogram", b: "rhombus", truth: false },
    { a: "parallelogram", b: "square", truth: false },
    { a: "kite", b: "rhombus", truth: false },
    { a: "trapezoid", b: "rectangle", truth: false }
];

function buildInclusion(quadKinds) {
    const pair = pick(INCLUSION_PAIRS.filter(p => quadKinds.includes(p.a) && quadKinds.includes(p.b)));
    const options = [
        { text: "Igen", correct: pair.truth },
        { text: "Nem", correct: !pair.truth }
    ];
    return {
        mode: "quadrilateral",
        ask: "inclusion",
        kind: pair.a,
        target: pair.b,
        truth: pair.truth,
        answer: pair.truth ? "Igen" : "Nem",
        question: `Minden ${QUADS[pair.a].label.toLowerCase()} egyben ${QUADS[pair.b].label.toLowerCase()} is?`,
        options
    };
}

function buildWhich(quadKinds) {
    const traits = QUAD_TRAITS
        .map(t => ({ text: t.text, shapes: t.shapes.filter(k => quadKinds.includes(k)) }))
        .filter(t => t.shapes.length > 0 && t.shapes.length <= quadKinds.length - 3);
    const trait = pick(traits);
    const correctKind = pick(trait.shapes);
    const others = shuffle(quadKinds.filter(k => !trait.shapes.includes(k))).slice(0, 3);
    const options = shuffle([correctKind, ...others]).map(k => ({
        text: QUADS[k].label,
        correct: k === correctKind
    }));
    return {
        mode: "quadrilateral",
        ask: "which",
        kind: correctKind,
        trait: trait.text,
        answer: QUADS[correctKind].label,
        question: `Melyik négyszögre igaz: ${trait.text.charAt(0).toLowerCase()}${trait.text.slice(1)}?`,
        options
    };
}

function diagonalsOf(kind) {
    const n = POLYGONS[kind].sides;
    return n * (n - 3) / 2;
}

function buildName(kinds) {    const kind = pick(kinds);
    const correct = POLYGONS[kind].label;
    const others = shuffle(ALL_KINDS.filter(k => k !== kind)).slice(0, 3);
    const options = shuffle([kind, ...others]).map(k => POLYGONS[k].label);

    return {
        mode: "name",
        kind,
        n: POLYGONS[kind].sides,
        options,
        answer: options.indexOf(correct)
    };
}

function buildCount(mode, kinds) {
    const kind = pick(kinds);
    const n = POLYGONS[kind].sides;
    const correct = mode === "sides" || mode === "vertices" ? n : diagonalsOf(kind);

    const candidates = [correct, correct + 1, correct + 2, correct - 1, correct - 2, correct + 4]
        .filter(v => v >= 0)
        .filter((v, i, a) => a.indexOf(v) === i);

    const distractors = shuffle(candidates.filter(v => v !== correct)).slice(0, 3);
    const options = shuffle([correct, ...distractors]);

    return {
        mode,
        kind,
        n,
        options,
        answer: options.indexOf(correct)
    };
}

function numberOptions(answer) {
    const values = [answer];
    for (const offset of [180, -180, 90, -90, 360, -360, 45, -45]) {
        if (values.length >= 4) break;
        const v = answer + offset;
        if (v > 0 && !values.includes(v)) values.push(v);
    }
    return shuffle(values);
}

function buildAngleSum() {
    const sub = pick(["quad-sum", "quad-missing", "exterior"]);
    if (sub === "quad-missing") {
        let a;
        let b;
        let c;
        do {
            a = random(4, 12) * 10;
            b = random(4, 12) * 10;
            c = random(4, 12) * 10;
        } while (a + b + c > 330);
        const expected = 360 - a - b - c;
        const options = numberOptions(expected);
        return {
            mode: "angle-sum",
            sub,
            a,
            b,
            c,
            question: `Egy négyszög három szöge ${a}°, ${b}° és ${c}°. Mekkora a negyedik szög?`,
            expected,
            explain: `360° − (${a}° + ${b}° + ${c}°) = ${expected}°.`,
            options,
            answer: options.indexOf(expected)
        };
    }
    const expected = 360;
    const options = numberOptions(expected);
    return {
        mode: "angle-sum",
        sub,
        question: sub === "exterior"
            ? "Mekkora a négyszög külső szögeinek összege?"
            : "Mekkora a négyszög belső szögeinek összege?",
        expected,
        explain: sub === "exterior"
            ? "A négyszög külső szögeinek összege mindig 360°."
            : "A négyszög belső szögeinek összege 360°.",
        options,
        answer: options.indexOf(expected)
    };
}

const QUAD_MIXES = ["name", "property"];
const QUAD_MIXES_ALL = ["name", "property", "inclusion", "which"];

function buildQuadrilateral(kind = pick(QUAD_KINDS), ask = pick(QUAD_MIXES), quadKinds = QUAD_KINDS) {
    if (ask === "inclusion") {
        return buildInclusion(quadKinds);
    }
    if (ask === "which") {
        return buildWhich(quadKinds);
    }
    if (ask === "name") {
        const correct = QUADS[kind].label;
        const others = shuffle(quadKinds.filter(k => k !== kind)).slice(0, 3);
        const options = shuffle([kind, ...others]).map(k => ({
            text: QUADS[k].label,
            correct: k === kind
        }));
        return {
            mode: "quadrilateral",
            ask: "name",
            kind,
            answer: correct,
            question: `Melyik négyszög: ${QUADS[kind].definition}?`,
            options
        };
    }
    const trueTraits = QUAD_TRAITS.filter(t => t.shapes.includes(kind));
    const falseTraits = QUAD_TRAITS.filter(t => !t.shapes.includes(kind));
    const correctTrait = pick(trueTraits);
    const distractors = shuffle(falseTraits).slice(0, 3);
    const options = shuffle([correctTrait, ...distractors]).map(t => ({
        text: t.text,
        correct: t === correctTrait
    }));
    return {
        mode: "quadrilateral",
        ask: "property",
        kind,
        answer: correctTrait.text,
        question: `Melyik tulajdonság igaz a ${QUADS[kind].dative}?`,
        options
    };
}

export function generatePolygon(options = {}) {
    const { count = 8, mode = "mixed", kinds = ALL_KINDS, ask, quadKinds = DEFAULT_QUAD_KINDS } = options;

    const mixes = mode === "mixed"
        ? ["name", "sides", "sides", "vertices", "vertices", "diagonals", "diagonals", "diagonals"]
        : null;

    const askPool = ask === "mixed-all" ? QUAD_MIXES_ALL : null;

    const quadOrder = shuffle([...quadKinds]);

    const tasks = [];
    let lastSignature = null;
    for (let i = 0; i < count; i++) {
        const m = mixes ? pick(mixes) : mode;
        const taskAsk = askPool ? pick(askPool) : ask;
        let task = buildTask(m, kinds, quadOrder[i % quadOrder.length], taskAsk, quadKinds);
        let signature = `${task.mode}:${task.ask ?? ""}:${task.kind}`;

        for (let attempt = 0; attempt < 6 && signature === lastSignature; attempt++) {
            task = buildTask(m, kinds, quadOrder[(i + attempt + 1) % quadOrder.length], taskAsk, quadKinds);
            signature = `${task.mode}:${task.ask ?? ""}:${task.kind}`;
        }

        lastSignature = signature;
        tasks.push(task);
    }
    return tasks;
}

function buildTask(m, kinds, quadKind, ask, quadKinds) {
    if (m === "angle-sum") {
        return buildAngleSum();
    }
    if (m === "name") {
        return buildName(kinds);
    }
    if (m === "sides" || m === "vertices" || m === "diagonals") {
        return buildCount(m, kinds);
    }
    if (m === "quadrilateral") {
        return buildQuadrilateral(quadKind, ask, quadKinds);
    }
    throw new Error(`Ismeretlen polygon mód: ${m}`);
}