import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";
import { makeOptions } from "./ui/optionHelper.js";

const WORLD_NEIGHBOR_TITLE = {
    postman: "🔍 Szomszédok",
    racing: "🔍 Ki áll mellette?",
    football: "🔍 Ki a szomszédja?",
    cooking: "🔍 Ki a szomszédja?",
    animals: "🦁 Ki áll mellette a kifutóban?",
    space: "🤖 Ki áll mellette a sorban?"
};

export function renderNeighborSingle(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();
    const world = getActiveWorld();
    const useChoice = step.interaction === "choice";

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = WORLD_NEIGHBOR_TITLE[world] ?? WORLD_NEIGHBOR_TITLE.postman;
    card.append(title);

    const question = document.createElement("div");
    question.className = "equation";
    question.style.fontSize = "1.3rem";

    const qText = document.createElement("span");
    qText.textContent = step.question;

    let input;
    let optionsContainer;

    if (useChoice) {
        question.append(qText);
        card.append(question);

        const options = makeOptions(step.answer, step.answer - 5, step.answer + 5);
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
        question.append(qText, input);
        card.append(question);

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
