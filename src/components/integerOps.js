import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
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

function fmt(n) {
    return n < 0 ? `−${Math.abs(n)}` : String(n);
}

function hintText(step) {
    if (step.operator === "−") {
        return "Kivonáskor az ellentettet adjuk hozzá: 5 − (−3) = 5 + 3 = 8, és (−7) − 2 = (−7) + (−2) = −9.";
    }
    if ((step.a < 0 && step.b < 0) || (step.a > 0 && step.b > 0)) {
        return "Két azonos előjelű szám összege: a közös előjelet megtartjuk, és az abszolút értékeket összeadjuk. Pl. (−4) + (−6) = −10.";
    }
    return "Különböző előjelű számok összege: a nagyobb abszolút értékű szám előjelét kapjuk, és a két abszolút érték különbségét számoljuk. Pl. (−4) + 7 = 3.";
}

function successText(step) {
    if (step.context === "temperature") return `🎉 Ügyes! A hőmérséklet ${fmt(step.answer)} °C lett.`;
    if (step.context === "debt") return `🎉 Ügyes! Az egyenleg ${fmt(step.answer)} Ft lett.`;
    return `🎉 Ügyes! ${step.expression} = ${fmt(step.answer)}.`;
}

export function renderIntegerOps(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) card.append(progress);

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🧮"} Előjeles összeadás és kivonás`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "integer-ops-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    const display = document.createElement("div");
    display.className = "integer-ops-display";
    display.innerHTML = `<span class="integer-ops-expr">${step.expression}</span> <span class="integer-ops-eq">=</span> <span class="integer-ops-answer-slot">?</span>`;
    card.append(display);

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
    hint.classList.add("integer-ops-hint");

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.innerHTML = `<p><strong>💡 Segítség</strong></p><p>${hintText(step)}</p>`;
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    function maybeShowHint() {
        if (feedback.getMistakes() >= 2 && !hintShown) {
            hintButton.style.display = "inline-block";
        }
    }

    if (step.interaction === "choice") {

        const options = document.createElement("div");
        options.className = "integer-ops-options";

        step.options.forEach(value => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "integer-ops-option";
            btn.textContent = step.unit ? `${fmt(value)} ${step.unit}` : fmt(value);

            btn.addEventListener("click", () => {
                if (feedback.isAnswered()) return;

                if (value === step.answer) {
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
        return;
    }

    const input = createNumberInput();
    input.className = "integer-ops-input";

    const button = createButton("Ellenőrzöm", { className: "nav-bar-btn" });
    card.append(input, button, hintButton, hint);

    requestAnimationFrame(() => input.focus());

    function check() {
        if (feedback.isAnswered()) return;

        if (input.value === "") return;
        const value = Number(input.value);
        if (isNaN(value)) return;

        if (value === step.answer) {
            input.disabled = true;
            button.disabled = true;
            feedback.success(successText(step));
        } else {
            feedback.retry();
            maybeShowHint();
            input.focus();
            input.select();
        }
    }

    button.addEventListener("click", check);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") check();
    });
}