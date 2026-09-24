import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
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

function correctNumber(step) {
    const opt = step.options.find(o => o.correct);
    return opt ? Number(opt.text) : 0;
}

export function renderDivisibility(step, root, next, progress, onResult, onAttempt) {

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "➗"} Osztó és többszörös`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "divisibility-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    const symbol = document.createElement("div");
    symbol.className = "divisibility-symbol-box";
    symbol.textContent = step.base;
    card.append(symbol);

    if (step.mode === "count" && Array.isArray(step.divisors)) {
        const chips = document.createElement("div");
        chips.className = "divisibility-chips";
        step.divisors.forEach(d => {
            const chip = document.createElement("span");
            chip.className = "divisibility-chip";
            chip.textContent = d;
            chips.append(chip);
        });
        card.append(chips);
    }

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

    const correct = correctNumber(step);

    const successText = (() => {
        if (step.mode === "multiple") {
            return `🎉 Ügyes! ${correct} többszöröse a ${step.base}${step.suffix}.`;
        }
        if (step.mode === "not-multiple") {
            return `🎉 Ügyes! ${correct} NEM többszöröse a ${step.base}${step.suffix}.`;
        }
        if (step.mode === "divisor") {
            return `🎉 Ügyes! ${correct} osztója a ${step.base}${step.suffix}.`;
        }
        return `🎉 Ügyes! A ${step.base}${step.suffix} ${correct} osztója van.`;
    })();

    const options = document.createElement("div");
    options.className = "divisibility-options";

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "divisibility-option";
        btn.textContent = opt.text;

        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;

            if (opt.correct) {
                markCorrect(btn);
                feedback.success(successText);
            } else {
                feedback.retry();
            }
        });

        options.append(btn);
    });

    card.append(options);
}