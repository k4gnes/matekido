import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createButton } from "./ui/button.js";
import { markCorrect } from "./ui/feedback.js";
import { getActiveWorld, getPlayRecord, recordPlayResult } from "../profile/Profile.js";

const RECORD_MODE = "addition-play";

const GRACE_MS = 10000;

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

function shuffle(list) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
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

function pickPair(pool, weights, avoid) {
    let total = 0;
    for (const p of pool) {
        if (p === avoid) continue;
        total += weights.get(pairKey(p.a, p.b));
    }
    let roll = Math.random() * total;
    for (const p of pool) {
        if (p === avoid) continue;
        roll -= weights.get(pairKey(p.a, p.b));
        if (roll <= 0) return p;
    }
    return pool.find(p => p !== avoid) ?? pool[0];
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

    const ac = new AbortController();
    const world = getActiveWorld();
    const ui = UI[world] ?? UI.postman;

    const duration = Number.isFinite(step.duration) && step.duration > 0 ? Math.min(step.duration, 300) : 60;
    const preset = LEVELS.some(l => l.id === step.level) ? step.level : "bridge";

    root.replaceChildren();

    const card = createCard();
    if (progress) card.append(progress);

    const title = document.createElement("h1");
    title.className = "mult-play-title";
    title.textContent = ui.title;
    card.append(title);

    const subtitle = document.createElement("p");
    subtitle.className = "mult-play-subtitle";
    const subtitleIdle = "🔢 Egyperces játék · összeadás";
    subtitle.textContent = subtitleIdle;
    card.append(subtitle);

    const body = document.createElement("div");
    body.className = "mult-play-body";
    card.append(body);

    const message = createMessageBox();
    card.append(message.element);

    root.append(card);

    const state = {
        level: preset,
        pool: [],
        weights: new Map(),
        correct: 0,
        missed: new Map(),
        current: null,
        last: null,
        locked: true,
        over: false,
        timeUp: false,
        ended: false,
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
            else nextPair();
        }, delay);
    }

    function showPicker() {
        stopTimers();
        message.clear();
        body.replaceChildren();
        subtitle.textContent = subtitleIdle;

        const lead = document.createElement("p");
        lead.className = "mult-play-lead";
        lead.textContent = "Mit gyakorolj? Egy perc alatt annyi összeadást oldasz meg helyesen, amennyit bírsz!";
        body.append(lead);

        const grid = document.createElement("div");
        grid.className = "mult-play-tables";
        body.append(grid);

        const bestLine = document.createElement("p");
        bestLine.className = "mult-play-bestline";

        const buttons = new Map();

        function bestLineFor(id) {
            const rec = getPlayRecord(RECORD_MODE, id);
            return rec ? `🏆 Legjobb eredményed: 🎯 ${rec.best}` : "🎯 Ennél még nincs rekordod – legyen ma!";
        }

        function paintSelection() {
            for (const [id, btn] of buttons) btn.classList.toggle("active", state.level === id);
            bestLine.textContent = bestLineFor(state.level);
        }

        for (const level of LEVELS) {
            const btn = createButton(level.label, {
                className: "mult-play-table mult-play-table-wide",
                onClick: () => {
                    state.level = level.id;
                    paintSelection();
                }
            });
            const rec = getPlayRecord(RECORD_MODE, level.id);
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

    function startPlay() {
        state.pool = buildPool(state.level);
        state.weights = new Map();
        for (const p of state.pool) state.weights.set(pairKey(p.a, p.b), 1);
        state.correct = 0;
        state.missed = new Map();
        state.last = null;
        state.remaining = duration * 1000;
        state.over = false;
        state.timeUp = false;
        state.ended = false;
        message.clear();
        body.replaceChildren();
        subtitle.textContent = `🔢 Egyperces játék · ${levelLabel(state.level)}`;

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

        nextPair();
    }

    function nextPair() {
        if (state.over) return;
        state.current = pickPair(state.pool, state.weights, state.last);
        state.last = state.current;
        state.locked = false;
        message.clear();

        if (!slot) return;

        slot.replaceChildren();

        const q = document.createElement("div");
        q.className = "mult-play-question";

        const fact = document.createElement("div");
        fact.className = "mult-play-fact";
        fact.textContent = `${state.current.a} + ${state.current.b} = ?`;
        q.append(fact);

        const opts = document.createElement("div");
        opts.className = "mult-play-options";
        for (const value of buildOptions(state.current)) {
            const btn = createButton(String(value), {
                className: "mult-play-option",
                onClick: () => answer(value, btn)
            });
            opts.append(btn);
        }
        q.append(opts);

        slot.append(q);
    }

    function answer(value, btn) {
        if (state.locked || state.over || !state.current) return;
        state.locked = true;

        const pair = state.current;
        const key = pairKey(pair.a, pair.b);
        const weight = state.weights.get(key) ?? 1;

        if (value === pair.answer) {
            state.correct++;
            state.missed.delete(key);
            state.weights.set(key, Math.max(1, weight * 0.5));
            if (btn) markCorrect(btn);
            message.show(`${ui.item} ${pair.a} + ${pair.b} = ${pair.answer}!`, "success");
            paintScore();
            advance(650);
            return;
        }

        state.missed.set(key, pair);
        state.weights.set(key, Math.min(12, weight * 3 + 1));
        if (btn) btn.classList.add("mult-play-option-wrong");
        revealCorrect(pair);
        message.show(`💡 ${hintFor(pair)}`, "retry");
        advance(1700);
    }

    function hintFor(pair) {
        if (state.level === "bridge") {
            return `${pair.a} + ${pair.b} → ${bridgeBreakdown(pair)}`;
        }
        return `${pair.a} + ${pair.b} = ${pair.answer}`;
    }

    function revealCorrect(pair) {
        const opts = slot.querySelectorAll(".mult-play-option");
        for (const el of opts) {
            if (el.textContent.trim() === String(pair.answer)) markCorrect(el);
        }
    }

    function saveRecords() {
        const saved = recordPlayResult(RECORD_MODE, state.level, state.correct);
        const overall = recordPlayResult(RECORD_MODE, "*", state.correct);
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

        if (record.newRecord) {
            const bestLine = document.createElement("div");
            bestLine.className = "mult-play-record mult-play-record-new";
            bestLine.textContent = `🎉 Új rekord: 🎯 ${record.best} (${levelLabel(state.level)})!`;
            box.append(bestLine);
        } else if (record.best > state.correct) {
            const bestLine = document.createElement("div");
            bestLine.className = "mult-play-record";
            bestLine.textContent = `🏆 Legjobb eredményed: 🎯 ${record.best} (ma: ${state.correct})`;
            box.append(bestLine);
        } else {
            const bestLine = document.createElement("div");
            bestLine.className = "mult-play-record";
            bestLine.textContent = `🏆 Legjobb eredményed: 🎯 ${record.best}`;
            box.append(bestLine);
        }

        const missed = [...state.missed.values()];
        if (missed.length > 0) {
            const label = document.createElement("p");
            label.className = "mult-play-missedlabel";
            label.textContent = "Ezeket érdemes még gyakorolni:";
            box.append(label);

            const chips = document.createElement("div");
            chips.className = "mult-play-missed";
            for (const pair of missed.slice(0, 12)) {
                const chip = document.createElement("span");
                chip.className = "mult-play-chip mult-play-chip-missed";
                chip.textContent = `${pair.a} + ${pair.b}`;
                chips.append(chip);
            }
            box.append(chips);
        } else {
            const allGood = document.createElement("p");
            allGood.className = "mult-play-missedlabel";
            allGood.textContent = "Minden összeadást elsőre eltaláltál! 🌟";
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
        stopTimers();
        ac.abort();
    };
}
