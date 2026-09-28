import { UNIT_OBJECTS } from "../data/unitObjects.js";

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

function conversionsFrom(pool, base) {
    return pool.filter(c => c.unit === base);
}

function fitsObject(conv, amount) {
    if (conv.reverse && amount % conv.factor !== 0) return false;
    const answer = conv.reverse ? amount / conv.factor : amount * conv.factor;
    return Number.isInteger(answer) && answer >= 1 && answer <= 9999;
}

function validAmounts(conv, object) {
    const amounts = [];
    const step = conv.reverse ? conv.factor : 1;
    const start = conv.reverse
        ? Math.ceil(object.min / conv.factor) * conv.factor
        : object.min;

    for (let amount = start; amount <= object.max; amount += step) {
        if (fitsObject(conv, amount)) amounts.push(amount);
    }

    return amounts;
}

function objectVariants(object, pool) {
    const variants = [];
    for (const conv of conversionsFrom(pool, object.base)) {
        for (const amount of validAmounts(conv, object)) {
            variants.push({ conv, amount });
        }
    }
    return variants;
}

export function generateMeasureUnits(options = {}) {
    const { count = 5, kind = "length", advanced = false, reverse = false, context = false, interaction = "choice" } = options;

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

        const objectVariantsByObject = context
            ? UNIT_OBJECTS[k].map(object => ({ object, variants: objectVariants(object, pool) }))
                .filter(entry => entry.variants.length > 0)
            : [];
        const entry = objectVariantsByObject.length ? pick(objectVariantsByObject) : null;

        const variant = entry ? pick(entry.variants) : null;
        const conv = variant ? variant.conv : pick(pool);
        const value = variant
            ? variant.amount
            : (conv.reverse ? rand(1, conv.max) * conv.factor : rand(1, conv.max));
        const correct = conv.reverse ? value / conv.factor : value * conv.factor;
        const mode = interaction === "mixed" ? pick(["choice", "input"]) : interaction;

        const task = {
            type: "measure-units",
            unit: conv.unit,
            target: conv.target,
            value,
            answer: correct,
            kind: k,
            advanced,
            reverse: conv.reverse === true,
            interaction: mode,
            question: `Hány ${conv.target} a ${value} ${conv.unit}?`
        };

        if (mode === "choice") {
            task.options = buildNumberOptions(correct, value);
        }

        if (entry) {
            const { object } = entry;
            task.context = `${object.emoji} ${object.phrase} ${variant.amount} ${object.base}.`;
            task.question = `Hány ${conv.target}?`;
        }

        tasks.push(task);
    }

    return tasks;
}