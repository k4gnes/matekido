const HOUR_WORDS = ["", "egy", "kettő", "három", "négy", "öt", "hat", "hét", "nyolc", "kilenc", "tíz", "tizenegy", "tizenkettő"];

const QUARTER_PREFIXES = { 15: "negyed", 30: "fél", 45: "háromnegyed" };

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function displayHour(h) {
    const hour12 = h % 12;
    return hour12 === 0 ? 12 : hour12;
}

function daypart(h) {
    if (h <= 4) return "hajnali";
    if (h <= 8) return "reggeli";
    if (h <= 11) return "délelőtti";
    if (h <= 17) return "délutáni";
    if (h <= 21) return "esti";
    return "éjszakai";
}

export function describeTime(h, m) {
    if (QUARTER_PREFIXES[m]) {
        const next = (displayHour(h) % 12) + 1;
        return `${QUARTER_PREFIXES[m]} ${HOUR_WORDS[next]}`;
    }
    if (h === 0) return "éjfél";
    if (h === 12) return "dél";
    return `${daypart(h)} ${HOUR_WORDS[displayHour(h)]} óra`;
}

export function generateTime(options = {}) {

    const { count = 5, minHour = 0, maxHour = 23, quarter = false } = options;

    const minutes = quarter ? [0, 15, 30, 45] : [0, 30];

    const times = [];
    for (let h = minHour; h <= maxHour; h++) {
        for (const m of minutes) {
            times.push({ h, m });
        }
    }

    const descPool = [...new Set(times.map(t => describeTime(t.h, t.m)))];

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const { h, m } = times[Math.floor(Math.random() * times.length)];
        const correct = describeTime(h, m);

        let siblings = [];
        let forbidden = [correct];
        if (m !== 0) {
            const next = HOUR_WORDS[(displayHour(h) % 12) + 1];
            siblings = [`negyed ${next}`, `fél ${next}`, `háromnegyed ${next}`, describeTime(h, 0)];
        } else {
            const twin = (h + 12) % 24;
            if (twin >= minHour && twin <= maxHour) {
                forbidden.push(describeTime(twin, 0));
            }
        }

        const nearMiss = [...new Set(siblings)].filter(d => !forbidden.includes(d));
        const rest = shuffle(descPool.filter(d => !forbidden.includes(d) && !nearMiss.includes(d)));

        const distractors = shuffle([...nearMiss, ...rest]).slice(0, 3);

        const choices = shuffle([
            { text: correct, correct: true },
            ...distractors.map(d => ({ text: d, correct: false }))
        ]);

        tasks.push({
            type: "time",
            hour: h,
            minute: m,
            answer: correct,
            options: choices
        });
    }

    return tasks;
}
