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
    kite: {
        label: "Deltoid",
        dative: "deltoidra",
        definition: "két-két szomszédos oldala egyenlő, de nem minden oldala egyenlő"
    }
};

const QUAD_KINDS = Object.keys(QUADS);

const QUAD_TRAITS = [
    { text: "Minden oldala egyenlő", shapes: ["square", "rhombus"] },
    { text: "Minden szöge derékszög", shapes: ["square", "rectangle"] },
    { text: "Szemközti oldalai párhuzamosak", shapes: ["square", "rectangle", "rhombus", "parallelogram"] },
    { text: "Szemközti oldalai egyenlők", shapes: ["square", "rectangle", "rhombus", "parallelogram"] },
    { text: "Szemközti szögei egyenlők", shapes: ["square", "rectangle", "rhombus", "parallelogram"] },
    { text: "Átlói egyenlő hosszúak", shapes: ["square", "rectangle"] },
    { text: "Átlói merőlegesek", shapes: ["square", "rhombus", "kite"] },
    { text: "Az átlói felezik egymást", shapes: ["square", "rectangle", "rhombus", "parallelogram"] },
    { text: "Van legalább egy pár párhuzamos oldala", shapes: ["square", "rectangle", "rhombus", "parallelogram", "trapezoid"] },
    { text: "Csak az egyik pár szemközti oldala párhuzamos", shapes: ["trapezoid"] },
    { text: "Két-két szomszédos oldala egyenlő", shapes: ["square", "rhombus", "kite"] },
    { text: "Az átlói nem metszik egymást", shapes: [] },
    { text: "Pontosan három oldala egyenlő hosszú", shapes: [] }
];

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

const QUAD_MIXES = ["name", "property"];

function buildQuadrilateral(kind = pick(QUAD_KINDS)) {
    const ask = pick(QUAD_MIXES);
    if (ask === "name") {
        const correct = QUADS[kind].label;
        const others = shuffle(QUAD_KINDS.filter(k => k !== kind)).slice(0, 3);
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
    const { count = 8, mode = "mixed", kinds = ALL_KINDS } = options;

    const mixes = mode === "mixed"
        ? ["name", "sides", "sides", "vertices", "vertices", "diagonals", "diagonals", "diagonals"]
        : null;

    const quadOrder = shuffle([...QUAD_KINDS]);

    const tasks = [];
    let lastSignature = null;
    for (let i = 0; i < count; i++) {
        const m = mixes ? pick(mixes) : mode;
        let task = buildTask(m, kinds, quadOrder[i % quadOrder.length]);
        let signature = `${task.mode}:${task.kind}`;

        for (let attempt = 0; attempt < 6 && signature === lastSignature; attempt++) {
            task = buildTask(m, kinds, quadOrder[(i + attempt + 1) % quadOrder.length]);
            signature = `${task.mode}:${task.kind}`;
        }

        lastSignature = signature;
        tasks.push(task);
    }
    return tasks;
}

function buildTask(m, kinds, quadKind) {
    if (m === "name") {
        return buildName(kinds);
    }
    if (m === "sides" || m === "vertices" || m === "diagonals") {
        return buildCount(m, kinds);
    }
    if (m === "quadrilateral") {
        return buildQuadrilateral(quadKind);
    }
    throw new Error(`Ismeretlen polygon mód: ${m}`);
}