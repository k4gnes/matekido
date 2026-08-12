import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createNumberInput } from "./ui/numberInput.js";
import { getActiveWorld } from "../profile/Profile.js";

const SVG_NS = "http://www.w3.org/2000/svg";

const ITEM_EMOJI = {
    racing: "🛞",
    cooking: "🥚",
    football: "⚽",
    animals: "🦓",
    space: "🤖"
};

const FIGURE_EMOJI = {
    racing: "🏎️",
    cooking: "🥞",
    football: "🧑",
    animals: "🦓",
    space: "🤖"
};

const FIGURE_COLORS = {
    racing: {
        leaving: { bg: "#fee2e2", border: "#ef4444" },
        staying: { bg: "#dbeafe", border: "#3b82f6" }
    },
    cooking: {
        leaving: { bg: "#fde3b3", border: "#92400e" },
        staying: { bg: "#fef3c7", border: "#f59e0b" }
    },
    football: {
        leaving: { bg: "#fee2e2", border: "#ef4444" },
        staying: { bg: "#dbeafe", border: "#3b82f6" }
    },
    animals: {
        leaving: { bg: "#fef3c7", border: "#f59e0b" },
        staying: { bg: "#ecfccb", border: "#65a30d" }
    },
    space: {
        leaving: { bg: "#e2e8f0", border: "#64748b" },
        staying: { bg: "#ede9fe", border: "#7c3aed" }
    }
};

const PART_COLORS = {
    racing: {
        part: { bg: "#fee2e2", border: "#ef4444" },
        other: { bg: "#dbeafe", border: "#3b82f6" }
    },
    cooking: {
        part: { bg: "#fee2e2", border: "#ef4444" },
        other: { bg: "#fef3c7", border: "#f59e0b" }
    },
    football: {
        part: { bg: "#fee2e2", border: "#ef4444" },
        other: { bg: "#dbeafe", border: "#3b82f6" }
    },
    animals: {
        part: { bg: "#fef3c7", border: "#f59e0b" },
        other: { bg: "#ecfccb", border: "#65a30d" }
    },
    space: {
        part: { bg: "#e2e8f0", border: "#64748b" },
        other: { bg: "#ede9fe", border: "#7c3aed" }
    }
};

const JOIN_LABELS = {
    postman: { before: "A ládában volt", after: "Tibi most hozott" },
    racing: { before: "A garázsban volt", after: "Most hozzászerel" },
    cooking: { before: "A tálban volt", after: "Ancsika most beletesz" },
    football: { before: "A tartóban volt", after: "Most hoztak" },
    animals: { before: "A karámban volt", after: "A gondozó most behoz" },
    space: { before: "A raktárban volt", after: "A robot most hozzászerel" }
};

const COMPARE_LABELS = {
    postman: { a: "Páros oldal", b: "Páratlan oldal", unit: "levél" },
    racing: { a: "Első verseny", b: "Második verseny", unit: "kör" },
    cooking: { a: "Reggel", b: "Délben", unit: "palacsinta" },
    football: { a: "Első félidő", b: "Második félidő", unit: "gól" },
    animals: { a: "Reggel", b: "Este", unit: "zebra" },
    space: { a: "Első űrhajó", b: "Második űrhajó", unit: "robot" }
};

const PART_LEGEND = {
    postman: {
        part: (n) => `🔵 ${n} kék cipős`,
        other: "🟤 barna cipős: ?"
    },
    racing: {
        part: (n) => `🔴 ${n} piros autó`,
        other: "🔵 kék autó: ?"
    },
    cooking: {
        part: (n) => `🍓 ${n} lekváros`,
        other: "🧀 sajtos: ?"
    },
    football: {
        part: (n) => `🔴 ${n} piros mezes`,
        other: "🔵 kék mezes: ?"
    },
    animals: {
        part: (n) => `🟡 ${n} sárga nyakörvű`,
        other: "🟢 zöld nyakörvű: ?"
    },
    space: {
        part: (n) => `🩶 ${n} működő`,
        other: "🟣 töltődik: ?"
    }
};

