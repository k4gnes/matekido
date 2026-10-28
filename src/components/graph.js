import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "🕸️ Gráfok",
    racing: "🏎️ Gráfok",
    football: "⚽ Gráfok",
    cooking: "🍳 Gráfok",
    animals: "🦁 Gráfok",
    space: "🚀 Gráfok",
    tram: "🚋 Gráfok"
};

export function renderGraph(step, root, next, progress, onResult, onAttempt) {
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

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "260");
    svg.setAttribute("height", "160");
    svg.setAttribute("viewBox", "0 0 260 160");
    svg.classList.add("graph-svg");

    const labels = step.labels || [];
    const edges = step.edges || [];
    const n = labels.length || 0;

    const positions = [];
    const cx = 130, cy = 80, r = 60;
    for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI * i) / Math.max(n, 1) - Math.PI / 2;
        positions.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
    }

    for (let i = 0; i < edges.length; i++) {
        const e = edges[i];
        const p1 = positions[e[0]];
        const p2 = positions[e[1]];
        if (!p1 || !p2) continue;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", String(p1.x));
        line.setAttribute("y1", String(p1.y));
        line.setAttribute("x2", String(p2.x));
        line.setAttribute("y2", String(p2.y));
        line.setAttribute("class", "graph-edge");
        svg.appendChild(line);
    }

    for (let i = 0; i < n; i++) {
        const p = positions[i];
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", String(p.x));
        circle.setAttribute("cy", String(p.y));
        circle.setAttribute("r", "16");
        circle.setAttribute("class", "graph-node");
        svg.appendChild(circle);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", String(p.x));
        text.setAttribute("y", String(p.y + 4));
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("class", "graph-label");
        text.textContent = labels[i] || String(i + 1);
        svg.appendChild(text);
    }

    card.append(svg);

    const question = document.createElement("p");
    question.className = "graph-question";
    question.textContent = step.question;
    card.append(question);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "graph-options";

    (step.options || []).forEach((opt, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "graph-option";
        btn.dataset.index = index;
        btn.textContent = opt.text;
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

    function checkAnswer(isCorrect) {
        if (feedback.isAnswered()) return;

        if (isCorrect) {
            optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
            feedback.success("😊 Ügyes! Helyes válasz.");
        } else {
            feedback.retry();
        }
    }

    optionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".graph-option");
        if (!btn || feedback.isAnswered()) return;

        const idx = Number(btn.dataset.index);
        const ok = step.options && step.options[idx] && step.options[idx].correct;

        if (ok) markCorrect(btn);

        checkAnswer(ok);
    }, { signal: ac.signal });
}
