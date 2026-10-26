function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const LABELS = {
    certain: "Biztos",
    possible: "Lehetséges",
    impossible: "Lehetetlen"
};

const EVENTS = {
    certain: [
        { emoji: "🎲", text: "Egy dobókockával dobunk. Páros vagy páratlan számot kapunk." },
        { emoji: "🌞", text: "Holnapra virrad, és új nap kezdődik." },
        { emoji: "🍎", text: "Az almának van magja." },
        { emoji: "🐟", text: "A hal a vízben él." }
    ],
    possible: [
        { emoji: "🎲", text: "Egy dobókockával dobunk. Hatost dobunk." },
        { emoji: "☂️", text: "Holnap esik az eső." },
        { emoji: "⚽", text: "A kedvenc csapatunk megnyeri a meccset." },
        { emoji: "🍬", text: "A zacskóban citromízű és eperízű cukorka is van. Citromízűt húzunk belőle." }
    ],
    impossible: [
        { emoji: "🎲", text: "Egy dobókockával dobunk. Hetest dobunk." },
        { emoji: "🐱", text: "A macska megtanul repülni." },
        { emoji: "🌙", text: "Nappal a Hold és a csillagok ragyognak." },
        { emoji: "🧊", text: "A puszta nyáron hó esik." }
    ]
};

const EVENTS_EASY = {
    certain: [
        { emoji: "☀️", text: "Nappal süt a nap az égen." },
        { emoji: "🐶", text: "A kutyának négy lába van." },
        { emoji: "🌧️", text: "Ha esik az eső, vizes lesz a föld." },
        { emoji: "🍎", text: "Az almának van magja." }
    ],
    possible: [
        { emoji: "🎲", text: "Egy dobókockával dobunk. Hatost kapunk." },
        { emoji: "🍎", text: "A piacon almát veszünk." },
        { emoji: "⚽", text: "A focimeccsen gólt rúgunk." },
        { emoji: "☂️", text: "Holnap esik az eső." }
    ],
    impossible: [
        { emoji: "🐘", text: "Az elefánt befér a zsebünkbe." },
        { emoji: "🌙", text: "Nappal ragyognak a csillagok." },
        { emoji: "🐟", text: "A hal az udvaron sétál." },
        { emoji: "🐱", text: "A macska megtanul repülni." }
    ]
};

const CATEGORIES = ["certain", "possible", "impossible"];

const COMPARE_COLORS = [
    { color: "piros", label: "Piros", acc: "pirosat", emoji: "🔴", hex: "#ef4444" },
    { color: "kék", label: "Kék", acc: "kéket", emoji: "🔵", hex: "#3b82f6" },
    { color: "zöld", label: "Zöld", acc: "zöldet", emoji: "🟢", hex: "#22c55e" },
    { color: "sárga", label: "Sárga", acc: "sárgát", emoji: "🟡", hex: "#eab308" },
    { color: "lila", label: "Lila", acc: "lilát", emoji: "🟣", hex: "#a855f7" }
];

function pickCompareColors() {
    const pool = shuffle([...COMPARE_COLORS]);
    return [pool[0], pool[1]];
}

const EQUAL_LABEL = "Ugyanolyan eséllyel";

// a kedvező és a nem kedvező esetek aránya irreduktílos marad
const CHANCE_PAIRS = [[1, 3], [2, 3], [3, 4], [1, 5], [2, 5], [3, 5], [1, 7], [2, 7]];

const FREQUENCY_SCENARIOS = [
    { trials: 20, favorable: 4, event: "A zacskóból 20 húzásból 4-szer piros golyót húztunk." },
    { trials: 25, favorable: 5, event: "Egy dobókockával 25-szor dobtunk, és 5-ször kaptunk hatost." },
    { trials: 40, favorable: 8, event: "A pörgettyű 40 pörgetésből 8-szor állt meg a kék színen." },
    { trials: 50, favorable: 10, event: "A focista 50 lövésből 10-szer talált a kapuba." },
    { trials: 30, favorable: 6, event: "A villamos 30 indulásból 6-szor késett." },
    { trials: 20, favorable: 5, event: "Az állatkertben 20 látogatóból 5-en vettek ajándékot." }
];

