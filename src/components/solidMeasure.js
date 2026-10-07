import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createHintBox } from "./ui/hintBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📦 Felszín és térfogat a postán",
    racing: "🏎️ Felszín és térfogat a boxutcában",
    football: "⚽ Felszín és térfogat a pályán",
    cooking: "🍳 Felszín és térfogat a konyhában",
    animals: "🦁 Felszín és térfogat az állatkertben",
    space: "🚀 Felszín és térfogat az űrhajón",
    tram: "🚋 Felszín és térfogat a villamoson"
};

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function createSolidSvg(step) {
    const { solid, a, b, c } = step;
    const unit = 64 / Math.max(a, b, c);
    const fw = a * unit;
    const fh = b * unit;
    const dx = c * unit * 0.55;
    const dy = c * unit * 0.4;
    const x = 62;
    const y = 58;

    const svg = svgEl("svg", { viewBox: "0 0 205 165", class: "slm-svg" });

    svg.append(svgEl("path", {
        d: `M${x},${y} L${x + dx},${y - dy} L${x + fw + dx},${y - dy} L${x + fw},${y} Z`,
        fill: "#93c5fd",
        stroke: "#1e293b",
        "stroke-width": "2.5",
        "stroke-linejoin": "round"
    }));
    svg.append(svgEl("path", {
        d: `M${x + fw},${y} L${x + fw + dx},${y - dy} L${x + fw + dx},${y + fh - dy} L${x + fw},${y + fh} Z`,
        fill: "#60a5fa",
        stroke: "#1e293b",
        "stroke-width": "2.5",
        "stroke-linejoin": "round"
    }));
    svg.append(svgEl("rect", {
        x, y, width: fw, height: fh,
        fill: "#3b82f6",
        "fill-opacity": ".9",
        stroke: "#1e293b",
        "stroke-width": "2.5",
        "stroke-linejoin": "round"
    }));

    function label(cx, cy, text) {
        const t = svgEl("text", {
            x: cx,
            y: cy,
            "text-anchor": "middle",
            "font-size": "13",
            "font-weight": "700",
            fill: "#1e293b",
            stroke: "#ffffff",
            "stroke-width": "4",
            "paint-order": "stroke"
        });
        t.textContent = text;
        svg.append(t);
    }

    label(x + fw / 2, y + fh + 20, `a = ${a} cm`);
    label(x - 12, y + fh / 2 + 4, `${solid === "cube" ? "a" : "b"} = ${b} cm`);
    label(x + fw + dx + 2, y - dy - 8, `${solid === "cube" ? "a" : "c"} = ${c} cm`);

    return svg;
}

function hintFor(step) {
    if (step.mode === "surface") {
        if (step.solid === "cube") {
            return `💡 A kockának 6 egyforma lapja van: F = 6 × a × a = 6 × ${step.a} × ${step.a} = ${step.answer} cm²`;
        }
        return `💡 F = 2 × (a×b + a×c + b×c) = 2 × (${step.a * step.b} + ${step.a * step.c} + ${step.b * step.c}) = ${step.answer} cm²`;
    }
    if (step.solid === "cube") {
        return `💡 A kocka térfogata: V = a × a × a = ${step.a} × ${step.a} × ${step.a} = ${step.answer} cm³`;
    }
    return `💡 V = a × b × c = ${step.a} × ${step.b} × ${step.c} = ${step.answer} cm³`;
}

export function renderSolidMeasure(step, root, next, progress, onResult, onAttempt) {

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

    const figure = document.createElement("div");
    figure.className = "slm-figure";
    figure.append(createSolidSvg(step));
    card.append(figure);

    const prompt = document.createElement("p");
    prompt.className = "slm-prompt";
    prompt.textContent = step.mode === "surface"
        ? "Mekkora a test felszíne? (A lapok területének összege.)"
        : "Mekkora a test térfogata? (Mennyi fér bele?)";
    card.append(prompt);

    const hint = createHintBox();

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.textContent = hintFor(step);
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    card.append(hintButton, hint);

    const options = document.createElement("div");
    options.className = "slm-options";

    step.options.forEach(value => {
        const btn = createButton(String(value), { className: "slm-option" });
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
        if (step.mode === "surface") {
            if (step.solid === "cube") {
                return `😊 Ügyes! F = 6 × ${step.a} × ${step.a} = ${step.answer} cm²`;
            }
            return `😊 Ügyes! F = 2 × (${step.a * step.b} + ${step.a * step.c} + ${step.b * step.c}) = ${step.answer} cm²`;
        }
        if (step.solid === "cube") {
            return `😊 Ügyes! V = ${step.a} × ${step.a} × ${step.a} = ${step.answer} cm³`;
        }
        return `😊 Ügyes! V = ${step.a} × ${step.b} × ${step.c} = ${step.answer} cm³`;
    }
}
