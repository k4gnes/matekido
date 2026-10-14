const ORDER_SETS = {
    postman: [
        ["📮", "✉️", "📦"],
        ["📬", "🎁", "📮"],
        ["🔠", "🔡", "🔢"]
    ],
    racing: [
        ["🏎️", "🚗", "🚌"],
        ["🏁", "🚦", "🛞"],
        ["🥇", "🥈", "🥉"]
    ],
    cooking: [
        ["🍎", "🍌", "🍇"],
        ["🍅", "🥕", "🥦"],
        ["🍰", "🧁", "🍪"]
    ],
    football: [
        ["⚽", "🥅", "🧤"],
        ["👟", "🥅", "⛳"],
        ["🏆", "🥇", "🎽"]
    ],
    animals: [
        ["🐶", "🐱", "🐰"],
        ["🦁", "🐘", "🦒"],
        ["🐸", "🐢", "🐠"]
    ],
    space: [
        ["🚀", "🛸", "🛰️"],
        ["🌍", "🌙", "⭐"],
        ["☄️", "🛸", "🚀"]
    ],
    tram: [
        ["🚋", "🚌", "🚲"],
        ["🚏", "🚦", "🧳"],
        ["🎫", "🧳", "🚋"]
    ]
};

const DEFAULT_SETS = [
    ["🐶", "🐱", "🐰"],
    ["🍎", "🍌", "🍇"],
    ["🔴", "🔵", "🟢"],
    ["⭐", "🌙", "☀️"],
    ["🚗", "🚌", "🚲"]
];

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function pickSet(world) {
    const pool = ORDER_SETS[world] ?? DEFAULT_SETS;
    return shuffle([...pool[Math.floor(Math.random() * pool.length)]]);
}

function generateOrderTask(world) {
    const items = pickSet(world);
    return {
        type: "combinatorics",
        mode: "order",
        items,
        total: 6,
        question: "Add meg a következő új sorrendet!"
    };
}

const COUNT_WORDS = {
    postman: { thing: "csomagot", person: "postás", a: "bélyeg", b: "boríték" },
    racing: { thing: "autót", person: "versenyző", a: "sisak", b: "overall" },
    football: { thing: "labdát", person: "játékos", a: "labda", b: "síp" },
    cooking: { thing: "tortát", person: "szakács", a: "süti", b: "fánk" },
    animals: { thing: "állatot", person: "gondozó", a: "kutya", b: "cica" },
    space: { thing: "műszert", person: "űrhajós", a: "csillag", b: "bolygó" },
    tram: { thing: "jegyet", person: "utas", a: "villamos", b: "busz" }
};

