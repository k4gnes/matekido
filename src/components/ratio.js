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

function ratioHint() {
    return "Az arány két mennyiség összehasonlítása: az 5 : 3 azt jelenti, hogy az elsőből 5, a másodikból 3 van – a sorrend számít! Az arányt úgy egyszerűsítjük, hogy mindkét tagot ugyanazzal a számmal osztjuk: 6 : 4 = 3 : 2. Az aránypárnál a két arány egyenlő: 2 : 3 = 8 : 12, mert mindkét tag 4-szeresére nőtt.";
}

function successText(step) {
    if (step.mode === "write") {
        return `🎉 Ügyes! A keresett arány: ${step.answer}.`;
    }
    if (step.mode === "simplify") {
        return `🎉 Ügyes! Az egyszerűsített arány: ${step.answer}.`;
    }
    return `🎉 Ügyes! A hiányzó tag a ${step.answer}.`;
}

function buildGroups(step) {
    const groups = document.createElement("div");
    groups.className = "ratio-groups";

    const makeGroup = (emoji, count, name) => {
        const group = document.createElement("div");
        group.className = "ratio-group";

        const icons = document.createElement("span");
        icons.className = "ratio-group-icons";
        icons.textContent = emoji.repeat(count);

        const label = document.createElement("span");
        label.className = "ratio-group-label";
        label.textContent = `${count} ${name}`;

        group.append(icons, label);
        return group;
    };

    const colon = document.createElement("span");
    colon.className = "ratio-colon";
    colon.textContent = ":";

    groups.append(
        makeGroup(step.leftEmoji, step.a, step.leftName),
        colon,
        makeGroup(step.rightEmoji, step.b, step.rightName)
    );

    return groups;
}

export function renderRatio(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) card.append(progress);

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🔗"} Arány és aránypár`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "ratio-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    if (step.mode === "write") {
        card.append(buildGroups(step));
    } else {
        const expression = document.createElement("div");
        expression.className = "ratio-expression";
        expression.textContent = step.display;
        card.append(expression);
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
    hint.classList.add("ratio-hint");

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.innerHTML = `<p><strong>💡 Segítség</strong></p><p>${ratioHint()}</p>`;
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    function maybeShowHint() {
        if (feedback.getMistakes() >= 2 && !hintShown) {
            hintButton.style.display = "inline-block";
        }
    }

    const options = document.createElement("div");
    options.className = "ratio-options";

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ratio-option";
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
}
