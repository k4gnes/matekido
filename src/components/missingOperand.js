import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_TITLES = {
    postman: "📮 Melyik szám hiányzik?",
    racing: "🏎️ Melyik szám hiányzik?",
    football: "⚽ Melyik szám hiányzik?",
    cooking: "🍳 Melyik szám hiányzik?",
    animals: "🦁 Melyik szám hiányzik?",
    space: "🤖 Melyik szám hiányzik?"
};

function getTitle(world) {
    return WORLD_TITLES[world] ?? WORLD_TITLES.postman;
}

function renderInput(step, card) {
    const expr = document.createElement("div");
    expr.className = "mult-expression";
    expr.textContent = step.expression;
    card.append(expr);

    const prompt = document.createElement("p");
    prompt.className = "mult-prompt";
    prompt.textContent = "Írd be a hiányzó számot!";
    card.append(prompt);

    const input = document.createElement("input");
    input.type = "number";
    input.className = "mult-input";
    input.placeholder = "?";
    card.append(input);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "mult-option";
    button.textContent = "Ellenőrzöm";
    card.append(button);

    return { input, button };
}

function renderChoice(step, card) {
    const expr = document.createElement("div");
    expr.className = "mult-expression";
    expr.textContent = step.expression;
    card.append(expr);

    const prompt = document.createElement("p");
    prompt.className = "mult-prompt";
    prompt.textContent = "Válaszd ki a hiányzó számot!";
    card.append(prompt);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "mult-options";

    step.options.forEach(value => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mult-option";
        btn.textContent = value;
        btn.dataset.value = value;
        optionsContainer.append(btn);
    });

    card.append(optionsContainer);

    return optionsContainer;
}

export function renderMissingOperand(step, root, next, progress, onResult, onAttempt) {

    let mistakes = 0;
    let answered = false;
    let reported = false;

    const ac = new AbortController();
    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = getTitle(world);
    card.append(title);

    const isInput = step.interaction === "input";
    const interactiveElement = isInput ? renderInput(step, card) : renderChoice(step, card);

    const message = createMessageBox();
    card.append(message.element);

    root.append(card);

    if (isInput) {
        requestAnimationFrame(() => interactiveElement.input.focus());
    }

    function checkAnswer(isCorrect) {
        if (answered) return;

        onAttempt?.();

        if (isCorrect) {
            answered = true;

            if (isInput) {
                interactiveElement.input.disabled = true;
                interactiveElement.button.disabled = true;
            } else {
                interactiveElement.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
            }

            message.show("😊 Szép munka!", "success");

            if (!reported) {
                reported = true;
                onResult?.(true);
            }
            ac.abort();
            setTimeout(() => next(), 800);
        } else {
            if (mistakes === 1) {
                message.show("🙂 Majdnem! Próbáld meg még egyszer!", "retry");
            } else {
                message.show("🤔 Még nem sikerült.", "retry");
            }
            mistakes++;

            if (!reported) {
                reported = true;
                onResult?.(false);
            }

            if (isInput) {
                interactiveElement.input.focus();
                interactiveElement.input.select();
            }
        }
    }

    if (isInput) {
        interactiveElement.button.addEventListener("click", () => {
            const answer = Number(interactiveElement.input.value);
            if (isNaN(answer)) return;
            checkAnswer(answer === step.answer);
        });
        interactiveElement.input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const answer = Number(interactiveElement.input.value);
                if (isNaN(answer)) return;
                checkAnswer(answer === step.answer);
            }
        }, { signal: ac.signal });
    } else {
        interactiveElement.addEventListener("click", (e) => {
            const btn = e.target.closest(".mult-option");
            if (!btn || answered) return;
            checkAnswer(Number(btn.dataset.value) === step.answer);
        });
    }
}
