import { renderAdditionHint } from "./hints/additionHint.js";
import { renderSubtractionHint } from "./hints/subtractionHint.js";
import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createHintBox } from "./ui/hintBox.js";
import { createExercise } from "./ui/exerciseShell.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { makeOptions } from "./ui/optionHelper.js";

export function renderMixed(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    const ac = new AbortController();

    const title = document.createElement("h1");
    title.textContent = step.title;

    const useChoice = step.interaction === "choice";

    const equation = document.createElement("div");
    equation.className = "equation";

    const left = document.createElement("span");
    left.textContent = step.a;
    const opSpan = document.createElement("span");
    opSpan.textContent = step.op;
    const right = document.createElement("span");
    right.textContent = step.b;
    const equal = document.createElement("span");
    equal.textContent = "=";

    let input;
    let optionsContainer;
    let placeholder = null;

    const correctAnswer = step.inputPos === "left"
        ? step.a
        : step.inputPos === "right"
            ? step.b
            : step.answer;

    if (useChoice) {
        placeholder = document.createElement("span");
        placeholder.textContent = "?";
        placeholder.style.fontWeight = "bold";
        placeholder.style.color = "#4a90d9";

        if (step.inputPos === "left") {
            equation.append(placeholder, opSpan, right, equal);
        } else if (step.inputPos === "right") {
            equation.append(left, opSpan, placeholder, equal);
        } else {
            equation.append(left, opSpan, right, equal);
        }

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

        if (step.inputPos === "left") {
            equation.append(input, opSpan, right, equal);
        } else if (step.inputPos === "right") {
            equation.append(left, opSpan, input, equal);
        } else {
            equation.append(left, opSpan, right, equal, input);
        }

        if (step.inputPos !== "result") {
            const result = document.createElement("span");
            result.textContent = step.answer;
            equation.append(result);
        }
    }

    const hint = createHintBox();

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            if (step.op === "+") {
                renderAdditionHint({ a: step.a, b: step.b }, hint);
            } else {
                renderSubtractionHint({ a: step.a, b: step.b }, hint);
            }
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
                if (placeholder) {
                    placeholder.textContent = String(value);
                    placeholder.style.color = "#2e7d32";
                }
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
