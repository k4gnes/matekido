import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📮 Rendezd sorba!",
    racing: "🏎️ Rendezd sorba!",
    football: "⚽ Rendezd sorba!",
    cooking: "🍳 Rendezd sorba!",
    animals: "🦁 Rendezd sorba!",
    space: "🤖 Rendezd sorba!",
    tram: "🚋 Rendezd sorba!"
};

export function renderCombinatorics(step, root, next, progress, onResult, onAttempt) {

    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = TITLES[world] ?? TITLES.postman;
    card.append(title);

    const items = step.items;
    const total = step.total ?? 6;
    const slots = items.map(() => null);
    const used = new Set();
    const found = [];

    const prompt = document.createElement("p");
    prompt.className = "comb-prompt";
    prompt.textContent = step.question ?? "Add meg a következő új sorrendet!";
    card.append(prompt);

    const counter = document.createElement("p");
    counter.className = "comb-counter";
    card.append(counter);

    const build = document.createElement("div");
    build.className = "comb-build";
    card.append(build);

    const tray = document.createElement("div");
    tray.className = "comb-tray";
    card.append(tray);

    const foundWrap = document.createElement("div");
    foundWrap.className = "comb-found";
    card.append(foundWrap);

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

    function render() {

        counter.textContent = `Megtalált sorrend: ${found.length} / ${total}`;
        const done = feedback.isAnswered();

        build.replaceChildren();
        slots.forEach((itemIndex, i) => {
            const slot = document.createElement("button");
            slot.type = "button";
            slot.className = "comb-slot" + (itemIndex === null ? "" : " filled");
            slot.textContent = itemIndex === null ? "?" : items[itemIndex];
            slot.disabled = done;
            slot.setAttribute("aria-label", itemIndex === null ? "Üres hely" : "Kitett elem");
            slot.addEventListener("click", () => removeAt(i));
            build.append(slot);
        });

        tray.replaceChildren();
        items.forEach((emoji, i) => {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "comb-item" + (used.has(i) ? " used" : "");
            chip.textContent = emoji;
            chip.disabled = done || used.has(i);
            chip.addEventListener("click", () => place(i));
            tray.append(chip);
        });

        foundWrap.replaceChildren();
        for (let i = 0; i < total; i++) {
            const cell = document.createElement("div");
            cell.className = "comb-found-cell" + (found[i] ? "" : " empty");
            cell.textContent = found[i] ? found[i].join(" ") : "? ? ?";
            foundWrap.append(cell);
        }
    }

    function nextEmpty() {
        return slots.indexOf(null);
    }

    function place(itemIndex) {
        if (feedback.isAnswered() || used.has(itemIndex)) return;
        const i = nextEmpty();
        if (i === -1) return;
        slots[i] = itemIndex;
        used.add(itemIndex);
        render();
        if (slots.every(s => s !== null)) {
            check();
        }
    }

    function removeAt(i) {
        if (feedback.isAnswered() || slots[i] === null) return;
        used.delete(slots[i]);
        slots[i] = null;
        render();
    }

    function clearSlots() {
        for (let i = 0; i < slots.length; i++) {
            if (slots[i] !== null) {
                used.delete(slots[i]);
            }
            slots[i] = null;
        }
        render();
    }

    function check() {
        const key = slots.join("|");
        const emojis = slots.map(i => items[i]);

        if (found.some(f => f.join("|") === key)) {
            message.show("🙂 Ezt a sorrendet már megtaláltad! Rakj ki egy másikat.", "retry");
            clearSlots();
            return;
        }

        found.push(emojis);
        message.show(`✨ Új sorrend! ${emojis.join(" ")}`, "success");
        clearSlots();

        if (found.length === total) {
            feedback.success(`🎉 Megvan mind a ${total} sorrend! Ügyes vagy!`);
            render();
        }
    }

    render();

}
