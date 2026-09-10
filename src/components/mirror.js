import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "🪞 Tükrözés és szimmetria",
    racing: "🏎️ Tükrözés a boxutcában",
    football: "⚽ Tükrözés a pályán",
    cooking: "🍳 Tükrözés a konyhában",
    animals: "🦁 Tükrözés az állatkertben",
    space: "🤖 Tükrözés az űrhajón"
};

const SVG_NS = "http://www.w3.org/2000/svg";

const CELL = 30;
const ORIGIN = 15;

function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function maxCoord(cells, idx) {
    return Math.max(...cells.map(c => c[idx]));
}

function createMirrorLine(svg, axis) {
    if (axis === "vertical") {
        const x = ORIGIN + 2 * CELL;
        svg.append(svgEl("line", {
            x1: x, y1: ORIGIN - 8,
            x2: x, y2: ORIGIN + 4 * CELL + 8,
            stroke: "#ef4444", "stroke-width": "10", "stroke-opacity": ".25"
        }));
        svg.append(svgEl("line", {
            x1: x, y1: ORIGIN - 8,
            x2: x, y2: ORIGIN + 4 * CELL + 8,
            stroke: "#ef4444", "stroke-width": "5", "stroke-dasharray": "9 6"
        }));
    } else {
        const y = ORIGIN + 2 * CELL;
        svg.append(svgEl("line", {
            x1: ORIGIN - 8, y1: y,
            x2: ORIGIN + 4 * CELL + 8, y2: y,
            stroke: "#ef4444", "stroke-width": "10", "stroke-opacity": ".25"
        }));
        svg.append(svgEl("line", {
            x1: ORIGIN - 8, y1: y,
            x2: ORIGIN + 4 * CELL + 8, y2: y,
            stroke: "#ef4444", "stroke-width": "5", "stroke-dasharray": "9 6"
        }));
    }
}

function createShapeSvg(cells, color, axis, alignToMirror) {
    const svg = svgEl("svg", { viewBox: "0 0 150 150" });

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            svg.append(svgEl("rect", {
                x: ORIGIN + j * CELL,
                y: ORIGIN + i * CELL,
                width: CELL,
                height: CELL,
                fill: "#f1f5f9",
                stroke: "#e2e8f0"
            }));
        }
    }

    createMirrorLine(svg, axis);

    const dx = axis === "vertical" && alignToMirror ? 3 - maxCoord(cells, 0) : 0;
    const dy = axis === "horizontal" && alignToMirror ? 3 - maxCoord(cells, 1) : 0;

    for (const [x, y] of cells) {
        svg.append(svgEl("rect", {
            x: ORIGIN + (x + dx) * CELL,
            y: ORIGIN + (y + dy) * CELL,
            width: CELL,
            height: CELL,
            rx: 5,
            fill: color,
            "fill-opacity": ".9",
            stroke: "#1e293b",
            "stroke-width": "2"
        }));
    }

    return svg;
}

function createBaseSvg(step) {
    return createShapeSvg(step.base, "#f59e0b", step.axis, false);
}

export function renderMirror(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();
    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = TITLES[world] ?? TITLES.postman;
    card.append(title);

    const baseWrap = document.createElement("div");
    baseWrap.className = "mr-base";
    baseWrap.append(createBaseSvg(step));
    const baseLabel = document.createElement("span");
    baseLabel.className = "mr-label";
    baseLabel.textContent = "minta";
    baseWrap.append(baseLabel);
    card.append(baseWrap);

    const prompt = document.createElement("p");
    prompt.className = "mr-prompt";
    prompt.textContent = "Melyik a minta tükörképe? A piros szaggatott vonal a tükör!";
    card.append(prompt);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "mr-options";

    step.options.forEach((cells, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mr-option";
        btn.dataset.index = index;
        btn.append(createShapeSvg(cells, "#3b82f6", step.axis, true));
        optionsContainer.append(btn);
    });

    card.append(optionsContainer);

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

    function successText() {
        return "😊 Ügyes! A tükörkép úgy néz ki, mintha a tükörben látnád!";
    }

    function checkAnswer(isCorrect) {
        if (feedback.isAnswered()) return;

        if (isCorrect) {
            optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");

            feedback.success(successText());
        } else {
            feedback.retry();
        }
    }

    optionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".mr-option");
        if (!btn || feedback.isAnswered()) return;

        const ok = Number(btn.dataset.index) === step.answer;

        if (ok) markCorrect(btn);

        checkAnswer(ok);
    }, { signal: ac.signal });
}