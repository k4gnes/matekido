import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { createHintBox } from "./ui/hintBox.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📈 Függvények a postán",
    racing: "🏎️ Függvények a boxutcában",
    football: "⚽ Függvények a pályán",
    cooking: "🍳 Függvények a konyhában",
    animals: "🦁 Függvények az állatkertben",
    space: "🚀 Függvények az űrhajón",
    tram: "🚋 Függvények a villamoson"
};

const SVG_NS = "http://www.w3.org/2000/svg";

// A rács tartománya megegyezik a generátoréval (x = 0..8, y = 0..9).
const X_MIN = 0;
const X_MAX = 8;
const Y_MIN = 0;
const Y_MAX = 9;
const CELL = 26;
const PAD_LEFT = 30;
const PAD_TOP = 12;

function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function cellX(x) {
    return PAD_LEFT + (x - X_MIN) * CELL;
}

function cellY(y) {
    return PAD_TOP + (Y_MAX - y) * CELL;
}

function createGridSvg(step) {
    const gridW = (X_MAX - X_MIN + 1) * CELL;
    const gridH = (Y_MAX - Y_MIN + 1) * CELL;
    const svg = svgEl("svg", { viewBox: `0 0 ${PAD_LEFT + gridW + 16} ${PAD_TOP + gridH + 32}`, class: "fn-svg" });

    for (let x = X_MIN; x <= X_MAX; x++) {
        for (let y = Y_MIN; y <= Y_MAX; y++) {
            const rect = svgEl("rect", {
                x: cellX(x),
                y: cellY(y),
                width: CELL,
                height: CELL,
                fill: (x + y) % 2 === 0 ? "#f8fafc" : "#f1f5f9",
                stroke: "#e2e8f0"
            });
            if (step.mode === "plot") {
                rect.setAttribute("class", "fn-cell");
                rect.setAttribute("data-x", x);
                rect.setAttribute("data-y", y);
            }
            svg.append(rect);
        }
    }

    svg.append(svgEl("line", {
        x1: PAD_LEFT, y1: PAD_TOP + gridH,
        x2: PAD_LEFT + gridW, y2: PAD_TOP + gridH,
        stroke: "#64748b", "stroke-width": 2.5
    }));
    svg.append(svgEl("line", {
        x1: PAD_LEFT, y1: PAD_TOP,
        x2: PAD_LEFT, y2: PAD_TOP + gridH,
        stroke: "#64748b", "stroke-width": 2.5
    }));

    function axisLabel(cx, cy, text, fill, size) {
        const t = svgEl("text", {
            x: cx, y: cy,
            "text-anchor": "middle",
            "dominant-baseline": "central",
            "font-size": size,
            "font-weight": "700",
            fill
        });
        t.textContent = text;
        svg.append(t);
    }

    for (let x = X_MIN; x <= X_MAX; x++) {
        axisLabel(cellX(x) + CELL / 2, PAD_TOP + gridH + 14, x, "#64748b", 12);
    }
    for (let y = Y_MIN; y <= Y_MAX; y++) {
        axisLabel(PAD_LEFT - 10, cellY(y) + CELL / 2, y, "#64748b", 12);
    }

    axisLabel(PAD_LEFT + gridW + 12, PAD_TOP + gridH + 14, "x", "#334155", 14);
    axisLabel(PAD_LEFT - 20, PAD_TOP - 2, "y", "#334155", 14);

    if (step.mode === "read") {
        const ask = cellX(step.askX) + CELL / 2;
        svg.append(svgEl("line", {
            x1: ask, y1: PAD_TOP,
            x2: ask, y2: PAD_TOP + gridH,
            stroke: "#f59e0b", "stroke-width": 2, "stroke-dasharray": "5 4"
        }));

        const pts = step.points.map(([x, y]) =>
            `${(cellX(x) + CELL / 2).toFixed(1)},${(cellY(y) + CELL / 2).toFixed(1)}`);
        svg.append(svgEl("polyline", {
            points: pts.join(" "),
            fill: "none",
            stroke: "#2563eb",
            "stroke-width": 3,
            "stroke-linecap": "round",
            "stroke-linejoin": "round"
        }));

        step.points.forEach(([x, y]) => {
            svg.append(svgEl("circle", {
                cx: (cellX(x) + CELL / 2).toFixed(1),
                cy: (cellY(y) + CELL / 2).toFixed(1),
                r: 5,
                fill: "#ef4444",
                stroke: "#ffffff",
                "stroke-width": 2
            }));
        });
    }

    return svg;
}

function createTable(table) {
    const el = document.createElement("table");
    el.className = "fn-table";

    const thead = document.createElement("thead");
    const hr = document.createElement("tr");
    const th1 = document.createElement("th");
    th1.textContent = table.xLabel;
    const th2 = document.createElement("th");
    th2.textContent = table.yLabel;
    hr.append(th1, th2);
    thead.append(hr);
    el.append(thead);

    const tbody = document.createElement("tbody");
    table.rows.forEach(row => {
        const tr = document.createElement("tr");
        const td1 = document.createElement("td");
        td1.textContent = String(row.x);
        const td2 = document.createElement("td");
        if (row.y === null) {
            td2.textContent = "?";
            td2.className = "fn-missing";
        } else {
            td2.textContent = String(row.y);
        }
        tr.append(td1, td2);
        tbody.append(tr);
    });
    el.append(tbody);

    return el;
}

