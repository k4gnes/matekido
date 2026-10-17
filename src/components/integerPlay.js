import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createButton } from "./ui/button.js";
import { markCorrect } from "./ui/feedback.js";
import { getActiveWorld, getPlayRecord, recordPlayResult } from "../profile/Profile.js";

const RECORD_MODE = "integer-play";

const GRACE_MS = 10000;

const UI = {
    postman: { title: "📮 Egész számok a postán", done: "📮 Kézbesítve!" },
    racing: { title: "🏎️ Egész számok a pályán", done: "🏁 Célban értél!" },
    football: { title: "⚽ Egész számok a pályán", done: "⚽ Vége a meccsnek!" },
    cooking: { title: "🍳 Egész számok a konyhában", done: "🍳 Tálkák készen!" },
    animals: { title: "🦁 Egész számok az állatkertben", done: "🦁 Mindig jó!" },
    space: { title: "🤖 Egész számok az űrhajón", done: "🤖 Küldetés teljesítve!" },
    tram: { title: "🚋 Egész számok a villamoson", done: "🚋 Mindenütt megálltál!" }
};

const LEVELS = [
    { id: "easy", label: "🌱 Könnyű", forms: ["add-neg", "sub-neg", "neg-add", "neg-sub", "neg-plus-neg", "small-minus-big"] },
    { id: "hard", label: "🔥 Kőkemény", forms: ["neg-mul-pos", "neg-mul-neg", "neg-div-pos", "pos-div-neg", "neg-div-neg", "mul-add", "neg-sub-neg", "sub-mul-neg"] }
];

const FORMS = {
    "add-neg": () => {
        const a = random(3, 15);
        const b = random(1, 12);
        return { expression: `${a} + (−${b})`, answer: a - b, traps: [a + b] };
    },
    "sub-neg": () => {
        const a = random(3, 15);
        const b = random(1, 12);
        return { expression: `${a} − (−${b})`, answer: a + b, traps: [a - b] };
    },
    "neg-add": () => {
        const a = random(2, 12);
        const b = random(1, 15);
        return { expression: `(−${a}) + ${b}`, answer: b - a, traps: [-(a + b)] };
    },
    "neg-sub": () => {
        const a = random(2, 12);
        const b = random(1, 12);
        return { expression: `(−${a}) − ${b}`, answer: -(a + b), traps: [b - a] };
    },
    "neg-plus-neg": () => {
        const a = random(2, 10);
        const b = random(2, 10);
        return { expression: `(−${a}) + (−${b})`, answer: -(a + b), traps: [a - b, b - a, a + b] };
    },
    "small-minus-big": () => {
        const a = random(1, 9);
        const b = random(a + 1, 15);
        return { expression: `${a} − ${b}`, answer: a - b, traps: [b - a] };
    },
    "neg-mul-pos": () => {
        const a = random(2, 9);
        const b = random(2, 9);
        return { expression: `${a} × (−${b})`, answer: -(a * b), traps: [a * b] };
    },
    "neg-mul-neg": () => {
        const a = random(2, 9);
        const b = random(2, 9);
        return { expression: `(−${a}) × (−${b})`, answer: a * b, traps: [-(a * b)] };
    },
    "neg-div-pos": () => {
        const b = random(2, 9);
        const q = random(2, 9);
        return { expression: `(−${b * q}) ÷ ${b}`, answer: -q, traps: [q] };
    },
    "pos-div-neg": () => {
        const b = random(2, 9);
        const q = random(2, 9);
        return { expression: `${b * q} ÷ (−${b})`, answer: -q, traps: [q] };
    },
    "neg-div-neg": () => {
        const b = random(2, 9);
        const q = random(2, 9);
        return { expression: `(−${b * q}) ÷ (−${b})`, answer: q, traps: [-q] };
    },
    "mul-add": () => {
        const a = random(2, 9);
        const b = random(2, 9);
        const c = random(2, 15);
        return { expression: `(−${a}) × ${b} + ${c}`, answer: -(a * b) + c, traps: [a * b + c, -(a * b) - c] };
    },
    "neg-sub-neg": () => {
        const a = random(2, 12);
        const b = random(2, 12);
        return { expression: `(−${a}) − (−${b})`, answer: b - a, traps: [-(a + b), a - b] };
    },
    "sub-mul-neg": () => {
        const a = random(5, 20);
        const b = random(2, 9);
        const c = random(2, 9);
        return { expression: `${a} − ${b} × (−${c})`, answer: a + b * c, traps: [a - b * c] };
    }
};

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

function fmt(value) {
    return String(value).replace(/-/g, "−");
}

function buildOptions(answer, traps) {
    const options = [answer];
    const add = (value) => {
        if (options.length < 4 && Number.isInteger(value) && !options.includes(value)) options.push(value);
    };
    for (const trap of traps) add(trap);
    for (const value of shuffle([-answer, answer + 1, answer - 1, answer + 2, answer - 2, answer + 10, answer - 10])) add(value);
    let extra = 3;
    while (options.length < 4) {
        add(answer + options.length + extra);
        extra++;
    }
    return shuffle(options);
}

function buildTask(form) {
    const task = FORMS[form] ? FORMS[form]() : FORMS["add-neg"]();
    return { form, expression: task.expression, answer: task.answer, options: buildOptions(task.answer, task.traps) };
}

