import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "🌀 Mozgatás és forgatás",
    racing: "🏎️ Forgatás a boxutcában",
    football: "⚽ Forgatás a pályán",
    cooking: "🍳 Forgatás a konyhában",
    animals: "🦁 Forgatás az állatkertben",
    space: "🤖 Forgatás az űrhajón"
};

const SVG_NS = "http://www.w3.org/2000/svg";

const CELL = 26;
const ORIGIN = 21;

function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function createShapeSvg(cells, color) {
    const svg = svgEl("svg", { viewBox: "0 0 120 120" });

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
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

    for (const [x, y] of cells) {
        svg.append(svgEl("rect", {
            x: ORIGIN + x * CELL,
            y: ORIGIN + y * CELL,
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

export function renderTransform(step, root, next, progress, onResult, onAttempt) {

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
    baseWrap.className = "tf-base";
    baseWrap.append(createShapeSvg(step.base, "#f59e0b"));
    const baseLabel = document.createElement("span");
    baseLabel.className = "tf-label";
    baseLabel.textContent = "minta";
    baseWrap.append(baseLabel);
    card.append(baseWrap);

    const prompt = document.createElement("p");
    prompt.className = "tf-prompt";
    prompt.textContent = "Melyik alakzat ugyanaz, mint a minta, csak elforgatva?";
    card.append(prompt);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "tf-options";

    step.options.forEach((cells, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tf-option";
        btn.dataset.index = index;
        btn.append(createShapeSvg(cells, "#3b82f6"));
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
        return "😊 Ügyes! Ez valóban ugyanaz az alakzat, csak elforgatva!";
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
        const btn = e.target.closest(".tf-option");
        if (!btn || feedback.isAnswered()) return;

        const ok = Number(btn.dataset.index) === step.answer;

        if (ok) markCorrect(btn);

        checkAnswer(ok);
    }, { signal: ac.signal });
}