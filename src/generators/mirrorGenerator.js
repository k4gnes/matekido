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

function rotations(cells) {
    let r = cells;
    const out = [];
    for (let i = 0; i < 4; i++) {
        out.push(r);
        r = rotate90(r);
    }
    return out;
}

function mirrorVertical(cells) {
    return normalize(cells.map(([x, y]) => [3 - x, y]));
}

function mirrorHorizontal(cells) {
    return normalize(cells.map(([x, y]) => [x, 3 - y]));
}

function maxCoord(cells, idx) {
    return Math.max(...cells.map(c => c[idx]));
}

function mirrorAcross(cells, idx) {
    const max = maxCoord(cells, idx);
    return normalize(cells.map(c => c.map((v, i) => (i === idx ? max - v : v))));
}

const FAMILIES = [
    [[0, 0], [0, 1], [0, 2], [1, 2]],
    [[1, 0], [2, 0], [0, 1], [1, 1]],
    [[0, 1], [1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]],
    [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1]],
    [[0, 0], [0, 1], [0, 2], [0, 3], [1, 1]]
];

const ORIENTATIONS = FAMILIES.flatMap(family => {
    const rots = rotations(family);
    return rots.map((rot, i) => ({ cells: rot, family: JSON.stringify(family) }));
});

function cellsKey(cells) {
    return JSON.stringify([...cells].sort());
}

function buildMirror() {
    const base = pick(ORIENTATIONS).cells;

    let attempt = 0;
    while (attempt < 20) {
        attempt++;

        const axis = pick(["vertical", "horizontal"]);
        const mirror = axis === "vertical" ? mirrorVertical(base) : mirrorHorizontal(base);

        if (cellsKey(mirror) === cellsKey(base)) continue;

        const rotPool = rotations(base).filter(c => cellsKey(c) !== cellsKey(base) && cellsKey(c) !== cellsKey(mirror));
        if (rotPool.length === 0) continue;

        const rotated = pick(rotPool);
        const options = shuffle([mirror, base, rotated]);

        return {
            type: "mirror",
            axis,
            base,
            options,
            answer: options.findIndex(c => cellsKey(c) === cellsKey(mirror))
        };
    }

    return buildMirror();
}

export function generateMirror(options = {}) {
    const { count = 5 } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        tasks.push(buildMirror());
    }
    return tasks;
}