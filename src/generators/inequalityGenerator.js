function randint(min, max) {
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

const RELATIONS = [">", "<", "≥", "≤"];
const OPPOSITE = { ">": "<", "<": ">", "≥": "≤", "≤": "≥" };

function label(relation, bound) {
    return `x ${relation} ${bound}`;
}

function buildRead() {
    const relation = pick(RELATIONS);
    const bound = randint(1, 8);
    const options = shuffle(RELATIONS.map(r => ({
        text: label(r, bound),
        correct: r === relation
    })));
    return {
        mode: "read",
        relation,
        bound,
        question: "Melyik egyenlőtlenség megoldáshalmaza ez?",
        options
    };
}

function buildChoose() {
    const relation = pick(RELATIONS);
    const bound = randint(1, 8);
    const options = shuffle(RELATIONS.map(r => ({
        relation: r,
        bound,
        correct: r === relation
    })));
    return {
        mode: "choose",
        relation,
        bound,
        question: `Melyik számegyenes mutatja az ${label(relation, bound)} megoldáshalmazát?`,
        options
    };
}

function buildSolve() {
    const relation = pick(RELATIONS);
    const bound = randint(2, 8);
    const a = randint(1, 6);
    const correctText = label(relation, bound);
    const candidates = [
        label(relation, bound + 1),
        label(relation, bound - 1),
        label(OPPOSITE[relation], bound),
        label(OPPOSITE[relation], bound + 1),
        label(relation, bound + a)
    ];
    const decoys = [];
    for (const candidate of candidates) {
        if (candidate !== correctText && !decoys.includes(candidate)) decoys.push(candidate);
        if (decoys.length === 3) break;
    }
    return {
        mode: "solve",
        relation,
        bound,
        a,
        expression: `x + ${a} ${relation} ${bound + a}`,
        question: "Oldd meg az egyenlőtlenséget! Melyik a megoldáshalmaz?",
        options: shuffle([
            { text: correctText, correct: true },
            ...decoys.map(text => ({ text, correct: false }))
        ])
    };
}

export function generateInequality(options = {}) {
    const { count = 4, mode = "mixed" } = options;

    const builders = { read: buildRead, choose: buildChoose, solve: buildSolve };

    if (mode !== "mixed" && !builders[mode]) {
        throw new Error(`Ismeretlen egyenlőtlenség mód: ${mode}`);
    }

    const tasks = [];
    const seen = new Set();

    let guard = 0;
    while (tasks.length < count && guard < count * 200) {
        guard++;
        const chosen = mode === "mixed" ? pick(Object.keys(builders)) : mode;
        const task = builders[chosen]();
        const key = `${task.mode}|${task.relation}|${task.bound}`;
        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push({
            type: "inequality",
            ...task
        });
    }

    return tasks;
}
