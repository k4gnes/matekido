import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createButton } from "./ui/button.js";
import { markCorrect } from "./ui/feedback.js";
import { getActiveWorld, getPlayRecord, recordPlayResult } from "../profile/Profile.js";

const RECORD_MODE = "operation-order-play";

const UI = {
    postman: { title: "📮 Műveleti sorrend a postán", done: "📮 Kézbesítve!" },
    racing: { title: "🏎️ Műveleti sorrend a boxutcában", done: "🏁 Célban értél!" },
    football: { title: "⚽ Műveleti sorrend a pályán", done: "⚽ Vége a meccsnek!" },
    cooking: { title: "🍳 Műveleti sorrend a konyhában", done: "🍳 Tálkák készen!" },
    animals: { title: "🦁 Műveleti sorrend az állatkertben", done: "🦁 Mindig jó!" },
    space: { title: "🤖 Műveleti sorrend az űrhajón", done: "🤖 Küldetés teljesítve!" },
    tram: { title: "🚋 Műveleti sorrend a villamoson", done: "🚋 Mindenütt megálltál!" }
};

const LEVELS = [
    { id: "easy", label: "🌱 Könnyű", forms: ["mult-add", "mult-sub", "div-add", "paren-add", "paren-sub"] },
    { id: "hard", label: "🔥 Kőkemény", forms: ["mult-add", "mult-add", "mult-sub", "div-add", "div-sub", "two-mult", "paren-add", "paren-sub", "chain", "paren-two"] }
];

const FORM_WEIGHT = {
    "mult-add": 3,
    "mult-add-rev": 3,
    "mult-sub": 3,
    "div-add": 3,
    "div-sub": 2,
    "two-mult": 2,
    "paren-add": 3,
    "paren-sub": 2,
    "chain": 2,
    "paren-two": 1
};

function isParenForm(form) {
    return form.startsWith("paren-");
}

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

function normalize(src) {
    return src.replace(/−/g, "-").replace(/\s+/g, "");
}

function evaluate(raw) {
    const src = normalize(raw);
    let i = 0;

    function factor() {
        if (src[i] === "(") {
            i++;
            const value = sum();
            if (src[i] === ")") i++;
            return value;
        }
        const start = i;
        while (i < src.length && /\d/.test(src[i])) i++;
        return Number(src.slice(start, i));
    }

    function term() {
        let value = factor();
        while (src[i] === "×" || src[i] === "÷") {
            const op = src[i++];
            const right = factor();
            value = op === "×" ? value * right : value / right;
        }
        return value;
    }

    function sum() {
        let value = term();
        while (src[i] === "+" || src[i] === "-") {
            const op = src[i++];
            const right = term();
            value = op === "+" ? value + right : value - right;
        }
        return value;
    }

    return sum();
}

function evaluateLeftToRight(src) {
    const tokens = normalize(src).match(/\d+|[+\-×÷]/g) ?? [];
    let value = Number(tokens[0]);
    for (let k = 1; k < tokens.length; k += 2) {
        const op = tokens[k];
        const right = Number(tokens[k + 1]);
        if (op === "+") value += right;
        else if (op === "-") value -= right;
        else if (op === "×") value *= right;
        else value /= right;
    }
    return value;
}

function buildExpression(form) {
    switch (form) {
        case "mult-add":
            return `${random(2, 9)} + ${random(2, 9)} × ${random(2, 9)}`;
        case "mult-add-rev":
            return `${random(2, 9)} × ${random(2, 9)} + ${random(2, 9)}`;
        case "mult-sub": {
            const b = random(3, 9);
            const c = random(3, 9);
            return `${b * c + random(1, 9)} − ${b} × ${c}`;
        }
        case "div-add": {
            const c = random(2, 9);
            return `${random(2, 20)} + ${c * random(2, 9)} ÷ ${c}`;
        }
        case "div-sub": {
            const c = random(2, 9);
            const q = random(2, 9);
            return `${c * q + random(1, 9)} − ${c * q} ÷ ${c}`;
        }
        case "two-mult":
            return `${random(2, 9)} × ${random(2, 9)} + ${random(2, 9)} × ${random(2, 9)}`;
        case "paren-add":
            return `(${random(2, 20)} + ${random(2, 9)}) × ${random(2, 9)}`;
        case "paren-sub": {
            const a = random(5, 20);
            return `(${a} − ${random(2, a - 1)}) × ${random(2, 9)}`;
        }
        case "chain": {
            const b = random(2, 9);
            const c = random(2, 9);
            return `${b * c + random(1, 9)} − ${b} × ${c} + ${random(2, 9)}`;
        }
        case "paren-two": {
            const a = random(4, 12);
            return `(${random(2, 9)} + ${random(2, 9)}) × (${a} − ${random(2, a - 1)})`;
        }
        default:
            return `${random(2, 9)} + ${random(2, 9)} × ${random(2, 9)}`;
    }
}

