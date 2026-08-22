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
    hexagon: { label: "hatszög", dative: "hatszögnek", sides: 6 }
};

const KINDS = Object.keys(POLYGONS);

function buildSides() {
    const kinds = shuffle([...KINDS]);
    const flip = Math.random() < 0.5;
    const left = flip ? kinds[1] : kinds[0];
    const right = flip ? kinds[0] : kinds[1];

    return {
        type: "shape-compare",
        mode: "sides",
        question: Math.random() < 0.5
            ? "Melyik alakzatnak van több oldala?"
            : "Melyik alakzatnak vannak több sarka?",
        left: { kind: left, size: 64 },
        right: { kind: right, size: 64 },
        answer: POLYGONS[left].sides > POLYGONS[right].sides ? "left" : "right"
    };
}

function buildSize() {
    const kind = pick(KINDS);
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
    const { count = 8, mode = "mixed" } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        const m = mode === "mixed" ? (Math.random() < 0.6 ? "sides" : "size") : mode;
        tasks.push(m === "size" ? buildSize() : buildSides());
    }
    return tasks;
}
