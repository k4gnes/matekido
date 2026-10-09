import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createHintBox } from "./ui/hintBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

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

const H_VIEW = { w: 100, h: 30, pad: 7, lineY: 15 };
const V_VIEW = { w: 52, h: 100, cx: 20, top: 8, bottom: 80 };

function svgEl(name, attrs) {
    const el = document.createElementNS(SVGNS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function fmt(n) {
    return n < 0 ? `−${Math.abs(n)}` : String(n);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function hintText(step) {
    if (step.context === "temperature") {
        return "A 0 fok a fagypont: felfelé melegebb, lefelé hidegebb. A feliratok 5 fokonként vannak, a kis osztások 1 fokot érnek.";
    }
    return `A 0-tól jobbra a pozitív, balra a negatív számok vannak. A feliratok ${step.labelStep}-t lépnek, a kis osztások ${step.gridStep}-t érnek.`;
}

function successText(step) {
    if (step.mode === "place") {
        if (step.context === "temperature") return `🎉 Ügyes! ${fmt(step.value)} °C pont itt van a hőmérőn.`;
        return `🎉 Ügyes! A ${fmt(step.value)} itt van a számegyenesen.`;
    }
    if (step.context === "temperature") return `🎉 Ügyes! ${fmt(step.value)} °C.`;
    if (step.context === "debt") return `🎉 Ügyes! Az egyenleg ${fmt(step.value)} Ft.`;
    return `🎉 Ügyes! A nyíl a ${fmt(step.value)} helyén áll.`;
}

function buildHorizontal(step) {
    const { min, max, value, gridStep, labelStep } = step;
    const span = max - min;
    const intervalCount = span / labelStep;
    const longLabel = Math.max(String(Math.abs(min)).length, String(Math.abs(max)).length) + 1;
    const interval = Math.max(8.6, longLabel * 2.6);
    const w = Math.max(44, 14 + intervalCount * interval);
    const { h, pad, lineY } = H_VIEW;
    const usable = w - 2 * pad;
    const x = v => pad + ((v - min) / span) * usable;

    const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, class: "nl-svg nl-svg-horizontal", "aria-hidden": "true" });
    svg.dataset.min = min;
    svg.dataset.max = max;
    svg.dataset.gridStep = gridStep;
    svg.dataset.labelStep = labelStep;

    svg.append(svgEl("line", { x1: pad, y1: lineY, x2: pad + usable, y2: lineY, class: "nl-axis" }));
    svg.append(svgEl("polygon", { points: `${pad + usable},${lineY - 1.7} ${pad + usable + 3.4},${lineY} ${pad + usable},${lineY + 1.7}`, class: "nl-arrow" }));
    svg.append(svgEl("polygon", { points: `${pad},${lineY - 1.7} ${pad - 3.4},${lineY} ${pad},${lineY + 1.7}`, class: "nl-arrow" }));

    for (let v = min; v <= max; v += gridStep) {
        const isZero = v === 0;
        const isMajor = v % labelStep === 0;
        svg.append(svgEl("line", {
            x1: x(v), y1: lineY - (isMajor ? 2.6 : 1.9),
            x2: x(v), y2: lineY + (isMajor ? 2.6 : 1.9),
            class: isZero ? "nl-tick nl-tick-zero" : (isMajor ? "nl-tick nl-tick-major" : "nl-tick")
        }));
        if (isMajor) {
            const label = svgEl("text", {
                x: x(v), y: lineY + 8.4,
                class: v === 0 ? "nl-label nl-label-zero" : "nl-label",
                "text-anchor": "middle"
            });
            label.textContent = fmt(v);
            svg.append(label);
        }
    }

    return {
        svg,
        mark() {
            const group = svgEl("g", { class: "nl-marker-group" });
            group.append(svgEl("line", { x1: x(value), y1: lineY - 9.6, x2: x(value), y2: lineY, class: "nl-marker-stem" }));
            group.append(svgEl("polygon", {
                points: `${x(value) - 2.6},${lineY - 9.6} ${x(value) + 2.6},${lineY - 9.6} ${x(value)},${lineY - 4.6}`,
                class: "nl-marker"
            }));
            group.append(svgEl("circle", { cx: x(value), cy: lineY, r: 1.7, class: "nl-marker-dot" }));
            svg.append(group);
        },
        valueFromEvent(event, rect) {
            const px = (event.clientX - rect.left) * (w / rect.width);
            const raw = min + ((px - pad) / usable) * span;
            return clamp(Math.round(raw / gridStep) * gridStep, min, max);
        }
    };
}

function buildVertical(step) {
    const { min, max, value, gridStep, labelStep } = step;
    const { w, h, cx, top, bottom } = V_VIEW;
    const span = max - min;
    const y = v => top + ((max - v) / span) * (bottom - top);

    const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, class: "nl-svg nl-svg-vertical", "aria-hidden": "true" });
    svg.dataset.min = min;
    svg.dataset.max = max;
    svg.dataset.gridStep = gridStep;
    svg.dataset.labelStep = labelStep;

    svg.append(svgEl("rect", { x: cx - 4.5, y: top - 3, width: 9, height: bottom - top + 9, rx: 4.5, class: "nl-tube" }));
    svg.append(svgEl("circle", { cx, cy: bottom + 8, r: 7.5, class: "nl-bulb" }));

    for (let v = min; v <= max; v += gridStep) {
        const ty = y(v);
        const isZero = v === 0;
        const isMajor = v % labelStep === 0;
        const len = isZero ? 12 : (isMajor ? 11 : 8.5);
        svg.append(svgEl("line", {
            x1: cx + 5, y1: ty, x2: cx + len, y2: ty,
            class: isZero ? "nl-tick nl-tick-zero" : (isMajor ? "nl-tick nl-tick-major" : "nl-tick")
        }));
        if (isMajor) {
            const label = svgEl("text", {
                x: cx + 14, y: ty + 1.6,
                class: isZero ? "nl-label nl-label-zero" : "nl-label",
                "text-anchor": "start"
            });
            label.textContent = fmt(v);
            svg.append(label);
        }
    }

    const mercury = svgEl("rect", { x: cx - 3.4, y: bottom, width: 6.8, height: 0, rx: 3.4, class: "nl-mercury" });
    svg.append(mercury);
    svg.append(svgEl("circle", { cx, cy: bottom + 8, r: 6.4, class: "nl-mercury-bulb" }));

    return {
        svg,
        mark() {
            const ty = y(value);
            mercury.setAttribute("y", ty);
            mercury.setAttribute("height", Math.max(0, bottom - ty));
            svg.append(svgEl("line", { x1: cx - 12, y1: ty, x2: cx + 4.5, y2: ty, class: "nl-level-line" }));
        },
        valueFromEvent(event, rect) {
            const py = (event.clientY - rect.top) * (h / rect.height);
            const raw = max - ((py - top) / (bottom - top)) * span;
            return clamp(Math.round(raw / gridStep) * gridStep, min, max);
        }
    };
}

