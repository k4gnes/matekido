import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createHintBox } from "./ui/hintBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "🧱 Összetett alakzatok a postán",
    racing: "🏎️ Összetett alakzatok a boxutcában",
    football: "⚽ Összetett alakzatok a pályán",
    cooking: "🍳 Összetett alakzatok a konyhában",
    animals: "🦁 Összetett alakzatok az állatkertben",
    space: "🤖 Összetett alakzatok az űrhajón",
    tram: "🚋 Összetett alakzatok a villamoson"
};

const SVG_NS = "http://www.w3.org/2000/svg";
const CELL = 30;
const PAD = 14;

function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function createCompoundSvg(step) {
    const rows = step.rows;
    const cols = step.cols;
    const w = PAD * 2 + cols * CELL;
    const h = PAD * 2 + rows * CELL;

    const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, class: "cs-svg" });

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            svg.append(svgEl("rect", {
                x: PAD + c * CELL,
                y: PAD + r * CELL,
                width: CELL,
                height: CELL,
                fill: "#f1f5f9",
                stroke: "#e2e8f0",
                "stroke-width": 1
            }));
        }
    }

    const occupied = new Set(step.cells.map(([r, c]) => `${r},${c}`));

    step.cells.forEach(([r, c]) => {
        svg.append(svgEl("rect", {
            x: PAD + c * CELL,
            y: PAD + r * CELL,
            width: CELL,
            height: CELL,
            fill: "#bfdbfe",
            stroke: "#93c5fd",
            "stroke-width": 1
        }));
    });

    function seg(x1, y1, x2, y2) {
        svg.append(svgEl("line", {
            x1, y1, x2, y2,
            stroke: "#ef4444",
            "stroke-width": 4,
            "stroke-linecap": "round"
        }));
    }

    step.cells.forEach(([r, c]) => {
        const x1 = PAD + c * CELL;
        const y1 = PAD + r * CELL;
        if (!occupied.has(`${r - 1},${c}`)) seg(x1, y1, x1 + CELL, y1);
        if (!occupied.has(`${r + 1},${c}`)) seg(x1, y1 + CELL, x1 + CELL, y1 + CELL);
        if (!occupied.has(`${r},${c - 1}`)) seg(x1, y1, x1, y1 + CELL);
        if (!occupied.has(`${r},${c + 1}`)) seg(x1 + CELL, y1, x1 + CELL, y1 + CELL);
    });

    const seamGroup = svgEl("g", { class: "cs-seams" });
    seamGroup.style.display = "none";
    (step.seams ?? []).forEach(([[r1, c1], [r2, c2]]) => {
        seamGroup.append(svgEl("line", {
            x1: PAD + c1 * CELL,
            y1: PAD + r1 * CELL,
            x2: PAD + c2 * CELL,
            y2: PAD + r2 * CELL,
            stroke: "#64748b",
            "stroke-width": 3,
            "stroke-dasharray": "6 4"
        }));
    });
    svg.append(seamGroup);

    return { svg, seamGroup };
}

export function renderCompoundShape(step, root, next, progress, onResult, onAttempt) {

    const world = getActiveWorld();

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = TITLES[world] ?? TITLES.postman;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "cs-prompt";
    prompt.textContent = step.mode === "perimeter"
        ? "Mekkora a kerülete? A kerület a piros vonal! Számold meg, hány szakaszból áll!"
        : "Mekkora a területe? A terület a kék négyzetek! Számold meg őket!";
    card.append(prompt);

    const { svg, seamGroup } = createCompoundSvg(step);
    card.append(svg);

    const hint = createHintBox();

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            seamGroup.style.display = "block";
            hint.textContent = step.mode === "perimeter"
                ? "Bontsd két téglalapra! A kerület a piros szakaszok hossza – úgy könnyebb megszámolni."
                : "Bontsd két téglalapra! A terület a kék négyzetek száma – a két téglalap négyzeteit add össze.";
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    card.append(hintButton, hint);

    function checkAnswer(value, btn) {
        if (feedback.isAnswered()) return;
        if (value === step.answer) {
            markCorrect(btn);
            const egys = step.mode === "perimeter" ? "A kerület" : "A terület";
            feedback.success(`😊 Szép munka! ${egys} ${step.answer} egység!`);
        } else {
            feedback.retry();
            if (feedback.getMistakes() >= 2 && !hintShown) {
                hintButton.style.display = "inline-block";
            }
        }
    }

    const options = document.createElement("div");
    options.className = "cs-options";
    step.options.forEach(value => {
        const btn = createButton(String(value), { className: "cs-option" });
        btn.addEventListener("click", () => checkAnswer(value, btn));
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