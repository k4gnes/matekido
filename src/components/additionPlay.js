import { createPlayGame, shuffle, weightedPick } from "./playEngine.js";

const RECORD_MODE = "addition-play";

const UI = {
    postman: { title: "📮 Számolós posta", item: "📦", noun: "csomag", done: "📮 Kézbesítve!" },
    racing: { title: "🏎️ Számolás a pályán", item: "🏁", noun: "kör", done: "🏁 Célban értél!" },
    football: { title: "⚽ Góljáték", item: "⚽", noun: "gól", done: "⚽ Vége a meccsnek!" },
    cooking: { title: "🍳 Tálkajáték", item: "🥞", noun: "tálka", done: "🍳 Tálkák készen!" },
    animals: { title: "🦁 Etetőjáték", item: "🦒", noun: "állat", done: "🦁 Mind meget!" },
    space: { title: "🤖 Bolygójáték", item: "🪐", noun: "bolygó", done: "🤖 Űrhajó indul!" },
    tram: { title: "🚋 Utasjáték", item: "🧍", noun: "utas", done: "🚋 Indul a villamos!" }
};

const LEVELS = [
    { id: "ten", label: "🌱 Tízesen belül" },
    { id: "bridge", label: "🪜 Tízesátlépés 20-ig" }
];

function levelLabel(id) {
    const level = LEVELS.find(l => l.id === id);
    return level ? level.label : "";
}

function pairKey(a, b) {
    return `${a}+${b}`;
}

function buildPool(level) {
    const pool = [];
    const min = level === "ten" ? 1 : 2;
    for (let a = min; a <= 9; a++) {
        for (let b = min; b <= 9; b++) {
            const sum = a + b;
            if (level === "ten" && sum > 10) continue;
            if (level === "bridge" && sum <= 10) continue;
            pool.push({ a, b, answer: sum });
        }
    }
    return pool;
}

function buildOptions(pair) {
    const answer = pair.answer;
    const candidates = [answer + 1, answer - 1, answer + 2, answer - 2, answer + 10, answer - 10];

    const options = [answer];
    for (const value of shuffle(candidates)) {
        if (options.length >= 4) break;
        if (!Number.isInteger(value) || value <= 0 || value > 30) continue;
        if (options.includes(value)) continue;
        options.push(value);
    }
    while (options.length < 4) {
        const filler = answer + options.length + 3;
        if (!options.includes(filler)) options.push(filler);
    }
    return shuffle(options);
}

function bridgeBreakdown(pair) {
    const base = Math.max(pair.a, pair.b);
    const other = Math.min(pair.a, pair.b);
    const complement = 10 - base;
    const remainder = other - complement;
    return `${base} + ${complement} + ${remainder} = ${pair.answer}`;
}

export function renderAdditionPlay(step, root, next, progress) {
    return createPlayGame({
        recordMode: RECORD_MODE,
        ui: UI,
        levels: LEVELS,
        defaultLevel: "bridge",
        wideLevels: true,
        subtitleIdle: "🔢 Egyperces játék · összeadás",
        lead: "Mit gyakorolj? Egy perc alatt annyi összeadást oldasz meg helyesen, amennyit bírsz!",
        subtitleInGame: (state) => `🔢 Egyperces játék · ${levelLabel(state.level)}`,

        startRound: (state) => {
            state.pool = buildPool(state.level);
            for (const p of state.pool) state.weights.set(pairKey(p.a, p.b), 1);
        },

        nextTask: (state) => {
            const pair = weightedPick(
                state.pool,
                p => state.weights.get(pairKey(p.a, p.b)) ?? 1,
                state.last
            );
            state.last = pair;
            return {
                key: pairKey(pair.a, pair.b),
                missedKey: pairKey(pair.a, pair.b),
                display: `${pair.a} + ${pair.b} = ?`,
                answer: pair.answer,
                options: buildOptions(pair),
                a: pair.a,
                b: pair.b
            };
        },

        successMessage: (task, ui) => `${ui.item} ${task.a} + ${task.b} = ${task.answer}!`,
        failMessage: (task, state) => state.level === "bridge"
            ? `${task.a} + ${task.b} → ${bridgeBreakdown(task)}`
            : `${task.a} + ${task.b} = ${task.answer}`,
        correctDelay: () => 650,
        wrongDelay: () => 1700,
        chipText: (task) => `${task.a} + ${task.b}`,
        allGoodText: "Minden összeadást elsőre eltaláltál! 🌟",
        recordWhereNew: (state) => ` (${levelLabel(state.level)})`
    }, step, root, next, progress);
}
