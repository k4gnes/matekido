import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createHintRequest } from "./ui/hintBox.js?v=2";
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

function hintText(step) {
    if (step.mode === "multiple") {
        return `A többszörös úgy keletkezik, hogy a számot megszorozzuk egész számmal: ${step.base} × 2, ${step.base} × 3, ${step.base} × 4 …`;
    }
    if (step.mode === "not-multiple") {
        return `Számold ki a ${step.base} többszöröseit (× 2, × 3, × 4 …), és a többi válasz az, ami nem osztható ${step.base}-tel maradék nélkül.`;
    }
    if (step.mode === "divisor") {
        return `Az osztó olyan szám, amivel a ${step.base} maradék nélkül elosztható. Próbáld meg a válaszokat!`;
    }
    return `Az osztók azok a számok, amelyekkel a ${step.base} maradék nélkül osztható. Nézd meg a felsorolt számokat, és számold, hány osztja!`;
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
    const hint = createHintRequest(() => hintText(step));

    card.append(hint.button, hint.box);
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

    function maybeShowHint() {
        if (feedback.getMistakes() >= 2) hint.offer();
    }

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
                maybeShowHint();
            }
        });

        options.append(btn);
    });

    card.append(options);
}