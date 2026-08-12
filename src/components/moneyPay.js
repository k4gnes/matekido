import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
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

export function renderMoneyPay(step, root, next, progress, onResult, onAttempt) {

    let mistakes = 0;
    let reported = false;
    let solved = false;

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
    prompt.textContent = "Válogass érméket a pénztárcába, hogy pontosan kifizesd!";
    card.append(prompt);

    const tray = document.createElement("div");
    tray.className = "money-tray";
    COINS.forEach(value => {
        tray.append(createCoin(value, {
            size: 58,
            onClick: () => {
                if (solved) return;
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
            if (solved) return;
            wallet.length = 0;
            renderWallet();
        }
    });

    const checkBtn = createButton("✅ Ellenőrzöm");
    checkBtn.addEventListener("click", check);

    const message = createMessageBox();
    card.append(clearBtn, checkBtn, message.element);

    root.replaceChildren(card);

    function renderWallet() {
        walletBox.replaceChildren();
        const total = wallet.reduce((s, v) => s + v, 0);

        wallet.forEach((value, index) => {
            walletBox.append(createCoin(value, {
                size: 46,
                onClick: () => {
                    if (solved) return;
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
        if (solved) return;

        const total = wallet.reduce((s, v) => s + v, 0);

        onAttempt?.();

        if (total === step.price) {
            solved = true;
            checkBtn.disabled = true;
            clearBtn.disabled = true;
            message.show(`🎉 Pontosan ${total} Ft-ot fizettél ki!`, "success");

            if (!reported) {
                reported = true;
                onResult?.(true);
            }
            setTimeout(() => next(), 900);
        } else {
            if (!reported) {
                reported = true;
                onResult?.(false);
            }

            if (mistakes === 1) {
                message.show(`🙂 Majdnem! Most ${total} Ft van a tárcában, a termék ára ${step.price} Ft.`, "retry");
            } else {
                message.show(`🤔 Most ${total} Ft van a tárcában, a termék ára ${step.price} Ft.`, "retry");
            }
            mistakes++;
        }
    }

    renderWallet();
}