function buildOptions(expression, answer) {
    const flat = evaluateLeftToRight(expression);
    const noParen = evaluate(expression.replace(/[()]/g, ""));
    const candidates = [flat, noParen, answer + 1, answer - 1, answer + 2, answer - 2, answer + 10, answer - 10];

    const options = [answer];
    for (const value of shuffle(candidates)) {
        if (options.length >= 4) break;
        if (!Number.isInteger(value) || value < 0 || options.includes(value)) continue;
        options.push(value);
    }
    while (options.length < 4) {
        const filler = answer + options.length + 3;
        if (!options.includes(filler)) options.push(filler);
    }
    return shuffle(options);
}

function buildTask(form) {
    let expression = buildExpression(form);
    let answer = evaluate(expression);

    let guard = 0;
    while ((!Number.isInteger(answer) || answer < 0) && guard < 25) {
        expression = buildExpression(form);
        answer = evaluate(expression);
        guard++;
    }
    if (!Number.isInteger(answer) || answer < 0) {
        expression = `${random(2, 9)} + ${random(2, 9)} × ${random(2, 9)}`;
        answer = evaluate(expression);
    }

    return { expression, answer, options: buildOptions(expression, answer) };
}

export function renderOperationOrderPlay(step, root, next, progress) {

    const ac = new AbortController();
    const world = getActiveWorld();
    const ui = UI[world] ?? UI.postman;

    const duration = Number.isFinite(step.duration) && step.duration > 0 ? Math.min(step.duration, 300) : 60;
    const chosen = LEVELS.some(l => l.id === step.level) ? step.level : null;
    const defaultLevel = chosen ?? "hard";

    root.replaceChildren();

    const card = createCard();
    if (progress) card.append(progress);

    const title = document.createElement("h1");
    title.className = "mult-play-title";
    title.textContent = ui.title;
    card.append(title);

    const subtitle = document.createElement("p");
    subtitle.className = "mult-play-subtitle";
    const subtitleIdle = "🧮 Egyperces játék · műveleti sorrend";
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
        served: 0,
        ended: false,
        remaining: duration * 1000
    };

    let timerId = null;
    let lastTick = 0;
    let timerLabel = null;
    let timerFill = null;
    let scoreLabel = null;
    let slot = null;

    function stopTimer() {
        if (timerId !== null) {
            clearInterval(timerId);
            timerId = null;
        }
    }

    function formsFor(level) {
        return LEVELS.find(l => l.id === level)?.forms ?? LEVELS[1].forms;
    }

    function pickForm() {
        const forms = formsFor(state.level);
        const forced = state.served === 1 ? forms.filter(isParenForm) : [];
        state.served++;
        if (forced.length > 0) return pick(forced);
        let total = 0;
        for (const form of forms) total += state.weights.get(form) ?? FORM_WEIGHT[form] ?? 1;
        let roll = Math.random() * total;
        for (const form of forms) {
            roll -= state.weights.get(form) ?? FORM_WEIGHT[form] ?? 1;
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
        if (state.over) return;
        if (state.locked) endRound();
        else state.timeUp = true;
    }

    function advance(delay) {
        setTimeout(() => {
            if (state.timeUp) endRound();
            else nextTask();
        }, delay);
    }

    function showPicker() {
        stopTimer();
        message.clear();
        body.replaceChildren();
        subtitle.textContent = subtitleIdle;

        const lead = document.createElement("p");
        lead.className = "mult-play-lead";
        lead.textContent = "Milyen szinten számolsz? Egy perc alatt annyi feladatot oldasz meg helyesen, amennyit bírsz!";
        body.append(lead);

        const grid = document.createElement("div");
        grid.className = "mult-play-tables";
        body.append(grid);

        const buttons = new Map();

        function paintSelection() {
            for (const [id, btn] of buttons) btn.classList.toggle("active", state.level === id);
            bestLine.textContent = bestLineFor(state.level);
        }

        function bestLineFor(id) {
            const rec = getPlayRecord(RECORD_MODE, id);
            return rec ? `🏆 Legjobb eredményed: 🎯 ${rec.best}` : "🎯 Ennél még nincs rekordod – legyen ma!";
        }

        const bestLine = document.createElement("p");
        bestLine.className = "mult-play-bestline";

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
        state.served = 0;
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
        stopTimer();
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
        state.current = { form, ...buildTask(form) };
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

        const task = state.current;
        const weight = state.weights.get(task.form) ?? FORM_WEIGHT[task.form] ?? 1;

        if (value === task.answer) {
            state.correct++;
            state.missed.delete(task.expression);
            state.weights.set(task.form, Math.max(1, weight * 0.5));
            if (btn) markCorrect(btn);
            message.show(`${task.expression} = ${task.answer}!`, "success");
            paintScore();
            advance(600);
            return;
        }

        state.missed.set(task.expression, task);
        state.weights.set(task.form, Math.min(12, weight * 3 + 1));
        if (btn) btn.classList.add("mult-play-option-wrong");
        revealCorrect(task);
        message.show(`💡 ${task.expression} = ${task.answer}. Először a zárójel, aztán a szorzás és az osztás, végül az összeadás és a kivonás.`, "retry");
        advance(2200);
    }

    function revealCorrect(task) {
        const opts = slot.querySelectorAll(".mult-play-option");
        for (const el of opts) {
            if (el.textContent.trim() === String(task.answer)) markCorrect(el);
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
        stopTimer();
        ac.abort();
    };
}