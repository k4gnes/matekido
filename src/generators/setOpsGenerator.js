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

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

function formatSet(arr) {
    const unique = Array.from(new Set(arr)).sort((a, b) => a - b);
    if (unique.length === 0) return "{ }";
    return "{" + unique.join(",") + "}";
}

function buildTask() {
    const type = pick(["union", "intersection", "complement"]);
    if (type === "union") {
        const base = randomInt(4);
        const aCount = 3 + randomInt(2);
        const bCount = 3 + randomInt(2);
        const A = [];
        const B = [];
        for (let i = 0; i < aCount; i++) A.push(base + i);
        for (let i = 0; i < bCount; i++) B.push(base + 1 + i);
        const union = Array.from(new Set([...A, ...B])).sort((x, y) => x - y);
        const inter = Array.from(new Set(A.filter(x => B.includes(x)))).sort((x, y) => x - y);
        const onlyA = Array.from(new Set(A.filter(x => !B.includes(x)))).sort((x, y) => x - y);
        const onlyB = Array.from(new Set(B.filter(x => !A.includes(x)))).sort((x, y) => x - y);
        const correct = { text: formatSet(union), correct: true };
        const wrongs = [
            { text: formatSet(inter), correct: false },
            { text: formatSet(onlyA), correct: false },
            { text: formatSet(onlyB), correct: false }
        ].filter(w => w.text !== correct.text);
        while (wrongs.length < 3) {
            const extra = [];
            for (let i = 0; i < union.length + 1; i++) extra.push(base + randomInt(6));
            const cand = formatSet(extra.filter(x => !union.includes(x)));
            if (cand !== correct.text && !wrongs.some(w => w.text === cand)) {
                wrongs.push({ text: cand, correct: false });
            }
        }
        const options = shuffle([correct, ...wrongs.slice(0, 3)]);
        return { type: "set-ops", mode: "union", question: `Adott A=${formatSet(A)}, B=${formatSet(B)}. Melyik az A ∪ B halmaz?`, options };
    } else if (type === "intersection") {
        const base = randomInt(5);
        const A = [];
        const B = [];
        for (let i = 0; i < 4; i++) A.push(base + i);
        for (let i = 0; i < 4; i++) B.push(base + 2 + i);
        const inter = Array.from(new Set(A.filter(x => B.includes(x)))).sort((x, y) => x - y);
        const union = Array.from(new Set([...A, ...B])).sort((x, y) => x - y);
        const onlyA = Array.from(new Set(A.filter(x => !B.includes(x)))).sort((x, y) => x - y);
        const onlyB = Array.from(new Set(B.filter(x => !A.includes(x)))).sort((x, y) => x - y);
        const correct = { text: formatSet(inter), correct: true };
        const wrongs = [
            { text: formatSet(union), correct: false },
            { text: formatSet(onlyA), correct: false },
            { text: formatSet(onlyB), correct: false }
        ].filter(w => w.text !== correct.text);
        while (wrongs.length < 3) {
            const extra = [];
            for (let i = 0; i < 3; i++) extra.push(base + randomInt(8));
            const cand = formatSet(extra);
            if (cand !== correct.text && !wrongs.some(w => w.text === cand)) {
                wrongs.push({ text: cand, correct: false });
            }
        }
        const options = shuffle([correct, ...wrongs.slice(0, 3)]);
        return { type: "set-ops", mode: "intersection", question: `Adott A=${formatSet(A)}, B=${formatSet(B)}. Melyik az A ∩ B halmaz?`, options };
    } else {
        const base = randomInt(3);
        const U = [];
        for (let i = 0; i < 6; i++) U.push(base + i);
        const A = [];
        const countA = 2 + randomInt(3);
        for (let i = 0; i < countA; i++) A.push(U[i]);
        const comp = Array.from(new Set(U.filter(x => !A.includes(x)))).sort((x, y) => x - y);
        const correct = { text: formatSet(comp), correct: true };
        const wrongs = [
            { text: formatSet(A), correct: false },
            { text: formatSet(U), correct: false },
            { text: "{ }", correct: false }
        ].filter(w => w.text !== correct.text);
        while (wrongs.length < 3) {
            const extra = [];
            for (let i = 0; i < 4; i++) extra.push(base + randomInt(10));
            const cand = formatSet(extra.filter(x => !U.includes(x)));
            if (cand !== correct.text && !wrongs.some(w => w.text === cand)) {
                wrongs.push({ text: cand, correct: false });
            }
        }
        const options = shuffle([correct, ...wrongs.slice(0, 3)]);
        return { type: "set-ops", mode: "complement", question: `Alaphalmaz U=${formatSet(U)}, A=${formatSet(A)}. Melyik az A komplementere (Ā)?`, options };
    }
}

export function generateSetOps(options = {}) {
    const { count = 5 } = options;
    const tasks = [];
    const seen = new Set();
    const dedupeKey = (task) => task.question + "|" + task.options.map(o => o.text).sort().join(",");
    for (let i = 0; i < count; i++) {
        let task = buildTask();
        let key = dedupeKey(task);
        let tries = 0;
        while (seen.has(key) && tries < 20) {
            task = buildTask();
            key = dedupeKey(task);
            tries++;
        }
        seen.add(key);
        tasks.push(task);
    }
    return tasks;
}
