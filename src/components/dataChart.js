import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createHintRequest } from "./ui/hintBox.js?v=2";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📊 Adatok és diagramok",
    racing: "🏎️ Diagram a boxutcában",
    football: "⚽ Diagram a pályán",
    cooking: "🍳 Diagram a konyhában",
    animals: "🦁 Diagram az állatkertben",
    space: "🤖 Diagram az űrhajón",
    tram: "🚋 Diagram a villamoson"
};

const SVG_NS = "http://www.w3.org/2000/svg";
const BAR_COLORS = ["#f43f5e", "#3b82f6", "#22c55e"];

function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function sectorPath(cx, cy, r, startAngle, endAngle) {
    const rad = (deg) => ((deg - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(rad(startAngle));
    const y1 = cy + r * Math.sin(rad(startAngle));
    const x2 = cx + r * Math.cos(rad(endAngle));
    const y2 = cy + r * Math.sin(rad(endAngle));
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
}

function createPieSvg(chart) {
    const total = chart.reduce((s, c) => s + c.value, 0);
    const cx = 78;
    const cy = 75;
    const r = 48;

    const svg = svgEl("svg", { viewBox: "0 0 176 150" });

    let start = 0;
    chart.forEach((c, i) => {
        const angle = (c.value / total) * 360;
        const end = start + angle;
        svg.append(svgEl("path", {
            d: sectorPath(cx, cy, r, start, end),
            fill: BAR_COLORS[i % BAR_COLORS.length],
            stroke: "#ffffff",
            "stroke-width": "2"
        }));

        const rad = ((start + end) / 2 - 90) * Math.PI / 180;
        const lx = cx + (r + 20) * Math.cos(rad);
        const ly = cy + (r + 20) * Math.sin(rad);
        const label = svgEl("text", {
            x: lx.toFixed(1),
            y: ly.toFixed(1),
            "text-anchor": "middle",
            "font-size": "12",
            "font-weight": "700",
            fill: "#334155"
        });
        label.textContent = `${c.emoji} ${c.value}`;
        svg.append(label);

        start = end;
    });

    return svg;
}

function createChartSvg(chart) {
    const maxVal = Math.max(...chart.map(c => c.value));
    const gridStep = maxVal <= 10 ? 1 : maxVal <= 20 ? 2 : maxVal <= 50 ? 10 : 20;

    const svg = svgEl("svg", { viewBox: "0 0 176 150" });

    const plotW = 150;
    const plotH = 92;
    const marginLeft = 13;
    const marginTop = 44;
    const baseline = marginTop + plotH;
    const unitH = plotH / maxVal;

    for (let i = gridStep; i <= maxVal; i += gridStep) {
        const y = baseline - i * unitH;
        svg.append(svgEl("line", {
            x1: marginLeft,
            y1: y,
            x2: marginLeft + plotW,
            y2: y,
            stroke: "#94a3b8",
            "stroke-width": "1.2"
        }));
        const tickLabel = svgEl("text", {
            x: marginLeft - 3,
            y: y + 4,
            "text-anchor": "end",
            "font-size": "8",
            fill: "#94a3b8"
        });
        tickLabel.textContent = String(i);
        svg.append(tickLabel);
    }

    const colW = plotW / chart.length;

    chart.forEach((c, i) => {
        const cx = marginLeft + colW * i + colW / 2;
        const barW = Math.min(30, colW - 12);
        const h = c.value * unitH;

        const emojiLabel = svgEl("text", {
            x: cx,
            y: 16,
            "text-anchor": "middle",
            "font-size": "20"
        });
        emojiLabel.textContent = c.emoji;
        svg.append(emojiLabel);

        const valLabel = svgEl("text", {
            x: cx,
            y: 36,
            "text-anchor": "middle",
            "font-size": "14",
            "font-weight": "800",
            fill: "#1e293b"
        });
        valLabel.textContent = String(c.value);
        svg.append(valLabel);

        svg.append(svgEl("rect", {
            x: cx - barW / 2,
            y: baseline - h,
            width: barW,
            height: h,
            rx: 5,
            fill: BAR_COLORS[i],
            "fill-opacity": ".92",
            stroke: "#1e293b",
            "stroke-width": "1.5"
        }));
    });

    svg.append(svgEl("line", {
        x1: marginLeft,
        y1: baseline,
        x2: marginLeft + plotW,
        y2: baseline,
        stroke: "#334155",
        "stroke-width": "2"
    }));

    return svg;
}

function createSeriesSvg(chart, connect) {
    const maxVal = Math.max(...chart.map(c => c.value));
    const gridStep = maxVal <= 10 ? 1 : maxVal <= 20 ? 2 : maxVal <= 50 ? 10 : 20;

    const svg = svgEl("svg", { viewBox: "0 0 176 150" });

    const plotW = 150;
    const plotH = 92;
    const marginLeft = 13;
    const marginTop = 44;
    const baseline = marginTop + plotH;
    const unitH = plotH / maxVal;

    for (let i = gridStep; i <= maxVal; i += gridStep) {
        const y = baseline - i * unitH;
        svg.append(svgEl("line", {
            x1: marginLeft,
            y1: y,
            x2: marginLeft + plotW,
            y2: y,
            stroke: "#94a3b8",
            "stroke-width": "1.2"
        }));
        const tickLabel = svgEl("text", {
            x: marginLeft - 3,
            y: y + 4,
            "text-anchor": "end",
            "font-size": "8",
            fill: "#94a3b8"
        });
        tickLabel.textContent = String(i);
        svg.append(tickLabel);
    }

    const colW = plotW / chart.length;
    const points = chart.map((c, i) => {
        const x = marginLeft + colW * i + colW / 2;
        const y = baseline - c.value * unitH;

        const emojiLabel = svgEl("text", {
            x,
            y: 16,
            "text-anchor": "middle",
            "font-size": "20"
        });
        emojiLabel.textContent = c.emoji;
        svg.append(emojiLabel);

        const valLabel = svgEl("text", {
            x,
            y: 36,
            "text-anchor": "middle",
            "font-size": "14",
            "font-weight": "800",
            fill: "#1e293b"
        });
        valLabel.textContent = String(c.value);
        svg.append(valLabel);

        return { x, y };
    });

    if (connect) {
        svg.append(svgEl("polyline", {
            points: points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "),
            fill: "none",
            stroke: "#3b82f6",
            "stroke-width": "3",
            "stroke-linecap": "round",
            "stroke-linejoin": "round"
        }));
    }

    points.forEach(p => svg.append(svgEl("circle", {
        cx: p.x.toFixed(1),
        cy: p.y.toFixed(1),
        r: "5",
        fill: "#f43f5e",
        stroke: "#ffffff",
        "stroke-width": "2"
    })));

    svg.append(svgEl("line", {
        x1: marginLeft,
        y1: baseline,
        x2: marginLeft + plotW,
        y2: baseline,
        stroke: "#334155",
        "stroke-width": "2"
    }));

    return svg;
}

function createPictogramSvg(chart) {
    const svg = svgEl("svg", { viewBox: "0 0 176 150" });

    const rowH = 30;
    const fontSize = 16;
    const maxShown = 9;

    chart.forEach((c, i) => {
        const y = 22 + i * rowH;

        const label = svgEl("text", {
            x: 14,
            y: y,
            "font-size": "16",
            "text-anchor": "middle"
        });
        label.textContent = c.emoji;
        svg.append(label);

        const shown = Math.min(c.value, maxShown);
        for (let j = 0; j < shown; j++) {
            const icon = svgEl("text", { x: 30 + j * 10, y, "font-size": String(fontSize) });
            icon.textContent = c.emoji;
            svg.append(icon);
        }

        if (c.value > maxShown) {
            const dot = svgEl("text", {
                x: 30 + maxShown * 10 + 4,
                y: y,
                "font-size": "16",
                fill: "#94a3b8"
            });
            dot.textContent = "…";
            svg.append(dot);
        }

        const val = svgEl("text", {
            x: 168,
            y: y,
            "text-anchor": "end",
            "font-size": "14",
            "font-weight": "700",
            fill: "#334155"
        });
        val.textContent = String(c.value);
        svg.append(val);
    });

    return svg;
}

function createTableChart(chart) {
    const table = document.createElement("table");
    table.className = "dt-table";

    const thead = document.createElement("thead");
    const hr = document.createElement("tr");
    const h1 = document.createElement("th");
    h1.textContent = "Mi?";
    const h2 = document.createElement("th");
    h2.textContent = "Hány?";
    hr.append(h1, h2);
    thead.append(hr);
    table.append(thead);

    const tbody = document.createElement("tbody");
    chart.forEach(c => {
        const tr = document.createElement("tr");
        const td1 = document.createElement("td");
        td1.className = "dt-table-emoji";
        td1.textContent = c.emoji;
        const td2 = document.createElement("td");
        td2.className = "dt-table-value";
        td2.textContent = String(c.value);
        tr.append(td1, td2);
        tbody.append(tr);
    });
    table.append(tbody);

    return table;
}

function hintText(step) {
    if (step.mode === "top") {
        return "A legmagasabb oszlopnak a legnagyobb a számértéke – ezt keresd!";
    }
    if (step.mode === "least") {
        return "A legalacsonyabb oszlopnak a legkisebb a számértéke – ezt keresd!";
    }
    if (step.mode === "count") {
        return "Nézd meg a diagramon a megjelölt fajtát, és számold meg, hány darab van belőle!";
    }
    if (step.mode === "sum") {
        return "Adj össze minden oszlop számértékét!";
    }
    if (step.mode === "sum2") {
        return "Adj össze a két megjelölt oszlop számértékét!";
    }
    if (step.mode === "diff") {
        return "Vond ki a kisebb számértéket a nagyobból!";
    }
    if (step.mode === "percent") {
        return "A teljes kördiagram 100%. A százalékot így kapod: oszlop értéke ÷ összes érték × 100.";
    }
    return "Nézd meg a diagramot: melyik oszlop magasabb, annak a számértéke nagyobb!";
}

export function renderDataChart(step, root, next, progress, onResult, onAttempt) {

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

    const chartBox = document.createElement("div");
    chartBox.className = "dt-chart-box";
    if (step.chartType === "pictogram") {
        chartBox.append(createPictogramSvg(step.chart));
    } else if (step.chartType === "table") {
        chartBox.append(createTableChart(step.chart));
    } else if (step.chartType === "pie") {
        chartBox.append(createPieSvg(step.chart));
    } else if (step.chartType === "line") {
        chartBox.append(createSeriesSvg(step.chart, true));
    } else if (step.chartType === "dot") {
        chartBox.append(createSeriesSvg(step.chart, false));
    } else {
        chartBox.append(createChartSvg(step.chart));
    }
    card.append(chartBox);

    const prompt = document.createElement("p");
    prompt.className = "dt-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "dt-options";

    step.options.forEach((value, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "dt-option";
        btn.textContent = value;
        btn.dataset.index = index;
        optionsContainer.append(btn);
    });

    card.append(optionsContainer);

    const message = createMessageBox();
    const hint = createHintRequest(() => hintText(step));

    card.append(hint.button, hint.box);
    card.append(message.element);

    root.append(card);

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    function maybeShowHint() {
        if (feedback.getMistakes() >= 2) hint.offer();
    }

    function successText() {
        if (step.mode === "top") return "😊 Ügyes! A legmagasabb oszlopé a legtöbb!";
        if (step.mode === "least") return "😊 Ügyes! A legalacsonyabb oszlopé a legkevesebb!";
        if (step.mode === "count") return "😊 Ügyes! Jól megszámoltad az oszlopon!";
        if (step.mode === "sum") return "😊 Ügyes! Helyesen összeadtad az összes oszlopot!";
        if (step.mode === "sum2") return "😊 Ügyes! Helyesen összeadtad a két oszlopot!";
        if (step.mode === "diff") return "😊 Ügyes! Helyesen kivontad a kisebbet a nagyobból!";
        if (step.mode === "percent") return "😊 Ügyes! Jól kiszámoltad a kördiagram százalékait!";
        return "😊 Ügyes! Jól összehasonlítottad az oszlopokat!";
    }

    function checkAnswer(isCorrect) {
        if (feedback.isAnswered()) return;

        if (isCorrect) {
            optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");

            feedback.success(successText());
        } else {
            feedback.retry();
            maybeShowHint();
        }
    }

    optionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".dt-option");
        if (!btn || feedback.isAnswered()) return;

        const ok = Number(btn.dataset.index) === step.answer;

        if (ok) markCorrect(btn);

        checkAnswer(ok);
    }, { signal: ac.signal });
}