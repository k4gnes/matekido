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

function formatNumber(value) {
    return String(value).replace(".", ",");
}

const TRIPLES = [
    [3, 4, 5],
    [6, 8, 10],
    [5, 12, 13],
    [9, 12, 15],
    [8, 15, 17],
    [7, 24, 25],
    [12, 16, 20],
    [15, 20, 25],
    [10, 24, 26],
    [20, 21, 29],
    [9, 40, 41],
    [12, 35, 37],
    [18, 24, 30],
    [16, 30, 34]
];

const NON_TRIPLES = [
    [4, 5, 6],
    [3, 5, 7],
    [5, 6, 8],
    [2, 3, 4],
    [6, 7, 9],
    [7, 8, 10],
    [4, 7, 9],
    [5, 9, 11],
    [8, 9, 12],
    [6, 10, 13]
];

function numberOptions(answer, candidates) {
    const seen = new Set([answer]);
    const decoys = [];
    for (const value of shuffle(candidates)) {
        if (!Number.isInteger(value) || value <= 0 || seen.has(value)) continue;
        seen.add(value);
        decoys.push(value);
        if (decoys.length === 3) break;
    }
    return shuffle([answer, ...decoys]).map(value => ({ text: formatNumber(value), correct: value === answer }));
}

function buildHypotenuse() {
    const [a, b, c] = pick(TRIPLES);
    return {
        mode: "hypotenuse",
        a,
        b,
        answer: c,
        question: `Mekkora a derékszögű háromszög átfogója, ha a két befogója ${a} cm és ${b} cm?`,
        options: numberOptions(c, [a + b, c + 1, c - 1, c + 2, c - 2, a + b + c, Math.round(c / 2)])
    };
}

function buildLeg() {
    const [a, b, c] = pick(TRIPLES);
    const knownFirst = Math.random() < 0.5;
    const known = knownFirst ? a : b;
    const answer = knownFirst ? b : a;
    return {
        mode: "leg",
        known,
        hypotenuse: c,
        answer,
        question: `Mekkora a derékszögű háromszög hiányzó befogója, ha az átfogója ${c} cm és az egyik befogója ${known} cm?`,
        options: numberOptions(answer, [known, c + 1, c - 1, answer + 1, answer - 1, answer + 2, answer - 2, c - known])
    };
}

function buildCheck() {
    const isTriple = Math.random() < 0.5;
    const triple = isTriple ? pick(TRIPLES) : pick(NON_TRIPLES);
    const [a, b, c] = triple;
    const right = a * a + b * b === c * c;
    return {
        mode: "check",
        a,
        b,
        c,
        answer: right,
        question: `Derékszögű háromszög alkotható a ${a} cm, ${b} cm és ${c} cm oldalú háromszögből? Ellenőrizd a Pitagorasz-tétellel!`,
        options: [
            { text: "Igen", correct: right },
            { text: "Nem", correct: !right }
        ]
    };
}

const MODES = {
    hypotenuse: buildHypotenuse,
    leg: buildLeg,
    check: buildCheck
};

export function generatePythagorean(options = {}) {
    const { count = 6, mode = "mixed" } = options;

    const mixed = ["hypotenuse", "hypotenuse", "leg", "leg", "check"];

    const tasks = [];
    let lastSignature = null;
    for (let i = 0; i < count; i++) {
        const m = mode === "mixed" ? mixed[i % mixed.length] : mode;
        const build = MODES[m];
        if (!build) throw new Error(`Ismeretlen pythagorean mód: ${m}`);
        let task = build();
        let signature = `${task.mode}:${task.answer}`;
        for (let attempt = 0; attempt < 8 && signature === lastSignature; attempt++) {
            task = build();
            signature = `${task.mode}:${task.answer}`;
        }
        lastSignature = signature;
        tasks.push({ type: "pythagorean", ...task });
    }
    return tasks;
}