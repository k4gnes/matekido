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

function round10(n) {
    return Math.round(n / 10) * 10;
}

function round100(n) {
    return Math.round(n / 100) * 100;
}

function generateEstimateOptions(estimate, max, rounding) {
    const options = [estimate];
    const seen = new Set([estimate]);
    const wrongCandidates = [];

    const offsets = rounding === 100
        ? [100, -100, 200, -200, 300, -300, 150, -150, 250, -250]
        : [10, -10, 20, -20, 30, -30, 15, -15, 25, -25];

    for (const d of offsets) {
        const v = estimate + d;
        if (v > 0 && v <= max + 300 && !seen.has(v)) {
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

    const step = rounding === 100 ? 100 : 10;
    for (let v = step; v <= max + 300 && options.length < 4; v += step) {
        if (!seen.has(v)) {
            seen.add(v);
            options.push(v);
        }
    }

    return shuffle(options);
}

function generateAdditionEstimate(count, max, rounding) {
    const r = rounding === 100 ? round100 : round10;
    const tasks = [];
    for (let i = 0; i < count; i++) {
        const a = randint(rounding === 100 ? 101 : 11, max - (rounding === 100 ? 101 : 11));
        const b = randint(rounding === 100 ? 101 : 11, max - a);
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
    const r = rounding === 100 ? round100 : round10;
    const tasks = [];
    for (let i = 0; i < count; i++) {
        const a = randint(rounding === 100 ? 201 : 15, max);
        let b;
        let estimate;
        do {
            b = randint(rounding === 100 ? 101 : 6, a - (rounding === 100 ? 101 : 5));
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
    const r = rounding === 100 ? round100 : round10;
    const tasks = [];
    for (let i = 0; i < count; i++) {
        if (Math.random() < 0.5) {
            const a = randint(rounding === 100 ? 101 : 11, max - (rounding === 100 ? 101 : 11));
            const b = randint(rounding === 100 ? 101 : 11, max - a);
            const estimate = r(a) + r(b);
            tasks.push({
                type: "estimate",
                expression: `${a} + ${b} ≈ ?`,
                hint: `Gondold meg: ${r(a)} + ${r(b)} = ?`,
                answer: estimate,
                options: generateEstimateOptions(estimate, max, rounding)
            });
        } else {
            const a = randint(rounding === 100 ? 201 : 15, max);
            let b;
            let estimate;
            do {
                b = randint(rounding === 100 ? 101 : 6, a - (rounding === 100 ? 101 : 5));
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
    }
    return tasks;
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
