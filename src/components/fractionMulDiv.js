import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createHintBox } from "./ui/hintBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";
import { createAreaModel } from "./ui/areaModel.js";
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

const OP_SIGN = {
    times: "×",
    divide: "÷"
};

function operandNode(operand) {
    if (operand.whole !== undefined) {
        const el = document.createElement("div");
        el.className = "fmd-sign";
        el.textContent = String(operand.whole);
        return el;
    }
    return renderFractionSymbol(operand.numerator, operand.denominator);
}

function sign(text) {
    const el = document.createElement("div");
    el.className = "fmd-sign";
    el.textContent = text;
    return el;
}

function problemText(step) {
    const left = `${step.left.numerator}/${step.left.denominator}`;
    const right = step.mode === "whole"
        ? String(step.right.whole)
        : `${step.right.numerator}/${step.right.denominator}`;
    return `${left} ${OP_SIGN[step.op]} ${right}`;
}

export function renderFractionMulDiv(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) card.append(progress);

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "✖️"} Törtek szorzása és osztása`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "fmd-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    if (step.op === "times" && step.mode === "fraction") {
        card.append(createAreaModel({
            rows: step.left.denominator,
            cols: step.right.denominator,
            filledRows: step.left.numerator,
            filledCols: step.right.numerator
        }));
    }

    const row = document.createElement("div");
    row.className = "fmd-row";
    row.append(
        operandNode(step.left),
        sign(OP_SIGN[step.op]),
        operandNode(step.right),
        sign("="),
        sign("▢")
    );
    card.append(row);

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
    hint.classList.add("fmd-hint");

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
    options.className = "fraction-options";

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "fraction-option fraction-option-symbol";
        btn.append(renderFractionSymbol(opt.numerator, opt.denominator));

        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;

            if (opt.correct) {
                markCorrect(btn);
                options.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
                feedback.success(`🎉 Ügyes! ${problemText(step)} = ${opt.numerator}/${opt.denominator}. ${step.explanation}`);
            } else {
                feedback.retry();
                maybeShowHint();
            }
        });

        options.append(btn);
    });

    card.append(options, hintButton, hint);
}
