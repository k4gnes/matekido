import { renderAdditionHint } from "./hints/additionHint.js";
import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createHintBox } from "./ui/hintBox.js";
import { createExercise } from "./ui/exerciseShell.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { makeOptions } from "./ui/optionHelper.js";

export function renderAddition(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    const ac = new AbortController();

    const title = document.createElement("h1");
    title.textContent = step.title;

    const correctAnswer = step.a + step.b;
    const useChoice = step.interaction === "choice";

    const equation = document.createElement("div");
    equation.className = "equation";

    const first = document.createElement("span");
    first.textContent = step.a;

    const plus = document.createElement("span");
    plus.textContent = "+";

    const second = document.createElement("span");
    second.textContent = step.b;

    const equal = document.createElement("span");
    equal.textContent = "=";

    let input;
    let optionsContainer;

    if (useChoice) {
        equation.append(first, plus, second, equal);

        const options = makeOptions(correctAnswer, Math.max(0, correctAnswer - 15), correctAnswer + 15);
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
        equation.append(first, plus, second, equal, input);
    }

    const hint = createHintBox();

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            renderAdditionHint(step, hint);
            hintButton.style.display = "none";
            if (input) input.focus();
        }
    });
    hintButton.style.display = "none";

    const button = useChoice ? null : createButton("Ellenőrzöm");

    const children = [equation];
    if (optionsContainer) children.push(optionsContainer);
    if (button) children.push(button);
    children.push(hintButton, hint);

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

            if (feedback.getMistakes() >= 2 && !hintShown) {
                hintButton.style.display = "inline-block";
            }

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

            if (value === correctAnswer) {
                markCorrect(btn);
            }

            checkAnswer(value === correctAnswer);
        });
    } else if (input && button) {
        function check() {
            const answer = Number(input.value);
            if (isNaN(answer)) return;
            checkAnswer(answer === correctAnswer);
        }
        button.addEventListener("click", check);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") check();
        }, { signal: ac.signal });
    }
}
