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

const PI = "π";
const MEASURE_MIXED = ["identify", "convert", "circumference", "area"];

function coeffOptions(answer, candidates) {
    const seen = new Set([answer]);
    const values = [answer];
    const push = (value) => {
        if (values.length >= 4) return;
        if (Number.isInteger(value) && value > 0 && !seen.has(value)) {
            seen.add(value);
            values.push(value);
        }
    };
    for (const candidate of candidates) push(candidate);
    for (const delta of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6]) push(answer + delta);
    let k = 7;
    while (values.length < 4) {
        push(answer + k);
        k++;
    }
    return shuffle(values);
}

function generateCircumference() {
    if (Math.random() < 0.5) {
        const r = random(2, 12);
        const correct = 2 * r;
        return {
            type: "circle",
            mode: "circumference",
            variant: "radius",
            r,
            answerLabel: `${correct}${PI} cm`,
            question: `A kör sugara ${r} cm. Mennyi a kör kerülete? K = 2 × r × π`,
            options: coeffOptions(correct, [r, 2 * r + 2, r * r, r + 2]).map(v => `${v}${PI} cm`),
            successText: `😊 Ügyes! K = 2 × ${r} × π = ${correct}π cm.`
        };
    }
    const d = random(2, 12) * 2;
    const r = d / 2;
    const labels = coeffOptions(d, [r, 2 * d, r * r, d + 2]).map(v => `${v}${PI} cm`);
    return {
        type: "circle",
        mode: "circumference",
        variant: "diameter",
        d,
        r,
        answerLabel: `${d}${PI} cm`,
        question: `A kör átmérője ${d} cm. Mennyi a kör kerülete? K = d × π`,
        options: labels,
        successText: `😊 Ügyes! K = ${d} × π = ${d}π cm.`
    };
}

function generateArea() {
    const r = random(2, 10);
    const correct = r * r;
    const labels = coeffOptions(correct, [2 * r, r, 4 * r, r + 2]).map(v => `${v}${PI} cm²`);
    return {
        type: "circle",
        mode: "area",
        variant: "radius",
        r,
        answerLabel: `${correct}${PI} cm²`,
        question: `A kör sugara ${r} cm. Mennyi a kör területe? T = r × r × π`,
        options: labels,
        successText: `😊 Ügyes! T = ${r} × ${r} × π = ${correct}π cm².`
    };
}

// A sugár és a középponti szög úgy van választva, hogy a körív hossza és a
// körcikk területe is egész együtthatós π legyen (pl. r = 12, α = 90° → 6π cm és 36π cm²).
const SECTOR_RADII = [12, 24, 36];
const SECTOR_ANGLES = [30, 45, 60, 90, 120, 180];

function generateSector(kind) {
    const r = SECTOR_RADII[Math.floor(Math.random() * SECTOR_RADII.length)];
    const angle = SECTOR_ANGLES[Math.floor(Math.random() * SECTOR_ANGLES.length)];

    if (kind === "arc" || (kind === "mixed" && Math.random() < 0.5)) {
        const coeff = r * angle / 180;
        if (Math.random() < 0.5) {
            return {
                type: "circle",
                mode: "sector",
                variant: "arc-radius",
                r,
                angle,
                answerLabel: `${coeff}${PI} cm`,
                question: `A kör sugara ${r} cm, a középponti szög ${angle}°. Mennyi a körív hossza? L = (α / 360) × 2 × r × π`,
                options: coeffOptions(coeff, [2 * r, r]).map(v => `${v}${PI} cm`),
                successText: `😊 Ügyes! L = (${angle} / 360) × 2 × ${r} × π = ${coeff}π cm.`
            };
        }
        const d = 2 * r;
        return {
            type: "circle",
            mode: "sector",
            variant: "arc-diameter",
            r,
            d,
            angle,
            answerLabel: `${coeff}${PI} cm`,
            question: `A kör átmérője ${d} cm, a középponti szög ${angle}°. Mennyi a körív hossza? L = (α / 360) × π × d`,
            options: coeffOptions(coeff, [d, r, 2 * r]).map(v => `${v}${PI} cm`),
            successText: `😊 Ügyes! L = (${angle} / 360) × π × ${d} = ${coeff}π cm.`
        };
    }

    const coeff = r * r * angle / 360;
    return {
        type: "circle",
        mode: "sector",
        variant: "sector-area",
        r,
        angle,
        answerLabel: `${coeff}${PI} cm²`,
        question: `A kör sugara ${r} cm, a középponti szög ${angle}°. Mennyi a körcikk területe? T = (α / 360) × r × r × π`,
        options: coeffOptions(coeff, [r * r, (r * r) / 2, 2 * r]).map(v => `${v}${PI} cm²`),
        successText: `😊 Ügyes! T = (${angle} / 360) × ${r} × ${r} × π = ${coeff}π cm².`
    };
}

function pickMode(mode) {
    if (mode === "mixed") return Math.random() < 0.5 ? "identify" : "convert";
    if (mode === "measure-mixed") return MEASURE_MIXED[Math.floor(Math.random() * MEASURE_MIXED.length)];
    return mode;
}

function buildMode(m) {
    if (m === "convert") return generateConvert();
    if (m === "circumference") return generateCircumference();
    if (m === "area") return generateArea();
    if (m === "sector") return generateSector("mixed");
    if (m === "sector-arc") return generateSector("arc");
    if (m === "sector-area") return generateSector("area");
    return generateTask();
}

export function generateCircle(opts = {}) {
    const { count = 6, mode = "identify" } = opts;
    const tasks = [];
    let lastSignature = null;
    for (let i = 0; i < count; i++) {
        let task = null;
        for (let attempt = 0; attempt < 6; attempt++) {
            task = buildMode(pickMode(mode));
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
