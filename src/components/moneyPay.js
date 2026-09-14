import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback } from "./ui/feedback.js";
import { createCoin } from "./ui/coin.js";
import { COINS } from "../data/money.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_EMOJI = {
    postman: "💰",
    racing: "🔧",
    football: "⚽",
    cooking: "🥄",
    animals: "🦁",
    space: "🤖"
};

const NOTE_VALUES = new Set([200, 500, 1000]);

function isNote(value) {
    return NOTE_VALUES.has(value);
}

export function renderMoneyPay(step, root, next, progress, onResult, onAttempt) {

    const wallet = [];

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "💰"} Fizesd ki pontosan!`;
    card.append(title);

    const itemRow = document.createElement("div");
    itemRow.className = "money-item";
    itemRow.innerHTML = `
        <span class="money-item-emoji">${step.emoji}</span>
        <span class="money-item-name">${step.name}</span>
        <span class="money-item-price">${step.price} Ft</span>
    `;
    card.append(itemRow);

    const prompt = document.createElement("p");
    prompt.className = "money-prompt";
    const coinValues = step.coins ?? COINS;
    const hasNotes = coinValues.some(isNote);
    prompt.textContent = hasNotes
        ? "Válogass érméket és bankjegyeket a pénztárcába, hogy pontosan kifizesd!"
        : "Válogass érméket a pénztárcába, hogy pontosan kifizesd!";
    card.append(prompt);

    const tray = document.createElement("div");
    tray.className = "money-tray";
    coinValues.forEach(value => {
        tray.append(createCoin(value, {
            size: isNote(value) ? 72 : 58,
            note: isNote(value),
            onClick: () => {
                if (feedback.isAnswered()) return;
                wallet.push(value);
                renderWallet();
            }
        }));
    });
    card.append(tray);

    const walletBox = document.createElement("div");
    walletBox.className = "money-wallet";
    card.append(walletBox);

    const totalRow = document.createElement("div");
    totalRow.className = "money-total";
    card.append(totalRow);

    const clearBtn = createButton("🗑️ Kiürítem", {
        className: "money-secondary",
        onClick: () => {
            if (feedback.isAnswered()) return;
            wallet.length = 0;
            renderWallet();
        }
    });

    const checkBtn = createButton("Ellenőrzöm", { className: "nav-bar-btn" });
    checkBtn.addEventListener("click", check);

    const message = createMessageBox();
    card.append(clearBtn, checkBtn, message.element);

    root.replaceChildren(card);

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    function renderWallet() {
        walletBox.replaceChildren();
        const total = wallet.reduce((s, v) => s + v, 0);

        wallet.forEach((value, index) => {
            walletBox.append(createCoin(value, {
                size: isNote(value) ? 60 : 46,
                note: isNote(value),
                onClick: () => {
                    if (feedback.isAnswered()) return;
                    wallet.splice(index, 1);
                    renderWallet();
                }
            }));
        });

        if (wallet.length === 0) {
            const empty = document.createElement("span");
            empty.className = "money-wallet-empty";
            empty.textContent = "A pénztárca még üres…";
            walletBox.append(empty);
        }

        totalRow.textContent = `Összesen: ${total} Ft`;
    }

    function check() {
        if (feedback.isAnswered()) return;

        const total = wallet.reduce((s, v) => s + v, 0);

        if (total === step.price) {
            checkBtn.disabled = true;
            clearBtn.disabled = true;
            feedback.success(`🎉 Pontosan ${total} Ft-ot fizettél ki!`);
        } else {
            feedback.retry(`${feedback.getMistakes() === 1 ? "🙂 Majdnem!" : "🤔"} Most ${total} Ft van a tárcában, a termék ára ${step.price} Ft.`);
        }
    }

    renderWallet();
}
