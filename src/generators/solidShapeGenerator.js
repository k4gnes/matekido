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
    cube: { label: "kocka", dative: "kockának", faces: 6 },
    cuboid: { label: "téglatest", dative: "téglatestnek", faces: 6 },
    cylinder: { label: "henger", dative: "hengernek", faces: 3 },
    cone: { label: "kúp", dative: "kúpnak", faces: 2 }
};

const ALL_LABELS = [...Object.values(SOLIDS).map(s => s.label), "gömb"];

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function buildName() {
    const solid = pick(Object.keys(SOLIDS));
    const correctLabel = SOLIDS[solid].label;
    const distractors = shuffle(ALL_LABELS.filter(l => l !== correctLabel)).slice(0, 3);
    const options = shuffle([capitalize(correctLabel), ...distractors.map(capitalize)]);

    return {
        type: "solid-shape",
        mode: "name",
        solid,
        options,
        answer: options.indexOf(capitalize(correctLabel))
    };
}

function buildFaces() {
    const solid = pick(Object.keys(SOLIDS));
    const correct = SOLIDS[solid].faces;
    const candidates = shuffle([correct - 2, correct - 1, correct + 1, correct + 2, correct + 4])
        .filter(v => v > 0 && v !== correct);
    const options = shuffle([correct, ...candidates.slice(0, 3)]);

    return {
        type: "solid-shape",
        mode: "faces",
        solid,
        options,
        answer: options.indexOf(correct)
    };
}

export function generateSolidShape(options = {}) {
    const { count = 8, mode = "mixed" } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        const m = mode === "mixed" ? (Math.random() < 0.55 ? "name" : "faces") : mode;
        tasks.push(m === "faces" ? buildFaces() : buildName());
    }
    return tasks;
}
