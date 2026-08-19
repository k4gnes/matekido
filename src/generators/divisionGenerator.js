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

const EMOJIS_DEFAULT = ['🍎', '🍊', '🍋', '🍇', '🍓', '🥕', '🍬', '🌟', '⚽', '🎯', '🌸', '🐝'];

const EMOJIS_WORLD = {
    animals: ['🥕', '🍎', '🥬', '🍇', '🍌', '🥒', '🌽', '🐟', '🌿', '🍓'],
    cooking: ['🍳', '🥘', '🍖', '🍗', '🍎', '🍌', '🥕', '🍕', '🌮', '🥗'],
};

function getEmojis(world) {
    return EMOJIS_WORLD[world] || EMOJIS_DEFAULT;
}

function assignInteraction(task, modes, interaction) {
    const mode = interaction === "mixed" ? pick(modes) : interaction;
    task.interaction = mode;
    if (mode === "choice") {
        task.options = makeOptions(task.answer, 1, 20);
    }
    if (mode === "tf") {
        const isCorrect = Math.random() < 0.5;
        if (isCorrect) {
            task.statement = `${task.a} ÷ ${task.b} = ${task.answer}`;
            task.tfAnswer = true;
        } else {
            const wrong = task.answer + pick([-2, -1, 1, 2]);
            task.statement = `${task.a} ÷ ${task.b} = ${wrong}`;
            task.tfAnswer = false;
        }
    }
}

function generateSharing(count, tables, interaction, world) {
    const emojis = getEmojis(world);
    const tasks = [];
    for (let i = 0; i < count; i++) {
        const groups = randint(2, 5);
        const perGroup = pick(tables);
        const total = groups * perGroup;
        const emoji = pick(emojis);
        const task = {
            type: "sharing",
            total,
            groups,
            perGroup,
            answer: perGroup,
            emoji
        };
        assignInteraction(task, ["input", "choice"], interaction);
        tasks.push(task);
    }
    return tasks;
}

function generateGrouping(count, tables, interaction, world) {
    const emojis = getEmojis(world);
    const tasks = [];
    for (let i = 0; i < count; i++) {
        const groupSize = pick(tables);
        const numGroups = randint(2, 6);
        const total = groupSize * numGroups;
        const emoji = pick(emojis);
        const task = {
            type: "grouping",
            total,
            groupSize,
            numGroups,
            answer: numGroups,
            emoji
        };
        assignInteraction(task, ["input", "choice"], interaction);
        tasks.push(task);
    }
    return tasks;
}

function generateTable(count, tables, interaction) {
    const tasks = [];
    for (let i = 0; i < count; i++) {
        const b = pick(tables);
        const result = randint(1, 10);
        const a = b * result;
        const task = {
            type: "division-table",
            a,
            b,
            answer: result
        };
        assignInteraction(task, ["input", "choice", "tf"], interaction);
        tasks.push(task);
    }
    return tasks;
}

export function generateDivision(options = {}) {
    const { count = 6, tables = [2, 5, 10], type = "division-table", interaction = "mixed", world } = options;

    switch (type) {
        case "sharing":
            return generateSharing(count, tables, interaction, world);
        case "grouping":
            return generateGrouping(count, tables, interaction, world);
        case "division-table":
            return generateTable(count, tables, interaction);
        default:
            return generateTable(count, tables, interaction);
    }
}
