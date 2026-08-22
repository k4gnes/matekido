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

function generateEstimateOptions(estimate, max) {
    const options = [estimate];
    const seen = new Set([estimate]);
    const wrongCandidates = [];

    const offsets = [10, -10, 20, -20, 30, -30, 15, -15, 25, -25];

    for (const d of offsets) {
        const v = estimate + d;
        if (v > 0 && v <= max + 30 && !seen.has(v)) {
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

    for (let v = 10; v <= max + 30 && options.length < 4; v += 10) {
        if (!seen.has(v)) {
            seen.add(v);
            options.push(v);
        }
    }

    return shuffle(options);
}

function generateAdditionEstimate(count, max) {
    const tasks = [];
    for (let i = 0; i < count; i++) {
        const a = randint(11, max - 11);
        const b = randint(11, max - a);
        const estimate = round10(a) + round10(b);
        tasks.push({
            type: "estimate",
            expression: `${a} + ${b} ≈ ?`,
            hint: `Gondold meg: ${round10(a)} + ${round10(b)} = ?`,
            answer: estimate,
            options: generateEstimateOptions(estimate, max)
        });
    }
    return tasks;
}

function generateSubtractionEstimate(count, max) {
    const tasks = [];
    for (let i = 0; i < count; i++) {
        const a = randint(15, max);
        let b;
        let estimate;
        do {
            b = randint(6, a - 5);
            estimate = round10(a) - round10(b);
        } while (estimate <= 0);
        tasks.push({
            type: "estimate",
            expression: `${a} − ${b} ≈ ?`,
            hint: `Gondold meg: ${round10(a)} − ${round10(b)} = ?`,
            answer: estimate,
            options: generateEstimateOptions(estimate, max)
        });
    }
    return tasks;
}

function generateMixedEstimate(count, max) {
    const tasks = [];
    for (let i = 0; i < count; i++) {
        if (Math.random() < 0.5) {
            const a = randint(11, max - 11);
            const b = randint(11, max - a);
            const estimate = round10(a) + round10(b);
            tasks.push({
                type: "estimate",
                expression: `${a} + ${b} ≈ ?`,
                hint: `Gondold meg: ${round10(a)} + ${round10(b)} = ?`,
                answer: estimate,
                options: generateEstimateOptions(estimate, max)
            });
        } else {
            const a = randint(15, max);
            let b;
            let estimate;
            do {
                b = randint(6, a - 5);
                estimate = round10(a) - round10(b);
            } while (estimate <= 0);
            tasks.push({
                type: "estimate",
                expression: `${a} − ${b} ≈ ?`,
                hint: `Gondold meg: ${round10(a)} − ${round10(b)} = ?`,
                answer: estimate,
                options: generateEstimateOptions(estimate, max)
            });
        }
    }
    return tasks;
}

export function generateEstimate(options = {}) {
    const { count = 6, max = 50, op = "mixed" } = options;

    switch (op) {
        case "addition":
            return generateAdditionEstimate(count, max);
        case "subtraction":
            return generateSubtractionEstimate(count, max);
        case "mixed":
        default:
            return generateMixedEstimate(count, max);
    }
}
