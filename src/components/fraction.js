import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";
import { createFractionSvg, renderFractionSymbol } from "./ui/fractionShapes.js";

const WORLD_EMOJI = {
    postman: "🍕",
    racing: "🔧",
    football: "⚽",
    cooking: "🍳",
    animals: "🦁",
    space: "🤖"
};

const KIND_LABEL = {
    pizza: "Pizza",
    csoki: "Csoki",
    szendvics: "Szendvics",
    torta: "Torta"
};

const FRACTION_NAMES = { 2: "fele", 3: "harmada", 4: "negyede" };

function fractionText(numerator, denominator) {
    return `${numerator}/${denominator}`;
}

function renderSymbolButtonContent(opt, btn) {
    const content = opt.kind
        ? createFractionSvg(opt)
        : opt.numerator !== undefined
            ? renderFractionSymbol(opt.numerator, opt.denominator)
            : document.createTextNode(opt.text ?? "");
    btn.append(content);
}

export function renderFraction(step, root, next, progress, onResult, onAttempt) {

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🍕"} ${KIND_LABEL[step.kind] ?? "Törtek"} – törtek`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "fraction-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    if (step.drawing) {
        const drawing = document.createElement("div");
        drawing.className = "fraction-drawing";
        drawing.append(createFractionSvg(step.drawing));
        card.append(drawing);
    }

    if (step.symbol) {
        const symbolBox = document.createElement("div");
        symbolBox.className = "fraction-symbol-box";
        if (typeof step.symbol === "string") {
            symbolBox.textContent = step.symbol;
        } else {
            symbolBox.append(renderFractionSymbol(step.symbol.numerator, step.symbol.denominator));
        }
        card.append(symbolBox);
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

    let inputs = [];

    const successText = (() => {
        if (step.mode === "write") {
            return `🎉 Ügyes! ${step.numerator} részt színeztek be, és ${step.denominator} részre osztották az egészet!`;
        }
        const sym = step.symbol ? (typeof step.symbol === "string" ? step.symbol : fractionText(step.symbol.numerator, step.symbol.denominator)) : null;
        if (sym) {
            return `🎉 Ügyes! Ez a ${sym}.`;
        }
        return `🎉 Ügyes! ${FRACTION_NAMES[step.total] ?? fractionText(step.numerator, step.denominator)}!`;
    })();

    function checkWrite() {
        if (feedback.isAnswered()) return;
        const num = inputs[0]?.value?.trim();
        const den = inputs[1]?.value?.trim();
        if (num === "" || den === "") return;

        const ok = Number(num) === step.numerator && Number(den) === step.denominator;

        if (ok) {
            inputs.forEach(inp => {
                inp.disabled = true;
                markCorrect(inp);
            });
            feedback.success(successText);
        } else {
            feedback.retry();
            inputs[0].focus();
            inputs[0].select();
        }
    }

    if (step.mode === "write") {
        const writeRow = document.createElement("div");
        writeRow.className = "fraction-write";

        inputs = [
            { label: "számláló", placeholder: "?" },
            { label: "nevező", placeholder: "?" }
        ].map((cfg, i) => {
            const col = document.createElement("div");
            col.className = "fraction-write-col";
            const input = document.createElement("input");
            input.type = "number";
            input.min = "0";
            input.className = "fraction-write-input";
            input.placeholder = cfg.placeholder;
            input.setAttribute("aria-label", cfg.label);
            const label = document.createElement("div");
            label.className = "fraction-write-label";
            label.textContent = cfg.label;
            col.append(input, label);
            writeRow.append(col);

            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    if (i === 0) {
                        inputs[1].focus();
                    } else {
                        checkWrite();
                    }
                }
            });

            return input;
        });

        const button = document.createElement("button");
        button.type = "button";
        button.className = "nav-bar-btn";
        button.textContent = "Ellenőrzöm";
        button.addEventListener("click", checkWrite);

        card.append(writeRow, button);

        requestAnimationFrame(() => inputs[0].focus());
        return;
    }

    const options = document.createElement("div");
    options.className = "fraction-options";

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "fraction-option";
        if (opt.numerator !== undefined || opt.kind === undefined) {
            btn.classList.add("fraction-option-symbol");
        }

        renderSymbolButtonContent(opt, btn);

        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;

            if (opt.correct) {
                markCorrect(btn);
                feedback.success(successText);
            } else {
                feedback.retry();
            }
        });

        options.append(btn);
    });

    card.append(options);
}