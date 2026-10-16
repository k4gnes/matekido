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

function masterHint(step) {
    if (step.mode === "pair") {
        return "Kézfogásnál mindenki mindenkivel egyszer fog kezet: számold meg, hány pár alkotható, és figyelj, hogy egy kézfogásban ketten vesznek részt!";
    }
    if (step.mode === "logic") {
        return "Csukott szemmel a legrosszabb esetre készülj: először minden színből kihúzhatsz egyet úgy, hogy még nincs pár. A megoldás a színek számánál eggyel több.";
    }
    return "Hiányzó műveleti jelnél próbáld sorban a műveleti jeleket, és nézd meg, melyik adja a jobb oldali eredményt! Visszafelé gondolkodásnál a végéről indulj: az utolsó műveletet fordítva csináld meg – ha hozzáadtak, vonj le; ha szoroztak, ossz.";
}

function successText(step) {
    if (step.successText) return step.successText;
    if (step.mode === "missing-op") {
        return `🎉 Ügyes! A helyes jel: ${step.answer}.`;
    }
    return `🎉 Ügyes! A gondolt szám a ${step.answer}.`;
}

function buildExpression(text) {
    const expression = document.createElement("div");
    expression.className = "master-expression";
    expression.textContent = text;
    return expression;
}

function buildChoiceOptions(step, onPick) {
    const options = document.createElement("div");
    options.className = "master-options";

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "master-option";
        btn.textContent = opt.text;
        btn.addEventListener("click", () => onPick(opt, btn, options));
        options.append(btn);
    });

    return options;
}

export function renderMaster(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) card.append(progress);

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🌟"} Mester kihívás`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "master-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    const expressionText = step.display ?? step.chain;
    if (expressionText) {
        card.append(buildExpression(expressionText));
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
    hint.classList.add("master-hint");

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.innerHTML = `<p><strong>💡 Segítség</strong></p><p>${masterHint(step)}</p>`;
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    function maybeShowHint() {
        if (feedback.getMistakes() >= 2 && !hintShown) {
            hintButton.style.display = "inline-block";
        }
    }

    if (Array.isArray(step.options) && step.options.length > 0) {

        const options = buildChoiceOptions(step, (opt, btn, container) => {
            if (feedback.isAnswered()) return;

            if (opt.correct) {
                markCorrect(btn);
                container.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
                feedback.success(successText(step));
            } else {
                feedback.retry();
                maybeShowHint();
            }
        });

        card.append(options, hintButton, hint);

    } else {

        const row = document.createElement("div");
        row.className = "master-input-row";

        const input = document.createElement("input");
        input.type = "number";
        input.className = "master-input";
        input.placeholder = "?";
        input.setAttribute("aria-label", "A gondolt szám");

        const checkButton = createButton("Ellenőrzöm", { className: "nav-bar-btn" });
        row.append(input, checkButton);

        card.append(row, hintButton, hint);

        function checkAnswer() {
            if (feedback.isAnswered()) return;

            const value = Number(input.value);
            if (input.value === "" || Number.isNaN(value)) return;

            if (value === step.answer) {
                input.disabled = true;
                checkButton.disabled = true;
                feedback.success(successText(step));
            } else {
                feedback.retry();
                input.focus();
                input.select();
                maybeShowHint();
            }
        }

        checkButton.addEventListener("click", checkAnswer);
        input.addEventListener("keydown", event => {
            if (event.key === "Enter") checkAnswer();
        });

        requestAnimationFrame(() => input.focus());

    }

}
