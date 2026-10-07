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

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
}

function lcm(a, b) {
    return (a * b) / gcd(a, b);
}

const EASY_PERCENTS = [10, 20, 25, 50];

const WORD_TASKS = [
    {
        percent: 50,
        word: "fele",
        context: "Az osztály fele lány. Hány százaléka az osztálynak a lányok aránya?"
    },
    {
        percent: 25,
        word: "negyede",
        context: "A torta negyedét már felszeletelted. Hány százaléka a tortának a felszeletelt rész?"
    },
    {
        percent: 20,
        word: "ötöde",
        context: "A fejezet ötödét olvastad el. Hány százaléka a fejezetnek az elolvasott rész?"
    },
    {
        percent: 10,
        word: "tizede",
        context: "A célok tizedét már teljesítetted. Hány százaléka a listának a kész rész?"
    }
];

const FRACTION_POOL = ["1/2", "1/4", "1/5", "1/10", "1/20", "1/3", "1/8", "2/5", "3/4", "3/10", "4/5", "1/25"];

function fractionText(percent) {
    const g = gcd(percent, 100);
    const den = 100 / g;
    return den === 1 ? String(percent / g) : `${percent / g}/${den}`;
}

function percentPool(correct) {
    const pool = [];
    for (const delta of [-25, -20, -15, -10, -5, 5, 10, 15, 20, 25]) {
        const value = correct + delta;
        if (value >= 5 && value <= 95) pool.push(value);
    }
    for (const value of [correct * 2, correct / 2]) {
        if (Number.isInteger(value) && value >= 5 && value <= 95) pool.push(value);
    }
    return shuffle([...new Set(pool)]);
}

function percentOptions(correct, pool) {
    const decoys = pool.filter(v => v !== correct).slice(0, 3);
    return shuffle([correct, ...decoys]).map(v => ({ text: `${v}%`, correct: v === correct }));
}

function numberOptions(correct, candidates) {
    const seen = new Set([correct]);
    const decoys = [];
    for (const value of candidates) {
        if (!Number.isInteger(value) || value <= 0 || value === correct || seen.has(value)) continue;
        seen.add(value);
        decoys.push(value);
        if (decoys.length === 3) break;
    }
    return shuffle([correct, ...decoys]).map(v => ({ text: String(v), correct: v === correct }));
}

function answerStep(answer) {
    return Math.max(1, Math.round(answer / 10));
}

function ofValue(percent, max) {
    const unit = lcm(100 / gcd(percent, 100), 10);
    const k = randint(1, Math.max(1, Math.floor(max / unit)));
    const base = unit * k;
    return { base, answer: (base * percent) / 100 };
}

function buildGridTask(percents) {
    const percent = pick(percents);
    return {
        type: "percent",
        mode: "grid",
        percent,
        cells: percent,
        question: "Hány százalékot látsz kiszínezve?",
        options: percentOptions(percent, percentPool(percent))
    };
}

function buildFractionTask(percents) {
    const percent = pick(percents);
    const correct = fractionText(percent);
    const decoys = shuffle(FRACTION_POOL.filter(text => text !== correct)).slice(0, 3);
    return {
        type: "percent",
        mode: "frac",
        percent,
        symbol: `${percent}%`,
        question: "Melyik tört felel meg ennek az értéknek?",
        options: shuffle([correct, ...decoys]).map(text => ({ text, correct: text === correct }))
    };
}

function buildWordTask(index) {
    const task = WORD_TASKS[index % WORD_TASKS.length];
    return {
        type: "percent",
        mode: "word",
        percent: task.percent,
        word: task.word,
        context: task.context,
        question: "Hány százaléka ez a résznek az egészből?",
        options: percentOptions(task.percent, percentPool(task.percent))
    };
}

function buildOfTask(percents, max) {
    const percent = pick(percents);
    const { base, answer } = ofValue(percent, max);
    const step = answerStep(answer);
    const candidates = [
        percent,
        Math.max(1, Math.round(base / 100)),
        answer + step,
        answer - step,
        answer + 5,
        answer - 5,
        answer * 2,
        Math.round(answer / 2),
        answer + 1,
        answer - 1,
        answer + 2,
        answer - 2
    ];
    return {
        type: "percent",
        mode: "of",
        percent,
        base,
        answer,
        symbol: `${percent}%`,
        question: `Mi a ${base} szám ${percent} százaléka?`,
        options: numberOptions(answer, candidates)
    };
}

function buildFindTask(percents, max) {
    const percent = pick(percents);
    const { base, answer } = ofValue(percent, max);
    return {
        type: "percent",
        mode: "find",
        percent,
        base,
        answer,
        value: answer,
        symbol: `${answer} / ${base}`,
        question: `A(z) ${answer} hány százaléka a ${base} számnak?`,
        options: percentOptions(percent, percentPool(percent))
    };
}

export function generatePercent(options = {}) {
    const { count = 4, mode = "mixed", max = 1000 } = options;
    const percents = options.percents ?? EASY_PERCENTS;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        const chosen = mode === "mixed"
            ? pick(["grid", "frac", "word", "of"])
            : mode;

        if (chosen === "grid") {
            tasks.push(buildGridTask(percents));
        } else if (chosen === "frac") {
            tasks.push(buildFractionTask(percents));
        } else if (chosen === "word") {
            tasks.push(buildWordTask(i));
        } else if (chosen === "of") {
            tasks.push(buildOfTask(percents, max));
        } else if (chosen === "find") {
            tasks.push(buildFindTask(percents, max));
        } else {
            tasks.push(buildGridTask(percents));
        }
    }
    return tasks;
}
