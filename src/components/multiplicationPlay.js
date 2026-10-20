import { createPlayGame, shuffle, weightedPick } from "./playEngine.js";
import { getPlayRecord } from "../profile/Profile.js";

const ALL_TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10];

const TABLE_SUFFIX = { 3: "as", 5: "ös", 6: "os", 8: "as" };

const UI = {
    postman: {
        choice: "📮 Csomagjáték",
        input: "📮 Számolás a postán",
        item: "📦",
        noun: "csomag",
        done: "📮 Kézbesítve!"
    },
    racing: {
        choice: "🏎️ Száguldás",
        input: "🏎️ Számolás a pályán",
        item: "🏁",
        noun: "kör",
        done: "🏁 Célban értél!"
    },
    football: {
        choice: "⚽ Góljáték",
        input: "⚽ Számolás a meccsen",
        item: "⚽",
        noun: "gól",
        done: "⚽ Vége a meccsnek!"
    },
    cooking: {
        choice: "🍳 Tálkajáték",
        input: "🍳 Számolás a konyhában",
        item: "🥞",
        noun: "tálka",
        done: "🍳 Tálkák készen!"
    },
    animals: {
        choice: "🦁 Etetőjáték",
        input: "🦁 Számolás az állatkertben",
        item: "🦒",
        noun: "állat",
        done: "🦁 Mind meget!"
    },
    space: {
        choice: "🤖 Bolygójáték",
        input: "🤖 Számolás az űrben",
        item: "🪐",
        noun: "bolygó",
        done: "🤖 Űrhajó indul!"
    },
    tram: {
        choice: "🚋 Utasjáték",
        input: "🚋 Számolás a villamoson",
        item: "🧍",
        noun: "utas",
        done: "🚋 Indul a villamos!"
    }
};

function tableName(t) {
    return `${t}-${TABLE_SUFFIX[t] ?? "es"}`;
}

function tableLabel(tables) {
    if (tables.length === 0) return "";
    if (tables.length === 1) return `a ${tableName(tables[0])} táblán`;
    if (tables.length === ALL_TABLES.length) return "minden táblán";
    return "a kiválasztott táblákon";
}

function subtitleWhere(tables) {
    if (tables.length === 1) return `a ${tableName(tables[0])} táblán`;
    if (tables.length === ALL_TABLES.length) return "minden táblán";
    if (tables.length <= 3) {
        const names = tables.map(tableName);
        return names.length === 2
            ? `a ${names[0]} és ${names[1]} táblán`
            : `a ${names[0]}, ${names[1]} és ${names[2]} táblán`;
    }
    return "a kiválasztott táblákon";
}

function factKey(a, b) {
    return `${a}x${b}`;
}

function buildPool(tables) {
    const pool = [];
    for (const t of tables) {
        for (let n = 2; n <= 10; n++) {
            const a = Math.min(t, n);
            const b = Math.max(t, n);
            if (pool.some(f => f.a === a && f.b === b)) continue;
            pool.push({ a, b, answer: a * b });
        }
    }
    return pool;
}

function buildOptions(fact, tables) {
    const answer = fact.answer;
    const candidates = [];
    for (const t of tables) candidates.push(answer + t, answer - t);
    candidates.push(answer + 1, answer - 1, answer + 10, answer - 10, answer + 2, answer - 2, answer * 2, Math.floor(answer / 2));

    const options = [answer];
    for (const c of candidates) {
        if (options.length >= 4) break;
        if (!Number.isInteger(c) || c <= 0 || c > 150) continue;
        if (options.includes(c)) continue;
        options.push(c);
    }
    while (options.length < 4) {
        const c = answer + options.length + 3;
        if (!options.includes(c)) options.push(c);
    }
    return shuffle(options);
}

export function renderMultiplicationPlay(step, root, next, progress) {
    const mode = step.mode === "input" ? "input" : "choice";
    const isInput = mode === "input";

    return createPlayGame({
        recordMode: mode,
        ui: UI,
        title: (t) => isInput ? t.input : t.choice,
        levels: [],
        defaultLevel: null,
        selection: {
            all: ALL_TABLES,
            buttonLabel: (t) => `${t}×`,
            label: tableLabel,
            best: (chosen) => {
                let best = 0;
                for (const t of chosen) {
                    const rec = getPlayRecord(mode, String(t));
                    if (rec && rec.best > best) best = rec.best;
                }
                return best;
            }
        },
        subtitleIdle: isInput
            ? "🔢 Szorzótábla-játék · egy perc, beírás"
            : "🔢 Szorzótábla-játék · egy perc, négy gomb",
        lead: isInput
            ? "Melyik szorzótáblákat gyakorolnád? Egy perc alatt annyit írsz be, amennyit bírsz!"
            : "Melyik szorzótáblákat gyakorolnád? Egy perc alatt annyit találsz el, amennyit bírsz!",
        subtitleInGame: (state) => `🔢 Szorzótábla-játék · ${subtitleWhere(state.tables)}`,

        startRound: (state) => {
            state.tables = ALL_TABLES.filter(t => state.chosen.has(t));
            state.pool = buildPool(state.tables);
            for (const f of state.pool) state.weights.set(factKey(f.a, f.b), 1);
            state.perTable = new Map();
        },

        nextTask: (state) => {
            const fact = weightedPick(
                state.pool,
                f => state.weights.get(factKey(f.a, f.b)) ?? 1,
                state.last
            );
            state.last = fact;
            return {
                key: factKey(fact.a, fact.b),
                missedKey: factKey(fact.a, fact.b),
                display: `${fact.a} × ${fact.b} = ?`,
                answer: fact.answer,
                options: isInput ? null : buildOptions(fact, state.tables),
                input: isInput,
                a: fact.a,
                b: fact.b
            };
        },

        onCorrect: (state, task) => {
            for (const t of new Set([task.a, task.b])) {
                state.perTable.set(t, (state.perTable.get(t) ?? 0) + 1);
            }
        },

        successMessage: (task, t) => `${t.item} ${task.a} × ${task.b} = ${task.answer}!`,
        failMessage: (task) => `💡 ${task.a} × ${task.b} = ${task.answer}. Jöjj a következő!`,
        correctDelay: () => isInput ? 450 : 650,
        wrongDelay: () => isInput ? 1200 : 1600,

        recordEntries: (state) => state.perTable,
        recordTablesLine: (record) => `Új rekord a tábláknál: ${record.newTables.map(tableName).join(", ")}`,
        recordWhereNew: (state) => ` ${tableLabel(state.tables)}`,
        recordWhereBest: (state) => ` ${tableLabel(state.tables)}`,
        sortMissed: (x, y) => x.a - y.a || x.b - y.b,
        chipText: (task) => `${task.a} × ${task.b}`,
        allGoodText: "Minden szorzatot elsőre találtál! 🌟"
    }, step, root, next, progress);
}