export function renderFunction(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();
    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = TITLES[world] ?? TITLES.postman;
    card.append(title);

    const question = document.createElement("p");
    question.className = "fn-question";
    question.textContent = step.question;
    card.append(question);

    if (step.table) {
        card.append(createTable(step.table));
    }

    let svg = null;
    if (step.mode === "plot" || step.mode === "read") {
        const grid = document.createElement("div");
        grid.className = "fn-grid";
        svg = createGridSvg(step);
        grid.append(svg);
        card.append(grid);
    }

    const marked = new Set();
    const target = new Set((step.target ?? []).map(([x, y]) => `${x},${y}`));

    let counter = null;
    let input = null;
    let submitButton = null;
    let choiceBox = null;

    if (step.mode === "plot") {
        counter = document.createElement("p");
        counter.className = "fn-counter";
        card.append(counter);

        submitButton = createButton("Ellenőrzöm", { className: "nav-bar-btn", onClick: submitAnswer });
        card.append(submitButton);
    } else if (step.mode === "extend") {
        input = document.createElement("input");
        input.type = "number";
        input.className = "fn-input";
        input.placeholder = "?";
        input.setAttribute("aria-label", "A hiányzó szám beírása");
        card.append(input);

        submitButton = createButton("Ellenőrzöm", { className: "nav-bar-btn", onClick: submitAnswer });
        card.append(submitButton);
    } else {
        choiceBox = document.createElement("div");
        choiceBox.className = "fn-options";

        step.options.forEach(value => {
            const btn = createButton(String(value), { className: "fn-option" });
            btn.dataset.value = String(value);
            choiceBox.append(btn);
        });

        card.append(choiceBox);
    }

    let hintShown = false;

    const hint = createHintBox();

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.textContent = hintText();
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    card.append(hintButton, hint);

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

    function updateCounter() {
        if (!counter) return;
        counter.textContent = `Megjelölt pontok: ${marked.size} / ${target.size}`;
    }

    function hintText() {
        if (step.mode === "plot") {
            return "💡 Minden sor egy pont: az x a vízszintes, az y a függőleges tengelyen van.";
        }
        if (step.mode === "extend") {
            return "💡 Nézd meg, mennyivel változik az y értéke soronként, és folytasd a sort!";
        }
        if (step.mode === "rule") {
            return "💡 A lépés a két egymás utáni sor y értékeinek különbsége.";
        }
        return "💡 Kövesd a szaggatott vonalat, és olvasd le, hol metszi a kék grafikont!";
    }

    function successText() {
        if (step.mode === "plot") {
            return "🎉 Ügyes! Minden pontot helyesen jelöltél be!";
        }
        if (step.mode === "extend") {
            return `🎉 Ügyes! A hiányzó szám ${step.answer}.`;
        }
        if (step.mode === "rule") {
            return `🎉 Ügyes! A lépés ${step.answer}, vagyis minden sorban ennyivel változik az y.`;
        }
        return `🎉 Ügyes! A grafikonon ${step.askX} ${step.xUnit} alatt ${step.answer} ${step.yUnit} van.`;
    }

    function checkAnswer(isCorrect) {
        if (feedback.isAnswered()) return;

        if (isCorrect) {
            if (input) {
                input.disabled = true;
                submitButton.disabled = true;
            } else if (choiceBox) {
                choiceBox.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
            } else {
                svg.querySelectorAll(".fn-cell").forEach(c => c.style.pointerEvents = "none");
            }
            feedback.success(successText());
        } else {
            feedback.retry();

            if (input) {
                input.focus();
                input.select();
            }

            if (feedback.getMistakes() >= 2 && !hintShown) {
                hintButton.style.display = "inline-block";
            }
        }
    }

    function submitAnswer() {
        if (feedback.isAnswered()) return;

        if (step.mode === "plot") {
            const hit = [...marked].filter(key => target.has(key)).length;
            if (hit === target.size && marked.size === target.size) {
                checkAnswer(true);
                return;
            }
            // a rossz jelöléseket levesszük, a jóak megmaradnak
            for (const key of [...marked]) {
                if (!target.has(key)) {
                    marked.delete(key);
                    const cell = svg.querySelector(`.fn-cell[data-x="${key.split(",")[0]}"][data-y="${key.split(",")[1]}"]`);
                    if (cell) cell.classList.remove("fn-cell-marked");
                }
            }
            updateCounter();
            feedback.retry(`Még ${target.size - marked.size} pontot kell bejelölni! Nézd meg a táblázatot!`);
            return;
        }

        const value = Number(input.value);
        if (input.value.trim() === "" || isNaN(value)) return;

        checkAnswer(value === step.answer);
    }

    if (step.mode === "plot") {
        updateCounter();

        svg.addEventListener("click", (e) => {
            const cell = e.target.closest(".fn-cell");
            if (!cell || feedback.isAnswered()) return;

            const key = `${cell.dataset.x},${cell.dataset.y}`;

            if (marked.has(key)) {
                marked.delete(key);
                cell.classList.remove("fn-cell-marked");
            } else {
                marked.add(key);
                cell.classList.add("fn-cell-marked");
            }

            updateCounter();
        }, { signal: ac.signal });
    } else if (step.mode === "extend") {
        requestAnimationFrame(() => input.focus());
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") submitAnswer();
        }, { signal: ac.signal });
    } else {
        choiceBox.addEventListener("click", (e) => {
            const btn = e.target.closest(".fn-option");
            if (!btn || feedback.isAnswered()) return;

            const ok = Number(btn.dataset.value) === step.answer;
            if (ok) markCorrect(btn);

            checkAnswer(ok);
        }, { signal: ac.signal });
    }

    return () => ac.abort();
}
