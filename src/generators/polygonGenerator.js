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

function diagonalsOf(kind) {
    const n = POLYGONS[kind].sides;
    return n * (n - 3) / 2;
}

function buildName(kinds) {
    const kind = pick(kinds);
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

export function generatePolygon(options = {}) {
    const { count = 8, mode = "mixed", kinds = ALL_KINDS } = options;

    const mixes = mode === "mixed"
        ? ["name", "sides", "sides", "vertices", "vertices", "diagonals", "diagonals", "diagonals"]
        : null;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        const m = mixes ? pick(mixes) : mode;
        if (m === "name") {
            tasks.push(buildName(kinds));
        } else if (m === "sides" || m === "vertices" || m === "diagonals") {
            tasks.push(buildCount(m, kinds));
        } else {
            throw new Error(`Ismeretlen polygon mód: ${m}`);
        }
    }
    return tasks;
}