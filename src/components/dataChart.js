import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📊 Adatok és diagramok",
    racing: "🏎️ Diagram a boxutcában",
    football: "⚽ Diagram a pályán",
    cooking: "🍳 Diagram a konyhában",
    animals: "🦁 Diagram az állatkertben",
    space: "🤖 Diagram az űrhajón"
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

function createChartSvg(chart) {
    const max = Math.max(...chart.map(c => c.value));

    const svg = svgEl("svg", { viewBox: "0 0 176 150" });

    const plotW = 150;
    const plotH = 92;
    const marginLeft = 13;
    const marginTop = 30;
    const baseline = marginTop + plotH;
    const unitH = plotH / max;

    for (let i = 1; i <= max; i++) {
        const y = baseline - i * unitH;
        svg.append(svgEl("line", {
            x1: marginLeft,
            y1: y,
            x2: marginLeft + plotW,
            y2: y,
            stroke: "#94a3b8",
            "stroke-width": "1.6"
        }));
    }

    const colW = plotW / chart.length;

    chart.forEach((c, i) => {
        const cx = marginLeft + colW * i + colW / 2;
        const barW = Math.min(30, colW - 12);
        const h = c.value * unitH;

        const label = svgEl("text", {
            x: cx,
            y: marginTop,
            "text-anchor": "middle",
            "font-size": "20"
        });
        label.textContent = c.emoji;
        svg.append(label);

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
    chartBox.append(createChartSvg(step.chart));
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
    card.append(message.element);

    root.append(card);

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    function successText() {
        if (step.mode === "top") return "😊 Ügyes! A legmagasabb oszlopé a legtöbb!";
        if (step.mode === "least") return "😊 Ügyes! A legalacsonyabb oszlopé a legkevesebb!";
        if (step.mode === "count") return "😊 Ügyes! Jól megszámoltad az oszlopon!";
        return "😊 Ügyes! Jól összehasonlítottad az oszlopokat!";
    }

    function checkAnswer(isCorrect) {
        if (feedback.isAnswered()) return;

        if (isCorrect) {
            optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");

            feedback.success(successText());
        } else {
            feedback.retry();
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