export function renderIntegerPlay(step, root, next, progress) {

    const ac = new AbortController();
    const world = getActiveWorld();
    const ui = UI[world] ?? UI.postman;

    const duration = Number.isFinite(step.duration) && step.duration > 0 ? Math.min(step.duration, 300) : 60;
    const chosen = LEVELS.some(l => l.id === step.level) ? step.level : null;
    const defaultLevel = chosen ?? "easy";

    root.replaceChildren();

    const card = createCard();
    if (progress) card.append(progress);

    const title = document.createElement("h1");
    title.className = "mult-play-title";
    title.textContent = ui.title;
    card.append(title);

    const subtitle = document.createElement("p");
    subtitle.className = "mult-play-subtitle";
    const subtitleIdle = "🧮 Egyperces játék · egész számok";
    subtitle.textContent = subtitleIdle;
    card.append(subtitle);

    const body = document.createElement("div");
    body.className = "mult-play-body";
    card.append(body);

    const message = createMessageBox();
    card.append(message.element);

    root.append(card);

    const state = {
        level: defaultLevel,
        current: null,
        last: null,
        weights: new Map(),
        correct: 0,
        missed: new Map(),
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

    function formsFor(level) {
        return LEVELS.find(l => l.id === level)?.forms ?? LEVELS[0].forms;
    }

    function pickForm() {
        const forms = formsFor(state.level);
        let total = 0;
        for (const form of forms) total += state.weights.get(form) ?? 1;
        let roll = Math.random() * total;
        for (const form of forms) {
            roll -= state.weights.get(form) ?? 1;
            if (roll <= 0) return form;
        }
        return forms[0];
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

    function showPicker() {
        stopTimers();
        message.clear();
        body.replaceChildren();
        subtitle.textContent = subtitleIdle;

        const lead = document.createElement("p");
        lead.className = "mult-play-lead";
        lead.textContent = "Milyen szinten számolsz? Egy perc alatt annyi előjeles feladatot oldasz meg helyesen, amennyit bírsz!";
        body.append(lead);

        const grid = document.createElement("div");
        grid.className = "mult-play-tables";
        body.append(grid);

        const buttons = new Map();

        function bestLineFor(id) {
            const rec = getPlayRecord(RECORD_MODE, id);
            return rec ? `🏆 Legjobb eredményed: 🎯 ${rec.best}` : "🎯 Ennél még nincs rekordod – legyen ma!";
        }

        const bestLine = document.createElement("p");
        bestLine.className = "mult-play-bestline";

        function paintSelection() {
            for (const [id, btn] of buttons) btn.classList.toggle("active", state.level === id);
            bestLine.textContent = bestLineFor(state.level);
        }

        for (const level of LEVELS) {
            const btn = createButton(level.label, {
                className: "mult-play-table",
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
        state.weights = new Map();
        state.correct = 0;
        state.missed = new Map();
        state.last = null;
        state.remaining = duration * 1000;
        state.over = false;
        state.timeUp = false;
        state.ended = false;
        message.clear();
        body.replaceChildren();
        subtitle.textContent = `🧮 Egyperces játék · ${LEVELS.find(l => l.id === state.level)?.label ?? ""}`;

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
        stopTimers();
        lastTick = Date.now();
        timerId = setInterval(tick, 200);

        slot = document.createElement("div");
        slot.className = "mult-play-slot";
        body.append(slot);

        nextTask();
    }

    function nextTask() {
        if (state.over) return;
        const form = pickForm();
        state.current = buildTask(form);
        state.last = state.current;
        state.locked = false;
        message.clear();

        if (!slot) return;

        slot.replaceChildren();

        const q = document.createElement("div");
        q.className = "mult-play-question";

        const expr = document.createElement("div");
        expr.className = "mult-play-fact";
        expr.textContent = `${state.current.expression} = ?`;
        q.append(expr);

        const opts = document.createElement("div");
        opts.className = "mult-play-options";
        for (const value of state.current.options) {
            const btn = createButton(fmt(value), {
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

        const task = state.current;
        const weight = state.weights.get(task.form) ?? 1;

        if (value === task.answer) {
            state.correct++;
            state.missed.delete(task.expression);
            state.weights.set(task.form, Math.max(1, weight * 0.5));
            if (btn) markCorrect(btn);
            message.show(`${task.expression} = ${fmt(task.answer)}!`, "success");
            paintScore();
            advance(600);
            return;
        }

        state.missed.set(task.expression, task);
        state.weights.set(task.form, Math.min(12, weight * 3 + 1));
        if (btn) btn.classList.add("mult-play-option-wrong");
        revealCorrect(task);
        message.show(`💡 ${task.expression} = ${fmt(task.answer)}. Figyelj az előjelekre!`, "retry");
        advance(2200);
    }

    function revealCorrect(task) {
        const opts = slot.querySelectorAll(".mult-play-option");
        for (const el of opts) {
            if (el.textContent.trim() === fmt(task.answer)) markCorrect(el);
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
            bestLine.textContent = `🎉 Új rekord: 🎯 ${record.best}!`;
            box.append(bestLine);
        } else if (record.best > state.correct) {
            const bestLine = document.createElement("div");
            bestLine.className = "mult-play-record";
            bestLine.textContent = `🏆 Legjobb eredményed: 🎯 ${record.best} (ma: ${state.correct})`;
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
            for (const task of missed.slice(0, 12)) {
                const chip = document.createElement("span");
                chip.className = "mult-play-chip mult-play-chip-missed";
                chip.textContent = task.expression;
                chips.append(chip);
            }
            box.append(chips);
        } else {
            const allGood = document.createElement("p");
            allGood.className = "mult-play-missedlabel";
            allGood.textContent = "Minden feladatot elsőre találtál! 🌟";
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
