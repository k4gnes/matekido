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

function successText(step) {
    if (step.mode === "fraction-to-decimal") {
        return `🎉 Ügyes! ${step.numerator}/${step.denominator} = ${step.decimal}.`;
    }
    const expanded = `${step.expanded.numerator}/${step.expanded.denominator}`;
    const simple = `${step.numerator}/${step.denominator}`;
    if (expanded === simple) {
        return `🎉 Ügyes! ${step.decimal} = ${simple}.`;
    }
    return `🎉 Ügyes! ${step.decimal} = ${expanded} = ${simple}.`;
}

function optionContent(step, opt) {
    if (step.mode === "decimal-to-fraction") {
        return renderFractionSymbol(opt.numerator, opt.denominator);
    }
    const span = document.createElement("span");
    span.textContent = opt.text;
    return span;
}

export function renderFractionDecimal(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) card.append(progress);

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🔁"} Tört és tizedes tört átváltása`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "fd-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    const display = document.createElement("div");
    display.className = "fd-display";
    if (step.mode === "fraction-to-decimal") {
        display.append(renderFractionSymbol(step.numerator, step.denominator));
    } else {
        display.textContent = step.decimal;
    }
    card.append(display);

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
    hint.classList.add("fd-hint");

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
    options.className = "fd-options";

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "fd-option";
        btn.append(optionContent(step, opt));

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

    card.append(options, hintButton, hint);
}
