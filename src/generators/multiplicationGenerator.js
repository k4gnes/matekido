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

function generateTable(count, tables) {
    const tasks = [];
    for (let i = 0; i < count; i++) {
        const a = pick(tables);
        const b = randint(1, 10);
        const answer = a * b;
        tasks.push({
            type: "table",
            a,
            b,
            answer,
            options: makeOptions(answer, 1, 100)
        });
    }
    return tasks;
}

function generateMissingFactor(count, tables) {
    const tasks = [];
    for (let i = 0; i < count; i++) {
        const a = pick(tables);
        const b = randint(1, 10);
        const answer = a * b;
        const missingFirst = Math.random() < 0.5;
        tasks.push({
            type: "missing-factor",
            a,
            b,
            answer: missingFirst ? a : b,
            expression: missingFirst ? `? × ${b} = ${answer}` : `${a} × ? = ${answer}`
        });
    }
    return tasks;
}

function generateMatchGroups(count, tables) {
    const tasks = [];
    for (let i = 0; i < count; i++) {
        const a = pick(tables);
        const b = randint(2, 6);
        const total = a * b;
        tasks.push({
            type: "match-groups",
            a,
            b,
            total,
            groups: Array(b).fill(a)
        });
    }
    return tasks;
}

export function generateMultiplication(options = {}) {
    const { count = 6, tables = [2, 5, 10], type = "table" } = options;

    switch (type) {
        case "table":
            return generateTable(count, tables);
        case "missing-factor":
            return generateMissingFactor(count, tables);
        case "match-groups":
            return generateMatchGroups(count, tables);
        default:
            return generateTable(count, tables);
    }
}
