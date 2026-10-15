import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createHintBox } from "./ui/hintBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_EMOJI = {
    postman: "📮",
    racing: "🏎️",
    football: "⚽",
    cooking: "🍳",
    animals: "🦁",
    space: "🚀",
    tram: "🚋"
};

function successText(step) {
    if (step.mode === "factor") return `🎉 Ügyes! Az eredmény: ${step.answer}.`;
    return `🎉 Ügyes! Az eredmény ${step.answer}.`;
}

export function renderAlgebra(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) card.append(progress);

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🧮"} Algebra`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "algebra-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    const display = document.createElement("div");
    display.className = "algebra-display";
    display.textContent = step.expression;
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
    hint.classList.add("algebra-hint");

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.innerHTML = `<p><strong>💡 Segítség</strong></p><p>${step.hint}</p>`;
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    function maybeShowHint() {
        if (feedback.getMistakes() >= 2 && !hintShown) {
            hintButton.style.display = "inline-block";
        }
    }

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "algebra-options";

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "algebra-option";
        btn.textContent = opt.text;
        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;
            if (opt.correct) {
                markCorrect(btn);
                optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
                feedback.success(successText(step));
            } else {
                feedback.retry();
                maybeShowHint();
            }
        });
        optionsContainer.append(btn);
    });

    card.append(optionsContainer, hintButton, hint);
}
