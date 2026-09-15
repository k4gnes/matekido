function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const VARIANTS = ["center", "radius", "diameter"];

const LABELS = {
    center: "Középpont",
    radius: "Sugár",
    diameter: "Átmérő"
};

const QUESTIONS = {
    center: "Mit jelöl a piros pont?",
    radius: "Mit jelöl a piros szakasz?",
    diameter: "Mit jelöl a piros szakasz?"
};

function generateTask() {
    const variant = VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
    const correctLabel = LABELS[variant];
    const otherLabels = VARIANTS
        .filter(v => v !== variant)
        .map(v => LABELS[v]);
    const options = shuffle([correctLabel, ...otherLabels]);

    return {
        type: "circle",
        variant,
        question: QUESTIONS[variant],
        answer: options.indexOf(correctLabel),
        options,
        correctLabel
    };
}

export function generateCircle(opts = {}) {
    const { count = 6 } = opts;
    const tasks = [];
    for (let i = 0; i < count; i++) {
        tasks.push(generateTask());
    }
    return tasks;
}