const EMOJI_POOL_DEFAULT = [
    "🍎", "🍌", "🍇", "🍓", "🍉", "🍋",
    "🐶", "🐱", "🦊", "🐼", "🐸", "🐵",
    "🚗", "🚀", "⚽", "🏀", "🎈", "⭐",
    "🌙", "🌞", "🌈", "🍄", "🐞", "🌸"
];

const EMOJI_POOL_WORLD = {
    postman: [
        "💌", "📩", "📦", "📮", "📨", "📧", "✉️", "📬"
    ],
    racing: [
        "🏎️", "🚗", "🏁", "🔧", "⚙️", "⛽", "🏆", "🚦"
    ],
    football: [
        "⚽", "🥅", "👟", "🏆", "🎽", "⚾", "🏀", "🧤"
    ],
    animals: [
        "🐶", "🐱", "🦊", "🐼", "🐸", "🐵",
        "🐫", "🐘", "🦒", "🐒", "🦧", "🦥",
        "🍎", "🍌", "🍇", "🍓", "🥕", "🥒",
        "🌽", "🥬", "🍉", "🍋"
    ],
    space: [
        "🚀", "🛸", "🛰️", "🌍", "⭐", "👽", "🌙", "☄️"
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

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generatePattern(options = {}) {

    const { count = 5, visible = 7, minPattern = 2, maxPattern = 3, world, numeric = false } = options;

    if (numeric) {
        return generateNumericPatterns(count, visible);
    }

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

function generateNumericPatterns(count, visible) {
    const tasks = [];

    const steps = [2, 3, 5, 10, 25, 50, 100, 200];

    for (let i = 0; i < count; i++) {
        const step = pick(steps);
        const maxStart = 1000 - step * 2;
        const start = randint(1, Math.max(1, maxStart));
        const maxLen = Math.floor((1000 - start) / step);
        const len = Math.min(visible, Math.max(2, maxLen));
        const terms = [];
        for (let t = 0; t < len; t++) {
            terms.push(start + t * step);
        }
        const answer = start + len * step;

        const answerOptions = [answer];
        const seen = new Set([answer]);
        while (answerOptions.length < 4) {
            const off = (randint(1, 3) * pick([-1, 1])) * step;
            const v = answer + off;
            if (v > 0 && v <= 1000 && !seen.has(v)) {
                seen.add(v);
                answerOptions.push(v);
            }
            if (answerOptions.length >= 4) break;
            for (let v = step; v <= 1000 && answerOptions.length < 4; v += step) {
                if (!seen.has(v)) {
                    seen.add(v);
                    answerOptions.push(v);
                }
            }
        }
        shuffle(answerOptions);

        tasks.push({
            type: "pattern",
            terms,
            answer,
            options: answerOptions,
            pattern: terms
        });
    }

    return tasks;
}
