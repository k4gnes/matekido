import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📍 Koordináták a postán",
    racing: "🏎️ Koordináták a boxutcában",
    football: "⚽ Koordináták a pályán",
    cooking: "🍳 Koordináták a konyhában",
    animals: "🦁 Koordináták az állatkertben",
    space: "🚀 Koordináták az űrhajón",
    tram: "🚋 Koordináták a villamoson"
};

const SVG_NS = "http://www.w3.org/2000/svg";

const MAX_INDEX = 9;
const CELL = 26;
const PAD_LEFT = 34;
const PAD_TOP = 10;

function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function cellX(x) {
    return PAD_LEFT + x * CELL;
}

function cellY(y) {
    return PAD_TOP + (MAX_INDEX - y) * CELL;
}

function formatPair(x, y) {
    return `(${x}; ${y})`;
}

function createGridSvg(step) {
    const gridW = (MAX_INDEX + 1) * CELL;
    const svg = svgEl("svg", { viewBox: `0 0 ${PAD_LEFT + gridW + 16} ${PAD_TOP + gridW + 34}`, class: "cd-svg" });

    for (let x = 0; x <= MAX_INDEX; x++) {
        for (let y = 0; y <= MAX_INDEX; y++) {
            const rect = svgEl("rect", {
                x: cellX(x),
                y: cellY(y),
                width: CELL,
                height: CELL,
                fill: (x + y) % 2 === 0 ? "#f8fafc" : "#f1f5f9",
                stroke: "#e2e8f0"
            });
            if (step.mode === "locate") {
                rect.setAttribute("class", "cd-cell");
                rect.setAttribute("data-x", x);
                rect.setAttribute("data-y", y);
            }
            svg.append(rect);
        }
    }

    svg.append(svgEl("line", {
        x1: PAD_LEFT, y1: PAD_TOP + gridW,
        x2: PAD_LEFT + gridW, y2: PAD_TOP + gridW,
        stroke: "#64748b", "stroke-width": 2.5
    }));
    svg.append(svgEl("line", {
        x1: PAD_LEFT, y1: PAD_TOP,
        x2: PAD_LEFT, y2: PAD_TOP + gridW,
        stroke: "#64748b", "stroke-width": 2.5
    }));

    function axisLabel(cx, cy, text, fill, size, anchor) {
        const t = svgEl("text", {
            x: cx,
            y: cy,
            "text-anchor": anchor ?? "middle",
            "dominant-baseline": "central",
            "font-size": size,
            "font-weight": "700",
            fill
        });
        t.textContent = text;
        svg.append(t);
    }

    for (let x = 0; x <= MAX_INDEX; x++) {
        axisLabel(cellX(x) + CELL / 2, PAD_TOP + gridW + 15, x, "#64748b", 12);
    }
    for (let y = 0; y <= MAX_INDEX; y++) {
        axisLabel(PAD_LEFT - 10, cellY(y) + CELL / 2, y, "#64748b", 12);
    }

    axisLabel(PAD_LEFT + gridW + 12, PAD_TOP + gridW + 15, "x", "#334155", 14);
    axisLabel(PAD_LEFT - 22, PAD_TOP - 1, "y", "#334155", 14);

    if (step.mode === "read") {
        svg.append(svgEl("circle", {
            cx: cellX(step.x) + CELL / 2,
            cy: cellY(step.y) + CELL / 2,
            r: 8,
            fill: "#ef4444",
            stroke: "#ffffff",
            "stroke-width": 3
        }));
    }

    return svg;
}

export function renderCoordinate(step, root, next, progress, onResult, onAttempt) {

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

    const prompt = document.createElement("p");
    prompt.className = "cd-prompt";
    prompt.textContent = step.mode === "read"
        ? "Melyik koordináta tartozik a piros ponthoz? Először az x, aztán a y!"
        : `Jelöld be a ${formatPair(step.x, step.y)} pontot! Kattints a megfelelő mezőre!`;
    card.append(prompt);

    const gridWrap = document.createElement("div");
    gridWrap.className = "cd-grid";
    gridWrap.append(createGridSvg(step));
    card.append(gridWrap);

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
        if (step.mode === "read") {
            return `😊 Ügyes! A jelölt pont koordinátája ${formatPair(step.x, step.y)}!`;
        }
        return `😊 Ügyes! A ${formatPair(step.x, step.y)} pont jó helyen van!`;
    }

    function checkAnswer(isCorrect) {
        if (feedback.isAnswered()) return;

        if (isCorrect) {
            card.querySelectorAll(".cd-cell, .cd-option").forEach(c => c.style.pointerEvents = "none");

            feedback.success(successText());
        } else {
            feedback.retry();
        }
    }

    if (step.mode === "read") {
        const optionsContainer = document.createElement("div");
        optionsContainer.className = "cd-options";

        step.options.forEach((value, index) => {
            const btn = createButton(value, { className: "cd-option" });
            btn.dataset.index = index;
            optionsContainer.append(btn);
        });

        card.insertBefore(optionsContainer, message.element);

        optionsContainer.addEventListener("click", (e) => {
            const btn = e.target.closest(".cd-option");
            if (!btn || feedback.isAnswered()) return;

            const ok = Number(btn.dataset.index) === step.answer;

            if (ok) markCorrect(btn);

            checkAnswer(ok);
        }, { signal: ac.signal });
    } else {
        const svg = gridWrap.querySelector("svg");

        svg.addEventListener("click", (e) => {
            const cell = e.target.closest(".cd-cell");
            if (!cell || feedback.isAnswered()) return;

            const ok = Number(cell.dataset.x) === step.x && Number(cell.dataset.y) === step.y;

            if (ok) cell.setAttribute("fill", "#ef4444");

            checkAnswer(ok);
        }, { signal: ac.signal });
    }
}
