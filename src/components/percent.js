import { renderPercentHint } from "./hints/percentHint.js";
import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createHintBox } from "./ui/hintBox.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_EMOJI = {
    postman: "📮",
    racing: "🏎️",
    football: "⚽",
    cooking: "🍳",
    animals: "🦁",
    space: "🤖",
    tram: "🚋"
};

function correctText(step) {
    const opt = step.options.find(o => o.correct);
    return opt ? opt.text : "";
}

function successText(step, correct) {
    if (step.mode === "grid") {
        return `🎉 Ügyes! 100 kockából ${step.cells} van kiszínezve, ez ${step.percent}%.`;
    }
    if (step.mode === "frac") {
        return `🎉 Ügyes! ${step.percent}% = ${correct}.`;
    }
    if (step.mode === "word") {
        return `🎉 Ügyes! Ez ${step.percent}%.`;
    }
    if (step.mode === "of") {
        return `🎉 Ügyes! ${step.base} szám ${step.percent} százaléka ${correct}.`;
    }
    if (step.mode === "find") {
        return `🎉 Ügyes! ${step.value} a ${step.base} szám ${step.percent} százaléka.`;
    }
    return `🎉 Ügyes! ${correct}`;
}

export function renderPercent(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "💯"} ${step.title ?? "Százalék"}`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "percent-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    if (step.mode === "grid") {
        const drawing = document.createElement("div");
        drawing.className = "percent-drawing";
        drawing.append(renderGrid(step.cells));
        card.append(drawing);
    } else if (step.mode === "word") {
        const box = document.createElement("div");
        box.className = "percent-box percent-box-word";
        box.textContent = step.context;
        card.append(box);
    } else {
        const box = document.createElement("div");
        box.className = "percent-box";
        box.textContent = step.symbol;
        card.append(box);
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

    const options = document.createElement("div");
    options.className = "percent-options";

    const correct = correctText(step);

    const hint = createHintBox();

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            renderPercentHint(step, hint);
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "percent-option";
        btn.textContent = opt.text;

        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;

            if (opt.correct) {
                markCorrect(btn);
                feedback.success(successText(step, correct));
            } else {
                feedback.retry();

                if (feedback.getMistakes() >= 2 && !hintShown) {
                    hintButton.style.display = "inline-block";
                }
            }
        });

        options.append(btn);
    });

    card.append(options, hintButton, hint);
}

function renderGrid(filled) {
    const grid = document.createElement("div");
    grid.className = "percent-grid";

    for (let i = 0; i < 100; i++) {
        const cell = document.createElement("div");
        cell.className = "percent-cell";
        if (i < filled) {
            cell.classList.add("percent-cell-filled");
        }
        grid.append(cell);
    }

    return grid;
}
