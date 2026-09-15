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

const EMOJI_SETS_DEFAULT = [
    ["🍎", "🍌", "🍇"],
    ["🐱", "🐶", "🐰"],
    ["⚽", "🏀", "🎾"],
    ["🌷", "🌸", "🌻"]
];

const EMOJI_SETS_WORLD = {
    postman: [
        ["💌", "📩", "📦"],
        ["✉️", "📨", "📮"],
        ["📮", "📬", "📭"]
    ],
    racing: [
        ["🏎️", "🏁", "🔧"],
        ["🚗", "🏎️", "⛽"],
        ["🏆", "🏁", "⚙️"]
    ],
    cooking: [
        ["🥕", "🍅", "🍎"],
        ["🥚", "🍳", "🥖"],
        ["🍓", "🍌", "🍇"]
    ],
    football: [
        ["⚽", "🏀", "🎾"],
        ["🥅", "⚽", "👟"],
        ["🏆", "⚽", "🎽"]
    ],
    animals: [
        ["🦁", "🐯", "🐻"],
        ["🐱", "🐶", "🐰"],
        ["🐴", "🦓", "🐘"]
    ],
    space: [
        ["🚀", "🛰️", "⭐"],
        ["🛸", "👽", "🌍"],
        ["🌙", "⭐", "🪐"]
    ]
};

function buildChart(world, max = 6) {
    const sets = EMOJI_SETS_WORLD[world] ?? EMOJI_SETS_DEFAULT;
    const emojis = pick(sets);
    const pool = [];
    for (let i = 1; i <= max; i++) pool.push(i);
    const values = shuffle(pool).slice(0, 3);
    return emojis.map((emoji, i) => ({ emoji, value: values[i] }));
}

function buildNumericOptions(value, lo = 1, hi = 10) {
    const options = [value];
    let cand = 1;
    while (options.length < 3 && cand <= 10) {
        const direction = Math.random() < 0.5 ? -1 : 1;
        const n = value + direction * cand;
        if (n >= lo && n <= hi && !options.includes(n)) {
            options.push(n);
        }
        cand++;
    }
    for (let n = lo; n <= hi && options.length < 3; n++) {
        if (!options.includes(n)) options.push(n);
    }
    shuffle(options);
    return options;
}

function buildTask(world, max = 6, modes = ["top", "least", "count", "compare"]) {
    const chart = buildChart(world, max);
    const mode = pick(modes);

    if (mode === "top") {
        const target = chart.reduce((a, b) => a.value > b.value ? a : b);
        return {
            type: "data-chart",
            mode,
            chart,
            question: "Melyikből van a legtöbb?",
            options: chart.map(c => c.emoji),
            answer: chart.indexOf(target)
        };
    }

    if (mode === "least") {
        const target = chart.reduce((a, b) => a.value < b.value ? a : b);
        return {
            type: "data-chart",
            mode,
            chart,
            question: "Melyikből van a legkevesebb?",
            options: chart.map(c => c.emoji),
            answer: chart.indexOf(target)
        };
    }

    if (mode === "count") {
        const target = pick(chart);
        const value = target.value;
        const options = buildNumericOptions(value, 1, max);
        return {
            type: "data-chart",
            mode,
            chart,
            question: `Hány darab van ebből: ${target.emoji}?`,
            options,
            answer: options.indexOf(value)
        };
    }

    if (mode === "sum") {
        const value = chart.reduce((s, c) => s + c.value, 0);
        const options = buildNumericOptions(value, 1, max * 3);
        return {
            type: "data-chart",
            mode,
            chart,
            question: "Hány darab van összesen?",
            options,
            answer: options.indexOf(value)
        };
    }

    if (mode === "sum2") {
        const two = shuffle([...chart]).slice(0, 2);
        const value = two.reduce((s, c) => s + c.value, 0);
        const options = buildNumericOptions(value, 1, max * 2);
        return {
            type: "data-chart",
            mode,
            chart,
            question: `Hány darab van ${two[0].emoji} és ${two[1].emoji} összesen?`,
            options,
            answer: options.indexOf(value)
        };
    }

    if (mode === "diff") {
        const two = shuffle([...chart]).slice(0, 2);
        const [a, b] = two;
        const [bigger, smaller] = a.value >= b.value ? [a, b] : [b, a];
        const value = bigger.value - smaller.value;
        const options = value === 0 ? [0, 1] : buildNumericOptions(value, 1, max - 1);
        const q = `Mennyivel van több ${bigger.emoji}, mint ${smaller.emoji}?`;
        return {
            type: "data-chart",
            mode,
            chart,
            question: q,
            options,
            answer: options.indexOf(value)
        };
    }

    const two = shuffle([...chart]).slice(0, 2);
    const [a, b] = two;
    const winner = a.value > b.value ? a : b;
    const options = shuffle([a.emoji, b.emoji]);
    return {
        type: "data-chart",
        mode,
        chart,
        question: `Melyikből van több: ${a.emoji} vagy ${b.emoji}?`,
        options,
        answer: options.indexOf(winner.emoji)
    };
}

export function generateDataChart(options = {}) {
    const { count = 5, max = 6, modes } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        tasks.push(buildTask(options.world, max, modes));
    }
    return tasks;
}