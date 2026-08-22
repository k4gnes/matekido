import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📮 Hibás számolás?",
    racing: "🏎️ Hibás számolás?",
    football: "⚽ Hibás számolás?",
    cooking: "🍳 Hibás számolás?",
    animals: "🦁 Hibás számolás?",
    space: "🤖 Hibás számolás?"
};

export function renderFindError(step, root, next, progress, onResult, onAttempt) {

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

    const isPick = step.mode === "pick";

    if (!isPick) {
        const expr = document.createElement("div");
        expr.className = "fe-expression";
        expr.textContent = step.statement;
        card.append(expr);
    }

    const prompt = document.createElement("p");
    prompt.className = "fe-prompt";
    prompt.textContent = isPick ? "Melyik számolás hibás?" : "Hibás-e a számolás?";
    card.append(prompt);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = isPick ? "fe-calcs" : "fe-options";

    if (isPick) {
        step.items.forEach((item, index) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "fe-calc";
            btn.textContent = item.statement;
            btn.dataset.index = index;
            optionsContainer.append(btn);
        });
    } else {
        const okBtn = document.createElement("button");
        okBtn.type = "button";
        okBtn.className = "fe-option fe-ok";
        okBtn.textContent = "✅ Helyes";
        okBtn.dataset.value = "ok";

        const errBtn = document.createElement("button");
        errBtn.type = "button";
        errBtn.className = "fe-option fe-err";
        errBtn.textContent = "❌ Hibás";
        errBtn.dataset.value = "error";

        optionsContainer.append(okBtn, errBtn);
    }

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

    function successText() {
        if (!isPick && step.hasError) {
            return `😊 Ügyes! A helyes eredmény: ${step.correctResult}`;
        }
        return "😊 Szép munka!";
    }

    function checkAnswer(isCorrect) {
        if (feedback.isAnswered()) return;

        if (isCorrect) {
            optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");

            feedback.success(successText());
        } else {
            feedback.retry();
        }
    }

    optionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(isPick ? ".fe-calc" : ".fe-option");
        if (!btn || feedback.isAnswered()) return;

        const ok = isPick
            ? Number(btn.dataset.index) === step.answer
            : (btn.dataset.value === "error") === step.hasError;

        if (ok) markCorrect(btn);

        checkAnswer(ok);
    }, { signal: ac.signal });
}