function factorial(n) {
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function numberOptions(answer, candidates) {
    const seen = new Set([answer]);
    const values = [answer];
    for (const value of candidates) {
        if (values.length >= 4) break;
        if (Number.isInteger(value) && value > 0 && !seen.has(value)) {
            seen.add(value);
            values.push(value);
        }
    }
    return shuffle(values).map(value => ({ text: String(value), correct: value === answer }));
}

function reasoningOptions(answer, correctText, candidates) {
    const seenValues = new Set([answer]);
    const others = [];
    for (const candidate of candidates) {
        if (others.length >= 3) break;
        if (Number.isInteger(candidate.value) && candidate.value > 0 && !seenValues.has(candidate.value)) {
            seenValues.add(candidate.value);
            others.push({ text: candidate.text, correct: false });
        }
    }
    return shuffle([{ text: correctText, correct: true }, ...others]);
}

function generateCountTask(world, n) {
    const words = COUNT_WORDS[world] ?? COUNT_WORDS.postman;
    const answer = factorial(n);
    const candidates = [factorial(n - 1), (n - 1) * (n - 2), n * n, answer + n, answer - n, answer + 1, answer - 1];
    const parts = [];
    for (let i = n; i >= 1; i--) {
        parts.push(String(i));
    }
    const sum = (n * (n + 1)) / 2;
    return {
        type: "combinatorics",
        mode: "count",
        n,
        answer,
        question: `Hányféleképpen lehet sorba rendezni ${n} ${words.thing}?`,
        options: numberOptions(answer, candidates),
        explanation: `${parts.join(" × ")} = ${answer}. Az első helyre ${n}-féle, a másodikra ${n - 1}-féle kerülhet, és így tovább, ezért összeszorozzuk őket.`,
        reasoning: reasoningOptions(answer, parts.join(" × "), [
            { text: parts.slice().reverse().join(" + "), value: sum },
            { text: Array.from({ length: n }, () => String(n)).join(" × "), value: n ** n },
            { text: parts.slice(1).join(" × "), value: factorial(n - 1) },
            { text: `${n} × ${n - 1}`, value: n * (n - 1) },
            { text: `${n} × ${n}`, value: n * n },
            { text: `${n} + ${n - 1}`, value: n + (n - 1) }
        ])
    };
}

function generatePairTask(world, n) {
    const words = COUNT_WORDS[world] ?? COUNT_WORDS.postman;
    const answer = (n * (n - 1)) / 2;
    const candidates = [n * (n - 1), n * n, answer + 1, answer - 1, n + (n - 1), answer + n, answer - n];
    return {
        type: "combinatorics",
        mode: "pair",
        n,
        answer,
        question: `Hány párost alkothat ${n} ${words.person} egymás között?`,
        options: numberOptions(answer, candidates),
        explanation: `${n} × ${n - 1} ÷ 2 = ${answer}. Az elsőt ${n}-féleképp, a másodikat ${n - 1}-féleképp választhatjuk, de a sorrend nem számít, ezért osztunk 2-vel.`,
        reasoning: reasoningOptions(answer, `${n} × ${n - 1} ÷ 2`, [
            { text: `${n} × ${n - 1}`, value: n * (n - 1) },
            { text: `${n} + ${n - 1}`, value: n + (n - 1) },
            { text: `${n} × ${n}`, value: n * n },
            { text: `${n} × ${n - 1} × 2`, value: n * (n - 1) * 2 }
        ])
    };
}

function generateMultiplyTask(world, a, b) {
    const words = COUNT_WORDS[world] ?? COUNT_WORDS.postman;
    const answer = a * b;
    const candidates = [a + b, answer + a, answer - b, answer + 1, answer - 1, a * a, b * b];
    return {
        type: "combinatorics",
        mode: "multiply",
        a,
        b,
        answer,
        question: `Az egyik csoportban ${a} ${words.a}, a másikban ${b} ${words.b} van. Hányféleképpen választhatunk ki egyet-egyet?`,
        options: numberOptions(answer, candidates),
        explanation: `${a} × ${b} = ${answer}. Az egyik csoportból ${a}-féle, a másikból ${b}-féle választás van, ezeket összeszorozzuk.`,
        reasoning: reasoningOptions(answer, `${a} × ${b}`, [
            { text: `${a} + ${b}`, value: a + b },
            { text: `${a} × ${a} + 1`, value: a * a + 1 },
            { text: `${b} × ${b} + 1`, value: b * b + 1 },
            { text: `${a} × ${b + 1}`, value: a * (b + 1) },
            { text: `(${a + 1}) × ${b}`, value: (a + 1) * b },
            { text: `${a + b} × 2`, value: (a + b) * 2 }
        ])
    };
}

const MULTIPLY_PAIRS = [];
for (let a = 2; a <= 6; a++) {
    for (let b = 2; b <= 6; b++) {
        MULTIPLY_PAIRS.push([a, b]);
    }
}

function planValues(values, count) {
    const planned = [];
    let bag = [];
    for (let i = 0; i < count; i++) {
        if (bag.length === 0) {
            bag = shuffle([...values]);
            if (planned.length > 0 && values.length > 1 && bag[0] === planned[planned.length - 1]) {
                [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
            }
        }
        planned.push(bag.shift());
    }
    return planned;
}

export function generateCombinatorics(opts = {}) {
    const { count = 1, world, mode = "order" } = opts;
    if (mode === "count") {
        return planValues([3, 4], count).map(n => generateCountTask(world, n));
    }
    if (mode === "pair") {
        return planValues([4, 5, 6], count).map(n => generatePairTask(world, n));
    }
    if (mode === "multiply") {
        return planValues(MULTIPLY_PAIRS, count).map(([a, b]) => generateMultiplyTask(world, a, b));
    }
    const tasks = [];
    for (let i = 0; i < count; i++) {
        tasks.push(generateOrderTask(world));
    }
    return tasks;
}
