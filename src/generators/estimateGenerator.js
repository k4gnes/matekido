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

function roundTo(n, step) {
    return Math.round(n / step) * step;
}

function estimateStep(rounding) {
    return rounding > 0 ? rounding : 10;
}

function estimateRounder(rounding) {
    const step = estimateStep(rounding);
    return n => roundTo(n, step);
}

function generateEstimateOptions(estimate, max, rounding) {
    const options = [estimate];
    const seen = new Set([estimate]);
    const wrongCandidates = [];

    const offsets = [rounding, -rounding, 2 * rounding, -2 * rounding, 3 * rounding, -3 * rounding,
        rounding * 1.5, -rounding * 1.5, rounding * 2.5, -rounding * 2.5];

    for (const d of offsets) {
        const v = estimate + d;
        if (v > 0 && v <= max + rounding * 3 && !seen.has(v)) {
            wrongCandidates.push(v);
        }
    }

    shuffle(wrongCandidates);

    for (const v of wrongCandidates) {
        if (options.length >= 4) break;
        if (!seen.has(v)) {
            seen.add(v);
            options.push(v);
        }
    }

    for (let v = rounding; v <= max + rounding * 3 && options.length < 4; v += rounding) {
        if (!seen.has(v)) {
            seen.add(v);
            options.push(v);
        }
    }

    return shuffle(options);
}

function generateAdditionEstimate(count, max, rounding) {
    const r = estimateRounder(rounding);
    const min = estimateStep(rounding) + 1;
    const tasks = [];
    for (let i = 0; i < count; i++) {
        const a = randint(min, max - min);
        const b = randint(min, max - a);
        const estimate = r(a) + r(b);
        tasks.push({
            type: "estimate",
            expression: `${a} + ${b} ≈ ?`,
            hint: `Gondold meg: ${r(a)} + ${r(b)} = ?`,
            answer: estimate,
            options: generateEstimateOptions(estimate, max, rounding)
        });
    }
    return tasks;
}

function generateSubtractionEstimate(count, max, rounding) {
    const r = estimateRounder(rounding);
    const min = estimateStep(rounding) + 1;
    const tasks = [];
    for (let i = 0; i < count; i++) {
        const a = randint(min * 2 - 1, max);
        let b;
        let estimate;
        do {
            b = randint(min, a - min);
            estimate = r(a) - r(b);
        } while (estimate <= 0);
        tasks.push({
            type: "estimate",
            expression: `${a} − ${b} ≈ ?`,
            hint: `Gondold meg: ${r(a)} − ${r(b)} = ?`,
            answer: estimate,
            options: generateEstimateOptions(estimate, max, rounding)
        });
    }
    return tasks;
}

function generateMixedEstimate(count, max, rounding) {
    const additions = Math.floor(count / 2);
    const tasks = generateAdditionEstimate(additions, max, rounding);
    if (count - additions > 0) {
        tasks.push(...generateSubtractionEstimate(count - additions, max, rounding));
    }
    return shuffle(tasks);
}

export function generateEstimate(options = {}) {
    const { count = 6, max = 50, op = "mixed", rounding = 10 } = options;

    switch (op) {
        case "addition":
            return generateAdditionEstimate(count, max, rounding);
        case "subtraction":
            return generateSubtractionEstimate(count, max, rounding);
        case "mixed":
        default:
            return generateMixedEstimate(count, max, rounding);
    }
}
