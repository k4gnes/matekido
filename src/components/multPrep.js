import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createMessageBox } from "./ui/messageBox.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: {
        "equal-groups": "📮 Hány levél van összesen?",
        "repeated-addition": "📮 Számold ki az összeget!",
        "skip-counting": "📮 Mi a következő szám?"
    },
    racing: {
        "equal-groups": "🏎️ Hány kerék van összesen?",
        "repeated-addition": "🏎️ Számold ki az összeget!",
        "skip-counting": "🏎️ Mi a következő szám?"
    },
    football: {
        "equal-groups": "⚽ Hány játékos van összesen?",
        "repeated-addition": "⚽ Számold ki az összeget!",
        "skip-counting": "⚽ Mi a következő szám?"
    },
    cooking: {
        "equal-groups": "🍳 Hány hozzávaló van összesen?",
        "repeated-addition": "🍳 Számold ki az összeget!",
        "skip-counting": "🍳 Mi a következő szám?"
    },
    animals: {
        "equal-groups": "🦁 Hány állat van összesen?",
        "repeated-addition": "🦁 Számold ki az összeget!",
        "skip-counting": "🦁 Mi a következő szám?"
    },
    space: {
        "equal-groups": "🤖 Hány robot van összesen?",
        "repeated-addition": "🤖 Számold ki az összeget!",
        "skip-counting": "🤖 Mi a következő szám?"
    }
};

function getTitle(world, type) {
    return TITLES[world]?.[type] ?? TITLES.postman[type];
}

function renderEqualGroups(step, card) {
    const hint = document.createElement("p");
    hint.className = "mp-hint";
    hint.textContent = "Hány elem van összesen?";
    card.append(hint);

    const groupsContainer = document.createElement("div");
    groupsContainer.className = "mp-groups";

    for (let g = 0; g < step.groups; g++) {
        const group = document.createElement("div");
        group.className = "mp-group";
        for (let i = 0; i < step.perGroup; i++) {
            const item = document.createElement("span");
            item.className = "mp-item";
            item.textContent = step.emoji;
            group.append(item);
        }
        groupsContainer.append(group);
    }

    card.append(groupsContainer);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "mp-options";

    step.options.forEach(value => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mp-option";
        btn.textContent = value;
        btn.dataset.value = value;
        optionsContainer.append(btn);
    });

    card.append(optionsContainer);

    return optionsContainer;
}

function renderRepeatedAddition(step, card) {
    const hint = document.createElement("p");
    hint.className = "mp-hint";
    hint.textContent = "Számold ki az összeget!";
    card.append(hint);

    const expr = document.createElement("div");
    expr.className = "mp-expression";
    expr.textContent = step.expression + " = ?";
    card.append(expr);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "mp-options";

    step.options.forEach(value => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mp-option";
        btn.textContent = value;
        btn.dataset.value = value;
        optionsContainer.append(btn);
    });

    card.append(optionsContainer);

    return optionsContainer;
}

function renderSkipCounting(step, card) {
    const hint = document.createElement("p");
    hint.className = "mp-hint";
    hint.textContent = "Mi a hiányzó szám?";
    card.append(hint);

    const sequence = document.createElement("div");
    sequence.className = "mp-sequence";

    step.terms.forEach((num, index) => {
        if (index === step.missingIndex) {
            const input = createNumberInput();
            input.className = "mp-input";
            input.dataset.index = index;
            sequence.append(input);
        } else {
            const term = document.createElement("span");
            term.className = "mp-term";
            term.textContent = num;
            sequence.append(term);
        }

        if (index < step.terms.length - 1) {
            const sep = document.createElement("span");
            sep.className = "mp-sep";
            sep.textContent = ",";
            sequence.append(sep);
        }
    });

    card.append(sequence);

    return null;
}

export function renderMultPrep(step, root, next, progress, onResult, onAttempt) {

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

    let optionsContainer;

    if (step.type === "skip-counting") {
        renderSkipCounting(step, card);
    } else if (step.type === "repeated-addition") {
        optionsContainer = renderRepeatedAddition(step, card);
    } else {
        optionsContainer = renderEqualGroups(step, card);
    }

    const message = createMessageBox();
    card.append(message.element);

    root.append(card);

    function checkAnswer(answer) {
        if (answered) return;

        onAttempt?.();

        if (answer === step.answer) {
            answered = true;

            if (optionsContainer) {
                optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
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

    if (optionsContainer) {
        optionsContainer.addEventListener("click", (e) => {
            const btn = e.target.closest(".mp-option");
            if (!btn || answered) return;
            checkAnswer(Number(btn.dataset.value));
        });
    } else {
        const input = card.querySelector(".mp-input");
        if (input) {
            requestAnimationFrame(() => input.focus());

            const button = createButton("Ellenőrzöm");
            card.append(button);

            function checkInput() {
                const answer = Number(input.value);
                if (isNaN(answer)) return;
                checkAnswer(answer);
            }

            button.addEventListener("click", checkInput);
            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") checkInput();
            }, { signal: ac.signal });
        }
    }
}
