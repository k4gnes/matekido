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

function numberOptions(answer, candidates) {
    const seen = new Set([answer]);
    const values = [answer];
    for (const value of candidates) {
        if (values.length >= 4) break;
        if (Number.isInteger(value) && value > 0 && !seen.has(value)) {
            seen.add(value);
            values.push(value);
        }
    }
    const deltas = [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 10, -10];
    for (const delta of deltas) {
        if (values.length >= 4) break;
        const value = answer + delta;
        if (value > 0 && !seen.has(value)) {
            seen.add(value);
            values.push(value);
        }
    }
    return shuffle(values);
}

function generateTask() {
    const variant = VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
    const correctLabel = LABELS[variant];
    const otherLabels = VARIANTS
        .filter(v => v !== variant)
        .map(v => LABELS[v]);
    const options = shuffle([correctLabel, ...otherLabels]);

    return {
        type: "circle",
        mode: "identify",
        variant,
        question: QUESTIONS[variant],
        answer: options.indexOf(correctLabel),
        options,
        correctLabel
    };
}

function generateConvert() {
    if (Math.random() < 0.5) {
        const r = random(2, 20);
        const answer = r * 2;
        return {
            type: "circle",
            mode: "convert",
            variant: "radius-to-diameter",
            r,
            answer,
            question: `A kör sugara ${r} cm. Hány cm az átmérő?`,
            options: numberOptions(answer, [r, answer + 2, answer - 2, answer + r, r * r]),
            successText: `😊 Ügyes! Az átmérő a sugár kétszerese: ${r} × 2 = ${answer} cm.`
        };
    }
    const r = random(2, 20);
    const d = r * 2;
    return {
        type: "circle",
        mode: "convert",
        variant: "diameter-to-radius",
        d,
        answer: r,
        question: `A kör átmérője ${d} cm. Hány cm a sugár?`,
        options: numberOptions(r, [d, r + 2, r - 2, r * 2 * 2, r + d]),
        successText: `😊 Ügyes! A sugár az átmérő fele: ${d} ÷ 2 = ${r} cm.`
    };
}

export function generateCircle(opts = {}) {
    const { count = 6, mode = "identify" } = opts;
    const tasks = [];
    let lastSignature = null;
    for (let i = 0; i < count; i++) {
        let task = null;
        for (let attempt = 0; attempt < 6; attempt++) {
            const m = mode === "mixed"
                ? (Math.random() < 0.5 ? "identify" : "convert")
                : mode;
            task = m === "convert" ? generateConvert() : generateTask();
            const signature = `${task.mode}:${task.variant}`;
            if (signature !== lastSignature) {
                lastSignature = signature;
                break;
            }
        }
        tasks.push(task);
    }
    return tasks;
}
