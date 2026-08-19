const EMOJI_POOL_DEFAULT = [
    "🍎", "🍌", "🍇", "🍓", "🍉", "🍋",
    "🐶", "🐱", "🦊", "🐼", "🐸", "🐵",
    "🚗", "🚀", "⚽", "🏀", "🎈", "⭐",
    "🌙", "🌞", "🌈", "🍄", "🐞", "🌸"
];

const EMOJI_POOL_WORLD = {
    animals: [
        "🐶", "🐱", "🦊", "🐼", "🐸", "🐵",
        "🐫", "🐘", "🦒", "🐒", "🦧", "🦥",
        "🍎", "🍌", "🍇", "🍓", "🥕", "🥒",
        "🌽", "🥬", "🍉", "🍋"
    ],
    cooking: [
        "🍳", "🥘", "🍖", "🍗", "🍕", "🌮",
        "🍎", "🍌", "🥕", "🥗", "🍲", "🥪",
        "🍇", "🍓", "🍉", "🍋", "🍔", "🍣"
    ],
};

function getPool(world) {
    return EMOJI_POOL_WORLD[world] || EMOJI_POOL_DEFAULT;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function generatePattern(options = {}) {

    const { count = 5, visible = 7, minPattern = 2, maxPattern = 3, world } = options;

    const pool = getPool(world);
    const tasks = [];

    for (let i = 0; i < count; i++) {

        const shuffled = shuffle([...pool]);

        const baseLen = minPattern + Math.floor(Math.random() * (maxPattern - minPattern + 1));
        const base = shuffled.slice(0, baseLen);

        let pattern = [...base];
        if (Math.random() < 0.6) {
            const idx = Math.floor(Math.random() * baseLen);
            pattern = [...base.slice(0, idx + 1), ...base.slice(idx)];
        }

        const shown = Math.max(visible, pattern.length + 2);

        const terms = [];
        for (let t = 0; t < shown; t++) {
            terms.push(pattern[t % pattern.length]);
        }

        const answer = pattern[shown % pattern.length];

        const answerOptions = [answer];
        for (const e of pool) {
            if (answerOptions.length >= 4) break;
            if (!answerOptions.includes(e)) answerOptions.push(e);
        }
        shuffle(answerOptions);

        tasks.push({
            type: "pattern",
            terms,
            answer,
            options: answerOptions,
            pattern
        });
    }

    return tasks;
}
