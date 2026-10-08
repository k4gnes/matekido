function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const LABELS = ["Hé", "Kedd", "Sze", "Cs", "Pte"];

const CONTEXTS = {
    postman: "📦 A postás csomagjai naponta:",
    racing: "🏁 A boxutcai megállások naponta:",
    football: "⚽ A napi edzésadatok:",
    cooking: "🍳 A napi rendelések:",
    animals: "🦁 Az állatok napi látogatói:",
    space: "🚀 Az űrállomás napi adatai:",
    tram: "🚋 A villamos napi utasai:"
};

function makeOptions(answer, naturals) {
    const options = new Set([answer]);
    for (const candidate of naturals) {
        if (options.size >= 4) break;
        if (Number.isInteger(candidate) && candidate >= 1 && candidate <= 1200 && candidate !== answer) {
            options.add(candidate);
        }
    }
    let guard = 0;
    while (options.size < 4 && guard < 60) {
        guard++;
        const delta = random(2, Math.max(3, Math.round(answer / 5)));
        const candidate = answer + (Math.random() < 0.5 ? -1 : 1) * delta;
        if (candidate >= 1 && candidate <= 1200) options.add(candidate);
    }
    let k = 1;
    while (options.size < 4 && k < 400) {
        if (answer + k <= 1200) options.add(answer + k);
        if (answer - k >= 1) options.add(answer - k);
        k++;
    }
    return shuffle([...options]);
}

function buildValues(min, max, size) {
    for (let attempt = 0; attempt < 50; attempt++) {
        const values = [];
        for (let i = 0; i < size - 1; i++) values.push(random(min, max));
        const rest = values.reduce((s, v) => s + v, 0);
        const last = min + ((size - ((rest + min) % size)) % size);
        if (last <= max) {
            values.push(last);
            return shuffle(values);
        }
    }
    const values = Array(size).fill(min + (size - (min % size)) % size);
    return values;
}

function buildMissingPair(min, max, size) {
    for (let attempt = 0; attempt < 80; attempt++) {
        const avg = random(min, max);
        const span = Math.max(2, Math.floor(avg / 3));
        const values = [];
        let rest = 0;
        let valid = true;
        for (let i = 0; i < size - 1; i++) {
            const value = avg + random(-span, span);
            if (value < 1) {
                valid = false;
                break;
            }
            values.push(value);
            rest += value;
        }
        if (!valid) continue;
        const missing = avg * size - rest;
        if (missing < 1 || missing > 1000 || missing === avg) continue;
        values.push(missing);
        const order = shuffle([...Array(size).keys()]);
        return {
            avg,
            values: order.map(i => values[i]),
            missingIndex: order.indexOf(size - 1)
        };
    }
    return null;
}

function buildTask(options, world) {
    const {
        mode = "avg",
        display = "table",
        interaction = "input",
        size = 4,
        min = 1,
        max = 100
    } = options;

    let values;
    let avg;
    let missingIndex;

    if (mode === "missing") {
        const pair = buildMissingPair(min, max, size);
        if (!pair) return null;
        values = pair.values;
        avg = pair.avg;
        missingIndex = pair.missingIndex;
    } else {
        values = buildValues(min, max, size);
        avg = values.reduce((s, v) => s + v, 0) / size;
    }

    const sum = values.reduce((s, v) => s + v, 0);
    const answer = mode === "missing" ? values[missingIndex] : avg;

    const naturals = mode === "missing"
        ? [avg * size, values.filter((_, i) => i !== missingIndex).reduce((s, v) => s + v, 0), avg]
        : [sum, Math.max(...values), Math.min(...values)];

    const task = {
        mode,
        display,
        interaction,
        values,
        labels: LABELS.slice(0, size),
        avg,
        answer,
        question: mode === "missing"
            ? `Az átlag ${avg}. Milyen szám hiányzik?`
            : "Mennyi az átlag?",
        context: CONTEXTS[world] ?? "📊 Napi adatok:"
    };

    if (mode === "missing") task.missingIndex = missingIndex;
    if (interaction === "choice") task.options = makeOptions(answer, naturals);

    return task;
}

export function generateAverage(options = {}) {
    const { count = 6, world } = options;

    const tasks = [];
    const seen = new Set();
    let attempts = 0;

    while (tasks.length < count && attempts < 400) {
        attempts++;
        const task = buildTask(options, world);
        if (!task) continue;
        const signature = task.values.join(",");
        if (seen.has(signature)) continue;
        seen.add(signature);
        tasks.push(task);
    }

    return tasks;
}
