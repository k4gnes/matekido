import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createHintBox } from "./ui/hintBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "🧮 Kerület és terület a postán",
    racing: "🏎️ Kerület és terület a boxutcában",
    football: "⚽ Kerület és terület a pályán",
    cooking: "🍳 Kerület és terület a konyhában",
    animals: "🦁 Kerület és terület az állatkertben",
    space: "🤖 Kerület és terület az űrhajón",
    tram: "🚋 Kerület és terület a villamoson"
};

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function createRectSvg(step) {
    const unit = 14;
    const horiz = Math.max(step.a, step.b);
    const vert = Math.min(step.a, step.b);
    const W = unit * horiz;
    const H = unit * vert;
    const x = 56;
    const y = 40;

    const svg = svgEl("svg", { viewBox: `0 0 ${x + W + 12} ${y + H + 26}`, class: "sf-svg" });

    svg.append(svgEl("rect", {
        x, y, width: W, height: H,
        fill: "#bfdbfe",
        stroke: "#1e293b",
        "stroke-width": 2
    }));

    function label(cx, cy, text) {
        const t = svgEl("text", {
            x: cx,
            y: cy,
            "text-anchor": "middle",
            "font-size": "16",
            "font-weight": "700",
            fill: "#1e293b",
            stroke: "#ffffff",
            "stroke-width": "4",
            "paint-order": "stroke"
        });
        t.textContent = text;
        svg.append(t);
    }

    svg.append(svgEl("line", {
        x1: x, y1: y - 10, x2: x + W, y2: y - 10,
        stroke: "#64748b", "stroke-width": 1.5
    }));
    svg.append(svgEl("line", {
        x1: x, y1: y - 14, x2: x, y2: y - 6,
        stroke: "#64748b", "stroke-width": 1.5
    }));
    svg.append(svgEl("line", {
        x1: x + W, y1: y - 14, x2: x + W, y2: y - 6,
        stroke: "#64748b", "stroke-width": 1.5
    }));
    label(x + W / 2, y - 20, `${horiz} cm`);

    svg.append(svgEl("line", {
        x1: x - 10, y1: y, x2: x - 10, y2: y + H,
        stroke: "#64748b", "stroke-width": 1.5
    }));
    svg.append(svgEl("line", {
        x1: x - 14, y1: y, x2: x - 6, y2: y,
        stroke: "#64748b", "stroke-width": 1.5
    }));
    svg.append(svgEl("line", {
        x1: x - 14, y1: y + H, x2: x - 6, y2: y + H,
        stroke: "#64748b", "stroke-width": 1.5
    }));
    label(x - 30, y + H / 2 + 5, `${vert} cm`);

    return svg;
}

export function renderShapeFormula(step, root, next, progress, onResult, onAttempt) {

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
    prompt.className = "sf-prompt";
    prompt.textContent = step.mode === "perimeter"
        ? "Számold ki a kerületét fejben! K = 2 × (a + b)"
        : "Számold ki a területét fejben! T = a × b";
    card.append(prompt);

    card.append(createRectSvg(step));

    const hint = createHintBox();

    const hintText = `A ${step.shape === "square" ? "négyzet" : "téglalap"} ${
        step.mode === "perimeter"
            ? `kerülete: K = 2 × (${step.a} + ${step.b}) = 2 × ${step.a + step.b}`
            : `területe: T = ${step.a} × ${step.b} = ${step.a * step.b}`
    }`;

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.textContent = hintText;
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    card.append(hintButton, hint);

    const options = document.createElement("div");
    options.className = "sf-options";
    step.options.forEach(value => {
        const btn = createButton(String(value), { className: "sf-option" });
        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;
            if (value === step.answer) {
                markCorrect(btn);
                feedback.success(successText());
            } else {
                feedback.retry();
                if (feedback.getMistakes() >= 2 && !hintShown) {
                    hintButton.style.display = "inline-block";
                }
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

    function successText() {
        if (step.mode === "perimeter") {
            return `😊 Ügyes! K = 2 × (${step.a} + ${step.b}) = ${step.answer} cm`;
        }
        return `😊 Ügyes! T = ${step.a} × ${step.b} = ${step.answer} cm²`;
    }
}