import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";

const QUESTION_TEXT = {
    even: "Húzd a páros számokat a piros helyre!",
    odd: "Húzd a páratlan számokat a kék helyre!"
};

function createZone(label, kind) {
    const element = document.createElement("div");
    element.className = `eo-zone eo-${kind}`;

    const badge = document.createElement("span");
    badge.className = "eo-zone-label";
    badge.textContent = label;
    element.append(badge);

    return { element, kind };
}

export function renderEvenOdd(step, root, next, progress, onResult, onAttempt) {

    let mistakes = 0;
    let answered = false;
    let reported = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = "🎯 Páros vagy páratlan?";
    card.append(title);

    const hint = document.createElement("p");
    hint.className = "eo-hint";
    hint.textContent = QUESTION_TEXT[step.question];
    card.append(hint);

    const board = document.createElement("div");
    board.className = "eo-board";

    const chips = [];
    step.numbers.forEach(value => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "eo-chip";
        chip.dataset.value = value;
        chip.textContent = value;
        board.append(chip);
        chips.push(chip);
    });

    card.append(board);

    const red = createZone("Páros", "red");
    const blue = createZone("Páratlan", "blue");

    const targetZone = step.question === "even" ? red : blue;

    const zones = document.createElement("div");
    zones.className = "eo-zones";
    zones.append(targetZone.element);
    card.append(zones);

    const button = createButton("✅ Ellenőrzöm");
    card.append(button);

    const message = createMessageBox();
    card.append(message.element);

    root.append(card);

    let drag = null;

    card.addEventListener("pointerdown", (e) => {
        const chip = e.target.closest(".eo-chip");
        if (!chip || answered || drag) return;
        e.preventDefault();

        const rect = chip.getBoundingClientRect();

        const clone = chip.cloneNode(true);
        clone.classList.add("eo-clone");
        clone.style.width = rect.width + "px";
        clone.style.height = rect.height + "px";
        document.body.append(clone);

        chip.classList.add("eo-hidden");

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
        const r = targetZone.element.getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
            return targetZone.element;
        }
        return null;
    }

    function highlightZone(e) {
        targetZone.element.classList.toggle("eo-drag-over", getZoneAt(e.clientX, e.clientY) === targetZone.element);
    }

    function clearHighlight() {
        targetZone.element.classList.remove("eo-drag-over");
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

        drag.chip.classList.remove("eo-hidden");
        drag = null;

        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        document.removeEventListener("pointercancel", onUp);
    }

    function check() {
        if (answered) return;

        const isEvenQuestion = step.question === "even";
        const zoneElement = targetZone.element;

        let correct = true;

        for (const chip of chips) {
            const value = Number(chip.dataset.value);
            const isEven = value % 2 === 0;
            const matches = isEven === isEvenQuestion;

            if (matches) {
                if (chip.parentElement !== zoneElement) {
                    correct = false;
                }
            } else {
                if (chip.parentElement.classList.contains("eo-zone")) {
                    correct = false;
                }
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
