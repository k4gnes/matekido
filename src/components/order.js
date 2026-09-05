import { createButton } from "./ui/button.js";
import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_TITLES = {
    postman: "📮 Rendezzük sorainkat!",
    racing: "🏎️ Rendezzük sorainkat!",
    football: "⚽ Rendezzük sorainkat!",
    cooking: "🍳 Rendezzük sorainkat!",
    animals: "🦁 Rendezzük sorainkat!",
    space: "🤖 Rendezzük sorainkat!"
};

const DIRECTION_TEXT = {
    asc: "Rendezd növekvő sorrendbe!",
    desc: "Rendezd csökkenő sorrendbe!"
};

export function renderOrder(step, root, next, progress, onResult, onAttempt) {

    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = WORLD_TITLES[world] ?? WORLD_TITLES.postman;
    card.append(title);

    const hint = document.createElement("p");
    hint.className = "order-hint";

    const arrow = document.createElement("span");
    arrow.className = "order-arrow " + (step.direction === "desc" ? "down" : "up");
    arrow.textContent = step.direction === "desc" ? "▼" : "▲";

    const label = document.createElement("span");
    label.textContent = DIRECTION_TEXT[step.direction] ?? DIRECTION_TEXT.asc;

    hint.append(arrow, label);
    card.append(hint);

    const board = document.createElement("div");
    board.className = "order-board";

    step.values.forEach(value => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "order-chip";
        chip.dataset.value = value;
        chip.textContent = value;
        board.append(chip);
    });

    card.append(board);

    const sortedLabel = document.createElement("p");
    sortedLabel.className = "order-label " + (step.direction === "desc" ? "order-desc" : "order-asc");
    sortedLabel.textContent = "Rendezett sor";
    card.append(sortedLabel);

    const sortedBoard = document.createElement("div");
    sortedBoard.className = "order-board order-sorted " + (step.direction === "desc" ? "order-desc" : "order-asc");
    card.append(sortedBoard);

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

    function moveChip(chip) {
        if (chip.parentElement === sortedBoard) {
            board.append(chip);
        } else {
            sortedBoard.append(chip);
        }
    }

    card.addEventListener("click", (e) => {
        if (feedback.isAnswered()) return;
        const chip = e.target.closest(".order-chip");
        if (!chip) return;
        moveChip(chip);
    });

    function check() {
        if (feedback.isAnswered()) return;

        const current = [...sortedBoard.querySelectorAll(".order-chip")].map(c => Number(c.dataset.value));

        if (current.length === step.answer.length && current.every((v, i) => v === step.answer[i])) {

            button.disabled = true;

            feedback.success();

        } else {

            feedback.retry();
        }
    }

    button.addEventListener("click", check);
}