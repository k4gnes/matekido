import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📐 Alakzatok összehasonlítása",
    racing: "🏎️ Alakzatok a pályán",
    football: "⚽ Alakzatok a pályán",
    cooking: "🍳 Alakzatok a konyhában",
    animals: "🦁 Alakzatok az állatkertben",
    space: "🤖 Alakzatok az űrben"
};

const SIDES = {
    triangle: { label: "háromszög", dative: "háromszögnek", sides: 3 },
    square: { label: "négyzet", dative: "négyzetnek", sides: 4 },
    pentagon: { label: "ötszög", dative: "ötszögnek", sides: 5 },
    hexagon: { label: "hatszög", dative: "hatszögnek", sides: 6 }
};

const COLORS = {
    triangle: "#f59e0b",
    square: "#3b82f6",
    pentagon: "#a855f7",
    hexagon: "#10b981"
};

function polygonPoints(kind, size) {
    const n = SIDES[kind].sides;
    const c = 60;
    const r = size / 2;
    const pts = [];
    for (let i = 0; i < n; i++) {
        const angle = -Math.PI / 2 + i * 2 * Math.PI / n;
        pts.push(`${(c + r * Math.cos(angle)).toFixed(1)},${(c + r * Math.sin(angle)).toFixed(1)}`);
    }
    return pts.join(" ");
}

function createShapeSvg(shape) {
    const svgNs = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNs, "svg");
    svg.setAttribute("viewBox", "0 0 120 120");

    const poly = document.createElementNS(svgNs, "polygon");
    poly.setAttribute("points", polygonPoints(shape.kind, shape.size));
    poly.setAttribute("fill", COLORS[shape.kind]);
    poly.setAttribute("fill-opacity", "0.85");
    poly.setAttribute("stroke", "#1e293b");
    poly.setAttribute("stroke-width", "2.5");
    poly.setAttribute("stroke-linejoin", "round");
    svg.append(poly);

    return svg;
}

export function renderShapeCompare(step, root, next, progress, onResult, onAttempt) {

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

    const question = document.createElement("p");
    question.className = "sc-question";
    question.textContent = step.question;
    card.append(question);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "sc-options";

    ["left", "right"].forEach(side => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "sc-shape";
        btn.dataset.value = side;
        btn.append(createShapeSvg(step[side]));
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
        if (step.mode === "sides") {
            const winnerSide = step.answer;
            const loserSide = step.answer === "left" ? "right" : "left";
            const winner = SIDES[step[winnerSide].kind];
            const loser = SIDES[step[loserSide].kind];
            return `😊 Ügyes! A ${winner.dative} ${winner.sides} oldala van, a ${loser.dative} pedig ${loser.sides}.`;
        }
        return "😊 Ügyes! Ez tényleg a nagyobb!";
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
        const btn = e.target.closest(".sc-shape");
        if (!btn || feedback.isAnswered()) return;

        const ok = btn.dataset.value === step.answer;

        if (ok) markCorrect(btn);

        checkAnswer(ok);
    }, { signal: ac.signal });
}
