import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback } from "./ui/feedback.js";
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

function makeOptions(answer, min, max, count = 4) {
    const options = [answer];
    const seen = new Set([answer]);
    const deltas = [1, -1, 2, -2, 3, -3, 5, -5];
    for (const d of deltas) {
        if (options.length >= count) break;
        const v = answer + d;
        if (v >= min && v <= max && !seen.has(v)) {
            seen.add(v);
            options.push(v);
        }
    }
    for (let v = min; v <= max && options.length < count; v++) {
        if (!seen.has(v)) {
            seen.add(v);
            options.push(v);
        }
    }
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
}

function renderChoiceButtons(answer, min, max, className) {
    const opts = makeOptions(answer, min, max);
    const container = document.createElement("div");
    container.className = className;
    opts.forEach(value => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = className.replace("-options", "-option");
        btn.textContent = value;
        btn.dataset.value = value;
        container.append(btn);
    });
    return container;
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

    if (step.interaction === "choice") {
        const el = renderChoiceButtons(step.answer, 1, 50, "mp-options");
        card.append(el);
        return { element: el, isInput: false };
    }

    const input = createNumberInput();
    input.className = "mp-input";
    card.append(input);
    const button = createButton("Ellenőrzöm");
    card.append(button);
    return { input, button, isInput: true };
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

    if (step.interaction === "choice") {
        const el = renderChoiceButtons(step.answer, 1, 50, "mp-options");
        card.append(el);
        return { element: el, isInput: false };
    }

    const input = createNumberInput();
    input.className = "mp-input";
    card.append(input);
    const button = createButton("Ellenőrzöm");
    card.append(button);
    return { input, button, isInput: true };
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
            if (step.interaction === "choice") {
                const span = document.createElement("span");
                span.className = "mp-term";
                span.textContent = "?";
                span.style.fontWeight = "bold";
                span.style.color = "#4a90d9";
                sequence.append(span);
            } else {
                const input = createNumberInput();
                input.className = "mp-input";
                input.dataset.index = index;
                sequence.append(input);
            }
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

    if (step.interaction === "choice") {
        const el = renderChoiceButtons(step.answer, step.answer - 10, step.answer + 10, "mp-options");
        card.append(el);
        return { element: el, isInput: false };
    }

    return { input: null, isInput: true, needsButton: true };
}

export function renderMultPrep(step, root, next, progress, onResult, onAttempt) {

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

    let result;

    if (step.type === "skip-counting") {
        result = renderSkipCounting(step, card);
    } else if (step.type === "repeated-addition") {
        result = renderRepeatedAddition(step, card);
    } else {
        result = renderEqualGroups(step, card);
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

    function checkAnswer(isCorrect) {
        if (feedback.isAnswered()) return;

        if (isCorrect) {
            if (result.isInput) {
                if (result.input) result.input.disabled = true;
                if (result.button) result.button.disabled = true;
            }
            if (result.element && result.element.tagName === "DIV") {
                result.element.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
            }

            feedback.success();
        } else {
            feedback.retry();

            if (result.isInput && result.input) {
                result.input.focus();
                result.input.select();
            }
        }
    }

    if (result.isInput) {
        if (result.needsButton) {
            const input = card.querySelector(".mp-input");
            if (input) {
                const button = createButton("Ellenőrzöm");
                card.append(button);

                function checkInput() {
                    const answer = Number(input.value);
                    if (isNaN(answer)) return;
                    checkAnswer(answer === step.answer);
                }

                button.addEventListener("click", checkInput);
                input.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") checkInput();
                }, { signal: ac.signal });

                requestAnimationFrame(() => input.focus());
            }
        } else if (result.input) {
            requestAnimationFrame(() => result.input.focus());

            function checkInput() {
                const answer = Number(result.input.value);
                if (isNaN(answer)) return;
                checkAnswer(answer === step.answer);
            }

            result.button.addEventListener("click", checkInput);
            result.input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") checkInput();
            }, { signal: ac.signal });
        }
    } else if (result.element) {
        result.element.addEventListener("click", (e) => {
            const btn = e.target.closest(".mp-option");
            if (!btn || feedback.isAnswered()) return;
            checkAnswer(Number(btn.dataset.value) === step.answer);
        });
    }
}
