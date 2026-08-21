import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";
import { makeOptions } from "./ui/optionHelper.js";

const WORLD_TITLES = {
    postman: "📮 Mi a következő házszám?",
    racing: "🏎️ Mi a következő rajtszám?",
    football: "⚽ Mi a következő eredmény?",
    cooking: "🍳 Mi a következő oldalszám?",
    animals: "🦁 Mi a következő állat?",
    space: "🤖 Mi a következő robot?"
};

export function renderSequence(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();
    const world = getActiveWorld();
    const useChoice = step.interaction === "choice";

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = WORLD_TITLES[world] ?? WORLD_TITLES.postman;
    card.append(title);

    const sequence = document.createElement("div");
    sequence.className = "sequence";

    step.terms.forEach((num, index) => {
        const term = document.createElement("span");
        term.className = "sequence-term";
        term.textContent = num;
        sequence.append(term);

        if (index < step.terms.length - 1) {
            const sep = document.createElement("span");
            sep.className = "sequence-sep";
            sep.textContent = ",";
            sequence.append(sep);
        }
    });

    let input;
    let optionsContainer;

    if (useChoice) {
        card.append(sequence);

        const prompt = document.createElement("p");
        prompt.className = "mult-prompt";
        prompt.textContent = "Mi a következő szám?";
        card.append(prompt);

        const options = makeOptions(step.answer, step.answer - 10, step.answer + 10);
        optionsContainer = document.createElement("div");
        optionsContainer.className = "mult-options";

        options.forEach(value => {
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
        sequence.append(input);
        card.append(sequence);

        const button = createButton("Ellenőrzöm");
        card.append(button);

        button.addEventListener("click", check);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") check();
        }, { signal: ac.signal });
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
        requestAnimationFrame(() => input.focus());
    }

    function checkAnswer(isCorrect) {
        if (feedback.isAnswered()) return;

        if (isCorrect) {
            if (input) {
                input.disabled = true;
            }
            if (optionsContainer) {
                optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
            }

            feedback.success();
        } else {
            feedback.retry();

            if (input) {
                input.focus();
                input.select();
            }
        }
    }

    function check() {
        if (feedback.isAnswered()) return;
        const answer = Number(input.value);
        if (isNaN(answer)) return;
        checkAnswer(answer === step.answer);
    }

    if (useChoice && optionsContainer) {
        optionsContainer.addEventListener("click", (e) => {
            const btn = e.target.closest(".mult-option");
            if (!btn || feedback.isAnswered()) return;
            const value = Number(btn.dataset.value);

            if (value === step.answer) {
                markCorrect(btn);
            }

            checkAnswer(value === step.answer);
        });
    }
}
