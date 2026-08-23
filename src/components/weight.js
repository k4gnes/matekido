import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_TITLES = {
    postman: "⚖️ Mérlegelés",
    racing: "🏎️ Mérlegelés a műhelyben",
    football: "⚽ Mérlegelés az öltözőben",
    cooking: "🍳 Mérlegelés a konyhában",
    animals: "🦁 Mérlegelés az állatkertben",
    space: "🤖 Mérlegelés az űrállomáson"
};

export function renderWeight(step, root, next, progress, onResult, onAttempt) {

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = WORLD_TITLES[getActiveWorld()] ?? WORLD_TITLES.postman;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "weight-prompt";
    prompt.textContent = step.question === "nehezebb"
        ? "Keresd meg azt, ami nehezebb!"
        : "Keresd meg azt, ami könnyebb!";
    card.append(prompt);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "weight-options";

    [
        { side: "left", item: step.left },
        { side: "right", item: step.right }
    ].forEach(({ side, item }) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "weight-option";
        btn.dataset.side = side;

        const emoji = document.createElement("span");
        emoji.className = "weight-item-emoji";
        emoji.textContent = item.emoji;

        const name = document.createElement("span");
        name.className = "weight-item-name";
        name.textContent = item.name;

        btn.append(emoji, name);
        optionsContainer.append(btn);
    });

    card.append(optionsContainer);

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

    optionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".weight-option");
        if (!btn || feedback.isAnswered()) return;

        if (btn.dataset.side === step.answer) {
            markCorrect(btn);
            feedback.success();
        } else {
            feedback.retry();
        }
    });
}