function generateFrequencyTask() {
    const scenario = FREQUENCY_SCENARIOS[Math.floor(Math.random() * FREQUENCY_SCENARIOS.length)];
    const answer = `${scenario.favorable}/${scenario.trials}`;
    const candidates = [
        `${scenario.favorable}/${scenario.trials - 1}`,
        `${scenario.favorable + 1}/${scenario.trials}`,
        `${scenario.trials - scenario.favorable}/${scenario.trials}`,
        `${scenario.favorable}/${scenario.trials + 1}`,
        `${scenario.favorable + 2}/${scenario.trials}`
    ];
    const options = [answer];
    for (const candidate of candidates) {
        if (options.length >= 4) break;
        if (!options.includes(candidate)) options.push(candidate);
    }
    shuffle(options);

    return {
        type: "probability",
        mode: "frequency",
        event: scenario.event,
        trials: scenario.trials,
        favorable: scenario.favorable,
        question: "Mennyi a relatív gyakorisága?",
        options,
        answer: options.indexOf(answer),
        correctLabel: answer,
        successText: `😊 Igazad van! ${scenario.favorable} kedvező eset ÷ ${scenario.trials} kísérlet = ${answer}.`
    };
}

function generateChanceTask() {
    const scenario = Math.random() < 0.5 ? "bag" : "spinner";
    const [first, second] = pickCompareColors();
    const [amountA, amountB] = CHANCE_PAIRS[Math.floor(Math.random() * CHANCE_PAIRS.length)];
    const groups = shuffle([
        { color: first.color, label: first.label, acc: first.acc, emoji: first.emoji, hex: first.hex, amount: amountA },
        { color: second.color, label: second.label, acc: second.acc, emoji: second.emoji, hex: second.hex, amount: amountB }
    ]);

    const favorableIndex = Math.random() < 0.5 ? 0 : 1;
    const target = groups[favorableIndex];
    const other = groups[1 - favorableIndex];
    const total = amountA + amountB;
    const answer = `${target.amount}/${total}`;

    const candidates = [
        `${other.amount}/${total}`,
        `${target.amount}/${other.amount}`,
        target.amount > 1 ? `${target.amount - 1}/${total}` : `${target.amount + 1}/${total}`,
        `${target.amount + 1}/${total}`
    ];
    const options = [answer];
    for (const candidate of candidates) {
        if (options.length >= 4) break;
        if (!options.includes(candidate)) options.push(candidate);
    }
    shuffle(options);

    const question = scenario === "spinner"
        ? `Mekkora a valószínűsége, hogy ${target.color}ra áll meg a pörgettyű?`
        : `Mekkora a valószínűsége, hogy ${target.acc} golyót húzunk a zacskiból?`;

    return {
        type: "probability",
        mode: "chance",
        scenario,
        groups,
        favorableIndex,
        question,
        options,
        answer: options.indexOf(answer),
        correctLabel: answer,
        successText: `😊 Igazad van! ${total} esetből ${target.amount} ${target.color}, ezért a valószínűség ${answer}.`
    };
}

