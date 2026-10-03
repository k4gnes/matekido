import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { markCorrect } from "./ui/feedback.js";
import { getActiveWorld, getPlayRecord, recordPlayResult } from "../profile/Profile.js";

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

function shuffle(list) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
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

function pickFact(pool, weights, avoid) {
    let total = 0;
    for (const f of pool) {
        if (f === avoid) continue;
        total += weights.get(factKey(f.a, f.b));
    }
    let roll = Math.random() * total;
    for (const f of pool) {
        if (f === avoid) continue;
        roll -= weights.get(factKey(f.a, f.b));
        if (roll <= 0) return f;
    }
    return pool.find(f => f !== avoid) ?? pool[0];
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

    const ac = new AbortController();
    const world = getActiveWorld();
    const ui = UI[world] ?? UI.postman;

    const mode = step.mode === "input" ? "input" : "choice";
    const duration = Number.isFinite(step.duration) && step.duration > 0 ? Math.min(step.duration, 300) : 60;
    const preset = Array.isArray(step.defaultTables)
        ? step.defaultTables.filter(t => ALL_TABLES.includes(t))
        : [];

    root.replaceChildren();

    const card = createCard();
    if (progress) card.append(progress);

    const title = document.createElement("h1");
    title.className = "mult-play-title";
    title.textContent = mode === "input" ? ui.input : ui.choice;
    card.append(title);

    const subtitle = document.createElement("p");
    subtitle.className = "mult-play-subtitle";
    const subtitleIdle = mode === "input"
        ? "🔢 Szorzótábla-játék · egy perc, beírás"
        : "🔢 Szorzótábla-játék · egy perc, négy gomb";
    subtitle.textContent = subtitleIdle;
    card.append(subtitle);

    const body = document.createElement("div");
    body.className = "mult-play-body";
    card.append(body);

    const message = createMessageBox();
    card.append(message.element);

    root.append(card);

    const state = {
        chosen: new Set(preset),
        tables: [],
        pool: [],
        weights: new Map(),
        correct: 0,
        perTable: new Map(),
        missed: new Map(),
        current: null,
        last: null,
        locked: true,
        over: false,
        ended: false,
        remaining: duration * 1000
    };

    let timerId = null;
    let lastTick = 0;
    let timerLabel = null;
    let timerBar = null;
    let timerFill = null;
    let scoreLabel = null;
    let slot = null;

    function stopTimer() {
        if (timerId !== null) {
            clearInterval(timerId);
            timerId = null;
        }
    }

    function startTimer() {
        stopTimer();
        lastTick = Date.now();
        timerId = setInterval(tick, 200);
    }

    function tick() {
        if (state.over || document.hidden) return;
        const now = Date.now();
        state.remaining -= now - lastTick;
        lastTick = now;
        if (state.remaining <= 0) {
            state.remaining = 0;
            paintTimer();
            endRound();
            return;
        }
        paintTimer();
    }

    function paintTimer() {
        const secs = Math.ceil(state.remaining / 1000);
        const text = `⏳ ${secs} mp`;
        if (timerLabel.textContent !== text) timerLabel.textContent = text;
        const ratio = state.remaining / (duration * 1000);
        timerFill.style.width = `${Math.round(ratio * 100)}%`;
        timerBar.classList.toggle("mult-play-timerbar-low", secs <= 10);
    }

    function paintScore() {
        if (scoreLabel) scoreLabel.textContent = `🎯 ${state.correct} helyes`;
    }

    function bestFor(tables) {
        let best = 0;
        for (const t of tables) {
            const rec = getPlayRecord(mode, String(t));
            if (rec && rec.best > best) best = rec.best;
        }
        return best;
    }

    function showPicker() {
        stopTimer();
        message.clear();
        body.replaceChildren();
        subtitle.textContent = subtitleIdle;

        const lead = document.createElement("p");
        lead.className = "mult-play-lead";
        lead.textContent = mode === "input"
            ? "Melyik szorzótáblákat gyakorolnád? Egy perc alatt annyit írsz be, amennyit bírsz!"
            : "Melyik szorzótáblákat gyakorolnád? Egy perc alatt annyit találsz el, amennyit bírsz!";
        body.append(lead);

        const grid = document.createElement("div");
        grid.className = "mult-play-tables";
        body.append(grid);

        const buttons = new Map();

        function paintSelection() {
            for (const [t, btn] of buttons) btn.classList.toggle("active", state.chosen.has(t));
            startBtn.disabled = state.chosen.size === 0;
            allBtn.classList.toggle("active", state.chosen.size === ALL_TABLES.length);

            const chosen = ALL_TABLES.filter(t => state.chosen.has(t));
            const best = bestFor(chosen);
            bestLine.textContent = chosen.length === 0
                ? ""
                : best > 0
                    ? `🏆 Legjobb eredményed ${tableLabel(chosen)}: 🎯 ${best}`
                    : `🎯 ${tableLabel(chosen)} még nincs rekordod – legyen ma!`;
        }

        for (const t of ALL_TABLES) {
            const btn = createButton(`${t}×`, {
                className: "mult-play-table",
                onClick: () => {
                    if (state.chosen.has(t)) state.chosen.delete(t);
                    else state.chosen.add(t);
                    paintSelection();
                }
            });
            const rec = getPlayRecord(mode, String(t));
            if (rec) {
                const badge = document.createElement("span");
                badge.className = "mult-play-tablebest";
                badge.textContent = `🏆 ${rec.best}`;
                btn.append(badge);
            }
            buttons.set(t, btn);
            grid.append(btn);
        }

        const allBtn = createButton("🌈 Mind", {
            className: "mult-play-table mult-play-table-all",
            onClick: () => {
                if (state.chosen.size === ALL_TABLES.length) state.chosen.clear();
                else for (const t of ALL_TABLES) state.chosen.add(t);
                paintSelection();
            }
        });
        grid.append(allBtn);

        const bestLine = document.createElement("p");
        bestLine.className = "mult-play-bestline";
        body.append(bestLine);

        const startBtn = createButton("⏱️ Indul a perc!", {
            className: "nav-bar-btn mult-play-start",
            onClick: () => {
                if (state.chosen.size === 0) return;
                startPlay();
            }
        });
        body.append(startBtn);

        paintSelection();
    }

    function startPlay() {
        state.tables = ALL_TABLES.filter(t => state.chosen.has(t));
        state.pool = buildPool(state.tables);
        state.weights = new Map();
        for (const f of state.pool) state.weights.set(factKey(f.a, f.b), 1);
        state.correct = 0;
        state.perTable = new Map();
        state.missed = new Map();
        state.remaining = duration * 1000;
        state.over = false;
        message.clear();
        body.replaceChildren();
        subtitle.textContent = `🔢 Szorzótábla-játék · ${subtitleWhere(state.tables)}`;

        scoreLabel = document.createElement("div");
        scoreLabel.className = "mult-play-score";
        paintScore();

        const hud = document.createElement("div");
        hud.className = "mult-play-hud";

        timerLabel = document.createElement("div");
        timerLabel.className = "mult-play-timer";

        timerBar = document.createElement("div");
        timerBar.className = "mult-play-timerbar";

        timerFill = document.createElement("div");
        timerFill.className = "mult-play-timerfill";

        timerBar.append(timerFill);
        hud.append(timerLabel, timerBar, scoreLabel);
        body.append(hud);

        paintTimer();
        startTimer();

        slot = document.createElement("div");
        slot.className = "mult-play-slot";
        body.append(slot);

        nextFact();
    }

    function nextFact() {
        if (state.over) return;
        state.current = pickFact(state.pool, state.weights, state.last);
        state.last = state.current;
        state.locked = false;
        message.clear();

        if (!slot) return;

        slot.replaceChildren();

        const q = document.createElement("div");
        q.className = "mult-play-question";

        const fact = document.createElement("div");
        fact.className = "mult-play-fact";
        fact.textContent = `${state.current.a} × ${state.current.b} = ?`;
        q.append(fact);

        if (mode === "input") {
            const input = createNumberInput();
            input.className = "mult-play-input";
            const submit = createButton("Ellenőrzöm", { className: "nav-bar-btn" });

            function check() {
                if (state.locked || state.over) return;
                if (input.value.trim() === "") return;
                const value = Number(input.value);
                if (!Number.isFinite(value)) return;
                input.disabled = true;
                submit.disabled = true;
                answer(value, null);
            }

            submit.addEventListener("click", check, { signal: ac.signal });
            input.addEventListener("keydown", e => {
                if (e.key === "Enter") check();
            }, { signal: ac.signal });

            q.append(input, submit);
            requestAnimationFrame(() => input.focus());
        } else {
            const opts = document.createElement("div");
            opts.className = "mult-play-options";
            for (const value of buildOptions(state.current, state.tables)) {
                const btn = createButton(String(value), {
                    className: "mult-play-option",
                    onClick: () => answer(value, btn)
                });
                opts.append(btn);
            }
            q.append(opts);
        }

        slot.append(q);
    }

    function answer(value, btn) {
        if (state.locked || state.over || !state.current) return;
        state.locked = true;

        const fact = state.current;
        const key = factKey(fact.a, fact.b);
        const weight = state.weights.get(key) ?? 1;

        if (value === fact.answer) {
            state.correct++;
            state.missed.delete(key);
            state.weights.set(key, Math.max(1, weight * 0.5));
            for (const t of new Set([fact.a, fact.b])) {
                state.perTable.set(t, (state.perTable.get(t) ?? 0) + 1);
            }
            if (btn) markCorrect(btn);
            message.show(`${ui.item} ${fact.a} × ${fact.b} = ${fact.answer}!`, "success");
            paintScore();
            setTimeout(nextFact, mode === "input" ? 450 : 650);
            return;
        }

        state.missed.set(key, fact);
        state.weights.set(key, Math.min(12, weight * 3 + 1));
        if (btn) btn.classList.add("mult-play-option-wrong");
        revealCorrect(fact);
        message.show(`💡 ${fact.a} × ${fact.b} = ${fact.answer}. Jöjj a következő!`, "retry");
        setTimeout(nextFact, mode === "input" ? 1200 : 1600);
    }

    function revealCorrect(fact) {
        if (mode !== "input") {
            const opts = slot.querySelectorAll(".mult-play-option");
            for (const el of opts) {
                if (el.textContent.trim() === String(fact.answer)) markCorrect(el);
            }
            return;
        }
        const input = slot.querySelector(".mult-play-input");
        if (input) input.value = String(fact.answer);
    }

    function saveRecords() {
        const newTables = [];
        for (const [t, n] of state.perTable) {
            const saved = recordPlayResult(mode, String(t), n);
            if (saved?.isRecord) newTables.push(t);
        }
        const overall = recordPlayResult(mode, "*", state.correct);
        return { newTables: newTables.sort((a, b) => a - b), newRecord: !!overall?.isRecord, best: overall?.best ?? state.correct };
    }

    function endRound() {
        if (state.over) return;
        state.over = true;
        state.locked = true;
        stopTimer();
        renderSummary(saveRecords());
    }

    function renderSummary(record) {
        stopTimer();
        message.clear();
        body.replaceChildren();

        const box = document.createElement("div");
        box.className = "mult-play-summary";

        const headline = document.createElement("div");
        headline.className = "mult-play-summaryhead";
        headline.textContent = ui.done;
        box.append(headline);

        const score = document.createElement("div");
        score.className = "mult-play-summaryscore";
        score.textContent = `🎯 ${state.correct} helyes válasz`;
        box.append(score);

        const where = tableLabel(state.tables);
        const bestLine = document.createElement("div");
        if (record.newRecord) {
            bestLine.className = "mult-play-record mult-play-record-new";
            bestLine.textContent = `🎉 Új rekord: 🎯 ${record.best} ${where}!`;
        } else if (record.best > state.correct) {
            bestLine.className = "mult-play-record";
            bestLine.textContent = `🏆 Legjobb eredményed ${where}: 🎯 ${record.best} (ma: ${state.correct})`;
        } else {
            bestLine.className = "mult-play-record";
            bestLine.textContent = `🏆 Legjobb eredményed ${where}: 🎯 ${record.best}`;
        }
        box.append(bestLine);

        if (record.newTables.length > 0) {
            const tableLine = document.createElement("p");
            tableLine.className = "mult-play-recordtables";
            tableLine.textContent = `Új rekord a tábláknál: ${record.newTables.map(tableName).join(", ")}`;
            box.append(tableLine);
        }

        const missed = [...state.missed.values()].sort((x, y) => x.a - y.a || x.b - y.b);

        if (missed.length > 0) {
            const label = document.createElement("p");
            label.className = "mult-play-missedlabel";
            label.textContent = "Ezeket érdemes még gyakorolni:";
            box.append(label);

            const chips = document.createElement("div");
            chips.className = "mult-play-missed";
            for (const f of missed.slice(0, 12)) {
                const chip = document.createElement("span");
                chip.className = "mult-play-chip mult-play-chip-missed";
                chip.textContent = `${f.a} × ${f.b}`;
                chips.append(chip);
            }
            box.append(chips);
        } else {
            const allGood = document.createElement("p");
            allGood.className = "mult-play-missedlabel";
            allGood.textContent = "Minden szorzatot elsőre találtál! 🌟";
            box.append(allGood);
        }

        body.append(box);

        const againBtn = createButton("🔁 Még egyet", {
            className: "nav-bar-btn mult-play-again"
        });
        againBtn.addEventListener("click", () => {
            if (state.ended) return;
            state.ended = true;
            showPicker();
        }, { signal: ac.signal });
        body.append(againBtn);

        const nextBtn = createButton("➡️ Tovább", { className: "nav-bar-btn" });
        nextBtn.addEventListener("click", () => {
            if (state.ended) return;
            state.ended = true;
            next();
        }, { signal: ac.signal });
        body.append(nextBtn);
        setTimeout(() => nextBtn.focus(), 0);
    }

    showPicker();

    document.addEventListener("visibilitychange", () => {
        lastTick = Date.now();
    }, { signal: ac.signal });

    return () => {
        stopTimer();
        ac.abort();
    };
}