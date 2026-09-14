import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_EMOJI = {
    postman: "📮",
    racing: "🏎️",
    football: "⚽",
    cooking: "🍳",
    animals: "🦁",
    space: "🤖"
};

function renderTransform(step, card) {
    const hint = document.createElement("p");
    hint.className = "tc-hint";
    hint.textContent = "1 óra = 60 perc";
    card.append(hint);

    const expr = document.createElement("div");
    expr.className = "tc-expression";
    expr.textContent = `${step.question} ?`;
    card.append(expr);

    if (step.direction === "h2m") {
        const pict = document.createElement("p");
        pict.className = "tc-pict";
        pict.textContent = "🕐 60 perc = 1 óra";
        card.append(pict);
    }
}

export function renderTimeConvert(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();
    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();
    renderCSS(card);

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[world] ?? "🕐"} Idő – perc és óra`;
    card.append(title);

    renderTransform(step, card);

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

            feedback.success(`🎉 Ügyes! ${step.question} ${step.answer}.`);
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
        }, { signal: ac.signal });
    } else if (result.element && result.element.tagName === "DIV") {
        result.element.addEventListener("click", (e) => {
            const btn = e.target.closest(".tc-option");
            if (!btn || feedback.isAnswered()) return;

            const ok = Number(btn.dataset.value) === step.answer;
            if (ok) markCorrect(btn);

            checkAnswer(ok);
        });
    }
}

function renderChoiceMode(step, card) {
    const optionsContainer = document.createElement("div");
    optionsContainer.className = "tc-options";

    step.options.forEach(value => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tc-option";
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
    input.className = "tc-input";
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
        .tc-hint {
            font-size: 1.1rem;
            font-weight: 600;
            text-align: center;
            color: #b45309;
            background: #fef3c7;
            border: 1px solid #fcd34d;
            border-radius: 10px;
            padding: 0.5rem;
            margin: 0.6rem 0;
        }
        .tc-pict {
            font-size: 1rem;
            font-weight: 600;
            text-align: center;
            color: #475569;
            margin: 0.2rem 0;
        }
        .tc-expression {
            font-size: 2.2rem;
            font-weight: 800;
            text-align: center;
            margin: 1rem 0 0.4rem;
            color: #1e293b;
        }
        .tc-options {
            display: flex;
            gap: 0.8rem;
            justify-content: center;
            flex-wrap: wrap;
            margin: 0.8rem 0;
        }
        .tc-option {
            min-width: 72px;
            font-size: 1.4rem;
            font-weight: 700;
            color: #1e293b;
            background: #ffffff;
            border: 2px solid #cbd5e1;
            border-radius: 14px;
            padding: 0.5rem 0.8rem;
            cursor: pointer;
        }
        .tc-option:hover {
            transform: scale(1.05);
            border-color: #94a3b8;
        }
        .tc-input {
            width: 6ch;
            text-align: center;
            font-size: 2rem;
            padding: .3rem;
            border: 2px solid #bbb;
            border-radius: 8px;
            margin: 1rem auto;
            display: block;
        }
        .tc-input:focus {
            border-color: #4a90d9;
            outline: none;
        }
    `;
    card.prepend(style);
}