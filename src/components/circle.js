import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "⭕ Körök a postán",
    racing: "🏎️ Körök a boxutcában",
    football: "⚽ Körök a pályán",
    cooking: "🍳 Körök a konyhában",
    animals: "🦁 Körök az állatkertben",
    space: "🤖 Körök az űrhajón"
};

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function createCircleSvg(step) {
    const cx = 110;
    const cy = 110;
    const r = 80;

    const svg = svgEl("svg", { viewBox: "0 0 220 220", class: "cir-svg" });

    svg.append(svgEl("circle", {
        cx, cy, r,
        fill: "none",
        stroke: "#334155",
        "stroke-width": 3
    }));

    if (step.variant === "center" || step.variant === "radius" || step.variant === "diameter") {
        svg.append(svgEl("circle", {
            cx, cy, r: 4,
            fill: "#334155"
        }));
    }

    if (step.variant === "center") {
        svg.append(svgEl("circle", {
            cx, cy, r: 7,
            fill: "#ef4444"
        }));
    }

    if (step.variant === "radius") {
        svg.append(svgEl("line", {
            x1: cx, y1: cy, x2: cx + r, y2: cy,
            stroke: "#ef4444",
            "stroke-width": 4,
            "stroke-linecap": "round"
        }));
    }

    if (step.variant === "diameter") {
        svg.append(svgEl("line", {
            x1: cx - r, y1: cy, x2: cx + r, y2: cy,
            stroke: "#ef4444",
            "stroke-width": 4,
            "stroke-linecap": "round"
        }));
    }

    return svg;
}

export function renderCircle(step, root, next, progress, onResult, onAttempt) {

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
    prompt.className = "cir-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    card.append(createCircleSvg(step));

    const options = document.createElement("div");
    options.className = "cir-options";
    step.options.forEach((label, i) => {
        const btn = createButton(label, { className: "cir-option" });
        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;
            if (label === step.correctLabel) {
                markCorrect(btn);
                feedback.success(`😊 Szép munka! Ez a ${step.correctLabel.toLowerCase()}!`);
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