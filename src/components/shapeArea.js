import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📏 Kerület és terület a postán",
    racing: "🏎️ Kerület és terület a pályán",
    football: "⚽ Kerület és terület a pályán",
    cooking: "🍳 Kerület és terület a konyhában",
    animals: "🦁 Kerület és terület az állatkertben",
    space: "🤖 Kerület és terület az űrben",
    tram: "🚋 Kerület és terület a városban"
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

function createRectSvg(step) {
    const svg = svgEl("svg", { viewBox: "0 0 180 140", class: "sa-svg" });
    svg.append(svgEl("rect", {
        x: 30,
        y: 35,
        width: 120,
        height: 70,
        fill: "#bfdbfe",
        stroke: "#1e293b",
        "stroke-width": 2.5
    }));
    addLabel(svg, 90, 28, `${step.a} cm`);
    addLabel(svg, 16, 73, `${step.b} cm`);
    return svg;
}

function createTriangleSvg(step) {
    const svg = svgEl("svg", { viewBox: "0 0 180 140", class: "sa-svg" });
    svg.append(svgEl("polygon", {
        points: "25,115 155,115 85,25",
        fill: "#fef3c7",
        stroke: "#1e293b",
        "stroke-width": 2.5,
        "stroke-linejoin": "round"
    }));
    if (step.mode === "triangle-perimeter") {
        addLabel(svg, 90, 132, `${step.a} cm`);
        addLabel(svg, 40, 66, `${step.b} cm`);
        addLabel(svg, 130, 66, `${step.c} cm`);
    } else {
        svg.append(svgEl("line", {
            x1: 85,
            y1: 25,
            x2: 85,
            y2: 115,
            stroke: "#dc2626",
            "stroke-width": 2,
            "stroke-dasharray": "6 5"
        }));
        addLabel(svg, 90, 132, `${step.base} cm`);
        addLabel(svg, 100, 74, `${step.height} cm`);
    }
    return svg;
}

function createParallelogramSvg(step) {
    const svg = svgEl("svg", { viewBox: "0 0 180 140", class: "sa-svg" });
    svg.append(svgEl("polygon", {
        points: "45,110 165,110 135,35 15,35",
        fill: "#bbf7d0",
        stroke: "#1e293b",
        "stroke-width": 2.5,
        "stroke-linejoin": "round"
    }));
    svg.append(svgEl("line", {
        x1: 45,
        y1: 110,
        x2: 45,
        y2: 35,
        stroke: "#dc2626",
        "stroke-width": 2,
        "stroke-dasharray": "6 5"
    }));
    addLabel(svg, 105, 128, `${step.base} cm`);
    addLabel(svg, 60, 74, `${step.height} cm`);
    return svg;
}

function createTrapezoidSvg(step) {
    const svg = svgEl("svg", { viewBox: "0 0 200 150", class: "sa-svg" });
    svg.append(svgEl("polygon", {
        points: "60,35 140,35 175,115 25,115",
        fill: "#ddd6fe",
        stroke: "#1e293b",
        "stroke-width": 2.5,
        "stroke-linejoin": "round"
    }));
    svg.append(svgEl("line", {
        x1: 100,
        y1: 35,
        x2: 100,
        y2: 115,
        stroke: "#dc2626",
        "stroke-width": 2,
        "stroke-dasharray": "6 5"
    }));
    addLabel(svg, 100, 132, `${step.a} cm`);
    addLabel(svg, 100, 28, `${step.c} cm`);
    addLabel(svg, 112, 78, `${step.height} cm`);
    return svg;
}

function createRhombusSvg(step) {
    const svg = svgEl("svg", { viewBox: "0 0 200 150", class: "sa-svg" });
    svg.append(svgEl("polygon", {
        points: "100,25 165,75 100,125 35,75",
        fill: "#fbcfe8",
        stroke: "#1e293b",
        "stroke-width": 2.5,
        "stroke-linejoin": "round"
    }));
    svg.append(svgEl("line", {
        x1: 35,
        y1: 75,
        x2: 165,
        y2: 75,
        stroke: "#dc2626",
        "stroke-width": 2,
        "stroke-dasharray": "6 5"
    }));
    svg.append(svgEl("line", {
        x1: 100,
        y1: 25,
        x2: 100,
        y2: 125,
        stroke: "#dc2626",
        "stroke-width": 2,
        "stroke-dasharray": "6 5"
    }));
    addLabel(svg, 140, 66, `${step.e} cm`);
    addLabel(svg, 100, 142, `${step.f} cm`);
    return svg;
}

function createFigure(step) {
    if (step.mode === "parallelogram-area") return createParallelogramSvg(step);
    if (step.mode === "trapezoid-area") return createTrapezoidSvg(step);
    if (step.mode === "rhombus-area") return createRhombusSvg(step);
    if (step.mode === "triangle-area" || step.mode === "triangle-perimeter") return createTriangleSvg(step);
    return createRectSvg(step);
}

export function renderShapeArea(step, root, next, progress, onResult, onAttempt) {

    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = TITLES[world] ?? TITLES.postman;
    card.append(title);

    const figure = document.createElement("div");
    figure.className = "sa-figure";
    figure.append(createFigure(step));
    card.append(figure);

    const question = document.createElement("p");
    question.className = "sa-question";
    question.textContent = step.question;
    card.append(question);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "sa-options";

    step.options.forEach(value => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "sa-option";
        btn.dataset.value = value;
        btn.textContent = `${value}`;
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
        if (step.mode === "triangle-perimeter") {
            return `😊 Ügyes! K = ${step.a} + ${step.b} + ${step.c} = ${step.answer} cm`;
        }
        if (step.mode === "triangle-area") {
            return `😊 Ügyes! T = ${step.base} × ${step.height} ÷ 2 = ${step.answer} cm²`;
        }
        if (step.mode === "rectangle-perimeter") {
            return `😊 Ügyes! K = 2 × (${step.a} + ${step.b}) = ${step.answer} cm`;
        }
        if (step.mode === "rectangle-area") {
            return `😊 Ügyes! T = ${step.a} × ${step.b} = ${step.answer} cm²`;
        }
        if (step.mode === "trapezoid-area") {
            return `😊 Ügyes! T = (${step.a} + ${step.c}) × ${step.height} ÷ 2 = ${step.answer} cm²`;
        }
        if (step.mode === "rhombus-area") {
            return `😊 Ügyes! T = ${step.e} × ${step.f} ÷ 2 = ${step.answer} cm²`;
        }
        return `😊 Ügyes! T = ${step.base} × ${step.height} = ${step.answer} cm²`;
    }

    optionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".sa-option");
        if (!btn || feedback.isAnswered()) return;

        const ok = Number(btn.dataset.value) === step.answer;

        if (ok) markCorrect(btn);

        if (ok) {
            optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
            feedback.success(successText());
        } else {
            feedback.retry();
        }
    });
}
