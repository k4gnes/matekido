import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_TITLES = {
    postman: "🥤 Mennyi fér bele?",
    racing: "🏎️ Mennyi fér bele?",
    football: "⚽ Mennyi fér bele?",
    cooking: "🍳 Mennyi fér bele?",
    animals: "🦁 Mennyi fér bele?",
    space: "🤖 Mennyi fér bele?"
};

export function renderVolume(step, root, next, progress, onResult, onAttempt) {

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = WORLD_TITLES[getActiveWorld()] ?? WORLD_TITLES.postman;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "volume-prompt";
    prompt.textContent = step.question === "több"
        ? "Melyik edénybe fér több?"
        : "Melyik edénybe fér kevesebb?";
    card.append(prompt);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "volume-options";

    [
        { side: "left", item: step.left },
        { side: "right", item: step.right }
    ].forEach(({ side, item }) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "volume-option";
        btn.dataset.side = side;

        const emoji = document.createElement("span");
        emoji.className = "volume-item-emoji";
        emoji.textContent = item.emoji;

        const name = document.createElement("span");
        name.className = "volume-item-name";
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
        const btn = e.target.closest(".volume-option");
        if (!btn || feedback.isAnswered()) return;

        if (btn.dataset.side === step.answer) {
            markCorrect(btn);
            feedback.success();
        } else {
            feedback.retry();
        }
    });
}
