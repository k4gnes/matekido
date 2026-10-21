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
    space: "🤖 Körök az űrhajón",
    tram: "🚋 Körök a villamoson"
};

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function addLabel(svg, x, y, text) {
    const t = svgEl("text", {
        x,
        y,
        "text-anchor": "middle",
        "font-size": "15",
        "font-weight": "700",
        fill: "#1e293b",
        stroke: "#ffffff",
        "stroke-width": "4",
        "paint-order": "stroke"
    });
    t.textContent = text;
    svg.append(t);
}

function polar(cx, cy, r, deg) {
    const rad = deg * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function createSectorSvg(step) {
    const cx = 110;
    const cy = 110;
    const r = 80;
    const angle = step.angle ?? 90;
    const start = -90;
    const end = start + angle;

    const svg = svgEl("svg", { viewBox: "0 0 220 220", class: "cir-svg" });

    svg.append(svgEl("circle", {
        cx, cy, r,
        fill: "none",
        stroke: "#334155",
        "stroke-width": 3
    }));

    const p0 = polar(cx, cy, r, start);
    const p1 = polar(cx, cy, r, end);

    svg.append(svgEl("path", {
        d: `M ${cx} ${cy} L ${p0.x} ${p0.y} A ${r} ${r} 0 ${angle > 180 ? 1 : 0} 1 ${p1.x} ${p1.y} Z`,
        fill: "#fde68a",
        "fill-opacity": "0.85",
        stroke: "#f59e0b",
        "stroke-width": 2
    }));

    if (step.d !== undefined) {
        const opposite = polar(cx, cy, r, start + 180);
        svg.append(svgEl("line", {
            x1: p0.x, y1: p0.y, x2: opposite.x, y2: opposite.y,
            stroke: "#2563eb",
            "stroke-width": 3,
            "stroke-dasharray": "6 5"
        }));
        addLabel(svg, cx + (opposite.x - cx) * 0.5 + 26, cy + (opposite.y - cy) * 0.5, `d = ${step.d} cm`);
    }

    svg.append(svgEl("line", {
        x1: cx, y1: cy, x2: p0.x, y2: p0.y,
        stroke: "#ef4444",
        "stroke-width": 4,
        "stroke-linecap": "round"
    }));
    addLabel(svg, cx + (p0.x - cx) * 0.45 - 22, cy + (p0.y - cy) * 0.45, `r = ${step.r} cm`);

    const a0 = polar(cx, cy, 26, start);
    const a1 = polar(cx, cy, 26, end);
    svg.append(svgEl("path", {
        d: `M ${a0.x} ${a0.y} A 26 26 0 ${angle > 180 ? 1 : 0} 1 ${a1.x} ${a1.y}`,
        fill: "none",
        stroke: "#334155",
        "stroke-width": 2
    }));

    const mid = polar(cx, cy, 46, start + angle / 2);
    addLabel(svg, mid.x, mid.y + 5, `${angle}°`);

    svg.append(svgEl("circle", { cx, cy, r: 4, fill: "#334155" }));

    return svg;
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

    if (step.mode === "circumference" || step.mode === "area") {
        if (step.variant === "radius") {
            addLabel(svg, cx + r / 2, cy - 12, `${step.r} cm`);
        }
        if (step.variant === "diameter") {
            addLabel(svg, cx, cy - 12, `${step.d} cm`);
        }
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

    card.append(step.mode === "sector" ? createSectorSvg(step) : createCircleSvg(step));

    const options = document.createElement("div");
    options.className = "cir-options";
    step.options.forEach((value) => {
        const btn = createButton(String(value), { className: "cir-option" });
        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;

            if (step.answerLabel !== undefined) {
                if (value === step.answerLabel) {
                    markCorrect(btn);
                    feedback.success(step.successText);
                } else {
                    feedback.retry();
                }
                return;
            }

            if (step.mode === "convert") {
                if (Number(value) === step.answer) {
                    markCorrect(btn);
                    feedback.success(step.successText);
                } else {
                    feedback.retry();
                }
                return;
            }

            if (value === step.correctLabel) {
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