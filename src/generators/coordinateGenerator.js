const MAX_INDEX = 9;

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

function formatPair(x, y) {
    return `(${x}; ${y})`;
}

function buildReadTask() {
    const x = random(0, MAX_INDEX);
    const y = random(0, MAX_INDEX);
    const correct = formatPair(x, y);

    const options = new Set([correct]);
    let guard = 0;
    while (options.size < 4 && guard < 60) {
        guard++;
        options.add(formatPair(random(0, MAX_INDEX), random(0, MAX_INDEX)));
    }

    const list = shuffle([...options]);

    return {
        type: "coordinate",
        mode: "read",
        x,
        y,
        options: list,
        answer: list.indexOf(correct)
    };
}

function buildLocateTask() {
    const x = random(0, MAX_INDEX);
    const y = random(0, MAX_INDEX);

    return {
        type: "coordinate",
        mode: "locate",
        x,
        y,
        answer: [x, y]
    };
}

export function generateCoordinate(options = {}) {
    const { count = 6, mode = "mixed" } = options;

    const modes = mode === "mixed" ? ["read", "locate"] : [mode];

    const tasks = [];
    for (let i = 0; i < count; i++) {
        tasks.push(modes[i % modes.length] === "read" ? buildReadTask() : buildLocateTask());
    }
    return tasks;
}
