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

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const DURATIONS = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 20, 30, 40,
    60, 70, 75, 90, 100, 120];

function fmtTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h} óra ${m} perc`;
}

function fmtDur(minutes) {
    if (minutes < 60) return `${minutes} perc`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h} óra` : `${h} óra ${m} perc`;
}

function makeNumberOptions(correct) {
    const seen = new Set([correct]);
    const options = [correct];
    for (const d of [5, -5, 10, -10, 15, -15, 20, -20, 30, -30]) {
        if (options.length >= 4) break;
        const v = correct + d;
        if (v >= 5 && !seen.has(v)) {
            seen.add(v);
            options.push(v);
        }
    }
    return shuffle(options);
}

function makeTimeOptions(correct) {
    const seen = new Set([correct]);
    const options = [correct];
    for (const d of [5, -5, 10, -10, 15, -15, 20, -20, 30, -30]) {
        if (options.length >= 4) break;
        const v = correct + d;
        if (v >= 0 && v <= 1439 && !seen.has(v)) {
            seen.add(v);
            options.push(v);
        }
    }
    return shuffle(options);
}

function pickStart(duration) {
    const lastSlot = Math.floor((1320 - duration) / 5);
    return 5 * randInt(72, lastSlot);
}

function buildDurationTask() {
    const duration = pick(DURATIONS);
    const start = pickStart(duration);
    const end = start + duration;

    return {
        mode: "duration",
        start,
        end,
        duration,
        answer: duration,
        options: makeNumberOptions(duration),
        question: `Egy esemény ${fmtTime(start)}kor kezdődött, és ${fmtTime(end)}kor ért véget. Hány percig tartott?`
    };
}

function buildEndTask() {
    const duration = pick(DURATIONS);
    const start = pickStart(duration);
    const end = start + duration;

    return {
        mode: "end",
        start,
        end,
        duration,
        answer: end,
        options: makeTimeOptions(end),
        question: `Egy esemény ${fmtTime(start)}kor kezdődött, és ${fmtDur(duration)}ig tartott. Mikor ért véget?`
    };
}

function buildStartTask() {
    const duration = pick(DURATIONS);
    const start = pickStart(duration);
    const end = start + duration;

    return {
        mode: "start",
        start,
        end,
        duration,
        answer: start,
        options: makeTimeOptions(start),
        question: `Egy esemény ${fmtTime(end)}kor ért véget, és ${fmtDur(duration)}ig tartott. Mikor kezdődött?`
    };
}

export function generateElapsedTime(options = {}) {
    const { count = 8, mode = "mixed" } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        const m = mode === "mixed"
            ? pick(["duration", "duration", "start", "end"])
            : mode;

        if (m === "start") {
            tasks.push({ type: "elapsed-time", ...buildStartTask() });
        } else if (m === "end") {
            tasks.push({ type: "elapsed-time", ...buildEndTask() });
        } else {
            tasks.push({ type: "elapsed-time", ...buildDurationTask() });
        }
    }
    return tasks;
}