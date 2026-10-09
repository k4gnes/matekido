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

function primeFactorHint() {
    return "A számot a legkisebb prímosztóval kezdd: oszd el 2-vel, ha lehet, aztán 3-mal, 5-tel és így tovább, amíg 1 nem marad. Például 24 = 2 · 2 · 2 · 3. A prímfelbontásban csak prímszámok szorozhatnak!";
}

function successText(step) {
    if (step.mode === "missing") {
        return `🎉 Ügyes! A hiányzó prím a ${step.answer}: ${step.number} = ${step.factors.join(" · ")}.`;
    }
    return `🎉 Ügyes! ${step.number} = ${step.answer}.`;
}

export function renderPrimeFactor(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) card.append(progress);

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🌳"} Prímfelbontás`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "prime-factor-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    if (step.number != null && step.mode !== "missing") {
        const numberBox = document.createElement("div");
        numberBox.className = "prime-factor-number-box";
        numberBox.textContent = step.number;
        card.append(numberBox);
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

    const hint = createHintBox();
    hint.classList.add("prime-factor-hint");

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.innerHTML = `<p><strong>💡 Segítség</strong></p><p>${primeFactorHint()}</p>`;
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    function maybeShowHint() {
        if (feedback.getMistakes() >= 2 && !hintShown) {
            hintButton.style.display = "inline-block";
        }
    }

    const options = document.createElement("div");
    options.className = "prime-factor-options";

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "prime-factor-option";
        btn.textContent = opt.text;

        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;

            if (opt.correct) {
                markCorrect(btn);
                options.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
                feedback.success(successText(step));
            } else {
                feedback.retry();
                maybeShowHint();
            }
        });

        options.append(btn);
    });

    card.append(options, hintButton, hint);
}
