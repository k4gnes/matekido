import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: {
        "sharing": "📮 Szétosztás",
        "grouping": "📮 Hány csoport?",
        "division-table": "📌 Mennyi?"
    },
    racing: {
        "sharing": "🏎️ Szétosztás",
        "grouping": "🏎️ Hány csoport?",
        "division-table": "📌 Mennyi?"
    },
    football: {
        "sharing": "⚽ Szétosztás",
        "grouping": "⚽ Hány csoport?",
        "division-table": "📌 Mennyi?"
    },
    cooking: {
        "sharing": "🍳 Szétosztás",
        "grouping": "🍳 Hány csoport?",
        "division-table": "📌 Mennyi?"
    },
    animals: {
        "sharing": "🦁 Szétosztás",
        "grouping": "🦁 Hány csoport?",
        "division-table": "📌 Mennyi?"
    },
    space: {
        "sharing": "🤖 Szétosztás",
        "grouping": "🤖 Hány csoport?",
        "division-table": "📌 Mennyi?"
    }
};

function getTitle(world, type) {
    return TITLES[world]?.[type] ?? TITLES.postman[type];
}

function renderSharing(step, card) {
    const hint = document.createElement("p");
    hint.className = "div-hint";
    hint.textContent = `${step.total} ${step.emoji} – szétosztva ${step.groups} csoportba. Hány elem van csoportonként?`;
    card.append(hint);

    const visual = document.createElement("div");
    visual.className = "div-visual";

    for (let g = 0; g < step.groups; g++) {
        const group = document.createElement("div");
        group.className = "div-group";
        for (let i = 0; i < step.perGroup; i++) {
            const item = document.createElement("span");
            item.className = "div-item";
            item.textContent = step.emoji;
            group.append(item);
        }
        visual.append(group);
    }

    card.append(visual);

    if (step.interaction === "input") {
        return renderInputMode(step, card);
    }

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "div-options";

    step.options.forEach(value => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "div-option";
        btn.textContent = value;
        btn.dataset.value = value;
        optionsContainer.append(btn);
    });

    card.append(optionsContainer);

    return { element: optionsContainer, isInput: false };
}

function renderGrouping(step, card) {
    const hint = document.createElement("p");
    hint.className = "div-hint";
    hint.textContent = `${step.total} ${step.emoji} – mindegyik csoportban ${step.groupSize} darab. Hány csoport van?`;
    card.append(hint);

    const visual = document.createElement("div");
    visual.className = "div-visual";

    for (let g = 0; g < step.numGroups; g++) {
        const group = document.createElement("div");
        group.className = "div-group";
        for (let i = 0; i < step.groupSize; i++) {
            const item = document.createElement("span");
            item.className = "div-item";
            item.textContent = step.emoji;
            group.append(item);
        }
        visual.append(group);
    }

    card.append(visual);

    if (step.interaction === "input") {
        return renderInputMode(step, card);
    }

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "div-options";

    step.options.forEach(value => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "div-option";
        btn.textContent = value;
        btn.dataset.value = value;
        optionsContainer.append(btn);
    });

    card.append(optionsContainer);

    return { element: optionsContainer, isInput: false };
}

function renderInputMode(step, card) {
    const input = document.createElement("input");
    input.type = "number";
    input.className = "div-input";
    input.placeholder = "?";
    card.append(input);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "div-option";
    button.textContent = "Ellenőrzöm";
    card.append(button);

    return { input, button, isInput: true };
}

function renderDivisionTable(step, card) {
    if (step.interaction === "tf") {
        const expr = document.createElement("div");
        expr.className = "div-expression";
        expr.textContent = step.statement;
        card.append(expr);

        const prompt = document.createElement("p");
        prompt.className = "div-prompt";
        prompt.textContent = "Igaz vagy hamis?";
        card.append(prompt);

        const optionsContainer = document.createElement("div");
        optionsContainer.className = "div-options";

        const trueBtn = document.createElement("button");
        trueBtn.type = "button";
        trueBtn.className = "div-option";
        trueBtn.textContent = "Igaz";
        trueBtn.dataset.value = "true";
        optionsContainer.append(trueBtn);

        const falseBtn = document.createElement("button");
        falseBtn.type = "button";
        falseBtn.className = "div-option";
        falseBtn.textContent = "Hamis";
        falseBtn.dataset.value = "false";
        optionsContainer.append(falseBtn);

        card.append(optionsContainer);

        return { element: optionsContainer, isInput: false };
    }

    if (step.interaction === "input") {
        const expr = document.createElement("div");
        expr.className = "div-expression";
        expr.textContent = `${step.a} ÷ ${step.b} = ?`;
        card.append(expr);

        return renderInputMode(step, card);
    }

    const expr = document.createElement("div");
    expr.className = "div-expression";
    expr.textContent = `${step.a} ÷ ${step.b} = ?`;
    card.append(expr);

    const prompt = document.createElement("p");
    prompt.className = "div-prompt";
    prompt.textContent = "Válaszd ki a helyes választ!";
    card.append(prompt);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "div-options";

    step.options.forEach(value => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "div-option";
        btn.textContent = value;
        btn.dataset.value = value;
        optionsContainer.append(btn);
    });

    card.append(optionsContainer);

    return { element: optionsContainer, isInput: false };
}

function renderCSS(card) {
    const style = document.createElement("style");
    style.textContent = `
        .div-input {
            width: 5ch;
            text-align: center;
            font-size: 2rem;
            padding: .3rem;
            border: 2px solid #bbb;
            border-radius: 8px;
            margin: 1rem auto;
            display: block;
        }
        .div-input:focus {
            border-color: #4a90d9;
            outline: none;
        }
    `;
    card.prepend(style);
}

export function renderDivision(step, root, next, progress, onResult, onAttempt) {

    let mistakes = 0;
    let answered = false;
    let reported = false;

    const ac = new AbortController();
    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();
    renderCSS(card);

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = getTitle(world, step.type);
    card.append(title);

    let result;

    if (step.type === "sharing") {
        result = renderSharing(step, card);
    } else if (step.type === "grouping") {
        result = renderGrouping(step, card);
    } else {
        result = renderDivisionTable(step, card);
    }

    const message = createMessageBox();
    card.append(message.element);

    root.append(card);

    function checkAnswer(isCorrect) {
        if (answered) return;

        onAttempt?.();

        if (isCorrect) {
            answered = true;

            if (result.isInput) {
                result.input.disabled = true;
                result.button.disabled = true;
            } else if (result.element && result.element.tagName === "DIV") {
                result.element.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
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

            if (result.isInput && result.input) {
                result.input.focus();
                result.input.select();
            }
        }
    }

    if (result.isInput) {
        result.button.addEventListener("click", () => {
            const answer = Number(result.input.value);
            if (isNaN(answer)) return;
            checkAnswer(answer === step.answer);
        });
        result.input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const answer = Number(result.input.value);
                if (isNaN(answer)) return;
                checkAnswer(answer === step.answer);
            }
        }, { signal: ac.signal });
    } else if (result.element && result.element.tagName === "DIV") {
        result.element.addEventListener("click", (e) => {
            const btn = e.target.closest(".div-option");
            if (!btn || answered) return;

            if (step.interaction === "tf") {
                checkAnswer((btn.dataset.value === "true") === step.tfAnswer);
            } else {
                checkAnswer(Number(btn.dataset.value) === step.answer);
            }
        });
    }
}
