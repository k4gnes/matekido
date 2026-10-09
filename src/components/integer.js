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

function successText(step) {
    if (step.mode === "opposite") {
        return `🎉 Ügyes! A ${step.n} ellentettje ${step.answer}.`;
    }
    if (step.mode === "absolute") {
        return `🎉 Ügyes! |${step.n}| = ${step.answer}.`;
    }
    return `🎉 Ügyes! ${step.leftExpr} ${step.operator} ${step.rightExpr}.`;
}

function hintText(step) {
    if (step.mode === "opposite") {
        return "Az ellentett jele megfordul: a pozitívból negatív, a negatívból pozitív lesz. A 0 ellentettje önmaga.";
    }
    if (step.mode === "absolute") {
        return "Az abszolút érték a 0-tól mért távolság, ezért soha nem negatív: |−7| = 7 és |7| = 7.";
    }
    return "A számegyenesen a nagyobb szám van jobbra. Minden negatív szám kisebb minden pozitívnál, és két negatív közül az a nagyobb, amelyik közelebb van a 0-hoz (pl. −2 > −5).";
}

function fmtSigned(n) {
    return n < 0 ? `−${Math.abs(n)}` : String(n);
}

function renderNumberLine(step) {
    const lo = Math.min(step.leftValue, step.rightValue, 0);
    const hi = Math.max(step.leftValue, step.rightValue, 0);
    const span = hi - lo || 1;

    const frame = document.createElement("div");
    frame.className = "integer-numline";

    const plot = document.createElement("div");
    plot.className = "integer-numline-plot";
    frame.append(plot);

    const track = document.createElement("div");
    track.className = "integer-numline-track";
    plot.append(track);

    const zero = document.createElement("div");
    zero.className = "integer-numline-zero";
    zero.style.left = `${((0 - lo) / span) * 100}%`;
    zero.textContent = "0";
    plot.append(zero);

    function marker(value, side, label) {
        const dot = document.createElement("div");
        dot.className = `integer-numline-marker integer-numline-${side}`;
        dot.style.left = `${((value - lo) / span) * 100}%`;

        const tag = document.createElement("span");
        tag.className = "integer-numline-tag";
        tag.textContent = label;

        const bullet = document.createElement("span");
        bullet.className = "integer-numline-dot";

        if (side === "left") {
            dot.append(tag, bullet);
        } else {
            dot.append(bullet, tag);
        }

        plot.append(dot);
    }

    marker(step.leftValue, "left", fmtSigned(step.leftValue));
    marker(step.rightValue, "right", fmtSigned(step.rightValue));

    return frame;
}

export function renderInteger(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "➖"} Egész számok`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "integer-prompt";
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

    const options = document.createElement("div");
    options.className = "integer-options";

    const hint = createHintBox();
    hint.classList.add("integer-hint");

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

    if (step.mode === "compare") {

        const row = document.createElement("div");
        row.className = "integer-compare";

        const left = document.createElement("span");
        left.className = "integer-side";
        left.textContent = step.leftExpr;

        const slot = document.createElement("span");
        slot.className = "integer-op-slot";
        slot.textContent = "?";

        const right = document.createElement("span");
        right.className = "integer-side";
        right.textContent = step.rightExpr;

        row.append(left, slot, right);
        card.append(row);

        card.append(renderNumberLine(step));

        options.classList.add("integer-options-ops");

        ["<", "=", ">"].forEach(op => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "integer-option integer-op";
            btn.textContent = op;

            btn.addEventListener("click", () => {
                if (feedback.isAnswered()) return;

                if (op === step.operator) {
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

    const display = document.createElement("div");
    display.className = "integer-display";
    display.textContent = step.mode === "opposite"
        ? `${step.n} → ?`
        : `|${step.n}| = ?`;
    card.append(display);

    if (step.interaction === "choice") {

        step.options.forEach(value => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "integer-option";
            btn.textContent = value;
            btn.dataset.value = value;

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
    input.className = "integer-input";

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
