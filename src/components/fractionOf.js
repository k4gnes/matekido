import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const FRACTION_NAMES = { 2: "fele", 3: "harmada", 4: "negyede" };
const FRACTION_SYMBOLS = { 2: "½", 3: "⅓", 4: "¼" };

const WORLD_EMOJI = {
    postman: "📮",
    racing: "🏎️",
    football: "⚽",
    cooking: "🍳",
    animals: "🦁",
    space: "🤖"
};

function renderVisual(step, card) {
    if (step.visual === "bar") {
        const wrap = document.createElement("div");
        wrap.className = "fof-bar-wrap";

        const value = document.createElement("div");
        value.className = "fof-bar-value";
        value.textContent = step.whole;
        wrap.append(value);

        const bar = document.createElement("div");
        bar.className = "fof-bar";
        for (let i = 0; i < step.denominator; i++) {
            const seg = document.createElement("div");
            seg.className = "fof-bar-seg" + (i === 0 ? " fof-bar-seg-hot" : "");
            bar.append(seg);
        }
        wrap.append(bar);

        const note = document.createElement("p");
        note.className = "fof-note";
        note.textContent = `${step.whole}-t ${step.denominator} egyenlő részre osztva – a piros rész egy ${FRACTION_NAMES[step.denominator]}.`;
        wrap.append(note);

        card.append(wrap);
        return;
    }

    const hint = document.createElement("p");
    hint.className = "fof-hint";
    hint.textContent = `${step.whole} ${step.emoji} – ${step.denominator} egyenlő részre osztva. Mennyi az egyik rész?`;
    card.append(hint);

    const visual = document.createElement("div");
    visual.className = "fof-visual";

    for (let g = 0; g < step.denominator; g++) {
        const group = document.createElement("div");
        group.className = `fof-row${g === 0 ? " fof-row-highlight" : ""}`;
        for (let i = 0; i < step.answer; i++) {
            const item = document.createElement("span");
            item.className = "fof-item";
            item.textContent = step.emoji;
            group.append(item);
        }
        visual.append(group);
    }

    const note = document.createElement("p");
    note.className = "fof-note";
    note.textContent = `A piros rész a ${FRACTION_NAMES[step.denominator]} – ${step.answer} darab.`;
    visual.append(note);

    card.append(visual);
}

export function renderFractionOf(step, root, next, progress, onResult, onAttempt) {

    root.replaceChildren();

    const card = createCard();
    renderCSS(card);

    if (progress) {
        card.append(progress);
    }

    const emoji = WORLD_EMOJI[getActiveWorld()] ?? "🍕";
    const title = document.createElement("h1");
    title.textContent = `${emoji} ${FRACTION_NAMES[step.denominator]} – egész törtrésze`;
    card.append(title);

    renderVisual(step, card);

    const expr = document.createElement("div");
    expr.className = "fof-expression";
    expr.textContent = `${step.whole} ${FRACTION_NAMES[step.denominator]} = ?`;
    card.append(expr);

    const prompt = document.createElement("p");
    prompt.className = "fof-prompt";
    prompt.textContent = `Mennyi a ${step.whole}-nek a ${FRACTION_SYMBOLS[step.denominator]} (${FRACTION_NAMES[step.denominator]})?`;
    card.append(prompt);

    let result;

    if (step.interaction === "input") {
        result = renderInputMode(step, card);
    } else {
        result = renderChoiceMode(step, card);
    }

    const message = createMessageBox();
    card.append(message.element);

    root.append(card);

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    if (result.isInput && result.input) {
        requestAnimationFrame(() => result.input.focus());
    }

    function checkAnswer(isCorrect) {
        if (feedback.isAnswered()) return;

        if (isCorrect) {
            if (result.isInput) {
                result.input.disabled = true;
                result.button.disabled = true;
            } else if (result.element && result.element.tagName === "DIV") {
                result.element.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
            }

            feedback.success(`🎉 Ügyes! A ${step.whole} ${FRACTION_NAMES[step.denominator]} a ${step.answer}.`);
        } else {
            feedback.retry();

            if (result.isInput && result.input) {
                result.input.focus();
                result.input.select();
            }
        }
    }

    if (result.isInput) {
        result.button.addEventListener("click", () => {
            const answer = Number(result.input.value);
            if (isNaN(answer)) return;
            checkAnswer(answer === step.answer);
        });
        result.input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const answer = Number(result.input.value);
                if (isNaN(answer)) return;
                checkAnswer(answer === step.answer);
            }
        });
    } else if (result.element && result.element.tagName === "DIV") {
        result.element.addEventListener("click", (e) => {
            const btn = e.target.closest(".fof-option");
            if (!btn || feedback.isAnswered()) return;

            const ok = Number(btn.dataset.value) === step.answer;
            if (ok) markCorrect(btn);

            checkAnswer(ok);
        });
    }
}

