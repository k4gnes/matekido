import { createCard } from "./ui/card.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_TITLES = {
    postman: "📮 Mi a következő a sorban?",
    racing: "🏎️ Mi a következő a sorban?",
    football: "⚽ Mi a következő a sorban?",
    cooking: "🍳 Mi a következő a sorban?"
};

export function renderPattern(step, root, onNext, progress, onResult, onAttempt) {

    root.innerHTML = "";

    const world = getActiveWorld();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = WORLD_TITLES[world] ?? WORLD_TITLES.postman;
    card.append(title);

    const sequence = document.createElement("div");
    sequence.className = "pattern-sequence";

    step.terms.forEach(emoji => {
        const term = document.createElement("span");
        term.className = "pattern-term";
        term.textContent = emoji;
        sequence.append(term);
    });

    const question = document.createElement("span");
    question.className = "pattern-question";
    question.textContent = "?";
    sequence.append(question);

    card.append(sequence);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "pattern-options";

    let answered = false;
    let reported = false;

    step.options.forEach(opt => {
        const isCorrect = opt === step.answer;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pattern-option";
        btn.textContent = opt;

        btn.addEventListener("mouseenter", () => {
            if (!answered) btn.style.transform = "scale(1.1)";
        });
        btn.addEventListener("mouseleave", () => {
            if (!answered) btn.style.transform = "";
        });

        btn.addEventListener("click", () => {
            if (answered) return;
            answered = true;

            onAttempt?.();

            optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");

            if (isCorrect) {
                btn.classList.add("pattern-correct");
                message.textContent = "🎉 Jó válasz!";
                message.className = "pattern-message pattern-message-good";

                if (!reported) {
                    reported = true;
                    onResult?.(true);
                }
            } else {
                btn.classList.add("pattern-wrong");
                optionsContainer.querySelectorAll("button").forEach(b => {
                    if (b.textContent === step.answer) {
                        b.classList.add("pattern-correct");
                    }
                });
                message.textContent = `🤔 Nem! A helyes válasz: ${step.answer}`;
                message.className = "pattern-message pattern-message-bad";

                if (!reported) {
                    reported = true;
                    onResult?.(false);
                }
            }

            question.textContent = step.answer;

            const nextBtn = document.createElement("button");
            nextBtn.className = "pattern-next";
            nextBtn.textContent = "➡️ Tovább";
            nextBtn.addEventListener("click", () => onNext());
            card.append(nextBtn);
        });

        optionsContainer.append(btn);
    });

    const message = document.createElement("div");
    message.className = "pattern-message";

    card.append(optionsContainer, message);
    root.append(card);
}
