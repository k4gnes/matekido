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
    const deltas = [1, -1, 2, -2, 3, -3, 5, -5];
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
        task.options = makeOptions(task.answer, 1, 30);
    }
}

function generateAddMissing(max, interaction) {
    const tasks = [];
    for (let i = 0; i < 8; i++) {
        const b = randint(2, Math.min(max - 3, 20));
        const a = randint(1, max - b);
        const answer = a + b;
        const missingFirst = Math.random() < 0.5;
        const task = {
            type: "missing-operand",
            op: "+",
            a: missingFirst ? null : a,
            b: missingFirst ? b : null,
            answer: missingFirst ? a : b,
            expression: missingFirst ? `? + ${b} = ${answer}` : `${a} + ? = ${answer}`
        };
        assignInteraction(task, ["input", "choice"], interaction);
        tasks.push(task);
    }
    return tasks;
}

function generateSubMissing(max, interaction) {
    const tasks = [];
    for (let i = 0; i < 8; i++) {
        const result = randint(1, max - 3);
        const b = randint(1, max - result);
        const a = result + b;
        const missingMinuend = Math.random() < 0.5;
        const task = {
            type: "missing-operand",
            op: "-",
            a: missingMinuend ? null : a,
            b: missingMinuend ? null : b,
            answer: missingMinuend ? a : b,
            expression: missingMinuend ? `? - ${b} = ${result}` : `${a} - ? = ${result}`
        };
        assignInteraction(task, ["input", "choice"], interaction);
        tasks.push(task);
    }
    return tasks;
}

function generateMixed(max, interaction) {
    const tasks = [];
    for (let i = 0; i < 10; i++) {
        if (Math.random() < 0.5) {
            const b = randint(2, Math.min(max - 3, 20));
            const a = randint(1, max - b);
            const answer = a + b;
            const missingFirst = Math.random() < 0.5;
            const task = {
                type: "missing-operand",
                op: "+",
                a: missingFirst ? null : a,
                b: missingFirst ? b : null,
                answer: missingFirst ? a : b,
                expression: missingFirst ? `? + ${b} = ${answer}` : `${a} + ? = ${answer}`
            };
            assignInteraction(task, ["input", "choice"], interaction);
            tasks.push(task);
        } else {
            const result = randint(1, max - 3);
            const b = randint(1, max - result);
            const a = result + b;
            const missingMinuend = Math.random() < 0.5;
            const task = {
                type: "missing-operand",
                op: "-",
                a: missingMinuend ? null : a,
                b: missingMinuend ? null : b,
                answer: missingMinuend ? a : b,
                expression: missingMinuend ? `? - ${b} = ${result}` : `${a} - ? = ${result}`
            };
            assignInteraction(task, ["input", "choice"], interaction);
            tasks.push(task);
        }
    }
    return tasks;
}

export function generateMissingOperand(options = {}) {
    const { count = 10, max = 20, type = "mixed", interaction = "mixed" } = options;

    switch (type) {
        case "addition":
            return generateAddMissing(max, interaction).slice(0, count);
        case "subtraction":
            return generateSubMissing(max, interaction).slice(0, count);
        default:
            return generateMixed(max, interaction).slice(0, count);
    }
}
