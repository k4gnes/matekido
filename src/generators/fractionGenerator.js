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

const KINDS = ["pizza", "csoki", "szendvics", "torta"];

const FRACTION_NAMES = { 2: "fele", 3: "harmada", 4: "negyede" };
const FRACTION_ACCUS = { 2: "felét", 3: "harmadát", 4: "negyedét" };

function buildPickTask() {
    const kind = pick(KINDS);
    const total = pick([2, 3, 4]);
    const options = shuffle([2, 3, 4].map(t => ({
        kind,
        total: t,
        filled: 1,
        correct: t === total
    })));
    return {
        type: "fraction",
        mode: "pick",
        kind,
        total,
        question: `Melyik ${kind} mutatja a ${FRACTION_ACCUS[total]}?`,
        options
    };
}

function buildNameTask() {
    const kind = pick(KINDS);
    const total = pick([2, 3, 4]);
    const correct = FRACTION_NAMES[total];
    const options = shuffle(Object.keys(FRACTION_NAMES).map(t => ({
        text: FRACTION_NAMES[t],
        correct: FRACTION_NAMES[t] === correct
    })));
    return {
        type: "fraction",
        mode: "name",
        kind,
        total,
        drawing: { kind, total, filled: 1 },
        question: `A ${kind} mekkora része van kiszínezve?`,
        options
    };
}

export function generateFraction(options = {}) {
    const { count = 5 } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        tasks.push(Math.random() < 0.55 ? buildPickTask() : buildNameTask());
    }
    return tasks;
}