import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📦 Becslés",
    racing: "🏎️ Becslés",
    football: "⚽ Becslés",
    cooking: "🍳 Becslés",
    animals: "🦁 Becslés",
    space: "🤖 Becslés"
};

export function renderEstimate(step, root, next, progress, onResult, onAttempt) {

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
    expr.className = "est-expression";
    expr.textContent = step.expression;
    card.append(expr);

    if (step.hint) {
        const hint = document.createElement("p");
        hint.className = "est-hint";
        hint.textContent = step.hint;
        card.append(hint);
    }

    const prompt = document.createElement("p");
    prompt.className = "est-prompt";
    prompt.textContent = "Melyik a legjobb becslés?";
    card.append(prompt);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "est-options";

    step.options.forEach(value => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "est-option";
        btn.textContent = value;
        btn.dataset.value = value;
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

            feedback.success();
        } else {
            feedback.retry();
        }
    }

    optionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".est-option");
        if (!btn || feedback.isAnswered()) return;

        const ok = Number(btn.dataset.value) === step.answer;

        if (ok) markCorrect(btn);

        checkAnswer(ok);
    }, { signal: ac.signal });
}
