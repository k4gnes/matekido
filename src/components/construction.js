import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createHintRequest } from "./ui/hintBox.js?v=2";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📏 Szerkesztés a postán",
    racing: "🏎️ Szerkesztés a pályán",
    football: "⚽ Szerkesztés a pályán",
    cooking: "🍳 Szerkesztés a konyhában",
    animals: "🦁 Szerkesztés az állatkertben",
    space: "🚀 Szerkesztés az űrben",
    tram: "🚋 Szerkesztés a villamoson"
};

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function line(svg, x1, y1, x2, y2, attrs = {}) {
    svg.append(svgEl("line", {
        x1, y1, x2, y2,
        stroke: "#334155",
        "stroke-width": 2.5,
        "stroke-linecap": "round",
        ...attrs
    }));
}

function dot(svg, x, y, fill = "#ef4444") {
    svg.append(svgEl("circle", {
        cx: x,
        cy: y,
        r: 5,
        fill,
        stroke: "#ffffff",
        "stroke-width": 2
    }));
}

function label(svg, x, y, text, attrs = {}) {
    const t = svgEl("text", {
        x,
        y,
        "font-size": 16,
        "font-weight": 700,
        fill: "#334155",
        "text-anchor": "middle",
        ...attrs
    });
    t.textContent = text;
    svg.append(t);
}

function rightAngle(svg, x, y, dx, dy) {
    svg.append(svgEl("path", {
        d: `M ${x + dx} ${y} L ${x + dx} ${y + dy} L ${x} ${y + dy}`,
        fill: "none",
        stroke: "#64748b",
        "stroke-width": 2
    }));
}

function createFigure(kind) {
    const svg = svgEl("svg", { viewBox: "0 0 320 220", class: "co-svg" });

    if (kind === "segment") {
        line(svg, 70, 170, 250, 170);
        dot(svg, 70, 170);
        dot(svg, 250, 170);
        label(svg, 58, 192, "A");
        label(svg, 262, 192, "B");
    } else if (kind === "angle") {
        line(svg, 60, 170, 270, 170);
        line(svg, 60, 170, 190, 45);
        dot(svg, 60, 170);
        dot(svg, 270, 170, "#334155");
        dot(svg, 190, 45, "#334155");
        label(svg, 44, 190, "O");
        label(svg, 282, 190, "A");
        label(svg, 186, 30, "B");
    } else if (kind === "line-point") {
        line(svg, 30, 160, 290, 160);
        dot(svg, 160, 80);
        label(svg, 160, 64, "P");
        label(svg, 296, 152, "e");
    } else if (kind === "bisector-result") {
        line(svg, 70, 170, 250, 170);
        line(svg, 160, 40, 160, 200);
        line(svg, 115, 163, 115, 177, { stroke: "#64748b" });
        line(svg, 205, 163, 205, 177, { stroke: "#64748b" });
        rightAngle(svg, 160, 170, 10, -10);
        dot(svg, 70, 170);
        dot(svg, 250, 170);
        dot(svg, 160, 170, "#334155");
        label(svg, 58, 192, "A");
        label(svg, 262, 192, "B");
        label(svg, 160, 214, "M");
    } else if (kind === "angle-bisector-result") {
        line(svg, 60, 170, 270, 170);
        line(svg, 60, 170, 190, 45);
        line(svg, 60, 170, 255, 90, { stroke: "#2563eb" });
        dot(svg, 60, 170);
        dot(svg, 190, 45, "#334155");
        label(svg, 44, 190, "O");
        label(svg, 282, 190, "A");
        label(svg, 186, 30, "B");
        label(svg, 153, 151, "α", { "font-size": 18 });
        label(svg, 174, 105, "α", { "font-size": 18 });
    } else if (kind === "parallel-result") {
        line(svg, 30, 160, 290, 160);
        line(svg, 30, 80, 290, 80, { stroke: "#2563eb" });
        dot(svg, 160, 80);
        label(svg, 160, 64, "P");
        label(svg, 296, 152, "e");
    } else if (kind === "perpendicular-result") {
        line(svg, 30, 160, 290, 160);
        line(svg, 200, 60, 200, 160, { stroke: "#2563eb" });
        dot(svg, 200, 160);
        rightAngle(svg, 200, 160, 10, -10);
        label(svg, 200, 46, "P");
        label(svg, 296, 152, "e");
    }

    return svg;
}

export function renderConstruction(step, root, next, progress, onResult, onAttempt) {
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

    if (step.figure) {
        const figure = document.createElement("div");
        figure.className = "co-figure";
        figure.append(createFigure(step.figure.kind));
        card.append(figure);
    }

    const prompt = document.createElement("p");
    prompt.className = "co-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "co-options";

    step.options.forEach((option, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "co-option";
        btn.dataset.index = index;
        btn.textContent = option.text;
        optionsContainer.append(btn);
    });

    card.append(optionsContainer);

    const message = createMessageBox();
    const hint = createHintRequest(() => step.hint || "Olvasd el újra a feladatot, és gondold át a szerkesztés sorrendjét!");

    card.append(hint.button, hint.box);
    card.append(message.element);

    root.append(card);

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    function maybeShowHint() {
        if (feedback.getMistakes() >= 2) hint.offer();
    }

    function checkAnswer(isCorrect) {
        if (feedback.isAnswered()) return;

        if (isCorrect) {
            optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
            feedback.success("😊 Ügyes! Helyes válasz.");
        } else {
            feedback.retry();
            maybeShowHint();
        }
    }

    optionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".co-option");
        if (!btn || feedback.isAnswered()) return;

        const idx = Number(btn.dataset.index);
        const ok = step.options[idx] && step.options[idx].correct;

        if (ok) markCorrect(btn);

        checkAnswer(ok);
    }, { signal: ac.signal });
}
