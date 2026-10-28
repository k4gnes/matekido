import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "🗂 Halmazműveletek",
    racing: "🏎️ Halmazműveletek",
    football: "⚽ Halmazműveletek",
    cooking: "🍳 Halmazműveletek",
    animals: "🦁 Halmazműveletek",
    space: "🚀 Halmazműveletek",
    tram: "🚋 Halmazműveletek"
};

export function renderSetOps(step, root, next, progress, onResult, onAttempt) {
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

    const question = document.createElement("p");
    question.className = "setops-question";
    question.textContent = step.question;
    card.append(question);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "setops-options";

    (step.options || []).forEach((opt, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "setops-option";
        btn.dataset.index = index;
        btn.textContent = opt.text;
        optionsContainer.append(btn);
    });

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
            optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
            feedback.success("😊 Ügyes! Helyes válasz.");
        } else {
            feedback.retry();
        }
    }

    optionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".setops-option");
        if (!btn || feedback.isAnswered()) return;

        const idx = Number(btn.dataset.index);
        const ok = step.options && step.options[idx] && step.options[idx].correct;

        if (ok) markCorrect(btn);

        checkAnswer(ok);
    }, { signal: ac.signal });
}
