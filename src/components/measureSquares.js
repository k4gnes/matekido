import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_EMOJI = {
    postman: "📏",
    racing: "🔧",
    football: "⚽",
    cooking: "🥄",
    animals: "🦁",
    space: "🤖"
};

const S = 30;
const NS = "http://www.w3.org/2000/svg";

export function renderMeasureSquares(step, root, next, progress, onResult, onAttempt) {

    const WORD = { horizontal: "hosszú", tall: "magas", deep: "mély" };
    const TITLE = {
        horizontal: () => `Milyen hosszú a ${step.name}?`,
        tall: () => `Milyen magas a ${step.name}?`,
        deep: () => `Milyen mély a ${step.name}?`
    };

    const N = step.length;

    let placed = 0;

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "📏"} ${TITLE[step.direction]()}`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "meas-prompt";
    prompt.textContent = "Rakj mérőnégyzeteket a tárgyra, amíg pontosan be nem fedi, és számold meg, hányat ér!";
    card.append(prompt);

    const scene = document.createElement("div");
    scene.className = "meas-scene";

    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "meas-svg");
    svg.addEventListener("click", addSquare);
    scene.append(svg);
    card.append(scene);

    const count = document.createElement("p");
    count.className = "meas-count";
    card.append(count);

    const controls = document.createElement("div");
    controls.className = "meas-controls";

    const addBtn = createButton("+ 🟨 Négyzet", { className: "meas-add", onClick: addSquare });
    const removeBtn = createButton("🗑️ Elveszek", {
        className: "meas-remove",
        onClick: () => {
            if (feedback.isAnswered()) return;
            if (placed > 0) placed--;
            render();
        }
    });
    const checkBtn = createButton("✅ Ellenőrzöm", { onClick: check });
    controls.append(addBtn, removeBtn, checkBtn);
    card.append(controls);

    const message = createMessageBox();
    card.append(message.element);

    root.replaceChildren(card);

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    render();

    function addSquare() {
        if (feedback.isAnswered()) return;
        if (placed >= N + 3) return;
        placed++;
        render();
    }

    function el(tag, attrs) {
        const n = document.createElementNS(NS, tag);
        for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
        return n;
    }

    function setSize(w, h) {
        svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
        svg.setAttribute("width", w);
        svg.setAttribute("height", h);
    }

    function build() {
        const nodes = [];

        const label = el("text", { "font-size": 15 });
        label.textContent = `${step.emoji} ${step.name}`;

        const word = el("text", { "font-size": 15, "font-weight": 700, fill: "#475569" });
        word.textContent = WORD[step.direction];

        if (step.direction === "horizontal") {
            const barX = 100;
            setSize(barX + N * S + 80, 108);
            label.setAttribute("x", 6);
            label.setAttribute("y", 75);
            word.setAttribute("x", barX + N * S + 8);
            word.setAttribute("y", 75);

            nodes.push(label, word);
            nodes.push(el("rect", { x: barX, y: 60, width: N * S, height: 28, rx: 4, fill: "#f1f5f9", stroke: "#64748b", "stroke-width": 1.5, "stroke-dasharray": "5,4" }));
            for (let i = 1; i < N; i++) {
                nodes.push(el("line", { x1: barX + i * S, y1: 60, x2: barX + i * S, y2: 88, stroke: "#cbd5e1", "stroke-dasharray": "3,3" }));
            }
            nodes.push(el("line", { x1: barX, y1: 56, x2: barX, y2: 92, stroke: "#475569", "stroke-width": 2 }));

            for (let i = 0; i < placed; i++) {
                nodes.push(square(barX + i * S, 60, i >= N));
            }
        } else if (step.direction === "tall") {
            const barX = 120;
            const ground = 20 + N * S;
            setSize(barX + 36 + 70, ground + 10);
            label.setAttribute("x", 4);
            label.setAttribute("y", 20 + (N * S) / 2);
            word.setAttribute("x", barX + 36);
            word.setAttribute("y", 20 + (N * S) / 2);

            nodes.push(label, word);
            nodes.push(el("rect", { x: barX, y: 20, width: 28, height: N * S, rx: 4, fill: "#f1f5f9", stroke: "#64748b", "stroke-width": 1.5, "stroke-dasharray": "5,4" }));
            for (let i = 1; i < N; i++) {
                nodes.push(el("line", { x1: barX, y1: 20 + i * S, x2: barX + 28, y2: 20 + i * S, stroke: "#cbd5e1", "stroke-dasharray": "3,3" }));
            }
            nodes.push(el("line", { x1: barX - 6, y1: ground, x2: barX + 34, y2: ground, stroke: "#475569", "stroke-width": 2 }));

            for (let i = 0; i < placed; i++) {
                nodes.push(square(barX, ground - (i + 1) * S, i >= N));
            }
        } else {
            const barX = 120;
            const bottom = 30 + N * S;
            setSize(barX + 36 + 70, bottom + 10);
            label.setAttribute("x", 4);
            label.setAttribute("y", 30 + (N * S) / 2);
            word.setAttribute("x", barX + 36);
            word.setAttribute("y", 30 + (N * S) / 2);

            nodes.push(label, word);
            nodes.push(el("rect", { x: barX, y: 30, width: 28, height: N * S, rx: 4, fill: "#f1f5f9", stroke: "#64748b", "stroke-width": 1.5, "stroke-dasharray": "5,4" }));
            for (let i = 1; i < N; i++) {
                nodes.push(el("line", { x1: barX, y1: 30 + i * S, x2: barX + 28, y2: 30 + i * S, stroke: "#cbd5e1", "stroke-dasharray": "3,3" }));
            }
            nodes.push(el("line", { x1: barX - 6, y1: 30, x2: barX + 34, y2: 30, stroke: "#475569", "stroke-width": 2 }));

            for (let i = 0; i < placed; i++) {
                nodes.push(square(barX, 30 + i * S, i >= N));
            }
        }

        return nodes;
    }

    function square(x, y, overflow) {
        return el("rect", {
            x, y, width: S, height: S, rx: 3,
            fill: overflow ? "#fecaca" : "#fde68a",
            stroke: overflow ? "#dc2626" : "#d97706",
            "stroke-width": 2
        });
    }

    function render() {
        svg.replaceChildren(...build());
        count.textContent = `Rárakott négyzetek: ${placed}`;
        addBtn.disabled = placed >= N + 3;
    }

    function check() {
        if (feedback.isAnswered()) return;

        if (placed === N) {
            checkBtn.disabled = true;
            addBtn.disabled = true;
            removeBtn.disabled = true;
            feedback.success(`🎉 A ${step.name} ${N} négyzet ${WORD[step.direction]}!`);
        } else if (placed < N) {
            feedback.retry(
                placed === 0
                    ? "🤔 Előbb rakj négyzeteket a tárgyra!"
                    : `🤔 Még nincs tele! ${N - placed} négyzet hiányzik.`
            );
        } else {
            feedback.retry(`🤔 Túlságosan sok! A ${step.name} csak ${N} négyzet hosszú.`);
        }
    }
}
