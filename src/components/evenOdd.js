import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback } from "./ui/feedback.js";

const QUESTION_TEXT = {
    even: "Kattints a páros számokra, hogy a piros helyre kerüljenek!",
    odd: "Kattints a páratlan számokra, hogy a kék helyre kerüljenek!"
};

function createZone(label, kind) {
    const element = document.createElement("div");
    element.className = `eo-zone eo-${kind}`;

    const badge = document.createElement("span");
    badge.className = "eo-zone-label";
    badge.textContent = label;
    element.append(badge);

    return { element, kind };
}

export function renderEvenOdd(step, root, next, progress, onResult, onAttempt) {

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = "🎯 Páros vagy páratlan?";
    card.append(title);

    const hint = document.createElement("p");
    hint.className = "eo-hint";
    hint.textContent = QUESTION_TEXT[step.question];
    card.append(hint);

    const board = document.createElement("div");
    board.className = "eo-board";

    const chips = [];
    step.numbers.forEach(value => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "eo-chip";
        chip.dataset.value = value;
        chip.textContent = value;
        board.append(chip);
        chips.push(chip);
    });

    card.append(board);

    const red = createZone("Páros", "red");
    const blue = createZone("Páratlan", "blue");

    const targetZone = step.question === "even" ? red : blue;

    const zones = document.createElement("div");
    zones.className = "eo-zones";
    zones.append(targetZone.element);
    card.append(zones);

    const button = createButton("Ellenőrzöm");
    card.append(button);

    const message = createMessageBox();
    card.append(message.element);

    root.append(card);

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    card.addEventListener("click", (e) => {
        if (feedback.isAnswered()) return;
        const chip = e.target.closest(".eo-chip");
        if (!chip) return;
        if (chip.parentElement === targetZone.element) {
            board.append(chip);
        } else {
            targetZone.element.append(chip);
        }
    });

    function check() {
        if (feedback.isAnswered()) return;

        const isEvenQuestion = step.question === "even";
        const zoneElement = targetZone.element;

        let correct = true;

        for (const chip of chips) {
            const value = Number(chip.dataset.value);
            const isEven = value % 2 === 0;
            const matches = isEven === isEvenQuestion;

            if (matches) {
                if (chip.parentElement !== zoneElement) {
                    correct = false;
                }
            } else {
                if (chip.parentElement.classList.contains("eo-zone")) {
                    correct = false;
                }
            }
        }

        if (correct) {
            button.disabled = true;

            feedback.success();
        } else {
            feedback.retry();
        }
    }

    button.addEventListener("click", check);
}
