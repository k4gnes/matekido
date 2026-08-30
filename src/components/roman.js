import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";

export function renderRoman(step, root, next, progress, onResult, onAttempt) {

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = "🏛️ Római számok";

    const prompt = document.createElement("p");
    prompt.className = "mult-hint";
    prompt.textContent = step.direction === "toRoman"
        ? "Hogyan írjuk római számokkal?"
        : "Melyik szám ez római számokkal?";

    const display = document.createElement("div");
    display.className = "mult-expression";

    const value = document.createElement("span");
    value.textContent = step.direction === "toRoman" ? step.number : step.roman;
    display.append(value);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "mult-options";

    step.options.forEach(option => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mult-option";
        btn.textContent = option;
        btn.dataset.value = option;
        optionsContainer.append(btn);
    });

    card.append(title, prompt, display, optionsContainer);

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

    optionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".mult-option");
        if (!btn || feedback.isAnswered()) return;
        const option = btn.dataset.value;

        if (String(step.answer) === option) {
            markCorrect(btn);
            optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
            feedback.success();
        } else {
            feedback.retry();
        }
    });
}