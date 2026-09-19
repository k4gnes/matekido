import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_TITLES = {
    postman: "📮 Mi a következő a sorban?",
    racing: "🏎️ Mi a következő a sorban?",
    football: "⚽ Mi a következő a sorban?",
    cooking: "🍳 Mi a következő a sorban?",
    animals: "🦁 Mi a következő a sorban?",
    space: "🤖 Mi a következő a sorban?"
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

    const isNumeric = typeof step.terms[0] === "number";
    if (isNumeric) {
        sequence.classList.add("pattern-numeric");
    }

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
    if (isNumeric) {
        optionsContainer.classList.add("pattern-numeric");
    }

    const message = createMessageBox();

    card.append(optionsContainer, message.element);
    root.append(card);

    const feedback = createFeedback({
        message,
        container: card,
        onNext,
        onResult,
        onAttempt
    });

    step.options.forEach(opt => {
        const isCorrect = opt === step.answer;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pattern-option";
        btn.textContent = opt;

        btn.addEventListener("mouseenter", () => {
            if (!feedback.isAnswered()) btn.style.transform = "scale(1.1)";
        });
        btn.addEventListener("mouseleave", () => {
            if (!feedback.isAnswered()) btn.style.transform = "";
        });

        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;

            optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");

            if (isCorrect) {
                markCorrect(btn);
                feedback.success("🎉 Jó válasz!");
            } else {
                btn.classList.add("pattern-wrong");
                optionsContainer.querySelectorAll("button").forEach(b => {
                    if (b.textContent === step.answer) {
                        b.classList.add("pattern-correct");
                    }
                });
                feedback.reveal(`🤔 Nem! A helyes válasz: ${step.answer}`);
            }

            question.textContent = step.answer;
        });

        optionsContainer.append(btn);
    });
}