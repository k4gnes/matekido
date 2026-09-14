function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function makeOptions(answer, min, max, count = 4) {
    const options = [answer];
    const seen = new Set([answer]);
    const deltas = [15, -15, 30, -30, 60, -60, 5, -5];
    for (const d of deltas) {
        if (options.length >= count) break;
        const v = answer + d;
        if (v >= min && v <= max && !seen.has(v)) {
            seen.add(v);
            options.push(v);
        }
    }
    for (let v = min; v <= max && options.length < count; v++) {
        if (!seen.has(v)) {
            seen.add(v);
            options.push(v);
        }
    }
    return shuffle(options);
}

function descHours(hours) {
    const words = {
        1: "egy", 2: "két", 3: "három", 4: "négy", 5: "öt",
        6: "hat", 7: "hét", 8: "nyolc", 9: "kilenc", 10: "tíz",
        11: "tizenegy", 12: "tizenkettő", 24: "huszonnégy"
    };
    return words[hours] ?? String(hours);
}

function buildHoursTask() {
    const hours = pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const answer = hours * 60;
    const task = {
        type: "time-convert",
        direction: "h2m",
        hours,
        question: `${descHours(hours)} óra = ? perc`,
        answer
    };
    return task;
}

function buildMinutesTask() {
    const hours = pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const minutes = hours * 60;
    const answer = hours;
    const task = {
        type: "time-convert",
        direction: "m2h",
        hours,
        question: `${minutes} perc = ? óra`,
        answer
    };
    return task;
}

export function generateTimeConvert(options = {}) {
    const { count = 6, interaction = "mixed", direction = "mixed" } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        const dir = direction === "mixed" ? pick(["h2m", "m2h"]) : direction;
        const task = dir === "h2m" ? buildHoursTask() : buildMinutesTask();

        const mode = interaction === "mixed" ? pick(["choice", "input"]) : interaction;
        task.interaction = mode;

        if (mode === "choice") {
            const max = task.direction === "h2m" ? 900 : 12;
            const min = task.direction === "h2m" ? 30 : 1;
            task.options = makeOptions(task.answer, min, max);
        }

        tasks.push(task);
    }
    return tasks;
}