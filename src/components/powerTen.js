import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createHintBox } from "./ui/hintBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";
import { formatThousands } from "../utils/formatNumbers.js";

const WORLD_EMOJI = {
    postman: "📮",
    racing: "🏎️",
    football: "⚽",
    cooking: "🍳",
    animals: "🦁",
    space: "🤖",
    tram: "🚋"
};

const SUPERSCRIPTS = { 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶" };

function powerTenHint() {
    return "A tízes hatványoknál a kitevő mutatja, hány nullát írunk az 1 után: 10¹ = 10, 10² = 100, 10³ = 1000, 10⁴ = 10 000, 10⁵ = 100 000, 10⁶ = 1 000 000. A millió tehát 10⁶.";
}

function powerText(step) {
    return `10${SUPERSCRIPTS[step.exponent] ?? `^${step.exponent}`}`;
}

function displayText(step) {
    if (step.mode === "power") {
        return formatThousands(step.value);
    }
    return powerText(step);
}

function successText(step) {
    const power = powerText(step);
    if (step.mode === "value") {
        return `🎉 Ügyes! ${power} = ${formatThousands(step.answer)}.`;
    }
    if (step.mode === "zeros") {
        return `🎉 Ügyes! A ${power} számban ${step.answer} nulla van.`;
    }
    if (step.mode === "power") {
        return `🎉 Ügyes! ${formatThousands(step.value)} = ${power}.`;
    }
    return `🎉 Ügyes! A ${power} a ${step.answer}.`;
}

export function renderPowerTen(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) card.append(progress);

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🔟"} Tízes hatványok`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "power-ten-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    const displayBox = document.createElement("div");
    displayBox.className = "power-ten-display";
    displayBox.textContent = displayText(step);
    card.append(displayBox);

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
    hint.classList.add("power-ten-hint");

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.innerHTML = `<p><strong>💡 Segítség</strong></p><p>${powerTenHint()}</p>`;
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
    options.className = "power-ten-options";

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "power-ten-option";
        btn.textContent = step.mode === "value" ? formatThousands(Number(opt.text)) : opt.text;

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