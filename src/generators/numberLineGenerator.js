function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function fmt(n) {
    return n < 0 ? `−${Math.abs(n)}` : String(n);
}

const CONTEXTS = ["plain", "temperature", "debt"];

function contextInfo(context) {
    if (context === "temperature") {
        return {
            emoji: "🌡️",
            unit: "°C",
            orientation: "vertical",
            min: -10,
            max: 10,
            gridStep: 1,
            labelStep: 5,
            readQuestion: "A hőmérőn a higanyszál a jelölt vonalig ér. Hány fok van?",
            placeQuestion: (value) => `Kattints a hőmérőn oda, ahol ${fmt(value)} °C van!`
        };
    }
    if (context === "debt") {
        return {
            emoji: "💰",
            unit: "Ft",
            orientation: "horizontal",
            min: -1000,
            max: 1000,
            gridStep: 100,
            labelStep: 500,
            readQuestion: "A bankszámla egyenlegét mutatja a nyíl. Mennyi az egyenleg? A mínuszadósságot, a plusz megtakarítást jelent.",
            placeQuestion: (value) => `Kattints a számegyenesen a ${fmt(value)} Ft helyére!`
        };
    }
    return {
        emoji: "🔢",
        unit: "",
        orientation: "horizontal",
        min: -50,
        max: 50,
        gridStep: 5,
        labelStep: 10,
        readQuestion: "Melyik számot jelöli a nyíl a számegyenesen?",
        placeQuestion: (value) => `Kattints a számegyenesen ide: ${fmt(value)}`
    };
}

function randGridValue(min, max, gridStep, labelStep) {
    const candidates = [];
    for (let v = min; v <= max; v += gridStep) {
        if (v % labelStep === 0) continue;
        candidates.push(v);
    }
    return candidates.length > 0 ? candidates[randInt(0, candidates.length - 1)] : min;
}

function buildOptions(value, count, min, max, gridStep) {
    const options = [value];
    const seen = new Set([value]);

    const candidates = shuffle([
        value + gridStep, value - gridStep, -value,
        value + 2 * gridStep, value - 2 * gridStep,
        value + 3 * gridStep, value - 3 * gridStep
    ]);
    for (const candidate of candidates) {
        if (options.length >= count) break;
        if (candidate < min || candidate > max || seen.has(candidate)) continue;
        seen.add(candidate);
        options.push(candidate);
    }

    let fill = min;
    while (options.length < count && fill <= max) {
        if (!seen.has(fill)) {
            seen.add(fill);
            options.push(fill);
        }
        fill += gridStep;
    }

    return shuffle(options);
}

function makeRead(context, min, max, gridStep, labelStep, interaction) {
    const info = contextInfo(context);
    const value = randGridValue(min, max, gridStep, labelStep);

    const task = {
        type: "number-line",
        mode: "read",
        context,
        orientation: info.orientation,
        min,
        max,
        gridStep,
        labelStep,
        value,
        answer: value,
        question: `${info.emoji} ${info.readQuestion}`,
        interaction
    };

    if (info.unit) task.unit = info.unit;
    if (interaction === "choice") task.options = buildOptions(value, 4, min, max, gridStep);

    return task;
}

function makePlace(context, min, max, gridStep, labelStep) {
    const info = contextInfo(context);
    const value = randGridValue(min, max, gridStep, labelStep);

    const task = {
        type: "number-line",
        mode: "place",
        context,
        orientation: info.orientation,
        min,
        max,
        gridStep,
        labelStep,
        value,
        answer: value,
        question: `${info.emoji} ${info.placeQuestion(value)}`,
        interaction: "click"
    };

    if (info.unit) task.unit = info.unit;

    return task;
}

export function generateNumberLine(options = {}) {

    const {
        count = 6,
        mode = "read",
        context = "plain",
        interaction = "choice"
    } = options;

    const tasks = [];
    const seen = new Set();

    let guard = 0;
    while (tasks.length < count && guard < count * 80) {
        guard++;

        const ctx = context === "mixed" ? CONTEXTS[randInt(0, CONTEXTS.length - 1)] : context;
        const resolvedMode = mode === "mixed" ? (Math.random() < 0.5 ? "read" : "place") : mode;

        const info = contextInfo(ctx);
        const min = options.min ?? info.min;
        const max = options.max ?? info.max;
        const gridStep = options.gridStep ?? info.gridStep;
        const labelStep = options.labelStep ?? info.labelStep;

        const task = resolvedMode === "place"
            ? makePlace(ctx, min, max, gridStep, labelStep)
            : makeRead(ctx, min, max, gridStep, labelStep, interaction);

        const key = `${task.mode}|${task.context}|${task.value}|${task.min}|${task.max}`;
        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push(task);
    }

    return tasks;
}