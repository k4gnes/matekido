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

function describeExact(h, m) {
    if (m === 0) return describeTime(h, 0);
    if (h === 0 && m === 0) return "éjfél";
    return `${daypart(h)} ${HOUR_WORDS[displayHour(h)]} óra ${m} perc`;
}

export function generateTime(options = {}) {

    const { count = 5, minHour = 0, maxHour = 23, quarter = false, exact = false } = options;

    const minutes = exact
        ? Array.from({ length: 59 }, (_, i) => i + 1)
        : (quarter ? [0, 15, 30, 45] : [0, 30]);

    const describe = exact ? describeExact : describeTime;

    const times = [];
    for (let h = minHour; h <= maxHour; h++) {
        for (const m of minutes) {
            times.push({ h, m });
        }
    }

    const descPool = [...new Set(times.map(t => describe(t.h, t.m)))];

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const { h, m } = times[Math.floor(Math.random() * times.length)];
        const correct = describe(h, m);

        let nearMiss = [];
        let forbidden = [correct];

        if (exact) {
            const siblingMinutes = [m - 5, m + 5, m - 10, m + 10].map(x => ((x % 60) + 60) % 60)
                .filter(x => x !== m && x !== 0);
            nearMiss = [
                ...siblingMinutes.map(sm => `${daypart(h)} ${HOUR_WORDS[displayHour(h)]} óra ${sm} perc`),
                ...([-1, 1].map(d => h + d).filter(hh => hh >= minHour && hh <= maxHour).map(hh => describe(hh, m)))
            ];
        } else if (m !== 0) {
            const next = HOUR_WORDS[(displayHour(h) % 12) + 1];
            nearMiss = [`negyed ${next}`, `fél ${next}`, `háromnegyed ${next}`, describe(h, 0)];
        } else {
            const twin = (h + 12) % 24;
            if (twin >= minHour && twin <= maxHour) {
                forbidden.push(describe(twin, 0));
            }
        }

        nearMiss = [...new Set(nearMiss)].filter(d => !forbidden.includes(d));
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
