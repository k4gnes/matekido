import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_NEIGHBOR_TITLE = {
    postman: "🔍 Szomszédok",
    racing: "🔍 Ki áll mellette?",
    football: "🔍 Ki a szomszédja?"
};

export function renderNeighborSingle(step, root, next, progress, onResult) {

    let mistakes = 0;
    let answered = false;

    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = WORLD_NEIGHBOR_TITLE[world] ?? WORLD_NEIGHBOR_TITLE.postman;
    card.append(title);

    const question = document.createElement("div");
    question.className = "equation";
    question.style.fontSize = "1.3rem";

    const qText = document.createElement("span");
    qText.textContent = step.question;

    const input = createNumberInput();

    question.append(qText, input);
    card.append(question);

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

            onResult?.(true);
            setTimeout(() => next(), 800);

        } else {

            if (mistakes === 1) {
                message.show("🙂 Majdnem! Próbáld meg még egyszer!", "retry");
            } else {
                message.show("🤔 Még nem sikerült.", "retry");
            }

            mistakes++;

            onResult?.(false);
            input.focus();
            input.select();
        }
    }

    button.addEventListener("click", check);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") check();
    });
}
