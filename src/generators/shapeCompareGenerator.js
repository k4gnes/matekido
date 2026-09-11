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
    triangle: { label: "háromszög", dative: "háromszögnek", sides: 3 },
    square: { label: "négyzet", dative: "négyzetnek", sides: 4 },
    pentagon: { label: "ötszög", dative: "ötszögnek", sides: 5 },
    hexagon: { label: "hatszög", dative: "hatszögnek", sides: 6 },
    heptagon: { label: "hétszög", dative: "hétszögnek", sides: 7 },
    octagon: { label: "nyolcszög", dative: "nyolcszögnek", sides: 8 }
};

const KINDS = ["triangle", "square", "pentagon", "hexagon"];
const ALL_KINDS = Object.keys(POLYGONS);

function buildSides(kinds) {
    const pool = shuffle([...kinds]);
    const flip = Math.random() < 0.5;
    const left = flip ? pool[1] : pool[0];
    const right = flip ? pool[0] : pool[1];

    return {
        type: "shape-compare",
        mode: "sides",
        question: Math.random() < 0.5
            ? "Melyik alakzatnak van több oldala?"
            : "Melyik alakzatnak van több sarka?",
        left: { kind: left, size: 64 },
        right: { kind: right, size: 64 },
        answer: POLYGONS[left].sides > POLYGONS[right].sides ? "left" : "right"
    };
}

function buildSize(kinds) {
    const kind = pick(kinds);
    const big = pick([72, 80]);
    const small = pick([40, 48]);
    const flip = Math.random() < 0.5;

    return {
        type: "shape-compare",
        mode: "size",
        question: "Melyik alakzat a nagyobb?",
        left: flip ? { kind, size: small } : { kind, size: big },
        right: flip ? { kind, size: big } : { kind, size: small },
        answer: flip ? "right" : "left"
    };
}

export function generateShapeCompare(options = {}) {
    const { count = 8, mode = "mixed", kinds = KINDS } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        const m = mode === "mixed" ? (Math.random() < 0.6 ? "sides" : "size") : mode;
        tasks.push(m === "size" ? buildSize(kinds) : buildSides(kinds));
    }
    return tasks;
}
