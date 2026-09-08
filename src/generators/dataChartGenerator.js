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

const EMOJI_SETS = [
    ["🍎", "🍌", "🍇"],
    ["🐱", "🐶", "🐰"],
    ["⚽", "🏀", "🎾"],
    ["🌷", "🌸", "🌻"]
];

function buildChart() {
    const emojis = pick(EMOJI_SETS);
    const values = shuffle([1, 2, 3, 4, 5, 6]).slice(0, 3);
    return emojis.map((emoji, i) => ({ emoji, value: values[i] }));
}

function buildTask() {
    const chart = buildChart();
    const mode = pick(["top", "least", "count", "compare"]);

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
        const options = [value];
        let cand = 1;
        while (options.length < 3 && cand <= 6) {
            const direction = Math.random() < 0.5 ? -1 : 1;
            const n = value + direction * cand;
            if (n >= 1 && n <= 6 && !options.includes(n)) {
                options.push(n);
            }
            cand++;
        }
        for (let n = 1; n <= 6 && options.length < 3; n++) {
            if (!options.includes(n)) options.push(n);
        }
        shuffle(options);
        return {
            type: "data-chart",
            mode,
            chart,
            question: `Hány darab van ebből: ${target.emoji}?`,
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
    const { count = 5 } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        tasks.push(buildTask());
    }
    return tasks;
}