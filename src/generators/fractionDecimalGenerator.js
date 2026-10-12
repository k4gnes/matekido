function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function gcd(a, b) {
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}

const BASIC_DENOMS = [2, 4, 5, 10];
const ADVANCED_DENOMS = [2, 4, 5, 10, 20, 25, 50];

function buildValueList(denoms) {
    const values = [];
    for (const denominator of denoms) {
        for (let numerator = 1; numerator < denominator; numerator++) {
            if (gcd(numerator, denominator) !== 1) continue;
            values.push({ numerator, denominator, hundredths: numerator * 100 / denominator });
        }
    }
    return values;
}

const BASIC_VALUES = buildValueList(BASIC_DENOMS);
const ADVANCED_VALUES = buildValueList(ADVANCED_DENOMS);

function decimalText(hundredths) {
    if (hundredths % 10 === 0) return `0,${hundredths / 10}`;
    return `0,${String(hundredths).padStart(2, "0")}`;
}

function simplify(hundredths) {
    const divisor = gcd(hundredths, 100);
    return { numerator: hundredths / divisor, denominator: 100 / divisor };
}

function expandedFraction(hundredths) {
    if (hundredths % 10 === 0) return { numerator: hundredths / 10, denominator: 10 };
    return { numerator: hundredths, denominator: 100 };
}

function pickValue(level) {
    if (level === "basic") return pick(BASIC_VALUES);
    if (level === "advanced") return pick(ADVANCED_VALUES);
    return pick([...BASIC_VALUES, ...ADVANCED_VALUES]);
}

function pickDistractors(hundredths) {
    const chosen = [];
    const bases = [1, 10, 25, 5, 20, 50, 2, 4];
    for (const base of bases) {
        if (chosen.length >= 3) break;
        for (const candidate of shuffle([hundredths + base, hundredths - base])) {
            if (candidate < 1 || candidate > 99) continue;
            if (candidate === hundredths) continue;
            if (chosen.includes(candidate)) continue;
            chosen.push(candidate);
            break;
        }
    }
    return chosen;
}

function fractionToDecimalHint(numerator, denominator) {
    if (denominator === 10) {
        return "A 10-es nevező tizedeket jelent: a számlálót a tizedek helyére írjuk. Például a 3/10 az 0,3.";
    }
    const target = 10 % denominator === 0 ? 10 : 100;
    const factor = target / denominator;
    return `Bővítsd a törtet! A nevezőt ${target}-re hozzuk: ${denominator} · ${factor} = ${target}. A számlálót is szorozd meg ${factor}-tel, majd a ${target} nevezőről olvasd le a tizedes törtet.`;
}

function decimalToFractionHint(hundredths) {
    const { numerator, denominator } = expandedFraction(hundredths);
    return `A tizedes törtet először törtté írjuk: ${decimalText(hundredths)} = ${numerator}/${denominator}. Ezután egyszerűsítsd: oszd el a számlálót és a nevezőt is a legnagyobb közös osztójukkal, így kapod a legegyszerűbb alakot.`;
}

function buildFractionToDecimal(level) {
    const value = pickValue(level);
    const hundredths = value.hundredths;
    const correct = decimalText(hundredths);
    const distractors = pickDistractors(hundredths);
    const options = shuffle([
        { text: correct, correct: true },
        ...distractors.map(h => ({ text: decimalText(h), correct: false }))
    ]);
    return {
        type: "fraction-decimal",
        mode: "fraction-to-decimal",
        numerator: value.numerator,
        denominator: value.denominator,
        hundredths,
        decimal: correct,
        expanded: expandedFraction(hundredths),
        answer: correct,
        question: "Mennyi ez tizedes törttel?",
        hint: fractionToDecimalHint(value.numerator, value.denominator),
        options
    };
}

function buildDecimalToFraction(level) {
    const value = pickValue(level);
    const hundredths = value.hundredths;
    const decimal = decimalText(hundredths);
    const simple = simplify(hundredths);
    const distractors = pickDistractors(hundredths);
    const options = shuffle([
        {
            text: `${simple.numerator}/${simple.denominator}`,
            numerator: simple.numerator,
            denominator: simple.denominator,
            correct: true
        },
        ...distractors.map(h => {
            const s = simplify(h);
            return {
                text: `${s.numerator}/${s.denominator}`,
                numerator: s.numerator,
                denominator: s.denominator,
                correct: false
            };
        })
    ]);
    return {
        type: "fraction-decimal",
        mode: "decimal-to-fraction",
        numerator: simple.numerator,
        denominator: simple.denominator,
        hundredths,
        decimal,
        expanded: expandedFraction(hundredths),
        answer: `${simple.numerator}/${simple.denominator}`,
        question: "Mennyi ez törttel a legegyszerűbb alakban?",
        hint: decimalToFractionHint(hundredths),
        options
    };
}

export function generateFractionDecimal(options = {}) {
    const { count = 3, mode = "mixed", level = "mixed" } = options;

    const builders = {
        "fraction-to-decimal": () => buildFractionToDecimal(level),
        "decimal-to-fraction": () => buildDecimalToFraction(level)
    };

    const tasks = [];
    const seen = new Set();

    let guard = 0;
    while (tasks.length < count && guard < count * 300) {
        guard++;
        const chosen = mode === "mixed" ? pick(Object.keys(builders)) : mode;
        const build = builders[chosen];
        if (!build) {
            throw new Error(`Ismeretlen tört-tizedes mód: ${chosen}`);
        }
        const task = build();
        const key = `${task.mode}|${task.hundredths}`;
        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push(task);
    }

    if (tasks.length < count) {
        throw new Error("Nem sikerült elegendő feladatot generálni.");
    }

    return tasks;
}
