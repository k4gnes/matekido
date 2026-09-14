const MAX_GENERATION_ATTEMPTS = 10000;

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

function makeNumberOptions(answer, min, max, count = 4) {
    const options = [answer];
    const seen = new Set([answer]);
    const deltas = [1, -1, 2, -2, 3, -3];
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

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const EMOJIS_DEFAULT = ['🍎', '🍊', '🍋', '🍇', '🍓', '🥕', '🍬', '🌟', '⚽', '🎯', '🌸', '🐝'];

const EMOJIS_WORLD = {
    postman: ['💌', '📩', '📦', '📮', '📨', '📧', '✉️', '📬'],
    racing: ['🏎️', '🚗', '🔧', '⚙️', '🏁', '⛽', '🏆'],
    football: ['⚽', '🥅', '👟', '🏆', '🎽', '⚾', '🏀'],
    animals: ['🥕', '🍎', '🥬', '🍇', '🍌', '🥒', '🌽', '🐟', '🌿', '🍓'],
    space: ['🚀', '🛸', '🛰️', '🌍', '⭐', '👽', '🌙'],
    cooking: ['🍳', '🥘', '🍖', '🍗', '🍎', '🍌', '🥕', '🍕', '🌮', '🥗']
};

function getEmojis(world) {
    return EMOJIS_WORLD[world] || EMOJIS_DEFAULT;
}

export function generateRemainderDivision(options = {}) {

    const {
        count = 8,
        divisors = [2, 3, 4, 5, 6, 7, 8, 9],
        maxQuotient = 9,
        mode = "mixed",
        withZeroRemainder = false,
        interaction = "mixed",
        world
    } = options;

    const validModes = ["notation", "groups", "mixed"];

    if (!validModes.includes(mode)) {
        throw new Error(`Érvénytelen mode érték: ${mode}`);
    }

    const tasks = [];
    let attempts = 0;

    while (tasks.length < count) {

        attempts++;

        if (attempts > MAX_GENERATION_ATTEMPTS) {
            throw new Error("Nem sikerült elegendő maradékos osztást generálni.");
        }

        const b = pick(divisors);
        const quotient = random(1, maxQuotient);

        const remainderMin = withZeroRemainder ? 0 : 1;
        const remainderMax = b - 1;

        if (remainderMin > remainderMax) {
            continue;
        }

        const remainder = random(remainderMin, remainderMax);
        const a = b * quotient + remainder;
        const taskMode = mode === "mixed" ? pick(["notation", "groups"]) : mode;
        const taskInteraction = interaction === "mixed" ? pick(["input", "choice"]) : interaction;

        const task = {
            a,
            b,
            quotient,
            remainder,
            mode: taskMode,
            interaction: taskInteraction,
            emoji: pick(getEmojis(world))
        };

        if (taskInteraction === "choice") {
            task.quotientOptions = makeNumberOptions(quotient, 1, maxQuotient + 1);
            task.remainderOptions = makeNumberOptions(remainder, 0, b);
        }

        tasks.push(task);
    }

    return tasks;
}