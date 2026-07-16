import { renderAdditionHint } from "./hints/additionHint.js";
import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createHintBox } from "./ui/hintBox.js";

export function renderAddition(step, root, next, progress) {

    let mistakes = 0;
    let hintShown = false;
    let answered = false;

    root.replaceChildren();
    const card = createCard();

    const title = document.createElement("h1");
    title.textContent = step.title;

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

    const input = createNumberInput();

    equation.append(first, plus, second, equal, input);

    const message = createMessageBox();

    const hint = createHintBox();

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            renderAdditionHint(step, hint);
            hintButton.style.display = "none";
            input.focus();
        }
    });
    hintButton.style.display = "none";

    const button = createButton("Ellenőrzöm");

    if (progress) {
        card.append(progress);
    }

    card.append(
        title,
        equation,
        button,
        message.element,
        hintButton,
        hint
    );

    root.append(card);

    requestAnimationFrame(() => {
        input.focus();
    });

    function check() {
        if (answered) return;

        const answer = Number(input.value);
        const correctAnswer = step.a + step.b;

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
