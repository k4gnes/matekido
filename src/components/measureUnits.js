import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { createButton } from "./ui/button.js";
import { createHintBox } from "./ui/hintBox.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_EMOJI = {
    postman: "📏",
    racing: "🔧",
    football: "⚽",
    cooking: "🥄",
    animals: "🦁",
    space: "🤖",
    tram: "🚋"
};

const KIND_CONFIG = {
    length: {
        title: "Hosszúság-mérés",
        hint: "1 m = 10 dm = 100 cm, 1 dm = 10 cm",
        hintAdvanced: "1 km = 1000 m, 1 m = 1000 mm, 1 m = 10 dm = 100 cm"
    },
    weight: {
        title: "Tömeg-mérés",
        hint: "1 kg = 100 dkg, 1 dkg = 10 g",
        hintAdvanced: "1 kg = 100 dkg = 1000 g, 1 t = 1000 kg. Visszafelé 10-szeres, 100-szoros és 1000-szeres osztás"
    },
    volume: {
        title: "Űrtartalom-mérés",
        hint: "1 l = 10 dl = 100 cl",
        hintAdvanced: "1 l = 10 dl = 100 cl = 1000 ml. Visszafelé 10-szeres, 100-szoros és 1000-szeres osztás"
    }
};

export function renderMeasureUnits(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const emoji = WORLD_EMOJI[getActiveWorld()] ?? "📏";
    const config = KIND_CONFIG[step.kind] ?? KIND_CONFIG.length;

    const title = document.createElement("h1");
    title.textContent = `${emoji} ${config.title}`;
    card.append(title);

    const hintText = (step.advanced && config.hintAdvanced) ? config.hintAdvanced : config.hint;

    if (step.context) {
        const contextLine = document.createElement("p");
        contextLine.className = "mu-context";
        contextLine.textContent = step.context;
        card.append(contextLine);
    }

    const mode = step.interaction ?? "choice";
    const isUnitMode = mode === "unit";
    const isTrueFalse = mode === "tf";
    const isCompare = mode === "compare";
    const choiceSelector = isUnitMode ? ".mu-unit" : ".mu-option";
    const choiceClass = isUnitMode ? "mu-unit" : "mu-option";
    const choiceBoxClass = isCompare ? "mu-compare" : isUnitMode ? "mu-units" : "mu-options";

    if (isTrueFalse) {
        const expression = document.createElement("div");
        expression.className = "mu-expression";
        expression.textContent = step.statement;
        card.append(expression);
    }

    const prompt = document.createElement("p");
    prompt.className = "mu-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    let input = null;
    let submitButton = null;
    let choiceBox = null;

    if (mode === "input") {
        input = document.createElement("input");
        input.type = "number";
        input.className = "mu-input";
        input.placeholder = "?";
        input.setAttribute("aria-label", "Átváltás eredménye");
        card.append(input);

        submitButton = createButton("Ellenőrzöm", { onClick: submitAnswer });
        card.append(submitButton);
    } else {
        choiceBox = document.createElement("div");
        choiceBox.className = choiceBoxClass;

        if (isCompare) {
            const sides = [[step.leftValue, step.leftUnit], [step.rightValue, step.rightUnit]];

            const leftSide = document.createElement("span");
            leftSide.className = "mu-compare-side";
            leftSide.textContent = `${sides[0][0]} ${sides[0][1]}`;

            const ops = document.createElement("div");
            ops.className = "mu-compare-ops";

            ["<", "=", ">"].forEach(op => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = `${choiceClass} mu-compare-op`;
                btn.textContent = op;
                btn.dataset.value = op;
                ops.append(btn);
            });

            const rightSide = document.createElement("span");
            rightSide.className = "mu-compare-side";
            rightSide.textContent = `${sides[1][0]} ${sides[1][1]}`;

            choiceBox.append(leftSide, ops, rightSide);
        } else {
            const entries = isTrueFalse
                ? [["Igaz", "true"], ["Hamis", "false"]]
                : (isUnitMode ? step.unitOptions : step.options).map(choice => [choice, choice]);

            entries.forEach(([label, value]) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = choiceClass;
                btn.textContent = label;
                btn.dataset.value = value;
                choiceBox.append(btn);
            });
        }

        card.append(choiceBox);
    }

    let hintShown = false;

    const hint = createHintBox();

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.textContent = hintText;
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    card.append(hintButton, hint);

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

    function successText() {
        if (isUnitMode) return `🎉 Ügyes! ${step.value} ${step.answer} a helyes egység`;
        if (isTrueFalse) {
            return step.tfAnswer
                ? `🎉 Igaz! ${step.value} ${step.unit} = ${step.answer} ${step.target}`
                : `🤔 Nem, ez hamis. ${step.value} ${step.unit} = ${step.answer} ${step.target}`;
        }
        if (isCompare) {
            return `🎉 Ügyes! ${step.leftValue} ${step.leftUnit} ${step.operator} ${step.rightValue} ${step.rightUnit}`;
        }
        return `🎉 Ügyes! ${step.value} ${step.unit} = ${step.answer} ${step.target}`;
    }

    function checkAnswer(isCorrect) {
        if (feedback.isAnswered()) return;

        if (isCorrect) {
            if (input) {
                input.disabled = true;
                submitButton.disabled = true;
            } else if (choiceBox) {
                choiceBox.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
            }
            feedback.success(successText());
        } else {
            feedback.retry();

            if (input) {
                input.focus();
                input.select();
            }

            if (feedback.getMistakes() >= 2 && !hintShown) {
                hintButton.style.display = "inline-block";
            }
        }
    }

    function submitAnswer() {
        if (feedback.isAnswered()) return;

        const answer = Number(input.value);
        if (input.value.trim() === "" || isNaN(answer)) return;

        checkAnswer(answer === step.answer);
    }

    if (input) {
        requestAnimationFrame(() => input.focus());
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") submitAnswer();
        }, { signal: ac.signal });
    } else {
        choiceBox.addEventListener("click", (e) => {
            const btn = e.target.closest(choiceSelector);
            if (!btn || feedback.isAnswered()) return;

            const ok = isTrueFalse
                ? (btn.dataset.value === "true") === step.tfAnswer
                : String(btn.dataset.value) === String(step.answer);

            if (ok) markCorrect(btn);

            checkAnswer(ok);
        }, { signal: ac.signal });
    }
}