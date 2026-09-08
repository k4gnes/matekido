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
    { kind: "circle", label: "Körök", rule: "a körök közé?" },
    { kind: "triangle", label: "Háromszögek", rule: "a háromszögek közé?" },
    { kind: "square", label: "Négyzetek", rule: "a négyzetek közé?" },
    { kind: "rectangle", label: "Téglalapok", rule: "a téglalapok közé?" }
];

const COLOR_PROPS = [
    { name: "Piros", hex: "#ef4444", rule: "a piros alakzatok közé?" },
    { name: "Kék", hex: "#3b82f6", rule: "a kék alakzatok közé?" },
    { name: "Zöld", hex: "#22c55e", rule: "a zöld alakzatok közé?" },
    { name: "Sárga", hex: "#f59e0b", rule: "a sárga alakzatok közé?" },
    { name: "Lila", hex: "#a855f7", rule: "a lila alakzatok közé?" }
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

function buildTask() {
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
            ? { type: "size", label: "Nagy alakzatok", rule: "a nagy alakzatok közé?", value: "big" }
            : { type: "size", label: "Kis alakzatok", rule: "a kis alakzatok közé?", value: "small" };
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
            label: prop.label,
            rule: prop.rule,
            examples,
            options,
            answer: options.findIndex(o => key(o) === key(answer))
        };
    }

    throw new Error("Nem sikerült halmaz-feladatot generálni");
}

export function generateSetMatch(options = {}) {
    const { count = 5 } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        tasks.push(buildTask());
    }
    return tasks;
}