function generateCompareTask() {
    const scenario = Math.random() < 0.5 ? "bag" : "spinner";
    const [first, second] = pickCompareColors();
    const equal = Math.random() < 0.34;

    let amountA;
    let amountB;

    if (scenario === "spinner") {
        if (equal) {
            amountA = 4;
            amountB = 4;
        } else {
            const parts = [2, 3, 5, 6];
            amountA = parts[Math.floor(Math.random() * parts.length)];
            amountB = 8 - amountA;
        }
    } else if (equal) {
        amountA = [2, 3, 4][Math.floor(Math.random() * 3)];
        amountB = amountA;
    } else {
        const counts = [[4, 1], [5, 1], [3, 2], [4, 2]];
        const pair = counts[Math.floor(Math.random() * counts.length)];
        amountA = pair[0];
        amountB = pair[1];
    }

    const groups = shuffle([
        { color: first.color, label: first.label, acc: first.acc, emoji: first.emoji, hex: first.hex, amount: amountA },
        { color: second.color, label: second.label, acc: second.acc, emoji: second.emoji, hex: second.hex, amount: amountB }
    ]);

    if (equal) {
        const question = scenario === "spinner"
            ? "Melyik színen áll meg nagyobb eséllyel a pörgettyű?"
            : "Melyik színt húzod nagyobb eséllyel?";
        const options = shuffle([first.label, second.label, EQUAL_LABEL]);
        const successText = scenario === "spinner"
            ? `😊 Igazad van! Ugyanakkora a ${groups[0].color} és a ${groups[1].color} rész, ezért ugyanolyan eséllyel áll meg bármelyiken.`
            : `😊 Igazad van! Ugyanannyi ${groups[0].color} és ${groups[1].color} golyó van, ezért ugyanolyan eséllyel húzol bármelyiket.`;

        return {
            type: "probability",
            mode: "compare",
            scenario,
            groups,
            ask: "bigger",
            equal: true,
            question,
            options,
            answer: options.indexOf(EQUAL_LABEL),
            correctColor: null,
            correctLabel: EQUAL_LABEL,
            successText
        };
    }

    const ask = Math.random() < 0.5 ? "bigger" : "smaller";

    const sorted = [...groups].sort((a, b) => b.amount - a.amount);
    const more = sorted[0];
    const less = sorted[1];
    const correct = ask === "bigger" ? more : less;

    const question = scenario === "spinner"
        ? (ask === "bigger"
            ? "Melyik színen áll meg nagyobb eséllyel a pörgettyű?"
            : "Melyik színen áll meg kisebb eséllyel a pörgettyű?")
        : (ask === "bigger"
            ? "Melyiket húzod nagyobb eséllyel?"
            : "Melyiket húzod kisebb eséllyel?");

    const options = shuffle(groups.map(g => g.label));
    const answer = options.indexOf(correct.label);

    const successText = scenario === "spinner"
        ? (ask === "bigger"
            ? `😊 Igazad van! A ${correct.color} körcikk nagyobb, ezért azon áll meg nagyobb eséllyel a pörgettyű.`
            : `😊 Igazad van! A ${correct.color} körcikk kisebb, ezért azon áll meg kisebb eséllyel a pörgettyű.`)
        : (ask === "bigger"
            ? `😊 Igazad van! Több ${correct.color} golyó van, ezért nagyobb eséllyel ${correct.acc} húzod.`
            : `😊 Igazad van! Kevesebb ${correct.color} golyó van, ezért kisebb eséllyel ${correct.acc} húzod.`);

    return {
        type: "probability",
        mode: "compare",
        scenario,
        groups,
        ask,
        equal: false,
        question,
        options,
        answer,
        correctColor: correct.color,
        correctLabel: correct.label,
        successText
    };
}

function generateTask(level = 2) {
    const pool = level === 1 ? EVENTS_EASY : EVENTS;
    const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const event = pool[cat][Math.floor(Math.random() * pool[cat].length)];
    const correctLabel = LABELS[cat];
    const otherLabels = CATEGORIES
        .filter(c => c !== cat)
        .map(c => LABELS[c]);
    const options = shuffle([correctLabel, ...otherLabels]);

    return {
        type: "probability",
        emoji: event.emoji,
        text: event.text,
        category: cat,
        answer: options.indexOf(correctLabel),
        options,
        correctLabel
    };
}

export function generateProbability(opts = {}) {
    const { count = 6, level = 2, mode } = opts;
    const tasks = [];
    for (let i = 0; i < count; i++) {
        if (mode === "compare") tasks.push(generateCompareTask());
        else if (mode === "chance") tasks.push(generateChanceTask());
        else if (mode === "frequency") tasks.push(generateFrequencyTask());
        else tasks.push(generateTask(level));
    }
    return tasks;
}