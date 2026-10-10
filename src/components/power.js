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

const SUPERSCRIPTS = { 2: "²", 3: "³" };

function powerHint() {
    return "A hatványban az alap és a kitevő van: például a 4³-nél az alap a 4, a kitevő a 3, és azt jelenti, hogy 4 · 4 · 4 = 64. A négyzet az n² = n · n, a köb az n³ = n · n · n – annyiszor szorozzuk össze az alapot, ahány a kitevő.";
}

function successText(step) {
    const sup = SUPERSCRIPTS[step.exponent] ?? `^${step.exponent}`;
    if (step.mode === "base") {
        return `🎉 Ügyes! A ${step.answer}${sup} = ${step.value}.`;
    }
    if (step.mode === "notation") {
        return `🎉 Ügyes! A ${step.display} szorzat valóban ${step.answer}.`;
    }
    return `🎉 Ügyes! ${step.display} = ${step.answer}.`;
}

export function renderPower(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) card.append(progress);

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "⚡"} Hatványozás`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "power-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    if (step.display != null) {
        const displayBox = document.createElement("div");
        displayBox.className = "power-display";
        displayBox.textContent = step.display;
        card.append(displayBox);
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
    hint.classList.add("power-hint");

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.innerHTML = `<p><strong>💡 Segítség</strong></p><p>${powerHint()}</p>`;
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
    options.className = "power-options";

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "power-option";
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