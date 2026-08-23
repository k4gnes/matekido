import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_TITLES = {
    postman: "💰 Visszajáró",
    racing: "🔧 Visszajáró a műhelyboltban",
    football: "⚽ Visszajáró a szurkolói boltban",
    cooking: "🥄 Visszajáró a pékségben",
    animals: "🦁 Visszajáró a jegypénztárnál",
    space: "🤖 Visszajáró az űrboltban"
};

export function renderMoneyChange(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = WORLD_TITLES[getActiveWorld()] ?? WORLD_TITLES.postman;
    card.append(title);

    const itemRow = document.createElement("div");
    itemRow.className = "money-item";
    itemRow.innerHTML = `
        <span class="money-item-emoji">${step.emoji}</span>
        <span class="money-item-name">${step.name}</span>
        <span class="money-item-price">${step.price} Ft</span>
    `;
    card.append(itemRow);

    const paidRow = document.createElement("p");
    paidRow.className = "mc-paid";
    paidRow.textContent = `Fizettél vele: ${step.paid} Ft`;
    card.append(paidRow);

    const prompt = document.createElement("p");
    prompt.className = "mc-prompt";
    prompt.textContent = "Mennyi visszajárót kapsz?";
    card.append(prompt);

    const inputRow = document.createElement("div");
    inputRow.className = "mc-input-row";

    const input = document.createElement("input");
    input.type = "number";
    input.className = "mc-input";
    input.placeholder = "?";

    const checkBtn = document.createElement("button");
    checkBtn.type = "button";
    checkBtn.className = "mc-check";
    checkBtn.textContent = "✅ Ellenőrzöm";

    inputRow.append(input, checkBtn);
    card.append(inputRow);

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

    requestAnimationFrame(() => input.focus());

    function check() {
        if (feedback.isAnswered()) return;

        const answer = Number(input.value);
        if (!input.value || Number.isNaN(answer)) return;

        if (answer === step.change) {
            input.disabled = true;
            checkBtn.disabled = true;
            feedback.success(`🎉 Pontosan ${step.change} Ft a visszajáró!`);
        } else {
            feedback.retry();
            input.focus();
            input.select();
        }
    }

    checkBtn.addEventListener("click", check, { signal: ac.signal });
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") check();
    }, { signal: ac.signal });
}
