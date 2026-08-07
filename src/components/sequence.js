import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_TITLES = {
    postman: "📮 Mi a következő házszám?",
    racing: "🏎️ Mi a következő rajtszám?",
    football: "⚽ Mi a következő eredmény?",
    cooking: "🍳 Mi a következő oldalszám?"
};

export function renderSequence(step, root, next, progress, onResult, onAttempt) {

    let mistakes = 0;
    let answered = false;
    let reported = false;

    const ac = new AbortController();

    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = WORLD_TITLES[world] ?? WORLD_TITLES.postman;
    card.append(title);

    const sequence = document.createElement("div");
    sequence.className = "sequence";

    step.terms.forEach((num, index) => {
        const term = document.createElement("span");
        term.className = "sequence-term";
        term.textContent = num;
        sequence.append(term);

        if (index < step.terms.length - 1) {
            const sep = document.createElement("span");
            sep.className = "sequence-sep";
            sep.textContent = ",";
            sequence.append(sep);
        }
    });

    const input = createNumberInput();
    sequence.append(input);
    card.append(sequence);

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

        onAttempt?.();

        if (answer === step.answer) {

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
