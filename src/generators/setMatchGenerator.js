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

const KIND_PROPS = [
    { kind: "circle", label: "Körök", rule: "a körök csoportjába" },
    { kind: "triangle", label: "Háromszögek", rule: "a háromszögek csoportjába" },
    { kind: "square", label: "Négyzetek", rule: "a négyzetek csoportjába" },
    { kind: "rectangle", label: "Téglalapok", rule: "a téglalapok csoportjába" }
];

const COLOR_PROPS = [
    { name: "Piros", hex: "#ef4444", rule: "a piros alakzatok csoportjába" },
    { name: "Kék", hex: "#3b82f6", rule: "a kék alakzatok csoportjába" },
    { name: "Zöld", hex: "#22c55e", rule: "a zöld alakzatok csoportjába" },
    { name: "Sárga", hex: "#f59e0b", rule: "a sárga alakzatok csoportjába" },
    { name: "Lila", hex: "#a855f7", rule: "a lila alakzatok csoportjába" }
];

const ALL_HEXES = COLOR_PROPS.map(c => c.hex);
const ALL_KINDS = KIND_PROPS.map(k => k.kind);

function randomShape() {
    return {
        kind: pick(ALL_KINDS),
        color: pick(ALL_HEXES),
        size: pick([30, 44])
    };
}

function key(shape) {
    return `${shape.kind}|${shape.color}|${shape.size}`;
}

function matches(shape, prop) {
    if (prop.type === "color") return shape.color === prop.hex;
    if (prop.type === "kind") return shape.kind === prop.kind;
    if (prop.type === "size") return prop.value === "big" ? shape.size >= 40 : shape.size <= 34;
    return false;
}

function isNatural(n) {
    return Number.isInteger(n) && n >= 0;
}

function isInteger(n) {
    return Number.isInteger(n);
}

function isRational(n) {
    return Number.isFinite(n);
}

function buildNumberSetTask() {
    const sets = [
        { type: "N", label: "Természetes számok (ℕ)", rule: "a természetes számok halmazába" },
        { type: "Z", label: "Egész számok (ℤ)", rule: "az egész számok halmazába" },
        { type: "Q", label: "Racionális számok (ℚ)", rule: "a racionális számok halmazába" }
    ];
    const chosen = pick(sets);
    let members = [];
    let nonMembers = [];

    const candidates = [];
    for (let i = 0; i < 12; i++) candidates.push(Math.floor(Math.random() * 20));
    for (let i = 0; i < 8; i++) candidates.push(-Math.floor(Math.random() * 15));
    candidates.push(0.5, 0.25, -0.5, 1.5, 2.25, -1.25);

    if (chosen.type === "N") {
        members = candidates.filter(n => isNatural(n));
        nonMembers = candidates.filter(n => !isNatural(n));
    } else if (chosen.type === "Z") {
        members = candidates.filter(n => isInteger(n));
        nonMembers = candidates.filter(n => !isInteger(n));
    } else {
        members = candidates.filter(n => isRational(n));
        nonMembers = candidates.filter(n => !isFinite(n));
        if (nonMembers.length === 0) {
            nonMembers = [0.3333333333, 1/3];
        }
    }

    members = Array.from(new Set(members.map(x => (Math.abs(x) < 1000 ? x : Math.round(x))))).filter(x => (chosen.type === "N" ? isNatural(x) : chosen.type === "Z" ? isInteger(x) : isRational(x)));
    nonMembers = Array.from(new Set(nonMembers.map(x => x))).filter(x => !(chosen.type === "N" ? isNatural(x) : chosen.type === "Z" ? isInteger(x) : isRational(x)));

    if (members.length < 3) {
        if (chosen.type === "N") members = [0, 1, 2, 3, 5];
        else if (chosen.type === "Z") members = [-2, -1, 0, 1, 2];
        else members = [-1, 0, 0.5, 1, 2];
    }
    if (nonMembers.length < 2) {
        if (chosen.type === "N") nonMembers = [-1, -2, 0.5, 1.5];
        else if (chosen.type === "Z") nonMembers = [0.5, 1.5, 2.25, -0.25];
        else nonMembers = [1/3, Math.PI];
    }

    const examples = shuffle(members).slice(0, 3);
    const remainingMembers = members.filter(m => !examples.includes(m));
    const answerVal = remainingMembers.length > 0 ? remainingMembers[0] : members[0];
    let distractors = shuffle(nonMembers).slice(0, 2);
    if (distractors.length < 2) {
        distractors = nonMembers.slice(0, 2);
    }
    if (distractors.length < 2) {
        distractors = [0.3333333333, -0.5].filter(x => !(chosen.type === "N" ? isNatural(x) : chosen.type === "Z" ? isInteger(x) : isRational(x)));
    }
    const options = shuffle([answerVal, ...distractors.slice(0, 2)]);

    const outOptions = options.map(v => ({ value: v }));
    return {
        type: "set-match",
        mode: "numbers",
        label: chosen.label,
        rule: chosen.rule,
        examples: examples.map(v => ({ value: v })),
        options: outOptions,
        answer: outOptions.findIndex(o => o.value === answerVal)
    };
}

function buildShapeTask() {
    const r = Math.random();
    let prop;
    if (r < 0.5) {
        const chosen = pick(COLOR_PROPS);
        prop = { type: "color", label: `${chosen.name} alakzatok`, rule: chosen.rule, hex: chosen.hex };
    } else if (r < 0.82) {
        const chosen = pick(KIND_PROPS);
        prop = { type: "kind", label: chosen.label, rule: chosen.rule, kind: chosen.kind };
    } else {
        const big = Math.random() < 0.5;
        prop = big
            ? { type: "size", label: "Nagy alakzatok", rule: "a nagy alakzatok csoportjába", value: "big" }
            : { type: "size", label: "Kis alakzatok", rule: "a kis alakzatok csoportjába", value: "small" };
    }

    for (let attempt = 0; attempt < 50; attempt++) {
        const pool = [];
        for (let i = 0; i < 60; i++) {
            pool.push(randomShape());
        }

        const members = pool.filter(s => matches(s, prop));
        const nonMembers = pool.filter(s => !matches(s, prop));

        if (members.length < 4) continue;

        const uniqueMembers = [];
        const seen = new Set();
        for (const s of shuffle(members)) {
            const k = key(s);
            if (seen.has(k)) continue;
            seen.add(k);
            uniqueMembers.push(s);
            if (uniqueMembers.length >= 4) break;
        }

        if (uniqueMembers.length < 4) continue;

        const examples = uniqueMembers.slice(0, 3);
        const answer = uniqueMembers[3];

        const distractors = [];
        for (const s of shuffle(nonMembers)) {
            if (distractors.length === 2) break;
            if (distractors.some(d => key(d) === key(s))) continue;
            distractors.push(s);
        }

        if (distractors.length < 2) continue;

        const options = shuffle([answer, ...distractors]);

        return {
            type: "set-match",
            mode: "shapes",
            label: prop.label,
            rule: prop.rule,
            examples,
            options,
            answer: options.findIndex(o => key(o) === key(answer))
        };
    }

    throw new Error("Nem sikerült halmaz-feladatot generálni");
}

function buildTask(mode = "shapes") {
    if (mode === "numbers" || mode === "number-sets") {
        return buildNumberSetTask();
    }
    return buildShapeTask();
}

export function generateSetMatch(options = {}) {
    const { count = 5, mode = "shapes" } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        tasks.push(buildTask(mode));
    }
    return tasks;
}
