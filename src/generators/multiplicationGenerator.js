function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function makeOptions(answer, min, max, count = 4) {
    const options = [answer];
    const seen = new Set([answer]);
    const deltas = [1, -1, 2, -2, 3, -3, 5, -5, 10, -10];
    for (const d of deltas) {
        if (options.length >= count) break;
        const v = answer + d;
        if (v >= min && v <= max && !seen.has(v)) {
            seen.add(v);
            options.push(v);
        }
    }
    for (let v = min; v <= max && options.length < count; v++) {
        if (!seen.has(v)) {
            seen.add(v);
            options.push(v);
        }
    }
    return shuffle(options);
}

function assignInteraction(task, modes, interaction) {
    const mode = interaction === "mixed" ? pick(modes) : interaction;
    task.interaction = mode;
    if (mode === "choice") {
        task.options = makeOptions(task.answer, 1, 100);
    }
    if (mode === "tf") {
        const isCorrect = Math.random() < 0.5;
        if (isCorrect) {
            task.statement = `${task.a} × ${task.b} = ${task.answer}`;
            task.tfAnswer = true;
        } else {
            const wrong = task.answer + pick([-2, -1, 1, 2]);
            task.statement = `${task.a} × ${task.b} = ${wrong}`;
            task.tfAnswer = false;
        }
    }
}

function generateTable(count, tables, interaction) {
    const tasks = [];
    for (let i = 0; i < count; i++) {
        const a = pick(tables);
        const b = randint(1, 10);
        const answer = a * b;
        const task = { type: "table", a, b, answer };
        assignInteraction(task, ["input", "choice", "tf"], interaction);
        tasks.push(task);
    }
    return tasks;
}

function generateMissingFactor(count, tables, interaction) {
    const tasks = [];
    for (let i = 0; i < count; i++) {
        const a = pick(tables);
        const b = randint(1, 10);
        const answer = a * b;
        const missingFirst = Math.random() < 0.5;
        const task = {
            type: "missing-factor",
            a,
            b,
            answer: missingFirst ? a : b,
            expression: missingFirst ? `? × ${b} = ${answer}` : `${a} × ? = ${answer}`
        };
        assignInteraction(task, ["input", "choice"], interaction);
        tasks.push(task);
    }
    return tasks;
}

function generateMatchGroups(count, tables, interaction) {
    const tasks = [];
    for (let i = 0; i < count; i++) {
        const a = pick(tables);
        const b = randint(2, 6);
        const total = a * b;
        const task = {
            type: "match-groups",
            a,
            b,
            total,
            groups: Array(b).fill(a)
        };
        assignInteraction(task, ["choice"], interaction);
        tasks.push(task);
    }
    return tasks;
}

export function generateMultiplication(options = {}) {
    const { count = 6, tables = [2, 5, 10], type = "table", interaction = "mixed" } = options;

    switch (type) {
        case "table":
            return generateTable(count, tables, interaction);
        case "missing-factor":
            return generateMissingFactor(count, tables, interaction);
        case "match-groups":
            return generateMatchGroups(count, tables, interaction);
        default:
            return generateTable(count, tables, interaction);
    }
}
