function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
    return b ? gcd(b, a % b) : a;
}

function ratioText(a, b) {
    return `${a} : ${b}`;
}

const WRITE_SETS = [
    { leftEmoji: "🍎", rightEmoji: "🍐", leftName: "alma", rightName: "körte", leftArticle: "az", rightArticle: "a" },
    { leftEmoji: "🔴", rightEmoji: "🔵", leftName: "piros korong", rightName: "kék korong", leftArticle: "a", rightArticle: "a" },
    { leftEmoji: "🚗", rightEmoji: "🚌", leftName: "autó", rightName: "busz", leftArticle: "az", rightArticle: "a" },
    { leftEmoji: "🐟", rightEmoji: "🐠", leftName: "kis hal", rightName: "nagy hal", leftArticle: "a", rightArticle: "a" },
    { leftEmoji: "🍪", rightEmoji: "🍬", leftName: "keksz", rightName: "cukorka", leftArticle: "a", rightArticle: "a" },
    { leftEmoji: "⚽", rightEmoji: "🏀", leftName: "foci", rightName: "kosárlabda", leftArticle: "a", rightArticle: "a" }
];

function pickPair() {
    let a;
    let b;
    do {
        a = randInt(1, 9);
        b = randInt(1, 9);
    } while (a === b || gcd(a, b) !== 1);
    return [a, b];
}

function textOptions(correctText, candidates, fixed = []) {
    const decoys = [];
    for (const value of fixed) {
        if (value && value !== correctText && !decoys.includes(value)) decoys.push(value);
    }
    for (const candidate of shuffle([...new Set(candidates)])) {
        if (decoys.length === 3) break;
        if (candidate === correctText || !candidate || decoys.includes(candidate)) continue;
        if (/^(\d+) : \1$/.test(candidate)) continue;
        decoys.push(candidate);
    }
    return shuffle([
        { text: correctText, correct: true },
        ...decoys.map(text => ({ text, correct: false }))
    ]);
}

function buildWrite() {
    const set = pick(WRITE_SETS);
    const a = randInt(2, 6);
    let b = randInt(2, 6);
    while (b === a) b = randInt(2, 6);
    const answer = ratioText(a, b);
    const decoys = ratioText(b, a);
    return {
        mode: "write",
        a,
        b,
        leftEmoji: set.leftEmoji,
        rightEmoji: set.rightEmoji,
        leftName: set.leftName,
        rightName: set.rightName,
        answer,
        question: `Mennyi ${set.leftArticle} ${set.leftName} és ${set.rightArticle} ${set.rightName} aránya?`,
        options: textOptions(answer, [
            decoys,
            ratioText(a, a + b),
            ratioText(a + b, b),
            ratioText(a + 1, b),
            ratioText(a, b + 1),
            ratioText(b, a + b)
        ], [decoys])
    };
}

function buildSimplify() {
    const [simpleA, simpleB] = pickPair();
    const factor = randInt(2, 5);
    const a = simpleA * factor;
    const b = simpleB * factor;
    const answer = ratioText(simpleA, simpleB);
    return {
        mode: "simplify",
        a,
        b,
        factor,
        simpleA,
        simpleB,
        answer,
        display: ratioText(a, b),
        question: `Egyszerűsítsd a ${ratioText(a, b)} arányt!`,
        options: textOptions(answer, [
            ratioText(simpleB, simpleA),
            ratioText(a, simpleB),
            ratioText(simpleA, b),
            ratioText(simpleA + 1, simpleB),
            ratioText(simpleA, simpleB + 1)
        ])
    };
}

function buildMissing() {
    const [a, b] = pickPair();
    const k = randInt(2, 5);
    const unknownSide = pick(["left", "right"]);
    const answer = unknownSide === "right" ? b * k : a * k;
    const display = unknownSide === "right"
        ? `${ratioText(a, b)} = ${a * k} : ?`
        : `${ratioText(a, b)} = ? : ${b * k}`;
    const candidates = [answer - 1, answer + 1, answer - k, answer + k, answer + a, answer + b];
    const decoys = [];
    for (const candidate of shuffle([...new Set(candidates)])) {
        if (candidate <= 0 || candidate === answer || decoys.includes(candidate)) continue;
        decoys.push(candidate);
        if (decoys.length === 3) break;
    }
    return {
        mode: "missing",
        a,
        b,
        k,
        unknownSide,
        answer,
        display,
        question: "Mennyi a hiányzó tag?",
        options: shuffle([
            { text: String(answer), correct: true },
            ...decoys.map(value => ({ text: String(value), correct: false }))
        ])
    };
}

export function generateRatio(options = {}) {
    const { count = 4, mode = "mixed" } = options;

    const builders = { write: buildWrite, simplify: buildSimplify, missing: buildMissing };

    if (mode !== "mixed" && !builders[mode]) {
        throw new Error(`Ismeretlen arány mód: ${mode}`);
    }

    const tasks = [];
    const seen = new Set();

    let guard = 0;
    while (tasks.length < count && guard < count * 200) {
        guard++;
        const chosen = mode === "mixed" ? pick(Object.keys(builders)) : mode;
        const task = builders[chosen]();
        const key = `${task.mode}|${task.question}|${task.display ?? task.answer}`;
        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push({
            type: "ratio",
            ...task
        });
    }

    return tasks;
}
