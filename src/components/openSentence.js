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
    space: "🤖",
    tram: "🚋"
};

function hintText() {
    return "Helyettesítsd be a megadott számot az x helyére, és számold ki a műveletet! Ha ugyanazt kapod, mint a mondat jobb oldalán, akkor a mondat igaz; ha nem, akkor hamis.";
}

function successText(step) {
    return step.answer
        ? `🎉 Ügyes! Ha x = ${step.value}, akkor a mondat igaz.`
        : `🎉 Ügyes! Ha x = ${step.value}, akkor a mondat hamis.`;
}

export function renderOpenSentence(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🧩"} Nyitott mondat`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "open-sentence-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    const substitution = document.createElement("p");
    substitution.className = "open-sentence-substitution";
    substitution.textContent = `Ha x = ${step.value}, akkor`;
    card.append(substitution);

    const expression = document.createElement("div");
    expression.className = "open-sentence-expression";
    expression.textContent = step.sentence;
    card.append(expression);

    const message = createMessageBox();
    card.append(message.element);

    const options = document.createElement("div");
    options.className = "open-sentence-options";

    const trueBtn = document.createElement("button");
    trueBtn.type = "button";
    trueBtn.className = "open-sentence-option open-sentence-true";
    trueBtn.textContent = "✅ Igaz";
    trueBtn.dataset.value = "true";

    const falseBtn = document.createElement("button");
    falseBtn.type = "button";
    falseBtn.className = "open-sentence-option open-sentence-false";
    falseBtn.textContent = "❌ Hamis";
    falseBtn.dataset.value = "false";

    options.append(trueBtn, falseBtn);
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
    hint.classList.add("open-sentence-hint");

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

    options.addEventListener("click", (e) => {
        const btn = e.target.closest(".open-sentence-option");
        if (!btn || feedback.isAnswered()) return;

        const ok = (btn.dataset.value === "true") === step.answer;

        if (ok) {
            markCorrect(btn);
            options.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
            feedback.success(successText(step));
        } else {
            feedback.retry();
            maybeShowHint();
        }
    });

    card.append(hintButton, hint);
}
