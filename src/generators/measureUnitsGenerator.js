const CONVERSIONS = {
    length: [
        { unit: "m", target: "dm", factor: 10, max: 10 },
        { unit: "m", target: "cm", factor: 100, max: 3 },
        { unit: "dm", target: "cm", factor: 10, max: 10 }
    ],
    lengthAdvanced: [
        { unit: "km", target: "m", factor: 1000, max: 5 },
        { unit: "m", target: "mm", factor: 1000, max: 5 },
        { unit: "cm", target: "mm", factor: 10, max: 100 },
        { unit: "km", target: "m", factor: 1000, max: 10 }
    ],
    weight: [
        { unit: "kg", target: "dkg", factor: 100, max: 10 },
        { unit: "kg", target: "g", factor: 1000, max: 5 },
        { unit: "dkg", target: "g", factor: 10, max: 10 }
    ],
    weightReverse: [
        { unit: "g", target: "kg", factor: 1000, max: 5, reverse: true },
        { unit: "g", target: "dkg", factor: 10, max: 100, reverse: true },
        { unit: "dkg", target: "kg", factor: 100, max: 10, reverse: true },
        { unit: "kg", target: "t", factor: 1000, max: 5, reverse: true }
    ],
    volume: [
        { unit: "l", target: "dl", factor: 10, max: 10 },
        { unit: "l", target: "cl", factor: 100, max: 5 },
        { unit: "dl", target: "cl", factor: 10, max: 10 }
    ],
    volumeAdvanced: [
        { unit: "l", target: "ml", factor: 1000, max: 5 },
        { unit: "dl", target: "ml", factor: 100, max: 10 },
        { unit: "cl", target: "ml", factor: 10, max: 100 }
    ],
    volumeReverse: [
        { unit: "ml", target: "l", factor: 1000, max: 5, reverse: true },
        { unit: "ml", target: "dl", factor: 100, max: 10, reverse: true },
        { unit: "ml", target: "cl", factor: 10, max: 100, reverse: true },
        { unit: "cl", target: "dl", factor: 10, max: 10, reverse: true },
        { unit: "dl", target: "l", factor: 10, max: 10, reverse: true }
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
        if (v > 0) candidates.push(v);
    };
    push(correct * 10);
    push(correct / 10);
    push(correct * 100);
    push(value);
    push(correct + 10);
    push(correct - 10);

    const pool = shuffle([...new Set(candidates.map(c => Math.round(c)))]
        .filter(c => c > 0 && c !== correct)).slice(0, 3);

    return shuffle([correct, ...pool]);
}

export function generateMeasureUnits(options = {}) {
    const { count = 5, kind = "length", advanced = false, reverse = false } = options;

    const kinds = kind === "mixed"
        ? ["length", "weight", "volume"]
        : [kind];

    const tasks = [];

    for (let i = 0; i < count; i++) {
        const k = pick(kinds);
        let pool = (advanced && CONVERSIONS[k + "Advanced"])
            ? [...CONVERSIONS[k], ...CONVERSIONS[k + "Advanced"]]
            : CONVERSIONS[k];
        if (reverse && CONVERSIONS[k + "Reverse"]) {
            pool = [...pool, ...CONVERSIONS[k + "Reverse"]];
        }
        const conv = pick(pool);
        const raw = rand(1, conv.max);
        const value = conv.reverse ? raw * conv.factor : raw;
        const correct = conv.reverse ? value / conv.factor : value * conv.factor;

        const optionsArr = buildNumberOptions(correct, value);

        tasks.push({
            type: "measure-units",
            unit: conv.unit,
            target: conv.target,
            value,
            answer: correct,
            kind: k,
            advanced,
            reverse: conv.reverse === true,
            question: `Hány ${conv.target} a ${value} ${conv.unit}?`,
            options: optionsArr
        });
    }

    return tasks;
}