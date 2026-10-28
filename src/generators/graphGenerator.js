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

function buildHandshakeTask() {
    const n = pick([4, 5, 6]);
    const answer = (n * (n - 1)) / 2;
    const edges = [];
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            edges.push([i, j]);
        }
    }
    const labels = Array.from({ length: n }, (_, i) => String(i + 1));
    const options = shuffle([
        { text: String(answer), correct: true },
        { text: String(n * (n - 1)), correct: false },
        { text: String(n), correct: false },
        { text: String(n - 1), correct: false }
    ]);
    return {
        type: "graph",
        mode: "handshake",
        n,
        labels,
        edges,
        answer,
        question: `Hány kézfogás történik, ha ${n} ember mindenki mindenkivel kezet fog?`,
        options
    };
}

function buildPathTask() {
    const n = pick([4, 5]);
    const labels = Array.from({ length: n }, (_, i) => String(i + 1));
    const edges = [];
    if (n === 4) {
        edges.push([0, 1], [1, 2], [2, 3]);
    } else {
        edges.push([0, 1], [1, 2], [2, 3], [3, 4]);
    }
    const answer = edges.length;
    const options = shuffle([
        { text: String(answer), correct: true },
        { text: String(answer + 1), correct: false },
        { text: String(answer - 1), correct: false },
        { text: String(n), correct: false }
    ]);
    return {
        type: "graph",
        mode: "path",
        n,
        labels,
        edges,
        answer,
        question: "Hány él alkotja a megadott útvonalat?",
        options
    };
}

export function generateGraph(options = {}) {
    const { count = 5, mode = "mixed" } = options;
    const builders = { handshake: buildHandshakeTask, path: buildPathTask };
    const tasks = [];
    const seen = new Set();
    let guard = 0;
    while (tasks.length < count && guard < count * 200) {
        guard++;
        const chosen = mode === "mixed" ? pick(Object.keys(builders)) : mode;
        const build = builders[chosen];
        if (!build) throw new Error(`Ismeretlen gráf mód: ${chosen}`);
        const task = build();
        const key = `${task.mode}|${task.question}`;
        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push(task);
    }
    return tasks;
}
