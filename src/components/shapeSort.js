import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { SHAPE_CATEGORIES } from "../data/shapes.js";

function createZone(category) {
    const info = SHAPE_CATEGORIES[category];
    const element = document.createElement("div");
    element.className = `shape-zone shape-${category}`;

    const badge = document.createElement("span");
    badge.className = "shape-zone-label";
    badge.textContent = `${info.symbol} ${info.label}`;
    element.append(badge);

    return { element, category };
}

export function renderShapeSort(step, root, next, progress, onResult, onAttempt) {

    let mistakes = 0;
    let answered = false;
    let reported = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = "🟦 Rakd a helyére az alakzatokat!";
    card.append(title);

    const hint = document.createElement("p");
    hint.className = "shape-hint";
    hint.textContent = "Húzd az alakzatokat a megfelelő helyre!";
    card.append(hint);

    const board = document.createElement("div");
    board.className = "shape-board";

    const zoneFor = {};
    step.categories.forEach(cat => {
        zoneFor[cat] = createZone(cat);
    });

    const chips = [];
    const chipsByValue = {};
    step.items.forEach(item => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "shape-chip";
        chip.dataset.value = item.value;
        chip.textContent = item.value;
        board.append(chip);
        chips.push(chip);
        chipsByValue[item.value] = chip;
    });

    card.append(board);

    const zones = document.createElement("div");
    zones.className = "shape-zones";
    step.categories.forEach(cat => {
        zones.append(zoneFor[cat].element);
    });
    card.append(zones);

    const button = createButton("✅ Ellenőrzöm");
    card.append(button);

    const message = createMessageBox();
    card.append(message.element);

    root.append(card);

    const zoneElements = step.categories.map(cat => zoneFor[cat].element);

    let drag = null;

    card.addEventListener("pointerdown", (e) => {
        const chip = e.target.closest(".shape-chip");
        if (!chip || answered || drag) return;
        e.preventDefault();

        const rect = chip.getBoundingClientRect();

        const clone = chip.cloneNode(true);
        clone.classList.add("shape-clone");
        clone.style.width = rect.width + "px";
        clone.style.height = rect.height + "px";
        document.body.append(clone);

        chip.classList.add("shape-hidden");

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
        highlightZone(e);
    }

    function moveClone(e) {
        drag.clone.style.left = (e.clientX - drag.offsetX) + "px";
        drag.clone.style.top = (e.clientY - drag.offsetY) + "px";
    }

    function getZoneAt(x, y) {
        for (const el of zoneElements) {
            const r = el.getBoundingClientRect();
            if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
                return el;
            }
        }
        return null;
    }

    function highlightZone(e) {
        const zone = getZoneAt(e.clientX, e.clientY);
        zoneElements.forEach(el => el.classList.toggle("shape-drag-over", el === zone));
    }

    function clearHighlight() {
        zoneElements.forEach(el => el.classList.remove("shape-drag-over"));
    }

    function onUp(e) {
        if (!drag) return;

        drag.clone.remove();
        clearHighlight();

        const zone = getZoneAt(e.clientX, e.clientY);
        if (zone) {
            zone.append(drag.chip);
        } else {
            board.append(drag.chip);
        }

        drag.chip.classList.remove("shape-hidden");
        drag = null;

        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        document.removeEventListener("pointercancel", onUp);
    }

    function check() {
        if (answered) return;

        let correct = true;

        for (const item of step.items) {
            const chip = chipsByValue[item.value];
            const target = zoneFor[item.category].element;
            if (chip.parentElement !== target) {
                correct = false;
            }
        }

        onAttempt?.();

        if (correct) {
            answered = true;
            button.disabled = true;

            message.show("😊 Szép munka!", "success");

            if (!reported) {
                reported = true;
                onResult?.(true);
            }
            setTimeout(() => next(), 800);
        } else {
            if (mistakes === 1) {
                message.show("🙂 Majdnem! Próbáld meg még egyszer!", "retry");
            } else {
                message.show("🤔 Még nem sikerült.", "retry");
            }
            mistakes++;

            if (!reported) {
                reported = true;
                onResult?.(false);
            }
        }
    }

    button.addEventListener("click", check);
}
