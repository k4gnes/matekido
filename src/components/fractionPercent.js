import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createHintBox } from "./ui/hintBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";
import { renderFractionSymbol } from "./ui/fractionShapes.js";

const WORLD_EMOJI = {
    postman: "📮",
    racing: "🏎️",
    football: "⚽",
    cooking: "🍳",
    animals: "🦁",
    space: "🤖",
    tram: "🚋"
};

function givenNode(step) {
    if (step.given === "fraction") {
        return renderFractionSymbol(step.numerator, step.denominator);
    }
    const el = document.createElement("div");
    el.className = "fp-given-text";
    el.textContent = step.given === "ratio"
        ? `${step.numerator} : ${step.denominator}`
        : `${step.percent}%`;
    return el;
}

function renderBar(numerator, denominator) {
    const bar = document.createElement("div");
    bar.className = "fp-bar";
    for (let i = 0; i < denominator; i++) {
        const cell = document.createElement("div");
        cell.className = "fp-bar-cell" + (i < numerator ? " fp-bar-filled" : "");
        bar.append(cell);
    }
    return bar;
}

function renderHundredGrid(percent) {
    const grid = document.createElement("div");
    grid.className = "fp-grid";
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement("div");
        cell.className = "fp-cell" + (i < percent ? " fp-cell-filled" : "");
        grid.append(cell);
    }
    return grid;
}

function optionNode(step, opt) {
    if (step.target === "fraction") {
        return renderFractionSymbol(opt.numerator, opt.denominator);
    }
    const el = document.createElement("div");
    el.className = "fp-option-text";
    el.textContent = opt.text;
    return el;
}

export function renderFractionPercent(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) card.append(progress);

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🔗"} Törtrész, arány és százalék`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "fp-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    const given = document.createElement("div");
    given.className = "fp-given";
    given.append(givenNode(step));
    card.append(given);

    if (step.given === "percent") {
        card.append(renderHundredGrid(step.percent));
    } else {
        card.append(renderBar(step.numerator, step.denominator));
    }

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

    const hint = createHintBox();
    hint.classList.add("fp-hint");

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.innerHTML = `<p><strong>💡 Segítség</strong></p><p>${step.hint ?? ""}</p>`;
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    function maybeShowHint() {
        if (feedback.getMistakes() >= 2 && !hintShown) {
            hintButton.style.display = "inline-block";
        }
    }

    const options = document.createElement("div");
    options.className = "fp-options";

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "fp-option";
        btn.append(optionNode(step, opt));

        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;

            if (opt.correct) {
                markCorrect(btn);
                options.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
                feedback.success(`🎉 Ügyes! ${step.explanation}`);
            } else {
                feedback.retry();
                maybeShowHint();
            }
        });

        options.append(btn);
    });

    card.append(options, hintButton, hint);
}
