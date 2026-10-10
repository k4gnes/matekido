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

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const SUPERSCRIPT_DIGITS = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹"
};

function superscript(n) {
    return String(n).split("").map(d => SUPERSCRIPT_DIGITS[d]).join("");
}

function powerText(exponent) {
    return `10${superscript(exponent)}`;
}

const NAME = {
    1: "tíz",
    2: "száz",
    3: "ezer",
    4: "tízezer",
    5: "százezer",
    6: "millió"
};

function distinctNumbers(correct, candidates, count, min = 1) {
    const out = [];
    for (const v of shuffle([...new Set(candidates)])) {
        if (!Number.isInteger(v) || v < min || v === correct || out.includes(v)) continue;
        out.push(v);
        if (out.length >= count) break;
    }
    return out;
}

function numberOptions(correct, candidates) {
    const wrong = distinctNumbers(correct, candidates, 3);
    return shuffle([
        { text: String(correct), correct: true },
        ...wrong.map(v => ({ text: String(v), correct: false }))
    ]);
}

function buildValue() {
    const exponent = randInt(1, 6);
    const answer = 10 ** exponent;
    const candidates = [
        10 ** (exponent - 1),
        10 ** (exponent + 1),
        2 * answer,
        answer - 10 ** (exponent - 1),
        answer + 10 ** (exponent - 1),
        answer / 2,
        5 * answer,
        10 ** (exponent + 2)
    ];
    return {
        type: "power-ten",
        mode: "value",
        exponent,
        value: answer,
        answer,
        question: `Mennyi ennek a hatványnak az értéke?`,
        options: numberOptions(answer, candidates)
    };
}

function buildZeros() {
    const exponent = randInt(1, 6);
    const candidates = [
        exponent - 1,
        exponent + 1,
        exponent - 2,
        exponent + 2,
        exponent + 3,
        exponent - 3
    ];
    return {
        type: "power-ten",
        mode: "zeros",
        exponent,
        value: 10 ** exponent,
        answer: exponent,
        question: "Hány nullája van ennek a számnak?",
        options: numberOptions(exponent, candidates)
    };
}

function buildPower() {
    const exponent = randInt(1, 6);
    const answer = powerText(exponent);
    const candidates = [];
    for (let m = 1; m <= 6; m++) {
        if (m !== exponent) candidates.push(powerText(m));
    }
    candidates.push(powerText(exponent + 1));
    candidates.push(`${exponent}${superscript(10)}`);
    const wrong = shuffle([...new Set(candidates)]).filter(t => t !== answer).slice(0, 3);
    return {
        type: "power-ten",
        mode: "power",
        exponent,
        value: 10 ** exponent,
        answer,
        question: "Hogyan írjuk fel ezt a számot tíz hatványaként?",
        options: shuffle([
            { text: answer, correct: true },
            ...wrong.map(t => ({ text: t, correct: false }))
        ])
    };
}

function buildName() {
    const exponent = randInt(1, 6);
    const answer = NAME[exponent];
    const wrong = shuffle(Object.values(NAME).filter(n => n !== answer)).slice(0, 3);
    return {
        type: "power-ten",
        mode: "name",
        exponent,
        value: 10 ** exponent,
        answer,
        question: "Hogyan nevezzük ezt a számot?",
        options: shuffle([
            { text: answer, correct: true },
            ...wrong.map(t => ({ text: t, correct: false }))
        ])
    };
}

export function generatePowerTen(options = {}) {
    const { count = 4, mode = "mixed" } = options;

    const builders = {
        value: buildValue,
        zeros: buildZeros,
        power: buildPower,
        name: buildName
    };

    const tasks = [];
    const seen = new Set();

    let guard = 0;
    while (tasks.length < count && guard < count * 200) {
        guard++;
        const chosen = mode === "mixed" ? pick(Object.keys(builders)) : mode;
        const build = builders[chosen];
        if (!build) {
            throw new Error(`Ismeretlen tízes hatvány mód: ${chosen}`);
        }
        const task = build();
        const key = `${task.mode}|${task.exponent}`;
        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push(task);
    }

    return tasks;
}