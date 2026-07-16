import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";

export function renderNeighbor(step, root, next, progress) {

    let mistakes = 0;
    let answered = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = "❓ Kinek a szomszédai?";
    card.append(title);

    const row = document.createElement("div");
    row.className = "equation";

    const lowerTen = document.createElement("span");
    lowerTen.textContent = step.lowerTen;
    lowerTen.className = "neighbor-ten";

    const dotsLeft = document.createElement("span");
    dotsLeft.textContent = "...";
    dotsLeft.className = "neighbor-dots";

    const left = document.createElement("span");
    left.textContent = step.left;
    left.className = "neighbor-num";

    const input = createNumberInput();

    const right = document.createElement("span");
    right.textContent = step.right;
    right.className = "neighbor-num";

    const dotsRight = document.createElement("span");
    dotsRight.textContent = "...";
    dotsRight.className = "neighbor-dots";

    const upperTen = document.createElement("span");
    upperTen.textContent = step.upperTen;
    upperTen.className = "neighbor-ten";

    row.append(lowerTen, dotsLeft, left, input, right, dotsRight, upperTen);
    card.append(row);

    const button = createButton("Ellenőrzöm");
    card.append(button);

    const message = createMessageBox();
    card.append(message.element);

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
