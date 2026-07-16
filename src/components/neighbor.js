import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createExercise } from "./ui/exercise.js";

export function renderNeighbor(step, root, next, progress) {

    let mistakes = 0;
    let answered = false;

    const title = document.createElement("h1");
    title.textContent = "❓ Kinek a szomszédai?";

    const equation = document.createElement("div");
    equation.className = "equation";

    const left = document.createElement("span");
    left.textContent = step.left;
    left.style.fontSize = "2rem";
    left.style.fontWeight = "bold";
    left.style.margin = "0 1rem";

    const input = createNumberInput();

    const right = document.createElement("span");
    right.textContent = step.right;
    right.style.fontSize = "2rem";
    right.style.fontWeight = "bold";
    right.style.margin = "0 1rem";

    equation.append(left, input, right);

    const button = createButton("Ellenőrzöm");

    const { message } = createExercise({
        root, title, progress,
        children: [equation, button]
    });

    requestAnimationFrame(() => {
        input.focus();
    });

    function check() {
        if (answered) return;

        const answer = Number(input.value);

        if (answer === step.answer) {

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

            input.focus();
            input.select();
        }
    }

    button.addEventListener("click", check);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") check();
    });
}
