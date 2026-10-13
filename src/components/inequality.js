import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createHintBox } from "./ui/hintBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const SVGNS = "http://www.w3.org/2000/svg";

const WORLD_EMOJI = {
    postman: "📮",
    racing: "🏎️",
    football: "⚽",
    cooking: "🍳",
    animals: "🦁",
    space: "🤖",
    tram: "🚋"
};

function svgEl(name, attrs) {
    const el = document.createElementNS(SVGNS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function buildLine(relation, bound) {
    const min = 0;
    const max = 10;
    const w = 120;
    const h = 34;
    const pad = 10;
    const lineY = 20;
    const usable = w - 2 * pad;
    const x = v => pad + ((v - min) / (max - min)) * usable;
    const right = relation === ">" || relation === "≥";
    const strict = relation === ">" || relation === "<";
    const color = "#2b7de9";

    const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, class: "ineq-svg", "aria-hidden": "true" });

    svg.append(svgEl("line", { x1: x(min) - 3, y1: lineY, x2: x(max) + 1, y2: lineY, class: "ineq-axis" }));
    svg.append(svgEl("polygon", { points: `${x(max) + 1},${lineY - 2} ${x(max) + 5},${lineY} ${x(max) + 1},${lineY + 2}`, class: "ineq-axis-arrow" }));

    for (let v = min; v <= max; v++) {
        svg.append(svgEl("line", { x1: x(v), y1: lineY - 2, x2: x(v), y2: lineY + 2, class: "ineq-tick" }));
        const label = svgEl("text", { x: x(v), y: lineY + 10, class: "ineq-label", "text-anchor": "middle" });
        label.textContent = v;
        svg.append(label);
    }

    const from = right ? x(bound) : x(min) - 3;
    const to = right ? x(max) + 1 : x(bound);
    svg.append(svgEl("line", { x1: from, y1: lineY, x2: to, y2: lineY, class: "ineq-ray", stroke: color }));

    if (right) {
        svg.append(svgEl("polygon", { points: `${to},${lineY - 3} ${to + 5},${lineY} ${to},${lineY + 3}`, class: "ineq-ray-arrow", fill: color }));
    } else {
        svg.append(svgEl("polygon", { points: `${to},${lineY - 3} ${to - 5},${lineY} ${to},${lineY + 3}`, class: "ineq-ray-arrow", fill: color }));
    }

    svg.append(svgEl("circle", {
        cx: x(bound),
        cy: lineY,
        r: 2.4,
        class: strict ? "ineq-endpoint ineq-open" : "ineq-endpoint ineq-closed",
        fill: strict ? "#ffffff" : color,
        stroke: color
    }));

    return svg;
}

function hintText() {
    return "A > és < esetén a határérték nem tartozik a megoldáshalmazba, ezért üres karika van. A ≥ és ≤ esetén a határérték is megoldás, ezért teli karika van. A színes nyíl arra mutat, amerre a megoldások vannak: x > 3 esetén jobbra, x < 3 esetén balra.";
}

function successText(step) {
    return `🎉 Ügyes! A megoldáshalmaz: x ${step.relation} ${step.bound}.`;
}

export function renderInequality(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "📈"} Egyenlőtlenségek`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "ineq-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    if (step.mode === "read") {
        const lineBox = document.createElement("div");
        lineBox.className = "ineq-line";
        lineBox.append(buildLine(step.relation, step.bound));
        card.append(lineBox);
    }

    if (step.mode === "solve") {
        const expression = document.createElement("div");
        expression.className = "ineq-expression";
        expression.textContent = step.expression;
        card.append(expression);
    }

    const message = createMessageBox();
    card.append(message.element);

    const options = document.createElement("div");
    options.className = step.mode === "choose" ? "ineq-options ineq-options-lines" : "ineq-options";

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ineq-option";
        btn.dataset.correct = String(!!opt.correct);

        if (step.mode === "choose") {
            btn.classList.add("ineq-option-line");
            btn.append(buildLine(opt.relation, opt.bound));
        } else {
            btn.textContent = opt.text;
        }

        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;

            if (opt.correct) {
                markCorrect(btn);
                options.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
                feedback.success(successText(step));
            } else {
                feedback.retry();
                maybeShowHint();
            }
        });

        options.append(btn);
    });

    card.append(options);

    root.append(card);

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    const hint = createHintBox();
    hint.classList.add("ineq-hint");

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.innerHTML = `<p><strong>💡 Segítség</strong></p><p>${hintText()}</p>`;
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    function maybeShowHint() {
        if (feedback.getMistakes() >= 2 && !hintShown) {
            hintButton.style.display = "inline-block";
        }
    }

    card.append(hintButton, hint);
}
