import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📮 Igaz vagy hamis?",
    racing: "🏎️ Igaz vagy hamis?",
    football: "⚽ Igaz vagy hamis?",
    cooking: "🍳 Igaz vagy hamis?",
    animals: "🦁 Igaz vagy hamis?",
    space: "🤖 Igaz vagy hamis?"
};

export function renderTrueFalse(step, root, next, progress, onResult, onAttempt) {

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

    const expr = document.createElement("div");
    expr.className = "tf-expression";
    expr.textContent = step.statement;
    card.append(expr);

    const prompt = document.createElement("p");
    prompt.className = "tf-prompt";
    prompt.textContent = "Igaz vagy hamis?";
    card.append(prompt);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "tf-options";

    const trueBtn = document.createElement("button");
    trueBtn.type = "button";
    trueBtn.className = "tf-option tf-true";
    trueBtn.textContent = "✅ Igaz";
    trueBtn.dataset.value = "true";

    const falseBtn = document.createElement("button");
    falseBtn.type = "button";
    falseBtn.className = "tf-option tf-false";
    falseBtn.textContent = "❌ Hamis";
    falseBtn.dataset.value = "false";

    optionsContainer.append(trueBtn, falseBtn);
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
            trueBtn.style.pointerEvents = "none";
            falseBtn.style.pointerEvents = "none";

            feedback.success();
        } else {
            feedback.retry();
        }
    }

    optionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".tf-option");
        if (!btn || feedback.isAnswered()) return;

        const ok = (btn.dataset.value === "true") === step.answer;

        if (ok) markCorrect(btn);

        checkAnswer(ok);
    }, { signal: ac.signal });
}
