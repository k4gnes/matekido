import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createMessageBox } from "./ui/messageBox.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: {
        "table": "📮 Mennyi?",
        "missing-factor": "📮 Melyik szám hiányzik?",
        "match-groups": "📮 Melyik szorzás felel meg?"
    },
    racing: {
        "table": "🏎️ Mennyi?",
        "missing-factor": "🏎️ Melyik szám hiányzik?",
        "match-groups": "🏎️ Melyik szorzás felel meg?"
    },
    football: {
        "table": "⚽ Mennyi?",
        "missing-factor": "⚽ Melyik szám hiányzik?",
        "match-groups": "⚽ Melyik szorzás felel meg?"
    },
    cooking: {
        "table": "🍳 Mennyi?",
        "missing-factor": "🍳 Melyik szám hiányzik?",
        "match-groups": "🍳 Melyik szorzás felel meg?"
    },
    animals: {
        "table": "🦁 Mennyi?",
        "missing-factor": "🦁 Melyik szám hiányzik?",
        "match-groups": "🦁 Melyik szorzás felel meg?"
    },
    space: {
        "table": "🤖 Mennyi?",
        "missing-factor": "🤖 Melyik szám hiányzik?",
        "match-groups": "🤖 Melyik szorzás felel meg?"
    }
};

function getTitle(world, type) {
    return TITLES[world]?.[type] ?? TITLES.postman[type];
}

function renderTable(step, card) {
    const expr = document.createElement("div");
    expr.className = "mult-expression";
    expr.textContent = `${step.a} × ${step.b} = ?`;
    card.append(expr);

    const prompt = document.createElement("p");
    prompt.className = "mult-prompt";
    prompt.textContent = "Válaszd ki a helyes választ!";
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

function renderMissingFactor(step, card) {
    const expr = document.createElement("div");
    expr.className = "mult-expression";
    expr.textContent = step.expression;
    card.append(expr);

    const prompt = document.createElement("p");
    prompt.className = "mult-prompt";
    prompt.textContent = "Írd be a hiányzó számot!";
    card.append(prompt);

    const input = createNumberInput();
    input.className = "mult-input";
    card.append(input);

    return input;
}

function renderMatchGroups(step, card) {
    const hint = document.createElement("p");
    hint.className = "mult-hint";
    hint.textContent = "Hány elem van összesen? Melyik szorzás felel meg?";
    card.append(hint);

    const groupsContainer = document.createElement("div");
    groupsContainer.className = "mult-groups";

    step.groups.forEach(count => {
        const group = document.createElement("div");
        group.className = "mult-group";
        for (let i = 0; i < count; i++) {
            const item = document.createElement("span");
            item.className = "mult-item";
            item.textContent = "●";
            group.append(item);
        }
        groupsContainer.append(group);
    });

    card.append(groupsContainer);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "mult-options";

    const expressions = [
        `${step.a} × ${step.b} = ${step.total}`,
        `${step.b} × ${step.a} = ${step.total}`,
        `${step.a} × ${step.b + 1} = ${step.a * (step.b + 1)}`,
        `${step.a + 1} × ${step.b} = ${(step.a + 1) * step.b}`
    ];

    const correctExpr = `${step.a} × ${step.b} = ${step.total}`;
    const shuffled = [...expressions].sort(() => Math.random() - 0.5);

    shuffled.forEach(expr => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mult-option";
        btn.textContent = expr;
        btn.dataset.correct = expr === correctExpr ? "1" : "0";
        optionsContainer.append(btn);
    });

    card.append(optionsContainer);

    return optionsContainer;
}

export function renderMultiplication(step, root, next, progress, onResult, onAttempt) {

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
    title.textContent = getTitle(world, step.type);
    card.append(title);

    let interactiveElement;

    if (step.type === "missing-factor") {
        interactiveElement = renderMissingFactor(step, card);
    } else if (step.type === "match-groups") {
        interactiveElement = renderMatchGroups(step, card);
    } else {
        interactiveElement = renderTable(step, card);
    }

    const message = createMessageBox();
    card.append(message.element);

    root.append(card);

    function checkAnswer(isCorrect) {
        if (answered) return;

        onAttempt?.();

        if (isCorrect) {
            answered = true;

            if (interactiveElement && interactiveElement.tagName === "DIV") {
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
        }
    }

    if (step.type === "missing-factor") {
        requestAnimationFrame(() => interactiveElement.focus());

        const button = createButton("Ellenőrzöm");
        card.append(button);

        function checkInput() {
            const answer = Number(interactiveElement.value);
            if (isNaN(answer)) return;
            checkAnswer(answer === step.answer);
        }

        button.addEventListener("click", checkInput);
        interactiveElement.addEventListener("keydown", (e) => {
            if (e.key === "Enter") checkInput();
        }, { signal: ac.signal });

    } else {
        interactiveElement.addEventListener("click", (e) => {
            const btn = e.target.closest(".mult-option");
            if (!btn || answered) return;

            if (step.type === "match-groups") {
                checkAnswer(btn.dataset.correct === "1");
            } else {
                checkAnswer(Number(btn.dataset.value) === step.answer);
            }
        });
    }
}
