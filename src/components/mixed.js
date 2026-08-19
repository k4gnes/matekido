import { renderAdditionHint } from "./hints/additionHint.js";
import { renderSubtractionHint } from "./hints/subtractionHint.js";
import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createHintBox } from "./ui/hintBox.js";
import { createExercise } from "./ui/exercise.js";

function makeOptions(answer, min, max, count = 4) {
    const options = [answer];
    const seen = new Set([answer]);
    const deltas = [1, -1, 2, -2, 3, -3, 5, -5, 10, -10];
    for (const d of deltas) {
        if (options.length >= count) break;
        const v = answer + d;
        if (v >= min && v <= max && !seen.has(v)) {
            seen.add(v);
            options.push(v);
        }
    }
    for (let v = min; v <= max && options.length < count; v++) {
        if (!seen.has(v)) {
            seen.add(v);
            options.push(v);
        }
    }
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
}

export function renderMixed(step, root, next, progress, onResult, onAttempt) {

    let mistakes = 0;
    let hintShown = false;
    let answered = false;
    let reported = false;

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

    const correctAnswer = step.inputPos === "left"
        ? step.a
        : step.inputPos === "right"
            ? step.b
            : step.answer;

    if (useChoice) {
        if (step.inputPos === "left") {
            equation.append(opSpan, right, equal);
        } else if (step.inputPos === "right") {
            equation.append(left, opSpan, equal);
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

    const { message } = createExercise({
        root, title, progress,
        children
    });

    if (input) {
        requestAnimationFrame(() => input.focus());
    }

    function checkAnswer(isCorrect) {
        if (answered) return;

        onAttempt?.();

        if (isCorrect) {
            answered = true;
            if (input) {
                input.disabled = true;
                if (button) button.disabled = true;
            }
            if (optionsContainer) {
                optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
            }

            message.show("😊 Szép munka!", "success");

            if (!reported) {
                reported = true;
                onResult?.(true);
            }
            ac.abort();
            setTimeout(() => next(), 800);
        } else {
            if (mistakes === 1) {
                message.show("🙂 Majdnem! Próbáld meg még egyszer!", "retry");
            } else {
                message.show("🤔 Még nem sikerült.", "retry");
            }

            mistakes++;

            if (mistakes >= 2 && !hintShown) {
                hintButton.style.display = "inline-block";
            }

            if (!reported) {
                reported = true;
                onResult?.(false);
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
            if (!btn || answered) return;
            checkAnswer(Number(btn.dataset.value) === correctAnswer);
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
