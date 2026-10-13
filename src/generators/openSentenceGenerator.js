function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const MODES = ["add", "sub", "mul", "div"];

function buildTrue(mode) {
    if (mode === "add") {
        const a = randint(2, 40);
        const x = randint(2, 40);
        return { mode, a, right: x + a, value: x, sentence: `x + ${a} = ${x + a}` };
    }
    if (mode === "sub") {
        const a = randint(2, 30);
        const x = randint(a + 1, a + 40);
        return { mode, a, right: x - a, value: x, sentence: `x − ${a} = ${x - a}` };
    }
    if (mode === "mul") {
        const a = randint(2, 9);
        const x = randint(2, 8);
        return { mode, a, right: a * x, value: x, sentence: `${a} × x = ${a * x}` };
    }
    const a = randint(2, 9);
    const x = randint(2, 8);
    return { mode, a, right: x, value: a * x, sentence: `x ÷ ${a} = ${x}` };
}

function makeFalse(task) {
    const shift = pick([1, 2]);
    if (task.mode === "div") {
        const quotient = task.value / task.a;
        return { ...task, value: task.a * (quotient + shift) };
    }
    return { ...task, value: task.value + shift };
}

function computeLeft(mode, a, value) {
    if (mode === "add") return value + a;
    if (mode === "sub") return value - a;
    if (mode === "mul") return a * value;
    return value / a;
}

export function generateOpenSentence(options = {}) {
    const { count = 4, mode = "mixed" } = options;

    if (mode !== "mixed" && !MODES.includes(mode)) {
        throw new Error(`Ismeretlen nyitott mondat mód: ${mode}`);
    }

    const tasks = [];
    const seen = new Set();

    let guard = 0;
    while (tasks.length < count && guard < count * 200) {
        guard++;
        const chosen = mode === "mixed" ? pick(MODES) : mode;
        const base = buildTrue(chosen);
        const task = Math.random() < 0.5 ? base : makeFalse(base);
        const key = `${task.sentence}|${task.value}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const left = computeLeft(task.mode, task.a, task.value);
        tasks.push({
            type: "open-sentence",
            mode: task.mode,
            a: task.a,
            right: task.right,
            value: task.value,
            left,
            answer: left === task.right,
            sentence: task.sentence,
            question: "Igaz vagy hamis?"
        });
    }

    return tasks;
}