const REMOVE_LABELS = {
    postman: {
        waiting: "🏤 A postán várakoznak",
        departure: "🚐 Kézbesíteni indulnak (piros sapkás)",
        count: (n) => `A postán maradt: ${n} postás`
    },
    racing: {
        waiting: "🏁 A rajtvonalnál várakoznak",
        departure: "🏎️ Az első körre indulnak (piros autók)",
        count: (n) => `A rajtvonalnál maradt: ${n} autó`
    },
    cooking: {
        waiting: "🍽️ A tányéron vannak",
        departure: "😋 Megeszik (csokoládés)",
        count: (n) => `A tányéron maradt: ${n} palacsinta`
    },
    football: {
        waiting: "🏟️ A pályán vannak",
        departure: "🔄 Lecserélik (piros mezes)",
        count: (n) => `A pályán maradt: ${n} játékos`
    },
    animals: {
        waiting: "🦓 A kifutóban vannak",
        departure: "🟡 Megetetni viszik (sárga nyakörvű)",
        count: (n) => `A kifutóban maradt: ${n} zebra`
    },
    space: {
        waiting: "🛰️ Az űrállomáson vannak",
        departure: "🚀 Elindulnak (szürke robotok)",
        count: (n) => `Az űrállomáson maradt: ${n} robot`
    }
};

function el(name, attrs = {}) {
    const node = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        node.setAttribute(key, value);
    }
    return node;
}

function createEnvelope() {
    const svg = el("svg");
    svg.setAttribute("viewBox", "0 0 64 48");
    svg.setAttribute("width", "36");
    svg.setAttribute("height", "27");
    svg.setAttribute("class", "wp-envelope");

    svg.append(el("rect", { x: 2, y: 2, width: 60, height: 44, rx: 5, fill: "#ffffff", stroke: "#64748b", "stroke-width": 2 }));
    svg.append(el("polyline", { points: "2,4 32,25 62,4", fill: "none", stroke: "#64748b", "stroke-width": 2 }));
    svg.append(el("rect", { x: 43, y: 5, width: 16, height: 16, rx: 2, fill: "#ef4444", stroke: "#b91c1c", "stroke-width": 1 }));

    return svg;
}

function createPostman({ cap = "#3b82f6", shoes = "#334155", question = false } = {}) {
    const svg = el("svg");
    svg.setAttribute("viewBox", "0 0 44 64");
    svg.setAttribute("width", "42");
    svg.setAttribute("height", "60");
    svg.setAttribute("class", "wp-postman-figure");
    svg.setAttribute("role", "img");

    const skin = "#fcd9b8";
    const uniform = "#546e7a";
    const dark = "#2c3e50";

    svg.append(el("rect", { x: 17, y: 57, width: 4, height: 4, rx: 1, fill: dark }));
    svg.append(el("rect", { x: 23, y: 57, width: 4, height: 4, rx: 1, fill: dark }));

    svg.append(el("rect", { x: 16, y: 61, width: 6, height: 3, rx: 1.5, fill: shoes }));
    svg.append(el("rect", { x: 22, y: 61, width: 6, height: 3, rx: 1.5, fill: shoes }));

    svg.append(el("rect", { x: 14, y: 42, width: 16, height: 16, rx: 3, fill: uniform }));
    svg.append(el("rect", { x: 14, y: 53, width: 16, height: 3, fill: "#334e68" }));
    svg.append(el("polygon", { points: "18,42 22,47 26,42", fill: "#eceff1" }));
    svg.append(el("rect", { x: 20, y: 39, width: 4, height: 4, fill: skin }));

    svg.append(el("path", { d: "M19 42 L31 55", stroke: "#d7ccc8", "stroke-width": 3, fill: "none" }));
    svg.append(el("rect", { x: 26, y: 49, width: 13, height: 9, rx: 2, fill: "#8d6e63", stroke: "#6d4c41", "stroke-width": 1 }));

    svg.append(el("rect", { x: 11, y: 43, width: 4, height: 10, rx: 2, fill: uniform }));
    svg.append(el("rect", { x: 29, y: 43, width: 4, height: 10, rx: 2, fill: uniform }));

    svg.append(el("circle", { cx: 22, cy: 31, r: 9, fill: skin }));
    svg.append(el("circle", { cx: 19, cy: 30, r: 1.4, fill: dark }));
    svg.append(el("circle", { cx: 25, cy: 30, r: 1.4, fill: dark }));
    svg.append(el("path", { d: "M18 35 Q22 38 26 35", stroke: "#b06d3a", "stroke-width": 1.6, fill: "none", "stroke-linecap": "round" }));

    svg.append(el("path", { d: "M13 27 Q13 16 22 16 Q31 16 31 27 Z", fill: cap }));
    svg.append(el("rect", { x: 11, y: 26, width: 22, height: 4, rx: 2, fill: cap }));

    if (question) {
        const badge = el("circle", { cx: 32, cy: 15, r: 6, fill: "#f59e0b", stroke: "#b45309", "stroke-width": 1.5 });
        const text = el("text", { x: 32, y: 18, "text-anchor": "middle", "font-size": 8, "font-weight": "bold", fill: "#fff" });
        text.textContent = "?";
        svg.append(badge, text);
    }

    return svg;
}

