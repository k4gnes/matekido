import { renderSubtractionHint } from "./hints/subtractionHint.js";
import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createHintBox } from "./ui/hintBox.js";
import { createExercise } from "./ui/exercise.js";

export function renderSubtraction(step, root, next, progress) {

    let mistakes = 0;
    let hintShown = false;
    let answered = false;

    const title = document.createElement("h1");
    title.textContent = step.title;

    const equation = document.createElement("div");
    equation.className = "equation";

    const first = document.createElement("span");
    first.textContent = step.a;

    const minus = document.createElement("span");
    minus.textContent = "-";

    const second = document.createElement("span");
    second.textContent = step.b;

    const equal = document.createElement("span");
    equal.textContent = "=";

    const input = createNumberInput();

    equation.append(first, minus, second, equal, input);

    const hint = createHintBox();

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            renderSubtractionHint(step, hint);
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
        const correctAnswer = step.a - step.b;

        if (answer === correctAnswer) {

            answered = true;
            input.disabled = true;
            button.disabled = true;

            message.show("😊 Szép munka!", "success");

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

            input.focus();
            input.select();
        }
    }

    button.addEventListener("click", check);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") check();
    });
}
