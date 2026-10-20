import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { markCorrect } from "./ui/feedback.js";
import { getActiveWorld, getPlayRecord, recordPlayResult } from "../profile/Profile.js";

const GRACE_MS = 10000;

export function shuffle(list) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

export function fmtMinus(value) {
    return String(value).replace(/-/g, "−");
}

// Súlyozott választás; az `avoid` elem nem jöhet kétszer egymás után.
export function weightedPick(items, weightOf, avoid = null) {
    let total = 0;
    for (const item of items) {
        if (item === avoid) continue;
        total += weightOf(item);
    }
    let roll = Math.random() * total;
    for (const item of items) {
        if (item === avoid) continue;
        roll -= weightOf(item);
        if (roll <= 0) return item;
    }
    return items.find(item => item !== avoid) ?? items[0];
}

// Közös váz az egyperces játékokhoz. A `game` paraméter adja meg a
// feladatgenerátort, a feliratokat és a rekordkulcsot; a váz kezeli az
// időzítőt, a válaszadást és az összegzést.
//
// game jellemzői:
//   recordMode, ui, levels, defaultLevel, subtitleIdle, lead, wideLevels?
//   title(ui)?, startRound(state), nextTask(state) -> task
//   correctDelay(task), wrongDelay(task) -> ms
//   successMessage(task, ui), failMessage(task, state, ui)
//   chipText(task), allGoodText, fmt
//   sortMissed?, recordWhereNew(state)?, recordWhereBest(state)?
//   showBestWhenEqual?
//   recordEntries(state)?, recordTablesLine(record)?
//   selection?  -> { all, buttonLabel, label, best }
export function createPlayGame(game, step, root, next, progress) {

    const ac = new AbortController();
    const world = getActiveWorld();
    const ui = game.ui[world] ?? game.ui.postman;

    const duration = Number.isFinite(step.duration) && step.duration > 0 ? Math.min(step.duration, 300) : 60;
    const presetLevel = game.levels.some(l => l.id === step.level) ? step.level : game.defaultLevel;
    const presetTables = Array.isArray(step.defaultTables)
        ? step.defaultTables.filter(t => game.selection?.all.includes(t))
        : [];
    const fmt = game.fmt ?? String;

    root.replaceChildren();

    const card = createCard();
    if (progress) card.append(progress);

    const title = document.createElement("h1");
    title.className = "mult-play-title";
    title.textContent = game.title ? game.title(ui) : ui.title;
    card.append(title);

    const subtitle = document.createElement("p");
    subtitle.className = "mult-play-subtitle";
    const subtitleIdle = game.subtitleIdle;
    subtitle.textContent = subtitleIdle;
    card.append(subtitle);

    const body = document.createElement("div");
    body.className = "mult-play-body";
    card.append(body);

    const message = createMessageBox();
    card.append(message.element);

    root.append(card);

    const state = {
        level: presetLevel,
        chosen: new Set(presetTables),
        current: null,
        last: null,
        weights: new Map(),
        correct: 0,
        missed: new Map(),
        locked: true,
        over: false,
        timeUp: false,
        ended: false,
        served: 0,
        remaining: duration * 1000
    };

    let timerId = null;
    let graceId = null;
    let lastTick = 0;
    let timerLabel = null;
    let timerFill = null;
    let scoreLabel = null;
    let slot = null;

    function stopTimers() {
        if (timerId !== null) {
            clearInterval(timerId);
            timerId = null;
        }
        if (graceId !== null) {
            clearTimeout(graceId);
            graceId = null;
        }
    }

    function startTimer() {
        stopTimers();
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
            endRoundWhenIdle();
            return;
        }
        paintTimer();
    }

    function paintTimer() {
        const secs = Math.ceil(state.remaining / 1000);
        const text = `⏳ ${secs} mp`;
        if (timerLabel && timerLabel.textContent !== text) timerLabel.textContent = text;
        if (!timerFill) return;
        const ratio = state.remaining / (duration * 1000);
        timerFill.style.width = `${Math.round(ratio * 100)}%`;
    }

    function paintScore() {
        if (scoreLabel) scoreLabel.textContent = `🎯 ${state.correct} helyes`;
    }

    function endRoundWhenIdle() {
        if (state.over || state.timeUp) return;
        if (state.locked) {
            endRound();
            return;
        }
        state.timeUp = true;
        stopTimers();
        message.show("⏳ Elfogyott az idő! Válaszolhatsz még egyszer, aztán jön az eredmény.", "retry");
        showFinishButton();
        graceId = setTimeout(() => endRound(), GRACE_MS);
    }

    function showFinishButton() {
        if (!slot || slot.querySelector(".mult-play-finish")) return;
        const finishBtn = createButton("🏁 Befejezem", { className: "nav-bar-btn mult-play-finish" });
        finishBtn.addEventListener("click", () => endRound(), { signal: ac.signal });
        slot.append(finishBtn);
    }

    function advance(delay) {
        setTimeout(() => {
            if (state.timeUp) endRound();
            else nextTask();
        }, delay);
    }

    function showSinglePicker(grid) {
        const buttons = new Map();

        const bestLine = document.createElement("p");
        bestLine.className = "mult-play-bestline";

        function paintSelection() {
            for (const [id, btn] of buttons) btn.classList.toggle("active", state.level === id);
            const rec = getPlayRecord(game.recordMode, state.level);
            bestLine.textContent = rec ? `🏆 Legjobb eredményed: 🎯 ${rec.best}` : "🎯 Ennél még nincs rekordod – legyen ma!";
        }

        for (const level of game.levels) {
            const btn = createButton(level.label, {
                className: "mult-play-table" + (game.wideLevels ? " mult-play-table-wide" : ""),
                onClick: () => {
                    state.level = level.id;
                    paintSelection();
                }
            });
            const rec = getPlayRecord(game.recordMode, level.id);
            if (rec) {
                const badge = document.createElement("span");
                badge.className = "mult-play-tablebest";
                badge.textContent = `🏆 ${rec.best}`;
                btn.append(badge);
            }
            buttons.set(level.id, btn);
            grid.append(btn);
        }

        body.append(bestLine);

        const startBtn = createButton("⏱️ Indul a perc!", {
            className: "nav-bar-btn mult-play-start",
            onClick: () => startPlay()
        });
        body.append(startBtn);

        paintSelection();
    }

    function showMultiPicker(grid) {
        const sel = game.selection;
        const buttons = new Map();

        const bestLine = document.createElement("p");
        bestLine.className = "mult-play-bestline";

        function paintSelection() {
            for (const [id, btn] of buttons) btn.classList.toggle("active", state.chosen.has(id));
            startBtn.disabled = state.chosen.size === 0;
            allBtn.classList.toggle("active", state.chosen.size === sel.all.length);

            const chosen = sel.all.filter(t => state.chosen.has(t));
            const best = sel.best(chosen);
            bestLine.textContent = chosen.length === 0
                ? ""
                : best > 0
                    ? `🏆 Legjobb eredményed ${sel.label(chosen)}: 🎯 ${best}`
                    : `🎯 ${sel.label(chosen)} még nincs rekordod – legyen ma!`;
        }

        for (const id of sel.all) {
            const btn = createButton(sel.buttonLabel(id), {
                className: "mult-play-table",
                onClick: () => {
                    if (state.chosen.has(id)) state.chosen.delete(id);
                    else state.chosen.add(id);
                    paintSelection();
                }
            });
            const rec = getPlayRecord(game.recordMode, String(id));
            if (rec) {
                const badge = document.createElement("span");
                badge.className = "mult-play-tablebest";
                badge.textContent = `🏆 ${rec.best}`;
                btn.append(badge);
            }
            buttons.set(id, btn);
            grid.append(btn);
        }

        const allBtn = createButton("🌈 Mind", {
            className: "mult-play-table mult-play-table-all",
            onClick: () => {
                if (state.chosen.size === sel.all.length) state.chosen.clear();
                else for (const id of sel.all) state.chosen.add(id);
                paintSelection();
            }
        });
        grid.append(allBtn);

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

    function showPicker() {
        stopTimers();
        message.clear();
        body.replaceChildren();
        subtitle.textContent = subtitleIdle;

        const lead = document.createElement("p");
        lead.className = "mult-play-lead";
        lead.textContent = typeof game.lead === "function" ? game.lead(state) : game.lead;
        body.append(lead);

        const grid = document.createElement("div");
        grid.className = "mult-play-tables";
        body.append(grid);

        if (game.selection) showMultiPicker(grid);
        else showSinglePicker(grid);
    }

    function startPlay() {
        state.weights = new Map();
        state.correct = 0;
        state.missed = new Map();
        state.last = null;
        state.served = 0;
        state.remaining = duration * 1000;
        state.over = false;
        state.timeUp = false;
        state.ended = false;
        if (game.startRound) game.startRound(state);
        message.clear();
        body.replaceChildren();
        subtitle.textContent = game.subtitleInGame(state);

        scoreLabel = document.createElement("span");
        scoreLabel.className = "mult-play-score";
        paintScore();

        const hud = document.createElement("div");
        hud.className = "mult-play-hud";

        const hudTop = document.createElement("div");
        hudTop.className = "mult-play-hudtop";

        timerLabel = document.createElement("span");
        timerLabel.className = "mult-play-timer";

        hudTop.append(timerLabel, scoreLabel);

        const timerBar = document.createElement("div");
        timerBar.className = "mult-play-timerbar";

        timerFill = document.createElement("div");
        timerFill.className = "mult-play-timerfill";

        timerBar.append(timerFill);
        hud.append(hudTop, timerBar);
        body.append(hud);

        paintTimer();
        startTimer();

        slot = document.createElement("div");
        slot.className = "mult-play-slot";
        body.append(slot);

        nextTask();
    }

    function nextTask() {
        if (state.over) return;
        const task = game.nextTask(state);
        state.current = task;
        state.locked = false;
        message.clear();

        if (!slot) return;

        slot.replaceChildren();

        const q = document.createElement("div");
        q.className = "mult-play-question";

        const fact = document.createElement("div");
        fact.className = "mult-play-fact";
        fact.textContent = task.display;
        q.append(fact);

        if (task.input) {
            const input = createNumberInput();
            input.className = "mult-play-input";
            const submit = createButton("Ellenőrzöm", { className: "nav-bar-btn" });

            function check() {
                if (state.locked || state.over) return;
                if (input.value.trim() === "") {
                    if (state.timeUp) endRound();
                    return;
                }
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
            for (const value of task.options) {
                const btn = createButton(fmt(value), {
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

        const task = state.current;
        const weight = state.weights.get(task.key) ?? 1;

        if (value === task.answer) {
            state.correct++;
            state.missed.delete(task.missedKey);
            state.weights.set(task.key, Math.max(1, weight * 0.5));
            if (game.onCorrect) game.onCorrect(state, task);
            if (btn) markCorrect(btn);
            message.show(game.successMessage(task, ui), "success");
            paintScore();
            advance(game.correctDelay(task));
            return;
        }

        state.missed.set(task.missedKey, task);
        state.weights.set(task.key, Math.min(12, weight * 3 + 1));
        if (btn) btn.classList.add("mult-play-option-wrong");
        revealCorrect(task);
        message.show(game.failMessage(task, state, ui), "retry");
        advance(game.wrongDelay(task));
    }

    function revealCorrect(task) {
        if (task.input) {
            const input = slot.querySelector(".mult-play-input");
            if (input) input.value = String(task.answer);
            return;
        }
        const opts = slot.querySelectorAll(".mult-play-option");
        for (const el of opts) {
            if (el.textContent.trim() === fmt(task.answer)) markCorrect(el);
        }
    }

    function saveRecords() {
        if (game.recordEntries) {
            const newKeys = [];
            for (const [key, score] of game.recordEntries(state)) {
                const saved = recordPlayResult(game.recordMode, String(key), score);
                if (saved?.isRecord) newKeys.push(key);
            }
            const overall = recordPlayResult(game.recordMode, "*", state.correct);
            return {
                newTables: newKeys.sort((a, b) => a - b),
                newRecord: !!overall?.isRecord,
                best: overall?.best ?? state.correct
            };
        }
        const saved = recordPlayResult(game.recordMode, state.level, state.correct);
        const overall = recordPlayResult(game.recordMode, "*", state.correct);
        return {
            newRecord: !!(saved?.isRecord || overall?.isRecord),
            best: overall?.best ?? state.correct
        };
    }

    function endRound() {
        if (state.over) return;
        state.over = true;
        state.locked = true;
        stopTimers();
        renderSummary(saveRecords());
    }

    function renderSummary(record) {
        stopTimers();
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

        const whereNew = game.recordWhereNew ? game.recordWhereNew(state) : "";
        const whereBest = game.recordWhereBest ? game.recordWhereBest(state) : "";

        if (record.newRecord) {
            const bestLine = document.createElement("div");
            bestLine.className = "mult-play-record mult-play-record-new";
            bestLine.textContent = `🎉 Új rekord: 🎯 ${record.best}${whereNew}!`;
            box.append(bestLine);
        } else if (record.best > state.correct) {
            const bestLine = document.createElement("div");
            bestLine.className = "mult-play-record";
            bestLine.textContent = `🏆 Legjobb eredményed${whereBest}: 🎯 ${record.best} (ma: ${state.correct})`;
            box.append(bestLine);
        } else if (game.showBestWhenEqual !== false) {
            const bestLine = document.createElement("div");
            bestLine.className = "mult-play-record";
            bestLine.textContent = `🏆 Legjobb eredményed${whereBest}: 🎯 ${record.best}`;
            box.append(bestLine);
        }

        if (game.recordTablesLine && record.newTables?.length > 0) {
            const tableLine = document.createElement("p");
            tableLine.className = "mult-play-recordtables";
            tableLine.textContent = game.recordTablesLine(record);
            box.append(tableLine);
        }

        const missed = [...state.missed.values()];
        if (game.sortMissed) missed.sort(game.sortMissed);

        if (missed.length > 0) {
            const label = document.createElement("p");
            label.className = "mult-play-missedlabel";
            label.textContent = "Ezeket érdemes még gyakorolni:";
            box.append(label);

            const chips = document.createElement("div");
            chips.className = "mult-play-missed";
            for (const task of missed.slice(0, 12)) {
                const chip = document.createElement("span");
                chip.className = "mult-play-chip mult-play-chip-missed";
                chip.textContent = game.chipText(task);
                chips.append(chip);
            }
            box.append(chips);
        } else {
            const allGood = document.createElement("p");
            allGood.className = "mult-play-missedlabel";
            allGood.textContent = game.allGoodText;
            box.append(allGood);
        }

        body.append(box);

        const againBtn = createButton("🔁 Még egyet", {
            className: "nav-bar-btn mult-play-again",
            onClick: () => {
                if (state.ended) return;
                state.ended = true;
                showPicker();
            }
        });
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
        stopTimers();
        ac.abort();
    };
}
