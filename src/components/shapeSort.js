import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback } from "./ui/feedback.js";
import { SHAPE_CATEGORIES } from "../data/shapes.js";
import { createShapeSvg } from "./ui/shapeSvg.js";

const ZONE_COLORS = {
    circle: "#e53935",
    triangle: "#f57c00",
    square: "#7e57c2",
    rectangle: "#1e88e5"
};

function createZone(category) {
    const info = SHAPE_CATEGORIES[category];
    const element = document.createElement("div");
    element.className = `shape-zone shape-${category}`;

    const badge = document.createElement("span");
    badge.className = "shape-zone-label";
    badge.append(createShapeSvg({ kind: info.kind, color: ZONE_COLORS[category], size: 16 }));
    badge.append(document.createTextNode(info.label));
    element.append(badge);

    return { element, category };
}

export function renderShapeSort(step, root, next, progress, onResult, onAttempt) {

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
    hint.textContent = "Kattints egy alakzatra, majd a helyére!";
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
        chip.append(createShapeSvg({ kind: item.kind, color: item.color, size: item.size }));
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

    const button = createButton("Ellenőrzöm", { className: "nav-bar-btn" });
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

    const zoneElements = step.categories.map(cat => zoneFor[cat].element);

    let selected = null;

    function clearTargets() {
        zoneElements.forEach(el => el.classList.remove("shape-drag-over"));
    }

    function selectChip(chip) {
        if (feedback.isAnswered()) return;
        if (selected === chip) {
            selected.classList.remove("shape-selected");
            selected = null;
            clearTargets();
            return;
        }
        if (selected) {
            selected.classList.remove("shape-selected");
        }
        selected = chip;
        selected.classList.add("shape-selected");
        zoneElements.forEach(el => el.classList.add("shape-drag-over"));
    }

    chips.forEach(chip => {
        chip.addEventListener("click", (e) => {
            e.stopPropagation();
            selectChip(chip);
        });
    });

    zoneElements.forEach(el => {
        el.addEventListener("click", (e) => {
            if (e.target.closest(".shape-chip")) return;
            if (!selected || feedback.isAnswered()) return;
            el.append(selected);
            selected.classList.remove("shape-selected");
            selected = null;
            clearTargets();
        });
    });

    function check() {
        if (feedback.isAnswered()) return;

        let correct = true;

        for (const item of step.items) {
            const chip = chipsByValue[item.value];
            const target = zoneFor[item.category].element;
            if (chip.parentElement !== target) {
                correct = false;
            }
        }

        if (correct) {
            button.disabled = true;

            feedback.success();
        } else {
            feedback.retry();
        }
    }

    button.addEventListener("click", check);
}