function renderChoiceMode(step, card) {
    const optionsContainer = document.createElement("div");
    optionsContainer.className = "fof-options";

    step.options.forEach(value => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "fof-option";
        btn.textContent = value;
        btn.dataset.value = value;
        optionsContainer.append(btn);
    });

    card.append(optionsContainer);

    return { element: optionsContainer, isInput: false };
}

function renderInputMode(step, card) {
    const input = document.createElement("input");
    input.type = "number";
    input.className = "fof-input";
    input.placeholder = "?";
    card.append(input);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "nav-bar-btn";
    button.textContent = "Ellenőrzöm";
    card.append(button);

    return { input, button, isInput: true };
}

function renderCSS(card) {
    const style = document.createElement("style");
    style.textContent = `
        .fof-expression {
            font-size: 2.2rem;
            font-weight: 800;
            text-align: center;
            margin: 1rem 0 0.2rem;
            color: #1e293b;
        }
        .fof-prompt {
            font-size: 1.1rem;
            font-weight: 600;
            text-align: center;
            margin: 0.2rem 0 1rem;
            color: #475569;
        }
        .fof-hint {
            font-size: 1rem;
            font-weight: 600;
            text-align: center;
            margin: 0.8rem 0 0.4rem;
            color: #475569;
        }
        .fof-visual {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
            margin: 0.6rem 0 0.4rem;
        }
        .fof-row {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 0.25rem;
            background: #f8fafc;
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            padding: 0.3rem 0.6rem;
            max-width: 90%;
        }
        .fof-row-highlight {
            border-color: #e2574c;
            background: #fff7ed;
        }
        .fof-note {
            font-size: 0.95rem;
            font-weight: 700;
            color: #b4423a;
            margin: 0.2rem 0 0.6rem;
        }
        .fof-item {
            font-size: 1.5rem;
            line-height: 1;
        }
        .fof-bar-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.4rem;
            margin: 0.6rem 0 0.8rem;
        }
        .fof-bar-value {
            font-size: 2.2rem;
            font-weight: 800;
            color: #1e293b;
        }
        .fof-bar {
            display: flex;
            width: min(80%, 420px);
            height: 46px;
            border: 3px solid #334155;
            border-radius: 10px;
            overflow: hidden;
        }
        .fof-bar-seg {
            flex: 1;
            background: #f6c453;
        }
        .fof-bar-seg + .fof-bar-seg {
            border-left: 3px solid #334155;
        }
        .fof-bar-seg-hot {
            background: #e2574c;
        }
        .fof-options {
            display: flex;
            gap: 0.8rem;
            justify-content: center;
            flex-wrap: wrap;
            margin: 0.8rem 0;
        }
        .fof-option {
            min-width: 64px;
            font-size: 1.4rem;
            font-weight: 700;
            color: #1e293b;
            background: #ffffff;
            border: 2px solid #cbd5e1;
            border-radius: 14px;
            padding: 0.5rem 0.8rem;
            cursor: pointer;
        }
        .fof-option:hover {
            transform: scale(1.05);
            border-color: #94a3b8;
        }
        .fof-input {
            width: 6ch;
            text-align: center;
            font-size: 2rem;
            padding: .3rem;
            border: 2px solid #bbb;
            border-radius: 8px;
            margin: 1rem auto;
            display: block;
        }
        .fof-input:focus {
            border-color: #4a90d9;
            outline: none;
        }
    `;
    card.prepend(style);
}