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
    if (step.mode === "mul") {
        return "Két azonos előjelű szám szorzata pozitív, két különböző előjelűé negatív: (−3) × (−4) = 12, de (−3) × 4 = −12.";
    }
    return "Osztásnál ugyanez a szabály: (−24) ÷ (−6) = 4, de 24 ÷ (−6) = −4.";
}

function successText(step) {
    if (step.context === "temperature") {
        return step.mode === "mul"
            ? `🎉 Ügyes! A változás ${fmt(step.answer)} °C.`
            : `🎉 Ügyes! Óránként ${fmt(step.answer)} °C volt a változás.`;
    }
    if (step.context === "debt") {
        return step.mode === "mul"
            ? `🎉 Ügyes! A változás ${fmt(step.answer)} Ft.`
            : `🎉 Ügyes! Havonta ${fmt(step.answer)} Ft volt a változás.`;
    }
    return `🎉 Ügyes! ${step.expression} = ${fmt(step.answer)}.`;
}

export function renderIntegerMuldiv(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) card.append(progress);

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🧮"} Előjeles szorzás és osztás`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "integer-muldiv-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    const display = document.createElement("div");
    display.className = "integer-muldiv-display";
    display.innerHTML = `<span class="integer-muldiv-expr">${step.expression}</span> <span class="integer-muldiv-eq">=</span> <span class="integer-muldiv-answer-slot">?</span>`;
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
    hint.classList.add("integer-muldiv-hint");

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
        options.className = "integer-muldiv-options";

        step.options.forEach(value => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "integer-muldiv-option";
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
    input.className = "integer-muldiv-input";

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