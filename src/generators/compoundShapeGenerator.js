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

function makeOptions(answer, min, max) {
    const options = new Set([answer]);
    let guard = 0;
    while (options.size < 4 && guard < 40) {
        guard++;
        const delta = random(1, Math.max(2, Math.round((max - min) / 5)));
        const candidate = answer + (Math.random() < 0.5 ? -1 : 1) * delta;
        if (candidate >= min && candidate <= max) {
            options.add(candidate);
        }
    }
    return shuffle([...options]);
}

function lShape() {
    const cols = random(4, 6);
    const rows = random(3, 5);
    const cutCols = random(1, cols - 2);
    const cutRows = random(1, rows - 2);
    const cells = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (r >= rows - cutRows && c >= cols - cutCols) continue;
            cells.push([r, c]);
        }
    }
    const seams = [[[rows - cutRows, 0], [rows - cutRows, cols - cutCols]]];
    return { kind: "L", rows, cols, cells, seams };
}

function stairsShape() {
    const rows = random(3, 4);
    const base = random(1, 2);
    const cells = [];
    for (let r = 0; r < rows; r++) {
        const width = base + r;
        for (let c = 0; c < width; c++) {
            cells.push([r, c]);
        }
    }
    const seams = [];
    for (let r = 1; r < rows; r++) {
        seams.push([[r, 0], [r, base + r - 1]]);
    }
    return { kind: "stairs", rows, cols: base + rows - 1, cells, seams };
}

function boundaryCount(cells) {
    const set = new Set(cells.map(([r, c]) => `${r},${c}`));
    let boundary = 0;
    for (const [r, c] of cells) {
        if (!set.has(`${r - 1},${c}`)) boundary++;
        if (!set.has(`${r + 1},${c}`)) boundary++;
        if (!set.has(`${r},${c - 1}`)) boundary++;
        if (!set.has(`${r},${c + 1}`)) boundary++;
    }
    return boundary;
}

export function generateCompoundShape(options = {}) {
    const { count = 8, mode = "mixed" } = options;

    const modes = mode === "mixed" ? ["perimeter", "area"] : [mode];

    const tasks = [];

    for (let i = 0; i < count; i++) {
        const shape = Math.random() < 0.6 ? lShape() : stairsShape();
        const m = modes[i % modes.length];
        const answer = m === "area" ? shape.cells.length : boundaryCount(shape.cells);

        tasks.push({
            type: "compound-shape",
            kind: shape.kind,
            rows: shape.rows,
            cols: shape.cols,
            cells: shape.cells,
            seams: shape.seams,
            mode: m,
            answer,
            options: makeOptions(answer, 6, 26)
        });
    }

    return tasks;
}