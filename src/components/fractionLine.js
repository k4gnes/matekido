import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createHintBox } from "./ui/hintBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";
import { renderFractionSymbol } from "./ui/fractionShapes.js";

const SVGNS = "http://www.w3.org/2000/svg";

const WORLD_EMOJI = {
    postman: "📮",
    racing: "🏎️",
    football: "⚽",
    cooking: "🍳",
    animals: "🦁",
    space: "🤖",
    tram: "🚋"
};

const LINE = { h: 48, pad: 10, lineY: 24 };

function svgEl(name, attrs) {
    const el = document.createElementNS(SVGNS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function renderMixed(whole, numerator, denominator) {
    const wrap = document.createElement("span");
    wrap.className = "fl-mixed";
    const w = document.createElement("span");
    w.className = "fl-whole";
    w.textContent = whole;
    wrap.append(w, renderFractionSymbol(numerator, denominator));
    return wrap;
}

function buildLine(step) {
    const { max, den } = step;
    const totalTicks = max * den;
    const gap = totalTicks > 16 ? 22 : totalTicks > 10 ? 26 : 34;
    const { h, pad, lineY } = LINE;
    const w = pad * 2 + totalTicks * gap;
    const usable = w - 2 * pad;
    const x = n => pad + (n / totalTicks) * usable;

    const svg = svgEl("svg", {
        viewBox: `0 0 ${w} ${h}`,
        width: String(w),
        height: String(h),
        class: "fl-svg",
        "aria-hidden": "true",
        preserveAspectRatio: "xMidYMid meet"
    });

    svg.append(svgEl("line", { x1: pad, y1: lineY, x2: w - pad, y2: lineY, class: "fl-axis" }));
    svg.append(svgEl("polygon", {
        points: `${w - pad},${lineY - 1.8} ${w - pad + 3.6},${lineY} ${w - pad},${lineY + 1.8}`,
        class: "fl-arrow"
    }));
    svg.append(svgEl("polygon", {
        points: `${pad},${lineY - 1.8} ${pad - 3.6},${lineY} ${pad},${lineY + 1.8}`,
        class: "fl-arrow"
    }));

    for (let n = 0; n <= totalTicks; n++) {
        const isMajor = n % den === 0;
        svg.append(svgEl("line", {
            x1: x(n), y1: lineY - (isMajor ? 3 : 2),
            x2: x(n), y2: lineY + (isMajor ? 3 : 2),
            class: n === 0 ? "fl-tick fl-tick-zero" : (isMajor ? "fl-tick fl-tick-major" : "fl-tick")
        }));
        if (isMajor) {
            const label = svgEl("text", {
                x: x(n), y: lineY + 8.8,
                class: "fl-label",
                "text-anchor": "middle"
            });
            label.textContent = n / den;
            svg.append(label);
        }
    }

    return {
        svg,
        mark() {
            const group = svgEl("g", { class: "fl-marker-group" });
            group.append(svgEl("line", {
                x1: x(step.num), y1: lineY - 10, x2: x(step.num), y2: lineY, class: "fl-marker-stem"
            }));
            group.append(svgEl("polygon", {
                points: `${x(step.num) - 2.8},${lineY - 10} ${x(step.num) + 2.8},${lineY - 10} ${x(step.num)},${lineY - 4.8}`,
                class: "fl-marker"
            }));
            group.append(svgEl("circle", { cx: x(step.num), cy: lineY, r: 1.9, class: "fl-marker-dot" }));
            svg.append(group);
        },
        valueFromEvent(event, rect) {
            const px = (event.clientX - rect.left) * (w / rect.width);
            const raw = ((px - pad) / usable) * totalTicks;
            return clamp(Math.round(raw), 0, totalTicks);
        }
    };
}

function successText(step) {
    if (step.mode === "read") {
        return `🎉 Ügyes! A nyíl a ${step.num}/${step.den} helyén áll.`;
    }
    if (step.mode === "place") {
        return `🎉 Ügyes! A ${step.num}/${step.den} itt van a számegyenesen.`;
    }
    if (step.mode === "to-mixed") {
        return `🎉 Ügyes! ${step.num}/${step.den} = ${step.whole} ${step.rem}/${step.den}.`;
    }
    return `🎉 Ügyes! ${step.whole} ${step.rem}/${step.den} = ${step.num}/${step.den}.`;
}

function optionContent(step, opt) {
    if (step.mode === "to-mixed") {
        return renderMixed(opt.whole, opt.numerator, opt.denominator);
    }
    return renderFractionSymbol(opt.numerator, opt.denominator);
}

function createOptions(step, feedback, maybeShowHint) {
    const options = document.createElement("div");
    options.className = "fl-options";

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "fl-option";
        btn.append(optionContent(step, opt));

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

    return options;
}

export function renderFractionLine(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) card.append(progress);

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🍕"} Törtek a számegyenesen`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "fl-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    if (step.mode === "place" || step.mode === "to-mixed") {
        const display = document.createElement("div");
        display.className = "fl-display";
        display.append(renderFractionSymbol(step.num, step.den));
        card.append(display);
    } else if (step.mode === "to-fraction") {
        const display = document.createElement("div");
        display.className = "fl-display";
        display.append(renderMixed(step.whole, step.rem, step.den));
        card.append(display);
    }

    const message = createMessageBox();
    card.append(message.element);

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    const hint = createHintBox();
    hint.classList.add("fl-hint");

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.innerHTML = `<p><strong>💡 Segítség</strong></p><p>${step.hint ?? ""}</p>`;
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    function maybeShowHint() {
        if (feedback.getMistakes() >= 2 && !hintShown) {
            hintButton.style.display = "inline-block";
        }
    }

    if (step.mode === "read" || step.mode === "place") {
        const lineView = buildLine(step);

        const scroll = document.createElement("div");
        scroll.className = "fl-line-wrap";
        scroll.append(lineView.svg);
        card.append(scroll);

        root.append(card);

        if (step.mode === "read") {
            lineView.mark();
            card.append(createOptions(step, feedback, maybeShowHint), hintButton, hint);
            return;
        }

        lineView.svg.classList.add("fl-clickable");
        lineView.svg.addEventListener("click", (event) => {
            if (feedback.isAnswered()) return;
            const rect = lineView.svg.getBoundingClientRect();
            const picked = lineView.valueFromEvent(event, rect);
            if (picked === step.num) {
                lineView.mark();
                lineView.svg.classList.add("fl-solved");
                lineView.svg.style.pointerEvents = "none";
                feedback.success(successText(step));
            } else {
                feedback.retry(`🙂 Ez a ${picked}/${step.den} helye. Keresd a ${step.num}/${step.den} helyét!`);
                maybeShowHint();
            }
        });

        card.append(hintButton, hint);
        return;
    }

    root.append(card);
    card.append(createOptions(step, feedback, maybeShowHint), hintButton, hint);
}
