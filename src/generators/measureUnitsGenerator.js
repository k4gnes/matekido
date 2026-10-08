import { UNIT_OBJECTS, UNIT_OBJECTS_EXTENDED } from "../data/unitObjects.js?v=1";

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
    lengthReverse: [
        { unit: "mm", target: "cm", factor: 10, max: 100, reverse: true },
        { unit: "cm", target: "dm", factor: 10, max: 100, reverse: true },
        { unit: "m", target: "km", factor: 1000, max: 10, reverse: true }
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

const EXTENDED_CONVERSIONS = {
    weight: [
        { unit: "t", target: "kg", factor: 1000, max: 9 }
    ],
    volume: [
        { unit: "hl", target: "l", factor: 100, max: 90 },
        { unit: "hl", target: "dl", factor: 1000, max: 9 }
    ]
};

const EXTENDED_CONVERSIONS_REVERSE = {
    length: [
        { unit: "cm", target: "m", factor: 100, max: 50, reverse: true }
    ],
    volume: [
        { unit: "l", target: "hl", factor: 100, max: 10, reverse: true },
        { unit: "dl", target: "hl", factor: 1000, max: 10, reverse: true }
    ]
};

const UNIT_FAMILY = {
    length: ["km", "m", "dm", "cm", "mm"],
    weight: ["t", "kg", "dkg", "g"],
    volume: ["l", "dl", "cl", "ml"]
};

const EXTENDED_FAMILY = {
    volume: ["hl"]
};

const UNIT_MEASURE_WORD = {
    length: "hossza",
    weight: "tömege",
    volume: "űrtartalma"
};

function roundNice(value) {
    if (value >= 1000) return Math.round(value / 100) * 100;
    if (value >= 100) return Math.round(value / 10) * 10;
    return value;
}

function buildUnitChoiceTask(k, object, amount, allowed = null, extended = false) {
    let family = [...UNIT_FAMILY[k], ...(extended && EXTENDED_FAMILY[k] ? EXTENDED_FAMILY[k] : [])]
        .filter(u => u !== object.base);
    if (allowed) {
        const filtered = family.filter(u => allowed.has(u));
        if (filtered.length) family = filtered;
    }
    const unitOptions = shuffle([object.base, ...shuffle(family).slice(0, 3)]);
    const nice = roundNice(amount);

    return {
        type: "measure-units",
        kind: k,
        value: nice,
        unit: object.base,
        answer: object.base,
        unitOptions,
        ...(allowed ? { allowedUnits: [...allowed] } : {}),
        extended,
        interaction: "unit",
        question: "Melyik egység illik ide?",
        context: `${object.emoji} ${object.phrase} ${UNIT_MEASURE_WORD[k]} ${nice} ____`
    };
}

const UNIT_LADDER = {
    length: { m: 1000, dm: 100, cm: 10 },
    weight: { kg: 1000, dkg: 10, g: 1 },
    volume: { l: 1000, dl: 100, cl: 10, ml: 1 }
};

const UNIT_LADDER_ADVANCED = {
    length: { km: 1000000, mm: 1 },
    weight: { t: 1000000 },
    volume: {}
};

const EXTENDED_LADDER = {
    volume: { hl: 100000 }
};

const COMPARE_QUESTION = {
    length: "Melyik a hosszabb?",
    weight: "Melyik a nehezebb?",
    volume: "Melyikben van több?"
};

function buildCompareTask(k, advanced, allowed = null, extended = false) {
    const ladder = {
        ...UNIT_LADDER[k],
        ...(advanced && UNIT_LADDER_ADVANCED[k] ? UNIT_LADDER_ADVANCED[k] : {}),
        ...(extended && EXTENDED_LADDER[k] ? EXTENDED_LADDER[k] : {})
    };
    let unitNames = Object.keys(ladder);
    if (allowed) {
        const filtered = unitNames.filter(u => allowed.has(u));
        if (filtered.length >= 2) unitNames = filtered;
    }
    const leftUnit = pick(unitNames);
    let rightUnit = pick(unitNames);
    while (rightUnit === leftUnit) {
        rightUnit = pick(unitNames);
    }

    const step = Math.max(ladder[leftUnit], ladder[rightUnit]);
    const span = step >= 1000000 ? 2 : 9;
    const relation = pick(["<", "<", ">", ">", "="]);
    const gap = relation === "=" ? 0 : rand(1, Math.max(1, span - 1));
    const multiplier = relation === "="
        ? rand(1, span)
        : relation === "<"
            ? rand(1, Math.max(1, span - gap))
            : rand(gap + 1, span);

    const leftBase = multiplier * step;
    const rightBase = (multiplier + (relation === "<" ? gap : -gap)) * step;

    return {
        type: "measure-units",
        kind: k,
        advanced,
        extended,
        interaction: "compare",
        leftValue: leftBase / ladder[leftUnit],
        leftUnit,
        rightValue: rightBase / ladder[rightUnit],
        rightUnit,
        operator: relation,
        answer: relation,
        question: COMPARE_QUESTION[k]
    };
}

function pickWrongAnswer(correct) {
    const candidates = [correct * 10, correct / 10, correct * 100, correct / 100]
        .map(v => Math.round(v))
        .filter(v => v > 0 && v !== correct);
    const unique = [...new Set(candidates)];
    return unique.length ? pick(unique) : correct + 10;
}

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

function pickPreferred(entries, reverse) {
    if (!entries.length) return null;
    const wants = v => (v.conv.reverse === true) === reverse;

    if (reverse) {
        const backwards = entries.filter(entry => entry.variants.some(wants));
        if (backwards.length) {
            const entry = pick(backwards);
            const variants = entry.variants.filter(wants);
            return { entry, variants: variants.length ? variants : entry.variants };
        }
    }

    const entry = pick(entries);
    const variants = entry.variants.filter(wants);
    return { entry, variants: variants.length ? variants : entry.variants };
}

function unitObjects(k, extended) {
    return extended && UNIT_OBJECTS_EXTENDED[k]
        ? [...UNIT_OBJECTS[k], ...UNIT_OBJECTS_EXTENDED[k]]
        : UNIT_OBJECTS[k];
}

export function generateMeasureUnits(options = {}) {
    const { count = 5, kind = "length", advanced = false, reverse = false, context = false, interaction = "choice", units = null, extended = false } = options;
    const allowed = Array.isArray(units) && units.length ? new Set(units) : null;

    const kinds = kind === "mixed"
        ? ["length", "weight", "volume"]
        : [kind];

    const tasks = [];

    for (let i = 0; i < count; i++) {
        const k = pick(kinds);
        const mode = interaction === "mixed" ? pick(["choice", "input", "tf", "compare"]) : interaction;

        if (mode === "unit") {
            let objects = unitObjects(k, extended);
            if (allowed) {
                const filtered = objects.filter(o => allowed.has(o.base));
                if (filtered.length) objects = filtered;
            }
            const object = pick(objects);
            tasks.push(buildUnitChoiceTask(k, object, rand(object.min, object.max), allowed, extended));
            continue;
        }

        if (mode === "compare") {
            tasks.push(buildCompareTask(k, advanced, allowed, extended));
            continue;
        }

        let pool = (advanced && CONVERSIONS[k + "Advanced"])
            ? [...CONVERSIONS[k], ...CONVERSIONS[k + "Advanced"]]
            : CONVERSIONS[k];
        if (reverse && CONVERSIONS[k + "Reverse"]) {
            pool = [...pool, ...CONVERSIONS[k + "Reverse"]];
        }
        if (extended && EXTENDED_CONVERSIONS[k]) {
            pool = [...pool, ...EXTENDED_CONVERSIONS[k]];
        }
        if (extended && reverse && EXTENDED_CONVERSIONS_REVERSE[k]) {
            pool = [...pool, ...EXTENDED_CONVERSIONS_REVERSE[k]];
        }
        if (allowed) {
            const filtered = pool.filter(c => allowed.has(c.unit) && allowed.has(c.target));
            if (filtered.length) pool = filtered;
        }

        const objectVariantsByObject = context
            ? unitObjects(k, extended).map(object => ({ object, variants: objectVariants(object, pool) }))
                .filter(entry => entry.variants.length > 0)
            : [];
        const chosen = pickPreferred(objectVariantsByObject, reverse);
        const entry = chosen ? chosen.entry : null;
        const variant = chosen ? pick(chosen.variants) : null;

        const conv = variant ? variant.conv : pick(pool);
        const value = variant
            ? variant.amount
            : (conv.reverse ? rand(1, conv.max) * conv.factor : rand(1, conv.max));
        const correct = conv.reverse ? value / conv.factor : value * conv.factor;

        const task = {
            type: "measure-units",
            unit: conv.unit,
            target: conv.target,
            value,
            answer: correct,
            kind: k,
            advanced,
            extended,
            reverse: conv.reverse === true,
            interaction: mode,
            question: `Hány ${conv.target} a ${value} ${conv.unit}?`
        };

        if (mode === "choice") {
            task.options = buildNumberOptions(correct, value);
        }

        if (mode === "tf") {
            const isTrue = Math.random() < 0.5;
            const stated = isTrue ? correct : pickWrongAnswer(correct);
            task.statedAnswer = stated;
            task.tfAnswer = isTrue;
            task.statement = `${value} ${conv.unit} = ${stated} ${conv.target}`;
            task.question = "Igaz vagy hamis?";
        }

        if (entry) {
            const { object } = entry;
            task.context = `${object.emoji} ${object.phrase} ${variant.amount} ${object.base}.`;
            if (mode !== "tf") {
                task.question = `Hány ${conv.target}?`;
            }
        }

        tasks.push(task);
    }

    return tasks;
}