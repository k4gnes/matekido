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
    space: "🚀",
    tram: "🚋"
};

const MINUS = "−";

function fmtInt(n) {
    return n < 0 ? `${MINUS}${-n}` : String(n);
}

function fractionNode(num, den) {
    const wrap = document.createElement("div");
    wrap.className = "rational-fraction";
    const n = document.createElement("div");
    n.className = "rational-num";
    n.textContent = fmtInt(num);
    const line = document.createElement("div");
    line.className = "rational-line";
    const d = document.createElement("div");
    d.className = "rational-den";
    d.textContent = String(den);
    wrap.append(n, line, d);
    return wrap;
}

function rationalNode(item) {
    if (item.kind === "fraction") {
        return fractionNode(item.num, item.den);
    }
    if (item.kind === "mixed") {
        const wrap = document.createElement("div");
        wrap.className = "rational-mixed";
        const whole = document.createElement("span");
        whole.className = "rational-whole";
        whole.textContent = `${item.neg ? MINUS : ""}${item.whole}`;
        wrap.append(whole, fractionNode(item.num, item.den));
        return wrap;
    }
    const span = document.createElement("span");
    span.className = "rational-text";
    span.textContent = item.text;
    return span;
}

function descTextLocal(d) {
    if (!d) return "";
    if (d.kind === "fraction") return `${fmtInt(d.num)}/${d.den}`;
    if (d.kind === "mixed") return `${d.neg ? MINUS : ""}${d.whole} ${d.num}/${d.den}`;
    return d.text;
}

function successText(step) {
    if (step.mode === "opposite") return `🎉 Ügyes! Az ellentett: ${step.answer}.`;
    if (step.mode === "absolute") return `🎉 Ügyes! Az abszolút érték: ${step.answer}.`;
    if (step.mode === "sign") return `🎉 Ügyes! Ez a szám: ${step.answer}.`;
    if (step.mode === "parts") {
        return step.target === "num"
            ? `🎉 Ügyes! A számláló ${step.answer}.`
            : `🎉 Ügyes! A nevező ${step.answer}.`;
    }
    if (step.mode === "to-decimal") return `🎉 Ügyes! Az eredmény ${step.answer}.`;
    if (step.mode === "to-fraction") return `🎉 Ügyes! ${step.answer} törttel egyenlő.`;
    if (step.mode === "to-mixed") return `🎉 Ügyes! Az eredmény ${step.answer}.`;
    if (step.mode === "to-improper") return `🎉 Ügyes! Az eredmény ${step.answer}.`;
    if (step.mode === "compare") return `🎉 Ügyes! ${descTextLocal(step.left)} ${step.answer} ${descTextLocal(step.right)}.`;
    return `🎉 Ügyes! Az eredmény ${step.answer}.`;
}

export function renderRational(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) card.append(progress);

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🔢"} Racionális számok`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "rational-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    if (step.display) {
        const display = document.createElement("div");
        display.className = "rational-display";
        display.append(rationalNode(step.display));
        card.append(display);
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
    hint.classList.add("rational-hint");

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.innerHTML = `<p><strong>💡 Segítség</strong></p><p>${step.hint}</p>`;
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    function maybeShowHint() {
        if (feedback.getMistakes() >= 2 && !hintShown) {
            hintButton.style.display = "inline-block";
        }
    }

    let optionsContainer = document.createElement("div");

    if (step.mode === "compare") {
        optionsContainer.className = "rational-compare";
        const leftBox = document.createElement("div");
        leftBox.className = "rational-compare-box";
        leftBox.append(rationalNode(step.left));
        const rightBox = document.createElement("div");
        rightBox.className = "rational-compare-box";
        rightBox.append(rationalNode(step.right));
        const opBox = document.createElement("div");
        opBox.className = "rational-ops";
        step.options.forEach(opt => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "rational-op-btn";
            btn.textContent = opt.text;
            btn.addEventListener("click", () => {
                if (feedback.isAnswered()) return;
                if (opt.correct) {
                    markCorrect(btn);
                    opBox.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
                    feedback.success(successText(step));
                } else {
                    feedback.retry();
                    maybeShowHint();
                }
            });
            opBox.append(btn);
        });
        optionsContainer.append(leftBox, opBox, rightBox);
    } else {
        optionsContainer.className = "rational-options";
        step.options.forEach(opt => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "rational-option";
            btn.append(rationalNode(opt));
            btn.addEventListener("click", () => {
                if (feedback.isAnswered()) return;
                if (opt.correct) {
                    markCorrect(btn);
                    optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
                    feedback.success(successText(step));
                } else {
                    feedback.retry();
                    maybeShowHint();
                }
            });
            optionsContainer.append(btn);
        });
    }

    card.append(optionsContainer, hintButton, hint);
}
