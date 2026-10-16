import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📐 Pitagorasz a postán",
    racing: "🏎️ Pitagorasz a pályán",
    football: "⚽ Pitagorasz a pályán",
    cooking: "🍳 Pitagorasz a konyhában",
    animals: "🦁 Pitagorasz az állatkertben",
    space: "🚀 Pitagorasz az űrben",
    tram: "🚋 Pitagorasz a városban"
};

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function createRightTriangleSvg(step) {
    const svg = svgEl("svg", { viewBox: "0 0 180 155", class: "pyth-svg" });

    svg.append(svgEl("polygon", {
        points: "25,125 155,125 25,25",
        fill: "#e0f2fe",
        stroke: "#1e293b",
        "stroke-width": 2.5,
        "stroke-linejoin": "round"
    }));

    svg.append(svgEl("rect", {
        x: 25,
        y: 105,
        width: 20,
        height: 20,
        fill: "none",
        stroke: "#1e293b",
        "stroke-width": 2
    }));

    const labels = [];

    if (step.mode === "hypotenuse") {
        labels.push({ x: 14, y: 78, text: `${step.a}` });
        labels.push({ x: 90, y: 143, text: `${step.b}` });
    } else if (step.mode === "leg") {
        labels.push({ x: 14, y: 78, text: "?" });
        labels.push({ x: 90, y: 143, text: `${step.known}` });
        labels.push({ x: 96, y: 68, text: `${step.hypotenuse}` });
    }

    for (const label of labels) {
        const text = svgEl("text", {
            x: label.x,
            y: label.y,
            "text-anchor": "middle",
            "font-size": 15,
            "font-weight": 700,
            fill: "#1e293b"
        });
        text.textContent = label.text;
        svg.append(text);
    }

    return svg;
}

export function renderPythagorean(step, root, next, progress, onResult, onAttempt) {

    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = TITLES[world] ?? TITLES.postman;
    card.append(title);

    if (step.mode !== "check") {
        const figure = document.createElement("div");
        figure.className = "pyth-figure";
        figure.append(createRightTriangleSvg(step));
        card.append(figure);
    }

    const question = document.createElement("p");
    question.className = "pyth-question";
    question.textContent = step.question;
    card.append(question);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "pyth-options";

    step.options.forEach(option => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pyth-option";
        btn.dataset.correct = option.correct ? "1" : "0";
        btn.textContent = option.text;
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
        if (step.mode === "hypotenuse") {
            return `😊 Ügyes! ${step.a}² + ${step.b}² = ${step.answer}², ezért az átfogó ${step.answer} cm.`;
        }
        if (step.mode === "leg") {
            return `😊 Ügyes! A hiányzó befogó ${step.answer} cm.`;
        }
        if (step.answer) {
            return `😊 Ügyes! ${step.a}² + ${step.b}² = ${step.c}², ezért derékszögű.`;
        }
        return `😊 Ügyes! ${step.a}² + ${step.b}² ≠ ${step.c}², ezért nem derékszögű.`;
    }

    optionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".pyth-option");
        if (!btn || feedback.isAnswered()) return;

        const ok = btn.dataset.correct === "1";

        if (ok) {
            markCorrect(btn);
            optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
            feedback.success(successText());
        } else {
            feedback.retry();
        }
    });
}