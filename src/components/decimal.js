import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";
import { renderFractionSymbol } from "./ui/fractionShapes.js";

const WORLD_EMOJI = {
    postman: "📮",
    racing: "🏎️",
    football: "⚽",
    cooking: "🍳",
    animals: "🦁",
    space: "🤖"
};

function correctText(step) {
    const opt = step.options.find(o => o.correct);
    return opt ? opt.text : "";
}

export function renderDecimal(step, root, next, progress, onResult, onAttempt) {

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🔟"} Tizedes törtek`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "decimal-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    if (step.mode === "tenths" || step.mode === "hundredths") {
        const drawing = document.createElement("div");
        drawing.className = "decimal-drawing";
        drawing.append(renderGrid(step.total, step.filled));
        card.append(drawing);
    } else if (step.mode === "compare") {
        const compareRow = document.createElement("div");
        compareRow.className = "decimal-compare";
        compareRow.append(renderSymbolBox(step.left), renderSymbolBox("?"), renderSymbolBox(step.right));
        card.append(compareRow);
    } else {
        const symbol = document.createElement("div");
        symbol.className = "decimal-symbol-box";
        if (step.direction === "fraction-to-decimal") {
            symbol.append(renderFractionSymbol(step.numerator, step.denominator));
        } else {
            symbol.textContent = step.symbol;
        }
        card.append(symbol);
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
    options.className = "decimal-options";

    const correct = correctText(step);

    const successText = (() => {
        if (step.mode === "compare") {
            return `🎉 Ügyes! ${step.left} ${correct} ${step.right}`;
        }
        if (step.mode === "convert") {
            return `🎉 Ügyes! ${step.symbol} = ${correct}.`;
        }
        return `🎉 Ügyes! ${correct} az ${step.filled} ${step.total === 10 ? "tized" : "század"}.`;
    })();

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "decimal-option";
        btn.textContent = opt.text;

        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;

            if (opt.correct) {
                markCorrect(btn);
                feedback.success(successText);
            } else {
                feedback.retry();
            }
        });

        options.append(btn);
    });

    card.append(options);
}

function renderGrid(total, filled) {
    const grid = document.createElement("div");
    grid.className = "decimal-grid";
    grid.classList.add(total === 10 ? "decimal-grid-tenths" : "decimal-grid-hundredths");

    for (let i = 0; i < total; i++) {
        const cell = document.createElement("div");
        cell.className = "decimal-cell";
        if (i < filled) {
            cell.classList.add("decimal-cell-filled");
        }
        grid.append(cell);
    }

    return grid;
}

function renderSymbolBox(text) {
    const box = document.createElement("div");
    box.className = "decimal-symbol-box";
    box.textContent = text;
    return box;
}