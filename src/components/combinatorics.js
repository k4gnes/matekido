import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📮 Rendezd sorba!",
    racing: "🏎️ Rendezd sorba!",
    football: "⚽ Rendezd sorba!",
    cooking: "🍳 Rendezd sorba!",
    animals: "🦁 Rendezd sorba!",
    space: "🤖 Rendezd sorba!",
    tram: "🚋 Rendezd sorba!"
};

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function createPairSvg(n) {
    const size = 220;
    const center = size / 2;
    const radius = 78;

    const svg = svgEl("svg", { viewBox: `0 0 ${size} ${size}`, class: "comb-diagram" });

    const points = [];
    for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        points.push({
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle)
        });
    }

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            svg.append(svgEl("line", {
                x1: points[i].x,
                y1: points[i].y,
                x2: points[j].x,
                y2: points[j].y,
                stroke: "#cbd5e1",
                "stroke-width": 2
            }));
        }
    }

    for (const point of points) {
        svg.append(svgEl("circle", {
            cx: point.x,
            cy: point.y,
            r: 7,
            fill: "#334155"
        }));
    }

    return svg;
}

export function renderCombinatorics(step, root, next, progress, onResult, onAttempt) {

    if (step.mode && step.mode !== "order") {
        renderCountChoice(step, root, next, progress, onResult, onAttempt);
        return;
    }

    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = TITLES[world] ?? TITLES.postman;
    card.append(title);

    const items = step.items;
    const total = step.total ?? 6;
    const slots = items.map(() => null);
    const used = new Set();
    const found = [];

    const prompt = document.createElement("p");
    prompt.className = "comb-prompt";
    prompt.textContent = step.question ?? "Add meg a következő új sorrendet!";
    card.append(prompt);

    const counter = document.createElement("p");
    counter.className = "comb-counter";
    card.append(counter);

    const build = document.createElement("div");
    build.className = "comb-build";
    card.append(build);

    const tray = document.createElement("div");
    tray.className = "comb-tray";
    card.append(tray);

    const foundWrap = document.createElement("div");
    foundWrap.className = "comb-found";
    card.append(foundWrap);

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

    function render() {

        counter.textContent = `Megtalált sorrend: ${found.length} / ${total}`;
        const done = feedback.isAnswered();

        build.replaceChildren();
        slots.forEach((itemIndex, i) => {
            const slot = document.createElement("button");
            slot.type = "button";
            slot.className = "comb-slot" + (itemIndex === null ? "" : " filled");
            slot.textContent = itemIndex === null ? "?" : items[itemIndex];
            slot.disabled = done;
            slot.setAttribute("aria-label", itemIndex === null ? "Üres hely" : "Kitett elem");
            slot.addEventListener("click", () => removeAt(i));
            build.append(slot);
        });

        tray.replaceChildren();
        items.forEach((emoji, i) => {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "comb-item" + (used.has(i) ? " used" : "");
            chip.textContent = emoji;
            chip.disabled = done || used.has(i);
            chip.addEventListener("click", () => place(i));
            tray.append(chip);
        });

        foundWrap.replaceChildren();
        for (let i = 0; i < total; i++) {
            const cell = document.createElement("div");
            cell.className = "comb-found-cell" + (found[i] ? "" : " empty");
            cell.textContent = found[i] ? found[i].join(" ") : "? ? ?";
            foundWrap.append(cell);
        }
    }

    function nextEmpty() {
        return slots.indexOf(null);
    }

    function place(itemIndex) {
        if (feedback.isAnswered() || used.has(itemIndex)) return;
        const i = nextEmpty();
        if (i === -1) return;
        slots[i] = itemIndex;
        used.add(itemIndex);
        render();
        if (slots.every(s => s !== null)) {
            check();
        }
    }

    function removeAt(i) {
        if (feedback.isAnswered() || slots[i] === null) return;
        used.delete(slots[i]);
        slots[i] = null;
        render();
    }

    function clearSlots() {
        for (let i = 0; i < slots.length; i++) {
            if (slots[i] !== null) {
                used.delete(slots[i]);
            }
            slots[i] = null;
        }
        render();
    }

    function check() {
        const key = slots.join("|");
        const emojis = slots.map(i => items[i]);

        if (found.some(f => f.join("|") === key)) {
            message.show("🙂 Ezt a sorrendet már megtaláltad! Rakj ki egy másikat.", "retry");
            clearSlots();
            return;
        }

        found.push(emojis);
        message.show(`✨ Új sorrend! ${emojis.join(" ")}`, "success");
        clearSlots();

        if (found.length === total) {
            feedback.success(`🎉 Megvan mind a ${total} sorrend! Ügyes vagy!`);
            render();
        }
    }

    render();

}

function renderCountChoice(step, root, next, progress, onResult, onAttempt) {

    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = (TITLES[world] ?? TITLES.postman).replace("Rendezd sorba!", "Hányféleképpen?");
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "comb-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    if (step.mode === "pair") {
        card.append(createPairSvg(step.n));
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

    const options = document.createElement("div");
    options.className = "comb-choice-options";

    let phase = "answer";

    function showReasonPrompt() {
        phase = "reason";
        options.replaceChildren();

        const note = document.createElement("p");
        note.className = "comb-reason-prompt";
        note.textContent = "✅ Jó a szám! De melyik számítással kapjuk? Válaszd ki a helyeset!";
        options.append(note);

        step.reasoning.forEach(opt => {
            const rbtn = document.createElement("button");
            rbtn.type = "button";
            rbtn.className = "comb-choice-option comb-reason-option";
            rbtn.textContent = opt.text;

            rbtn.addEventListener("click", () => {
                if (feedback.isAnswered()) return;

                if (opt.correct) {
                    rbtn.classList.add("comb-choice-correct");
                    feedback.success(`🎉 Ügyes! ${step.explanation}`);
                } else {
                    feedback.retry("🤔 Ez a számítás nem jó. Gondold végig, hány lehetőség van az egyes helyeken!");
                }
            });

            options.append(rbtn);
        });
    }

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "comb-choice-option";
        btn.textContent = opt.text;

        btn.addEventListener("click", () => {
            if (feedback.isAnswered() || phase !== "answer") return;

            if (opt.correct) {
                btn.classList.add("comb-choice-correct");
                showReasonPrompt();
            } else {
                feedback.retry();
            }
        });

        options.append(btn);
    });

    card.append(options);
}
