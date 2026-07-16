import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createMessageBox } from "./ui/messageBox.js";

export function renderMissingNumber(step, root, next, progress) {

    let mistakes = 0;
    let answered = false;

    root.replaceChildren();

    const card = createCard();

    const title = document.createElement("h1");
    title.textContent = "🔢 Mennyi hiányzik?";

    const equation = document.createElement("div");
    equation.className = "equation";

    const first = document.createElement("span");
    first.textContent = step.a;

    const plus = document.createElement("span");
    plus.textContent = "+";

    const input = createNumberInput();

    const equal = document.createElement("span");
    equal.textContent = "=";

    const result = document.createElement("span");
    result.textContent = step.sum;

    equation.append(first, plus, input, equal, result);

    const message = createMessageBox();

    const button = createButton("Ellenőrzöm");

    if (progress) {
        card.append(progress);
    }

    card.append(title, equation, button, message.element);

    root.append(card);

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