function createItemIcon(world) {
    if (world === "postman") {
        return createEnvelope();
    }
    const span = document.createElement("span");
    span.className = "wp-item-emoji";
    span.textContent = ITEM_EMOJI[world] ?? "●";
    return span;
}

function createFigure(world, { leaving = false } = {}) {
    if (world === "postman") {
        return createPostman({ cap: leaving ? "#ef4444" : "#3b82f6", shoes: "#334155" });
    }
    const colors = FIGURE_COLORS[world] ?? FIGURE_COLORS.racing;
    const c = leaving ? colors.leaving : colors.staying;
    const span = document.createElement("span");
    span.className = "wp-drag-figure";
    span.textContent = FIGURE_EMOJI[world] ?? "●";
    span.style.background = c.bg;
    span.style.borderColor = c.border;
    return span;
}

function createPartFigure(world, { highlight = false } = {}) {
    if (world === "postman") {
        return createPostman({
            cap: "#3b82f6",
            shoes: highlight ? "#3b82f6" : "#8d6e63",
            question: !highlight
        });
    }
    const colors = PART_COLORS[world] ?? PART_COLORS.racing;
    const c = highlight ? colors.part : colors.other;
    const span = document.createElement("span");
    span.className = "wp-drag-figure";
    span.textContent = FIGURE_EMOJI[world] ?? "●";
    span.style.background = c.bg;
    span.style.borderColor = c.border;
    return span;
}

function createIconRow(count, label, iconFactory) {
    const row = document.createElement("div");
    row.className = "wp-visual-row";

    const lab = document.createElement("div");
    lab.className = "wp-visual-label";
    lab.textContent = label;
    row.append(lab);

    const icons = document.createElement("div");
    icons.className = "wp-visual-icons";
    for (let i = 0; i < count; i++) {
        icons.append(iconFactory());
    }
    row.append(icons);

    return row;
}

function createIconColumn(count, label, iconFactory) {
    const col = document.createElement("div");
    col.className = "wp-compare-side";

    const lab = document.createElement("div");
    lab.className = "wp-visual-label";
    lab.textContent = label;
    col.append(lab);

    const icons = document.createElement("div");
    icons.className = "wp-visual-icons";
    for (let i = 0; i < count; i++) {
        icons.append(iconFactory());
    }
    col.append(icons);

    return col;
}

