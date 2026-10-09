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

function primeHint() {
    return "A prímszámnak pontosan két osztója van: az 1 és önmaga – ilyen a 2, 3, 5, 7, 11, 13. Az összetett számnak ennél több osztója van, például a 12 osztói: 1, 2, 3, 4, 6, 12. Az 1 se nem prím, se nem összetett.";
}

function successText(step) {
    if (step.mode === "classify") {
        return `🎉 Ügyes! A ${step.number} ${step.prime ? "prímszám" : "összetett szám"}.`;
    }
    if (step.mode === "which-prime") {
        return `🎉 Ügyes! A ${step.answer} prímszám.`;
    }
    return `🎉 Ügyes! A ${step.answer} összetett szám.`;
}

export function renderPrime(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) card.append(progress);

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "⚛️"} Prím- és összetett számok`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "prime-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    if (step.number != null) {
        const numberBox = document.createElement("div");
        numberBox.className = "prime-number-box";
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
    hint.classList.add("prime-hint");

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.innerHTML = `<p><strong>💡 Segítség</strong></p><p>${primeHint()}</p>`;
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
    options.className = "prime-options";

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "prime-option";
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
