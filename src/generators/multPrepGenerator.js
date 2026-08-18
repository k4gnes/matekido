const TABLES = [2, 5, 10];

const EMOJIS = ["🍎", "⭐", "🐟", "🌸", "🍋", "🐝", "🦉", "🍄", "🎈", "🍭"];

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

function generateEqualGroups(count, tables, max) {
    const tasks = [];
    for (let i = 0; i < count; i++) {
        const perGroup = pick(tables);
        const numGroups = randint(2, Math.min(6, Math.floor(max / perGroup)));
        const total = perGroup * numGroups;
        const emoji = pick(EMOJIS);
        tasks.push({
            type: "equal-groups",
            groups: numGroups,
            perGroup,
            total,
            answer: total,
            emoji,
            options: makeOptions(total, 1, max + 10)
        });
    }
    return tasks;
}

function generateRepeatedAddition(count, tables, max) {
    const tasks = [];
    for (let i = 0; i < count; i++) {
        const addend = pick(tables);
        const times = randint(2, Math.min(5, Math.floor(max / addend)));
        const parts = Array(times).fill(addend);
        const expression = parts.join(" + ");
        const answer = addend * times;
        tasks.push({
            type: "repeated-addition",
            addend,
            times,
            expression,
            answer,
            options: makeOptions(answer, 1, max + 10)
        });
    }
    return tasks;
}

function generateSkipCounting(count, tables, max) {
    const tasks = [];
    for (let i = 0; i < count; i++) {
        const step = pick(tables);
        const maxStart = max - step * 5;
        const start = randint(1, Math.max(1, maxStart));
        const terms = [];
        for (let t = 0; t < 5; t++) {
            terms.push(start + step * t);
        }
        const missingIndex = randint(1, 3);
        const answer = terms[missingIndex];
        tasks.push({
            type: "skip-counting",
            terms,
            missingIndex,
            answer,
            step
        });
    }
    return tasks;
}

export function generateMultPrep(options = {}) {
    const { count = 5, type = "equal-groups", tables = TABLES, max = 50 } = options;

    switch (type) {
        case "equal-groups":
            return generateEqualGroups(count, tables, max);
        case "repeated-addition":
            return generateRepeatedAddition(count, tables, max);
        case "skip-counting":
            return generateSkipCounting(count, tables, max);
        default:
            return generateEqualGroups(count, tables, max);
    }
}
