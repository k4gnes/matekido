import { renderAdditionHint } from "./hints/additionHint.js";
import { renderSubtractionHint } from "./hints/subtractionHint.js";
import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createHintBox } from "./ui/hintBox.js";
import { createExercise } from "./ui/exercise.js";

export function renderMixed(step, root, next, progress, onResult, onAttempt) {

    let mistakes = 0;
    let hintShown = false;
    let answered = false;
    let reported = false;

    const ac = new AbortController();

    const title = document.createElement("h1");
    title.textContent = step.title;

    const equation = document.createElement("div");
    equation.className = "equation";

    const input = createNumberInput();

    const left = document.createElement("span");
    left.textContent = step.a;
    const opSpan = document.createElement("span");
    opSpan.textContent = step.op;
    const right = document.createElement("span");
    right.textContent = step.b;
    const equal = document.createElement("span");
    equal.textContent = "=";

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
            input.focus();
        }
    });
    hintButton.style.display = "none";

    const button = createButton("Ellenőrzöm");

    const { message } = createExercise({
        root, title, progress,
        children: [equation, button, hintButton, hint]
    });

    requestAnimationFrame(() => {
        input.focus();
    });

    function check() {
        if (answered) return;

        const answer = Number(input.value);

        const correctAnswer = step.inputPos === "left"
            ? step.a
            : step.inputPos === "right"
                ? step.b
                : step.answer;

        onAttempt?.();

        if (answer === correctAnswer) {

            answered = true;
            input.disabled = true;
            button.disabled = true;

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
            input.focus();
            input.select();
        }
    }

    button.addEventListener("click", check);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") check();
    }, { signal: ac.signal });
}
