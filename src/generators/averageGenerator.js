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

function medianOf(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function modeOf(values) {
    const counts = new Map();
    for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
    let best = null;
    let bestCount = 0;
    for (const [value, count] of counts) {
        if (count > bestCount) {
            best = value;
            bestCount = count;
        }
    }
    return best;
}

// különböző értékek, és az összeg osztható az adatok számával
function buildMedianValues(min, max, size) {
    const values = [];
    const used = new Set();
    let guard = 0;
    while (values.length < size - 1 && guard < 200) {
        guard++;
        const value = random(min, max);
        if (used.has(value)) continue;
        used.add(value);
        values.push(value);
    }
    const rest = values.reduce((s, v) => s + v, 0);
    const need = (size - (rest % size)) % size;
    const candidates = [];
    for (let value = min; value <= max; value++) {
        if (value % size === need % size && !used.has(value)) candidates.push(value);
    }
    if (!candidates.length) return null;
    values.push(candidates[Math.floor(Math.random() * candidates.length)]);
    return shuffle(values);
}

// egy érték ismétlődik a legtöbbször, az összeg osztható az adatok számával
function buildModeValues(min, max, size) {
    for (let attempt = 0; attempt < 60; attempt++) {
        const modeValue = random(min, max);
        const first = random(min, max);
        const second = random(min, max);
        if (first === second) continue;
        const values = [];
        for (let i = 0; i < size - 2; i++) values.push(modeValue);
        values.push(first, second);
        const sum = values.reduce((s, v) => s + v, 0);
        if (sum % size !== 0) continue;
        return shuffle(values);
    }
    return null;
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
    } else if (mode === "median") {
        values = buildMedianValues(min, max, size);
        if (!values) return null;
        avg = values.reduce((s, v) => s + v, 0) / size;
    } else if (mode === "mode") {
        values = buildModeValues(min, max, size);
        if (!values) return null;
        avg = values.reduce((s, v) => s + v, 0) / size;
    } else {
        values = buildValues(min, max, size);
        avg = values.reduce((s, v) => s + v, 0) / size;
    }

    const sum = values.reduce((s, v) => s + v, 0);
    const sorted = [...values].sort((a, b) => a - b);

    let answer;
    let question;
    let naturals;

    if (mode === "missing") {
        answer = values[missingIndex];
        question = `Az átlag ${avg}. Milyen szám hiányzik?`;
        naturals = [avg * size, values.filter((_, i) => i !== missingIndex).reduce((s, v) => s + v, 0), avg];
    } else if (mode === "median") {
        answer = medianOf(values);
        question = "Mekkora a medián?";
        const mid = Math.floor(sorted.length / 2);
        naturals = [sorted[Math.max(0, mid - 1)], sorted[Math.min(sorted.length - 1, mid + 1)], sorted[0]];
    } else if (mode === "mode") {
        answer = modeOf(values);
        question = "Mekkora a módusz?";
        naturals = values.filter(v => v !== answer);
    } else {
        answer = avg;
        question = "Mennyi az átlag?";
        naturals = [sum, Math.max(...values), Math.min(...values)];
    }

    const task = {
        mode,
        display,
        interaction,
        values,
        labels: LABELS.slice(0, values.length),
        avg,
        answer,
        question,
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
