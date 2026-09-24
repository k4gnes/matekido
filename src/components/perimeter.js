import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📐 Kerület a postán",
    racing: "🏎️ Kerület a boxutcában",
    football: "⚽ Kerület a pályán",
    cooking: "🍳 Kerület a konyhában",
    animals: "🦁 Kerület az állatkertben",
    space: "🤖 Kerület az űrhajón",
    tram: "🚋 Kerület a villamoson"
};

const SVG_NS = "http://www.w3.org/2000/svg";
const CELL = 32;
const PAD = 14;
const SEG_COLOR = "#ef4444";

function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

const GAP = 3;
const SEG_W = 6;

function createPerimeterSvg(step) {
    const rows = step.rows;
    const cols = step.cols;
    const w = PAD * 2 + cols * CELL;
    const h = PAD * 2 + rows * CELL;

    const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, class: "per-svg" });

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            svg.append(svgEl("rect", {
                x: PAD + c * CELL,
                y: PAD + r * CELL,
                width: CELL,
                height: CELL,
                fill: "#dbeafe",
                stroke: "#e2e8f0"
            }));
        }
    }

    function seg(x1, y1, x2, y2) {
        svg.append(svgEl("line", {
            x1, y1, x2, y2,
            stroke: SEG_COLOR,
            "stroke-width": SEG_W,
            "stroke-linecap": "round"
        }));
    }

    for (let c = 0; c < cols; c++) {
        const x1 = PAD + c * CELL + GAP;
        const x2 = PAD + (c + 1) * CELL - GAP;
        seg(x1, PAD, x2, PAD);
        seg(x1, PAD + rows * CELL, x2, PAD + rows * CELL);
    }
    for (let r = 0; r < rows; r++) {
        const y1 = PAD + r * CELL + GAP;
        const y2 = PAD + (r + 1) * CELL - GAP;
        seg(PAD, y1, PAD, y2);
        seg(PAD + cols * CELL, y1, PAD + cols * CELL, y2);
    }

    return svg;
}

export function renderPerimeter(step, root, next, progress, onResult, onAttempt) {

    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = TITLES[world] ?? TITLES.postman;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "per-prompt";
    prompt.textContent = "Mekkora a kerülete? A kerület a piros vonal! Számold meg, hány szakaszból áll!";
    card.append(prompt);

    card.append(createPerimeterSvg(step));

    const options = document.createElement("div");
    options.className = "per-options";
    step.options.forEach(value => {
        const btn = createButton(String(value), { className: "per-option" });
        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;
            if (value === step.answer) {
                markCorrect(btn);
                feedback.success(`😊 Szép munka! A kerület ${step.answer} egység!`);
            } else {
                feedback.retry();
            }
        });
        options.append(btn);
    });
    card.append(options);

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
}