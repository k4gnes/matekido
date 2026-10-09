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
    return String(n);
}

function ruleHint(step) {
    if (step.mode === "remainder") {
        return "Oszd el a számot, és nézd meg, mi marad ki: a maradék mindig kisebb, mint az osztó!";
    }
    const rules = {
        2: "Akkor osztható 2-vel, ha páros, tehát 0, 2, 4, 6 vagy 8 az utolsó számjegye.",
        3: "Akkor osztható 3-mal, ha a számjegyeinek összege osztható 3-mal.",
        4: "Akkor osztható 4-gyel, ha az utolsó két számjegyéből álló szám osztható 4-gyel.",
        5: "Akkor osztható 5-tel, ha 0-ra vagy 5-re végződik.",
        6: "Akkor osztható 6-tal, ha 2-vel is ÉS 3-mal is osztható.",
        9: "Akkor osztható 9-cel, ha a számjegyeinek összege osztható 9-cel.",
        10: "Akkor osztható 10-zel, ha 0-ra végződik."
    };
    return rules[step.divisor] ?? "Próbáld ki az oszthatósági szabályt!";
}

function successText(step) {
    if (step.mode === "which") return `🎉 Ügyes! A ${step.answer} osztható ${step.word}.`;
    if (step.mode === "with") return `🎉 Ügyes! A ${step.number} osztható ${step.word}.`;
    return `🎉 Ügyes! ${step.a} ÷ ${step.b} = ${step.quotient}, a maradék ${step.answer}.`;
}

export function renderDivisibilityRule(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) card.append(progress);

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🎯"} Oszthatósági szabályok`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "divisibility-rule-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

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
    hint.classList.add("divisibility-rule-hint");

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.innerHTML = `<p><strong>💡 Segítség</strong></p><p>${ruleHint(step)}</p>`;
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    function maybeShowHint() {
        if (feedback.getMistakes() >= 2 && !hintShown) {
            hintButton.style.display = "inline-block";
        }
    }

    if (step.mode !== "remainder") {

        const options = document.createElement("div");
        options.className = "divisibility-rule-options";

        step.options.forEach(opt => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "divisibility-rule-option";
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
        return;
    }

    const input = createNumberInput();
    input.className = "divisibility-rule-input";

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