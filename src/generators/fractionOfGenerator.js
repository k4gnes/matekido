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
    postman: ['💌', '📩', '📦', '📮', '📨', '📧', '✉️', '📬'],
    racing: ['🏎️', '🚗', '🔧', '⚙️', '🏁', '⛽', '🏆'],
    football: ['⚽', '🥅', '👟', '🏆', '🎽', '⚾', '🏀'],
    animals: ['🥕', '🍎', '🥬', '🍇', '🍌', '🥒', '🌽', '🐟', '🌿', '🍓'],
    space: ['🚀', '🛸', '🛰️', '🌍', '⭐', '👽', '🌙'],
    cooking: ['🍳', '🥘', '🍖', '🍗', '🍎', '🍌', '🥕', '🍕', '🌮', '🥗'],
};

function getEmojis(world) {
    return EMOJIS_WORLD[world] || EMOJIS_DEFAULT;
}

export function generateFractionOf(options = {}) {
    const { count = 6, denominator = 0, interaction = "mixed", world } = options;

    const emojis = getEmojis(world);
    const denoms = denominator > 0 ? [denominator] : [2, 3, 4];

    const tasks = [];
    for (let i = 0; i < count; i++) {
        const den = pick(denoms);
        const answer = randint(1, 12);
        const whole = den * answer;
        const emoji = pick(emojis);

        const task = {
            type: "fraction-of",
            whole,
            denominator: den,
            answer,
            emoji
        };

        const mode = interaction === "mixed" ? pick(["choice", "input"]) : interaction;
        task.interaction = mode;

        if (mode === "choice") {
            task.options = makeOptions(task.answer, 1, 12);
        }

        tasks.push(task);
    }
    return tasks;
}