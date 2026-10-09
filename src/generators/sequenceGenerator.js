function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildStepped(max) {

    const maxStep = Math.min(10, Math.max(1, Math.floor((max - 1) / 5)));

    const step = randint(1, maxStep);

    const direction = Math.random() < 0.5 ? 1 : -1;

    let start;
    if (direction === 1) {
        start = randint(1, max - 5 * step);
    } else {
        start = randint(5 * step + 1, max);
    }

    const terms = [];
    for (let t = 0; t < 5; t++) {
        terms.push(start + direction * step * t);
    }

    return {
        type: "sequence",
        terms,
        answer: start + direction * step * 5,
        step,
        direction
    };
}

function buildAlternating(max, deltas) {

    const [first, second] = deltas;

    const span = 3 * first + 2 * second;

    const start = randint(1, Math.max(1, max - span));

    const terms = [];
    let current = start;
    for (let t = 0; t < 5; t++) {
        terms.push(current);
        current += t % 2 === 0 ? first : second;
    }

    return {
        type: "sequence",
        terms,
        answer: current,
        step: first,
        direction: 1,
        alternating: true,
        deltas
    };
}

export function generateSequence(options = {}) {

    const {
        count = 5,
        max = 100,
        interaction = "mixed",
        alternate = false,
        deltas = [1, 3]
    } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const task = alternate ? buildAlternating(max, deltas) : buildStepped(max);

        task.interaction = interaction === "mixed" ? pick(["input", "choice"]) : interaction;

        tasks.push(task);
    }

    return tasks;
}
