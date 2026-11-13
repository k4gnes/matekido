const TABLES = [2, 5, 10];

const EMOJIS_DEFAULT = ["🍎", "⭐", "🐟", "🌸", "🍋", "🐝", "🦉", "🍄", "🎈", "🍭"];

const EMOJIS_WORLD = {
    racing: ["🚗", "🏎️", "🏁", "🔧", "⛽"],
    football: ["👟", "⚽", "🎽", "🥅", "🏆"],
    postman: ["💌", "📩", "📨", "📧", "💌"],
    space: ["🚀", "🛸", "🌍", "⭐", "🛰️"],
    animals: ["🐰", "🦁", "🦊", "🐸", "🐻", "🦉", "🐢", "🐟", "🐝", "🐮"],
    cooking: ["🍳", "🥘", "🍖", "🍗", "🍎", "🍌", "🥕", "🍕", "🌮", "🥗"],
};

function getEmojis(world) {
    return EMOJIS_WORLD[world] || EMOJIS_DEFAULT;
}

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

function generateEqualGroups(count, tables, max, interaction, world) {
    const emojis = getEmojis(world);
    const tasks = [];
    const seen = new Set();
    // A [2, 5]-ös táblából csak pár csoportszerkezet van (5 feladatra ~10), ezért az nem jöhet kétszer.
    const buildTask = () => {
        const perGroup = pick(tables);
        const numGroups = randint(2, Math.min(6, Math.floor(max / perGroup)));
        const total = perGroup * numGroups;
        const emoji = pick(emojis);
        const mode = interaction === "mixed" ? pick(["input", "choice"]) : interaction;
        return {
            type: "equal-groups",
            groups: numGroups,
            perGroup,
            total,
            answer: total,
            emoji,
            interaction: mode,
            options: mode === "choice" ? makeOptions(total, 1, max + 10) : undefined
        };
    };
    for (let i = 0; i < count; i++) {
        let task = buildTask();
        let key = `${task.groups}x${task.perGroup}`;
        let tries = 0;
        while (seen.has(key) && tries < 20) {
            task = buildTask();
            key = `${task.groups}x${task.perGroup}`;
            tries++;
        }
        seen.add(key);
        tasks.push(task);
    }
    return tasks;
}

function generateRepeatedAddition(count, tables, max, interaction) {
    const tasks = [];
    const seen = new Set();
    const buildTask = () => {
        const addend = pick(tables);
        const times = randint(2, Math.min(5, Math.floor(max / addend)));
        const parts = Array(times).fill(addend);
        const expression = parts.join(" + ");
        const answer = addend * times;
        const mode = interaction === "mixed" ? pick(["input", "choice"]) : interaction;
        return {
            type: "repeated-addition",
            addend,
            times,
            expression,
            answer,
            interaction: mode,
            options: mode === "choice" ? makeOptions(answer, 1, max + 10) : undefined
        };
    };
    for (let i = 0; i < count; i++) {
        let task = buildTask();
        let tries = 0;
        while (seen.has(task.expression) && tries < 20) {
            task = buildTask();
            tries++;
        }
        seen.add(task.expression);
        tasks.push(task);
    }
    return tasks;
}

function generateSkipCounting(count, tables, max, interaction) {
    const tasks = [];
    const seen = new Set();
    const buildTask = () => {
        const step = pick(tables);
        const maxStart = max - step * 4;
        const start = randint(1, Math.max(1, maxStart));
        const terms = [];
        for (let t = 0; t < 5; t++) {
            terms.push(start + step * t);
        }
        const missingIndex = randint(1, 3);
        const answer = terms[missingIndex];
        return {
            type: "skip-counting",
            terms,
            missingIndex,
            answer,
            step,
            interaction: interaction === "mixed" ? pick(["input", "choice"]) : interaction
        };
    };
    for (let i = 0; i < count; i++) {
        let task = buildTask();
        // A számsor a feladat: ugyanazzal a sorral másik hiányzó hely is ugyanaz a feladatnak tűnik.
        let key = task.terms.join(",");
        let tries = 0;
        while (seen.has(key) && tries < 20) {
            task = buildTask();
            key = task.terms.join(",");
            tries++;
        }
        seen.add(key);
        tasks.push(task);
    }
    return tasks;
}

export function generateMultPrep(options = {}) {
    const { count = 5, type = "equal-groups", tables = TABLES, max = 50, interaction = "mixed", world } = options;

    switch (type) {
        case "equal-groups":
            return generateEqualGroups(count, tables, max, interaction, world);
        case "repeated-addition":
            return generateRepeatedAddition(count, tables, max, interaction);
        case "skip-counting":
            return generateSkipCounting(count, tables, max, interaction);
        default:
            return generateEqualGroups(count, tables, max, interaction, world);
    }
}
