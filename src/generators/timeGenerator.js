const HOUR_WORDS = ["", "egy", "kettő", "három", "négy", "öt", "hat", "hét", "nyolc", "kilenc", "tíz", "tizenegy", "tizenkettő"];

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
    if (m === 30) {
        const next = (displayHour(h) % 12) + 1;
        return `fél ${HOUR_WORDS[next]}`;
    }
    if (h === 0) return "éjfél";
    if (h === 12) return "dél";
    return `${daypart(h)} ${HOUR_WORDS[displayHour(h)]} óra`;
}

export function generateTime(options = {}) {

    const { count = 5, minHour = 0, maxHour = 23 } = options;

    const times = [];
    for (let h = minHour; h <= maxHour; h++) {
        for (const m of [0, 30]) {
            times.push({ h, m });
        }
    }

    const descPool = [...new Set(times.map(t => describeTime(t.h, t.m)))];

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const { h, m } = times[Math.floor(Math.random() * times.length)];
        const correct = describeTime(h, m);

        const distractors = shuffle([...descPool]).filter(d => d !== correct).slice(0, 3);

        const options = shuffle([
            { text: correct, correct: true },
            ...distractors.map(d => ({ text: d, correct: false }))
        ]);

        tasks.push({
            type: "time",
            hour: h,
            minute: m,
            answer: correct,
            options
        });
    }

    return tasks;
}