export function renderWordProblem(step, root, next, progress, onResult, onAttempt) {

    root.replaceChildren();

    const world = step.world ?? getActiveWorld();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = step.title;
    card.append(title);

    const story = document.createElement("p");
    story.className = "wp-story";
    story.textContent = step.text;
    card.append(story);

    const message = createMessageBox();

    let answered = false;
    let reported = false;
    let mistakes = 0;

    function reportSuccess(successText) {
        if (answered) return;
        answered = true;
        onAttempt?.();
        message.show(successText, "success");
        if (!reported) {
            reported = true;
            onResult?.(true);
        }
        setTimeout(() => next(), 900);
    }

    function reportRetry() {
        if (answered) return;
        onAttempt?.();
        message.show(mistakes === 1
            ? "🙂 Majdnem! Próbáld meg még egyszer!"
            : "🤔 Még nem sikerült.", "retry");
        mistakes++;
        if (!reported) {
            reported = true;
            onResult?.(false);
        }
    }

    const itemIcon = () => createItemIcon(world);

    if (step.kind === "join" || step.kind === "compare") {

        const question = document.createElement("p");
        question.className = "wp-question";
        question.textContent = step.question;

        if (step.kind === "join") {
            const labels = JOIN_LABELS[world] ?? JOIN_LABELS.postman;
            const visual = document.createElement("div");
            visual.className = "wp-visual";

            visual.append(createIconRow(step.a, labels.before, itemIcon));

            const plus = document.createElement("div");
            plus.className = "wp-visual-op";
            plus.textContent = "+";

            visual.append(plus, createIconRow(step.b, labels.after, itemIcon));

            card.append(visual);
        } else {
            const labels = COMPARE_LABELS[world] ?? COMPARE_LABELS.postman;
            const compare = document.createElement("div");
            compare.className = "wp-compare";
            compare.append(
                createIconColumn(step.a, `${labels.a}: ${step.a} ${labels.unit}`, itemIcon),
                createIconColumn(step.b, `${labels.b}: ${step.b} ${labels.unit}`, itemIcon)
            );
            card.append(compare);
        }

        card.append(question);

        const options = document.createElement("div");
        options.className = "wp-options";
        step.options.forEach(value => {
            const btn = createButton(String(value), { className: "wp-option" });
            btn.addEventListener("click", () => {
                if (value === step.answer) {
                    reportSuccess(step.successText);
                } else {
                    reportRetry();
                }
            });
            options.append(btn);
        });
        card.append(options);

    } else if (step.kind === "part-whole") {

        const visual = document.createElement("div");
        visual.className = "wp-visual";

        const row = document.createElement("div");
        row.className = "wp-visual-icons";

        for (let i = 0; i < step.total; i++) {
            const blue = i < step.part;
            const wrap = document.createElement("div");
            wrap.className = "wp-postman-wrap";
            wrap.append(createPartFigure(world, { highlight: blue }));
            row.append(wrap);
        }
        visual.append(row);
        card.append(visual);

        const legend = document.createElement("div");
        legend.className = "wp-legend";
        const legendTheme = PART_LEGEND[world] ?? PART_LEGEND.postman;
        const partLegend = document.createElement("span");
        partLegend.className = "wp-legend-blue";
        partLegend.textContent = legendTheme.part(step.part);
        const otherLegend = document.createElement("span");
        otherLegend.className = "wp-legend-brown";
        otherLegend.textContent = legendTheme.other;
        legend.append(partLegend, otherLegend);
        card.append(legend);

        const question = document.createElement("p");
        question.className = "wp-question";
        question.textContent = step.question;
        card.append(question);

        const input = createNumberInput("?");
        input.className = "wp-input";

        const button = createButton("Ellenőrzöm");
        card.append(input, button);

        function check() {
            if (answered) return;
            const answer = Number(input.value);
            if (answer === step.answer) {
                reportSuccess(step.successText);
            } else {
                reportRetry();
                input.focus();
                input.select();
            }
        }

        button.addEventListener("click", check);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") check();
        });

        requestAnimationFrame(() => input.focus());

    } else if (step.kind === "remove") {

        const labels = REMOVE_LABELS[world] ?? REMOVE_LABELS.postman;

        const hint = document.createElement("p");
        hint.className = "wp-hint";
        hint.textContent = step.hint;

        const countEl = document.createElement("div");
        countEl.className = "wp-count";
        countEl.textContent = labels.count(step.total);

        const waiting = document.createElement("div");
        waiting.className = "wp-area wp-waiting";
        const waitingLabel = document.createElement("div");
        waitingLabel.className = "wp-area-label";
        waitingLabel.textContent = labels.waiting;
        waiting.append(waitingLabel);

        const departure = document.createElement("div");
        departure.className = "wp-area wp-departure";
        const depLabel = document.createElement("div");
        depLabel.className = "wp-area-label";
        depLabel.textContent = labels.departure;
        departure.append(depLabel);

        const postmen = [];
        for (let i = 0; i < step.total; i++) {
            const leaving = i < step.leaving;
            const wrap = document.createElement("div");
            wrap.className = "wp-postman";
            wrap.dataset.leaving = leaving ? "true" : "false";
            wrap.append(createFigure(world, { leaving }));
            waiting.append(wrap);
            postmen.push(wrap);
        }

        card.append(hint, waiting, countEl, departure);

        const button = createButton("✅ Ellenőrzöm");
        card.append(button);

        function updateCount() {
            const remaining = postmen.filter(p => p.parentElement === waiting).length;
            countEl.textContent = labels.count(remaining);
        }

        const zones = [waiting, departure];

        let drag = null;

        card.addEventListener("pointerdown", (e) => {
            const postman = e.target.closest(".wp-postman");
            if (!postman || answered || drag) return;
            e.preventDefault();

            const rect = postman.getBoundingClientRect();

            const clone = postman.cloneNode(true);
            clone.classList.add("wp-postman-clone");
            clone.style.width = rect.width + "px";
            clone.style.height = rect.height + "px";
            document.body.append(clone);

            postman.classList.add("wp-postman-hidden");

            drag = {
                postman,
                clone,
                offsetX: e.clientX - rect.left,
                offsetY: e.clientY - rect.top
            };

            moveClone(e);

            document.addEventListener("pointermove", onMove);
            document.addEventListener("pointerup", onUp);
            document.addEventListener("pointercancel", onUp);
        });

        function onMove(e) {
            if (!drag) return;
            e.preventDefault();
            moveClone(e);
            highlightZone(e);
        }

        function moveClone(e) {
            drag.clone.style.left = (e.clientX - drag.offsetX) + "px";
            drag.clone.style.top = (e.clientY - drag.offsetY) + "px";
        }

        function getZoneAt(x, y) {
            for (const zone of zones) {
                const r = zone.getBoundingClientRect();
                if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
                    return zone;
                }
            }
            return null;
        }

        function highlightZone(e) {
            const zone = getZoneAt(e.clientX, e.clientY);
            zones.forEach(z => z.classList.toggle("wp-drag-over", z === zone));
        }

        function clearHighlight() {
            zones.forEach(z => z.classList.remove("wp-drag-over"));
        }

        function onUp(e) {
            if (!drag) return;

            drag.clone.remove();
            clearHighlight();

            const zone = getZoneAt(e.clientX, e.clientY);
            if (zone) {
                zone.append(drag.postman);
            }

            drag.postman.classList.remove("wp-postman-hidden");
            drag = null;

            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerup", onUp);
            document.removeEventListener("pointercancel", onUp);

            updateCount();
        }

        function check() {
            if (answered) return;
            const left = postmen.filter(p => p.parentElement === departure);
            const correct = left.length === step.leaving
                && left.every(p => p.dataset.leaving === "true");

            if (correct) {
                reportSuccess(step.successText);
            } else {
                reportRetry();
            }
        }

        button.addEventListener("click", check);
    }

    card.append(message.element);
    root.append(card);
}
