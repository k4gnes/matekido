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

const SOLIDS = {
    cube: { label: "kocka", dative: "kockának", faces: 6, edges: 12, vertices: 8 },
    cuboid: { label: "téglatest", dative: "téglatestnek", faces: 6, edges: 12, vertices: 8 },
    prism: { label: "hasáb", dative: "hasábnak", faces: 5, edges: 9, vertices: 6 },
    pyramid: { label: "gúla", dative: "gúlának", faces: 5, edges: 8, vertices: 5 },
    cylinder: { label: "henger", dative: "hengernek", faces: 3 },
    cone: { label: "kúp", dative: "kúpnak", faces: 2 },
    sphere: { label: "gömb", dative: "gömbnek", faces: 0 }
};

const BASE_SOLIDS = ["cube", "cuboid", "cylinder", "cone", "sphere"];
const FACE_SOLIDS = ["cube", "cuboid", "prism", "pyramid", "cylinder", "cone"];
const EDGE_SOLIDS = ["cube", "cuboid", "prism", "pyramid"];
const NET_SOLIDS = ["cube", "cuboid", "prism", "pyramid"];

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function allowedSolids(options) {
    const requested = Array.isArray(options.solids) ? options.solids.filter(s => SOLIDS[s]) : [];
    return requested.length ? requested : BASE_SOLIDS;
}

function createBag(items) {
    let bag = [];
    let last = null;
    return function draw() {
        if (!bag.length) {
            bag = shuffle(items.slice());
            if (bag.length > 1 && bag[bag.length - 1] === last) {
                [bag[bag.length - 1], bag[0]] = [bag[0], bag[bag.length - 1]];
            }
        }
        last = bag.pop();
        return last;
    };
}

function buildName(solids, solid = pick(solids)) {
    const correctLabel = capitalize(SOLIDS[solid].label);
    const labels = solids.map(s => capitalize(SOLIDS[s].label));
    const distractors = shuffle(labels.filter(l => l !== correctLabel)).slice(0, 3);
    const options = shuffle([correctLabel, ...distractors]);

    return {
        type: "solid-shape",
        mode: "name",
        solid,
        options,
        answer: options.indexOf(correctLabel)
    };
}

function buildCount(solid, mode) {
    const correct = SOLIDS[solid][mode];
    const candidates = shuffle([correct - 2, correct - 1, correct + 1, correct + 2, correct + 4])
        .filter(v => v > 0 && v !== correct);
    const options = shuffle([correct, ...candidates.slice(0, 3)]);

    return {
        type: "solid-shape",
        mode,
        solid,
        options,
        answer: options.indexOf(correct)
    };
}

function buildNet(solids, solid) {
    const netSolids = solids.filter(s => NET_SOLIDS.includes(s));
    const pool = netSolids.length ? netSolids : NET_SOLIDS;
    if (!solid) {
        solid = pick(pool);
    }
    const correctLabel = capitalize(SOLIDS[solid].label);
    const labels = pool.map(s => capitalize(SOLIDS[s].label));
    const distractors = shuffle(labels.filter(l => l !== correctLabel)).slice(0, 3);
    const options = shuffle([correctLabel, ...distractors]);

    return {
        type: "solid-shape",
        mode: "net",
        solid,
        options,
        answer: options.indexOf(correctLabel)
    };
}

export function generateSolidShape(options = {}) {
    const { count = 8, mode = "mixed" } = options;
    const solids = allowedSolids(options);
    const bags = new Map();

    function poolFor(m) {
        const allowed = m === "net" ? NET_SOLIDS
            : m === "faces" ? FACE_SOLIDS
            : m === "edges" || m === "vertices" ? EDGE_SOLIDS
            : solids;
        const pool = solids.filter(s => allowed.includes(s));
        return pool.length ? pool : allowed;
    }

    function drawSolid(m) {
        if (!bags.has(m)) bags.set(m, createBag(poolFor(m)));
        return bags.get(m)();
    }

    const tasks = [];
    for (let i = 0; i < count; i++) {
        const m = mode === "mixed" ? (Math.random() < 0.55 ? "name" : "faces") : mode;
        const solid = drawSolid(m);
        if (m === "net") tasks.push(buildNet(solids, solid));
        else if (m === "faces" || m === "edges" || m === "vertices") tasks.push(buildCount(solid, m));
        else tasks.push(buildName(solids, solid));
    }
    return tasks;
}
