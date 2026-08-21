import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { createCoin } from "./ui/coin.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_EMOJI = {
    postman: "💰",
    racing: "🔧",
    football: "⚽",
    cooking: "🥄",
    animals: "🦁",
    space: "🤖"
};

export function renderMoneyEnough(step, root, next, progress, onResult, onAttempt) {

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "💰"} Meg tudod venni?`;
    card.append(title);

    const itemRow = document.createElement("div");
    itemRow.className = "money-item";
    itemRow.innerHTML = `
        <span class="money-item-emoji">${step.emoji}</span>
        <span class="money-item-name">${step.name}</span>
        <span class="money-item-price">${step.price} Ft</span>
    `;
    card.append(itemRow);

    const walletLabel = document.createElement("p");
    walletLabel.className = "money-prompt";
    walletLabel.textContent = "A pénztárcádban ennyi pénz van:";
    card.append(walletLabel);

    const coinsWrap = document.createElement("div");
    coinsWrap.className = "money-cmp-coins";
    step.coins.forEach(v => coinsWrap.append(createCoin(v, { size: 46 })));
    card.append(coinsWrap);

    const question = document.createElement("p");
    question.className = "money-prompt";
    question.textContent = "Van elég pénz? Meg tudod venni?";
    card.append(question);

    const buttons = document.createElement("div");
    buttons.className = "money-enough-btns";

    const yesBtn = createButton("✅ Igen", {
        className: "money-enough-btn money-enough-yes",
        onClick: () => answer(true, yesBtn)
    });
    const noBtn = createButton("❌ Nem", {
        className: "money-enough-btn money-enough-no",
        onClick: () => answer(false, noBtn)
    });
    buttons.append(yesBtn, noBtn);
    card.append(buttons);

    const message = createMessageBox();
    card.append(message.element);

    root.replaceChildren(card);

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    function answer(guessed, btn) {
        if (feedback.isAnswered()) return;

        if (guessed === step.enough) {
            markCorrect(btn);
            feedback.success(step.enough ? "🎉 Igen, meg tudod venni!" : "🎉 Nem, nincs elég pénz!");
        } else {
            feedback.retry();
        }
    }
}
