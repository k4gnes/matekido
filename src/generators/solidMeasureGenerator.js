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

function makeOptions(answer) {
    const options = new Set([answer]);
    let guard = 0;
    while (options.size < 4 && guard < 60) {
        guard++;
        const delta = random(2, Math.max(3, Math.round(answer / 5)));
        const candidate = answer + (Math.random() < 0.5 ? -1 : 1) * delta;
        if (candidate >= 6 && candidate <= 1200) {
            options.add(candidate);
        }
    }
    let k = 1;
    while (options.size < 4) {
        if (answer + k <= 1200) options.add(answer + k);
        if (options.size < 4 && answer - k >= 6) options.add(answer - k);
        k++;
    }
    return shuffle([...options].slice(0, 4));
}

const FACE_TRIPLES = [
    [3, 4, 5],
    [6, 8, 10],
    [5, 12, 13]
];

const SPACE_TRIPLES = [
    [2, 3, 6, 7],
    [2, 4, 4, 6],
    [2, 6, 9, 11],
    [3, 6, 6, 9],
    [4, 4, 7, 9],
    [6, 6, 7, 11]
];

const PRISM_TRIPLES = [
    [3, 4, 5],
    [6, 8, 10],
    [5, 12, 13]
];

function surfaceOf(a, b, c) {
    return 2 * (a * b + a * c + b * c);
}

function buildFaceDiagonal() {
    const [a, b, answer] = pick(FACE_TRIPLES);
    const c = random(3, 10);

    return {
        type: "solid-measure",
        solid: "cuboid",
        mode: "faceDiagonal",
        a,
        b,
        c,
        answer,
        options: makeOptions(answer)
    };
}

function buildSpaceDiagonal() {
    const [a, b, c, answer] = pick(SPACE_TRIPLES);

    return {
        type: "solid-measure",
        solid: "cuboid",
        mode: "spaceDiagonal",
        a,
        b,
        c,
        answer,
        options: makeOptions(answer)
    };
}

function buildPrism(mode) {
    const [a, b, hyp] = pick(PRISM_TRIPLES);
    const c = random(3, 10);
    const answer = mode === "surface"
        ? a * b + (a + b + hyp) * c
        : (a * b / 2) * c;

    return {
        type: "solid-measure",
        solid: "prism",
        mode,
        a,
        b,
        c,
        answer,
        options: makeOptions(answer)
    };
}

function buildTask(mode, solid) {
    if (mode === "faceDiagonal") return buildFaceDiagonal();
    if (mode === "spaceDiagonal") return buildSpaceDiagonal();
    if (solid === "prism") return buildPrism(mode);

    let a;
    let b;
    let c;
    if (solid === "cube") {
        a = random(3, 10);
        b = a;
        c = a;
    } else {
        do {
            a = random(3, 10);
            b = random(3, 10);
            c = random(3, 10);
        } while (a === b && b === c);
    }

    const answer = mode === "surface" ? surfaceOf(a, b, c) : a * b * c;

    return {
        type: "solid-measure",
        solid,
        mode,
        a,
        b,
        c,
        answer,
        options: makeOptions(answer)
    };
}

export function generateSolidMeasure(options = {}) {
    const { count = 8, mode = "mixed", solids } = options;

    const modes = mode === "mixed" ? ["surface", "volume"] : [mode];
    const allowed = Array.isArray(solids) && solids.length
        ? solids.filter(s => ["cube", "cuboid", "prism"].includes(s))
        : [];
    const flatSolids = allowed.length ? allowed : ["cube", "cuboid"];

    const tasks = [];
    const seen = new Set();
    for (let i = 0; i < count; i++) {
        const m = modes[i % modes.length];
        let task;
        let guard = 0;
        do {
            const solid = m === "surface" || m === "volume"
                ? flatSolids[random(0, flatSolids.length - 1)]
                : "cuboid";
            task = buildTask(m, solid);
            guard++;
        } while (seen.has(`${task.solid}:${task.mode}:${task.a}:${task.b}:${task.c}`) && guard < 30);
        seen.add(`${task.solid}:${task.mode}:${task.a}:${task.b}:${task.c}`);
        tasks.push(task);
    }
    return tasks;
}
