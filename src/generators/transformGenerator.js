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

function normalize(cells) {
    const xs = cells.map(c => c[0]);
    const ys = cells.map(c => c[1]);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    return cells.map(([x, y]) => [x - minX, y - minY]);
}

function rotate90(cells) {
    const maxY = Math.max(...cells.map(c => c[1]));
    return normalize(cells.map(([x, y]) => [y, maxY - x]));
}

function mirrorCells(cells) {
    const maxX = Math.max(...cells.map(c => c[0]));
    return normalize(cells.map(([x, y]) => [maxX - x, y]));
}

function rotations(cells) {
    let r = cells;
    const out = [];
    for (let i = 0; i < 4; i++) {
        out.push(r);
        r = rotate90(r);
    }
    return out;
}

function distinctRotations(cells) {
    const seen = new Set();
    const out = [];
    rotations(cells).forEach(r => {
        const key = cellsKey(r);
        if (!seen.has(key)) {
            seen.add(key);
            out.push(r);
        }
    });
    return out;
}

function cellsKey(cells) {
    return JSON.stringify([...cells].sort());
}

const FAMILIES = [
    [[0, 0], [0, 1], [0, 2], [1, 2]],
    [[1, 0], [2, 0], [0, 1], [1, 1]],
    [[0, 1], [1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]],
    [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1]],
    [[0, 0], [0, 1], [0, 2], [0, 3], [1, 1]]
];

const MIRRORS = FAMILIES.map(mirrorCells);

function buildTurn() {
    const idx = Math.floor(Math.random() * FAMILIES.length);
    const base = pick(distinctRotations(FAMILIES[idx]));
    const same = distinctRotations(FAMILIES[idx]).filter(c => cellsKey(c) !== cellsKey(base));
    const answer = pick(same);
    const distractorPool = distinctRotations(MIRRORS[idx]).filter(c => cellsKey(c) !== cellsKey(answer));
    const distractors = shuffle(distractorPool).slice(0, 2);
    const options = shuffle([answer, ...distractors]);

    return {
        type: "transform",
        mode: "turn",
        base,
        options,
        answer: options.findIndex(c => cellsKey(c) === cellsKey(answer))
    };
}

export function generateTransform(options = {}) {
    const { count = 5 } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        tasks.push(buildTurn());
    }
    return tasks;
}