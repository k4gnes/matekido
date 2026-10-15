import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createHintBox } from "./ui/hintBox.js";
import { createFeedback } from "./ui/feedback.js";
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

function hintText(step) {
    if (step.mode === "add") {
        return `Azt keressük, melyik számhoz adtunk ${step.a}-t, hogy ${step.c} legyen. Ezért x = ${step.c} − ${step.a}.`;
    }
    if (step.mode === "sub") {
        return `Ha x-ből elveszünk ${step.a}-t és ${step.c} marad, akkor x = ${step.c} + ${step.a}.`;
    }
    if (step.mode === "mul") {
        return `A szorzás fordítottja az osztás, ezért x = ${step.c} ÷ ${step.a}.`;
    }
    if (step.mode === "div") {
        return `Az osztás fordítottja a szorzás, ezért x = ${step.c} × ${step.a}.`;
    }
    if (step.mode === "both-sides") {
        return `Az ismeretlent gyűjtsd az egyik oldalra: vond ki mindkét oldalból a ${step.c}x-et, majd a ${step.b}-t is vond ki. Így ${step.a - step.c}x = ${step.d - step.b}, ezért x = ${step.d - step.b} ÷ ${step.a - step.c}.`;
    }
    if (step.mode === "paren") {
        return `Először bontsd fel a zárójelet: szorozd be a ${step.a}-t mindkét taggal, majd az ismeretlent hagyd az egyik oldalon, a számokat a másikon.`;
    }
    if (step.mode === "fraction-add") {
        return `Szorozd meg mindkét oldalt ${step.a}-val, hogy eltűnjön a tört: x + ${step.b * step.a} = ${step.c * step.a}. Ezután vond ki a ${step.b * step.a}-t.`;
    }
    if (step.mode === "fraction-div") {
        return `Szorozd meg mindkét oldalt ${step.a}-val: x + ${step.b} = ${step.c * step.a}. Ezután vond ki a ${step.b}-t.`;
    }
    if (step.form === "mul-add") {
        return `Először vond ki a ${step.b}-t a jobb oldalból, aztán oszd el a szorzóval: x = (${step.c} − ${step.b}) ÷ ${step.a}.`;
    }
    return `Először add hozzá a ${step.b}-t a jobb oldalhoz, aztán oszd el a szorzóval: x = (${step.c} + ${step.b}) ÷ ${step.a}.`;
}

function fractionNode(numText, denText) {
    const wrap = document.createElement("span");
    wrap.className = "equation-frac";
    const n = document.createElement("span");
    n.className = "equation-frac-num";
    n.textContent = numText;
    const line = document.createElement("span");
    line.className = "equation-frac-line";
    const d = document.createElement("span");
    d.className = "equation-frac-den";
    d.textContent = denText;
    wrap.append(n, line, d);
    return wrap;
}

function expressionNode(expr) {
    const display = document.createElement("div");
    display.className = "equation-display equation-expression";
    expr.forEach(token => {
        if (typeof token === "string") {
            const span = document.createElement("span");
            span.className = "equation-token";
            span.textContent = token;
            display.append(span);
        } else if (token && Array.isArray(token.frac)) {
            display.append(fractionNode(token.frac[0], token.frac[1]));
        }
    });
    return display;
}

export function renderEquation(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🟰"} Egyenlet megoldása`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "equation-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    const display = Array.isArray(step.expr)
        ? expressionNode(step.expr)
        : (() => {
            const box = document.createElement("div");
            box.className = "equation-display";
            box.textContent = step.equation;
            return box;
        })();
    card.append(display);

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
    hint.classList.add("equation-hint");

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

    const input = createNumberInput();
    input.className = "equation-input";

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
            feedback.success(`🎉 Ügyes! x = ${step.answer}.`);
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
