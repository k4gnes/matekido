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

    let drag = null;

    board.addEventListener("pointerdown", (e) => {
        const chip = e.target.closest(".order-chip");
        if (!chip || feedback.isAnswered() || drag) return;
        e.preventDefault();

        const rect = chip.getBoundingClientRect();

        const clone = chip.cloneNode(true);
        clone.classList.add("order-clone");
        clone.style.width = rect.width + "px";
        clone.style.height = rect.height + "px";
        document.body.append(clone);

        chip.classList.add("order-hidden");

        drag = {
            chip,
            clone,
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top
        };

        moveClone(e);

        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onUp);
        document.addEventListener("pointercancel", onUp);
    });

    function onMove(e) {
        e.preventDefault();
        if (!drag) return;
        moveClone(e);
        placeChip(e);
    }

    function moveClone(e) {
        drag.clone.style.left = (e.clientX - drag.offsetX) + "px";
        drag.clone.style.top = (e.clientY - drag.offsetY) + "px";
    }

    function placeChip(e) {
        const visible = [...board.querySelectorAll(".order-chip:not(.order-hidden)")];

        let target = null;
        let bestDist = Infinity;
        for (const c of visible) {
            const r = c.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const d = (e.clientX - cx) ** 2 + (e.clientY - cy) ** 2;
            if (d < bestDist) {
                bestDist = d;
                target = c;
            }
        }
        if (!target) return;

        const r = target.getBoundingClientRect();
        const tc = r.left + r.width / 2;
        const tcy = r.top + r.height / 2;
        const dx = e.clientX - tc;
        const dy = e.clientY - tcy;
        const before = Math.abs(dx) >= Math.abs(dy)
            ? e.clientX < tc
            : e.clientY < tcy;

        if (before) {
            board.insertBefore(drag.chip, target);
        } else {
            board.insertBefore(drag.chip, target.nextSibling);
        }
    }

    function onUp() {
        if (!drag) return;
        drag.clone.remove();
        drag.chip.classList.remove("order-hidden");
        drag = null;
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        document.removeEventListener("pointercancel", onUp);
    }

    function check() {
        if (feedback.isAnswered()) return;

        const current = [...board.querySelectorAll(".order-chip")].map(c => Number(c.dataset.value));

        if (current.every((v, i) => v === step.answer[i])) {

            button.disabled = true;

            feedback.success();

        } else {

            feedback.retry();
        }
    }

    button.addEventListener("click", check);
}
