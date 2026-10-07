function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

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

function validShifts(cells) {
    const xs = cells.map(c => c[0]);
    const ys = cells.map(c => c[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const shifts = [];
    for (let dx = -minX; dx <= 3 - maxX; dx++) {
        for (let dy = -minY; dy <= 3 - maxY; dy++) {
            if (dx !== 0 || dy !== 0) shifts.push({ dx, dy });
        }
    }
    return shifts;
}

function shiftCells(cells, shift) {
    return cells.map(([x, y]) => [x + shift.dx, y + shift.dy]);
}

function describeShift(shift) {
    const parts = [];
    if (shift.dx > 0) parts.push(`${shift.dx} lépés jobbra`);
    if (shift.dx < 0) parts.push(`${-shift.dx} lépés balra`);
    if (shift.dy > 0) parts.push(`${shift.dy} lépés lefelé`);
    if (shift.dy < 0) parts.push(`${-shift.dy} lépés felfelé`);
    return parts.join(" és ");
}

function buildTranslate() {
    for (let attempt = 0; attempt < 40; attempt++) {
        const idx = Math.floor(Math.random() * 3);
        const shape = pick(distinctRotations(FAMILIES[idx]));
        const w = Math.max(...shape.map(c => c[0])) + 1;
        const h = Math.max(...shape.map(c => c[1])) + 1;
        const ox = random(0, 3 - w);
        const oy = random(0, 3 - h);
        const base = shape.map(([x, y]) => [x + ox, y + oy]);
        const shifts = validShifts(base);
        if (shifts.length < 3) continue;

        const correct = pick(shifts);
        const answer = shiftCells(base, correct);

        const pool = shuffle(shifts.filter(s => s.dx !== correct.dx || s.dy !== correct.dy));
        const distractors = [];
        const seen = new Set([cellsKey(answer)]);
        const candidates = [base, ...pool.map(s => shiftCells(base, s))];
        for (const cells of candidates) {
            if (distractors.length >= 2) break;
            const key = cellsKey(cells);
            if (seen.has(key)) continue;
            seen.add(key);
            distractors.push(cells);
        }
        if (distractors.length < 2) continue;

        const options = shuffle([answer, ...distractors]);

        return {
            type: "transform",
            mode: "translate",
            base,
            shift: correct,
            question: `Melyik alakzat lesz, ha a mintát ${describeShift(correct)} toljuk?`,
            options,
            answer: options.findIndex(c => cellsKey(c) === cellsKey(answer))
        };
    }

    return buildTurn();
}

export function generateTransform(options = {}) {
    const { count = 5, mode = "turn" } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        tasks.push(mode === "translate" ? buildTranslate() : buildTurn());
    }
    return tasks;
}