export function renderNumberLine(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) card.append(progress);

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🔢"} Számegyenes és hőmérő`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "nl-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    const message = createMessageBox();
    card.append(message.element);

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    const lineView = step.orientation === "vertical" ? buildVertical(step) : buildHorizontal(step);

    const scroll = document.createElement("div");
    scroll.className = step.orientation === "vertical" ? "nl-scroll nl-scroll-vertical" : "nl-scroll";
    scroll.append(lineView.svg);
    card.append(scroll);

    root.append(card);

    const hint = createHintBox();
    hint.classList.add("nl-hint");

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

    if (step.mode === "place") {
        lineView.svg.classList.add("nl-clickable");
        lineView.svg.addEventListener("click", (event) => {
            if (feedback.isAnswered()) return;
            const rect = lineView.svg.getBoundingClientRect();
            const picked = lineView.valueFromEvent(event, rect);
            if (picked === step.value) {
                lineView.mark();
                lineView.svg.classList.add("nl-solved");
                lineView.svg.style.pointerEvents = "none";
                feedback.success(successText(step));
            } else {
                feedback.retry(`🙂 Ez a ${fmt(picked)} helye. Keresd a ${fmt(step.value)} helyét!`);
                maybeShowHint();
            }
        });

        card.append(hintButton, hint);
        return;
    }

    lineView.mark();

    if (step.interaction === "choice") {

        const options = document.createElement("div");
        options.className = "nl-options";

        step.options.forEach(value => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "nl-option";
            btn.textContent = step.unit ? `${fmt(value)} ${step.unit}` : fmt(value);

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
    input.className = "nl-input";

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
