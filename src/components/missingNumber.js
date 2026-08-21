import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createExercise } from "./ui/exerciseShell.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";
import { makeOptions } from "./ui/optionHelper.js";

const WORLD_TITLES = {
    postman: "📮 Mennyi levél hiányzik?",
    racing: "🔧 Hány kör hiányzik?",
    football: "⚽ Hány gól hiányzik?",
    cooking: "🍳 Hány hozzávaló hiányzik?",
    animals: "🦁 Hány állat hiányzik?",
    space: "🤖 Hány robot hiányzik?"
};

export function renderMissingNumber(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();

    const world = getActiveWorld();

    const title = document.createElement("h1");
    title.textContent = WORLD_TITLES[world] ?? WORLD_TITLES.postman;

    const useChoice = step.interaction === "choice";

    const equation = document.createElement("div");
    equation.className = "equation";

    const first = document.createElement("span");
    first.textContent = step.a;

    const plus = document.createElement("span");
    plus.textContent = "+";

    const equal = document.createElement("span");
    equal.textContent = "=";

    const result = document.createElement("span");
    result.textContent = step.sum;

    let input;
    let optionsContainer;
    let placeholder = null;

    if (useChoice) {
        placeholder = document.createElement("span");
        placeholder.textContent = "?";
        placeholder.style.fontWeight = "bold";
        placeholder.style.color = "#4a90d9";

        equation.append(first, plus, placeholder, equal, result);

        const options = makeOptions(step.answer, Math.max(0, step.answer - 10), step.answer + 10);
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
    } else {
        input = createNumberInput();
        equation.append(first, plus, input, equal, result);
    }

    const button = useChoice ? null : createButton("Ellenőrzöm");

    const children = [equation];
    if (optionsContainer) children.push(optionsContainer);
    if (button) children.push(button);

    const { message, card } = createExercise({
        root, title, progress,
        children
    });

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
                if (button) button.disabled = true;
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

    if (useChoice && optionsContainer) {
        optionsContainer.addEventListener("click", (e) => {
            const btn = e.target.closest(".mult-option");
            if (!btn || feedback.isAnswered()) return;

            const value = Number(btn.dataset.value);

            if (value === step.answer) {
                markCorrect(btn);
                if (placeholder) {
                    placeholder.textContent = String(value);
                    placeholder.style.color = "#2e7d32";
                }
            }

            checkAnswer(value === step.answer);
        });
    } else if (input && button) {
        function check() {
            const answer = Number(input.value);
            if (isNaN(answer)) return;
            checkAnswer(answer === step.answer);
        }
        button.addEventListener("click", check);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") check();
        }, { signal: ac.signal });
    }
}
