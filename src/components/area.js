import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "🟦 Terület a postán",
    racing: "🏎️ Terület a boxutcában",
    football: "⚽ Terület a pályán",
    cooking: "🍳 Terület a konyhában",
    animals: "🦁 Terület az állatkertben",
    space: "🤖 Terület az űrhajón",
    tram: "🚋 Terület a villamoson"
};

const SVG_NS = "http://www.w3.org/2000/svg";
const CELL = 30;
const PAD = 14;
const FILL = "#93c5fd";
const STROKE = "#bfdbfe";

function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function createAreaSvg(step) {
    const rows = step.rows;
    const cols = step.cols;
    const w = PAD * 2 + cols * CELL;
    const h = PAD * 2 + rows * CELL;

    const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, class: "area-svg" });

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            svg.append(svgEl("rect", {
                x: PAD + c * CELL,
                y: PAD + r * CELL,
                width: CELL,
                height: CELL,
                fill: FILL,
                stroke: STROKE,
                "stroke-width": 2
            }));
        }
    }

    return svg;
}

export function renderArea(step, root, next, progress, onResult, onAttempt) {

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
    prompt.className = "area-prompt";
    prompt.textContent = "Mekkora a területe? A terület a kék négyzetek! Számold meg őket!";
    card.append(prompt);

    card.append(createAreaSvg(step));

    const options = document.createElement("div");
    options.className = "area-options";
    step.options.forEach(value => {
        const btn = createButton(String(value), { className: "area-option" });
        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;
            if (value === step.answer) {
                markCorrect(btn);
                feedback.success(`😊 Szép munka! A terület ${step.answer} egység!`);
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