import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";

const TARGET_LABEL = {
    tens: "tízesre",
    hundreds: "százasra"
};

export function renderRounding(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();

    const useChoice = step.interaction === "choice";

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = "🎯 Kerekítsük kerekre!";

    const hint = document.createElement("p");
    hint.className = "mult-hint";
    hint.textContent = `Kerekítsd ${TARGET_LABEL[step.target]}!`;

    const display = document.createElement("div");
    display.className = "mult-expression";

    const numberSpan = document.createElement("span");
    numberSpan.textContent = step.number;
    display.append(numberSpan);

    card.append(title, hint, display);

    let input;
    let optionsContainer;
    let button;

    if (useChoice) {
        optionsContainer = document.createElement("div");
        optionsContainer.className = "mult-options";

        step.options.forEach(value => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "mult-option";
            btn.textContent = value;
            btn.dataset.value = value;
            optionsContainer.append(btn);
        });

        card.append(optionsContainer);
    } else {
        input = createNumberInput();
        input.className = "mult-input";
        card.append(input);

        button = createButton("Ellenőrzöm");
        card.append(button);
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

    if (input) {
        requestAnimationFrame(() => {
            input.focus();
        });
    }

    function check() {
        if (feedback.isAnswered()) return;

        const answer = Number(input.value);
        if (isNaN(answer)) return;

        if (answer === step.answer) {
            input.disabled = true;
            button.disabled = true;
            feedback.success();
        } else {
            feedback.retry();
            input.focus();
            input.select();
        }
    }

    if (input) {
        button.addEventListener("click", check);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") check();
        }, { signal: ac.signal });
    }

    if (useChoice && optionsContainer) {
        optionsContainer.addEventListener("click", (e) => {
            const btn = e.target.closest(".mult-option");
            if (!btn || feedback.isAnswered()) return;
            const value = Number(btn.dataset.value);

            if (value === step.answer) {
                markCorrect(btn);
                optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
                feedback.success();
            } else {
                feedback.retry();
            }
        });
    }
}