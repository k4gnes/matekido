import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback } from "./ui/feedback.js";
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

function walletPanel(coins, label) {
    const panel = document.createElement("div");
    panel.className = "money-cmp-wallet";

    const labelEl = document.createElement("div");
    labelEl.className = "money-cmp-label";
    labelEl.textContent = label;
    panel.append(labelEl);

    const coinsWrap = document.createElement("div");
    coinsWrap.className = "money-cmp-coins";
    coins.forEach(v => coinsWrap.append(createCoin(v, { size: 42 })));
    panel.append(coinsWrap);

    return panel;
}

export function renderMoneyCompare(step, root, next, progress, onResult, onAttempt) {

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "💰"} Melyik pénztárcában van több?`;
    card.append(title);

    const equation = document.createElement("div");
    equation.className = "money-cmp-equation";

    const left = walletPanel(step.leftCoins, "A");
    const right = walletPanel(step.rightCoins, "B");

    const operators = document.createElement("div");
    operators.className = "money-cmp-operators";

    equation.append(left, operators, right);
    card.append(equation);

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

    ["<", "=", ">"].forEach(op => {
        const btn = createButton(op, {
            className: "money-cmp-op",
            onClick: () => {
                if (feedback.isAnswered()) return;

                if (op === step.operator) {
                    feedback.success();
                } else {
                    feedback.retry();
                }
            }
        });
        operators.append(btn);
    });
}
