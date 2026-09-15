const CONVERSIONS = {
    length: [
        { unit: "m", target: "dm", factor: 10, max: 10 },
        { unit: "m", target: "cm", factor: 100, max: 3 },
        { unit: "dm", target: "cm", factor: 10, max: 10 }
    ],
    lengthAdvanced: [
        { unit: "km", target: "m", factor: 1000, max: 5 },
        { unit: "m", target: "mm", factor: 1000, max: 5 }
    ],
    weight: [
        { unit: "kg", target: "dkg", factor: 100, max: 10 },
        { unit: "kg", target: "g", factor: 1000, max: 5 },
        { unit: "dkg", target: "g", factor: 10, max: 10 }
    ],
    volume: [
        { unit: "l", target: "dl", factor: 10, max: 10 },
        { unit: "l", target: "cl", factor: 100, max: 5 },
        { unit: "dl", target: "cl", factor: 10, max: 10 }
    ]
};

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

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
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

    const pool = shuffle([...new Set(candidates.map(c => Math.round(c)))]).slice(0, 3);

    return shuffle([correct, ...pool]);
}

export function generateMeasureUnits(options = {}) {
    const { count = 5, kind = "length", advanced = false } = options;

    const kinds = kind === "mixed"
        ? ["length", "weight", "volume"]
        : [kind];

    const tasks = [];

    for (let i = 0; i < count; i++) {
        const k = pick(kinds);
        const pool = (k === "length" && advanced)
            ? [...CONVERSIONS[k], ...CONVERSIONS.lengthAdvanced]
            : CONVERSIONS[k];
        const conv = pick(pool);
        const value = rand(1, conv.max);
        const correct = value * conv.factor;

        const optionsArr = buildNumberOptions(correct, value);

        tasks.push({
            type: "measure-units",
            unit: conv.unit,
            target: conv.target,
            value,
            answer: correct,
            kind: k,
            advanced,
            question: `Hány ${conv.target} a ${value} ${conv.unit}?`,
            options: optionsArr
        });
    }

    return tasks;
}