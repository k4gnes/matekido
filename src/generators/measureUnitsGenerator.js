const CONVERSIONS = [
    { unit: "m", target: "dm", factor: 10, max: 10 },
    { unit: "m", target: "cm", factor: 100, max: 3 },
    { unit: "dm", target: "cm", factor: 10, max: 10 }
];

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function buildNumberOptions(correct, value) {
    const candidates = [];
    const push = v => {
        if (v !== correct && v > 0) candidates.push(v);
    };
    push(correct * 10);
    push(correct / 10);
    push(correct * 100);
    push(value);
    push(correct + 10);
    push(correct - 10);

    const pool = shuffle([...new Set(candidates)]).slice(0, 3);

    return shuffle([correct, ...pool]);
}

export function generateMeasureUnits(options = {}) {
    const { count = 5 } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {
        const { unit, target, factor, max } = CONVERSIONS[Math.floor(Math.random() * CONVERSIONS.length)];
        const value = rand(1, max);
        const correct = value * factor;

        const optionsArr = buildNumberOptions(correct, value);

        tasks.push({
            type: "measure-units",
            unit,
            target,
            value,
            answer: correct,
            question: `Hány ${target} a ${value} ${unit}?`,
            options: optionsArr
        });
    }

    return tasks;
}