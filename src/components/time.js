import { createCard } from "./ui/card.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_TITLES = {
    postman: "📮 Mit mutat az óra?",
    racing: "🏎️ Mit mutat az óra?",
    football: "⚽ Mit mutat az óra?",
    cooking: "🍳 Mit mutat az óra?"
};

const SVG_NS = "http://www.w3.org/2000/svg";

function hand(svg, cx, cy, angleDeg, len) {
    const rad = angleDeg * Math.PI / 180;
    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("x1", cx);
    line.setAttribute("y1", cy);
    line.setAttribute("x2", cx + Math.sin(rad) * len);
    line.setAttribute("y2", cy - Math.cos(rad) * len);
    line.setAttribute("stroke", "#1e293b");
    line.setAttribute("stroke-width", "4");
    line.setAttribute("stroke-linecap", "round");
    svg.append(line);
}

function createClock(hour, minute) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("class", "time-clock");

    const cx = 50;
    const cy = 50;
    const r = 46;

    const face = document.createElementNS(SVG_NS, "circle");
    face.setAttribute("cx", cx);
    face.setAttribute("cy", cy);
    face.setAttribute("r", r);
    face.setAttribute("fill", "#ffffff");
    face.setAttribute("stroke", "#64748b");
    face.setAttribute("stroke-width", "3");
    svg.append(face);

    for (let i = 0; i < 12; i++) {
        const rad = i * 30 * Math.PI / 180;
        const major = i % 3 === 0;
        const inner = r - (major ? 10 : 6);
        const outer = r - 2;
        const tick = document.createElementNS(SVG_NS, "line");
        tick.setAttribute("x1", cx + Math.sin(rad) * inner);
        tick.setAttribute("y1", cy - Math.cos(rad) * inner);
        tick.setAttribute("x2", cx + Math.sin(rad) * outer);
        tick.setAttribute("y2", cy - Math.cos(rad) * outer);
        tick.setAttribute("stroke", "#334155");
        tick.setAttribute("stroke-width", major ? "2.5" : "1.5");
        svg.append(tick);
    }

    const hourAngle = (hour % 12) * 30 + minute * 0.5;
    const minuteAngle = minute * 6;

    hand(svg, cx, cy, hourAngle, 22);
    hand(svg, cx, cy, minuteAngle, 34);

    const center = document.createElementNS(SVG_NS, "circle");
    center.setAttribute("cx", cx);
    center.setAttribute("cy", cy);
    center.setAttribute("r", "3.5");
    center.setAttribute("fill", "#1e293b");
    svg.append(center);

    return svg;
}

export function renderTime(step, root, onNext, progress, onResult, onAttempt) {

    root.innerHTML = "";

    const world = getActiveWorld();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = WORLD_TITLES[world] ?? WORLD_TITLES.postman;
    card.append(title);

    const clockWrap = document.createElement("div");
    clockWrap.className = "time-clock-wrap";
    clockWrap.append(createClock(step.hour, step.minute));
    card.append(clockWrap);

    const prompt = document.createElement("p");
    prompt.className = "time-prompt";
    prompt.textContent = "Kattints a helyes meghatározásra!";
    card.append(prompt);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "time-options";

    const message = document.createElement("div");
    message.className = "time-message";

    let answered = false;
    let reported = false;

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "time-option";
        btn.textContent = opt.text;

        btn.addEventListener("mouseenter", () => {
            if (!answered) btn.style.transform = "scale(1.05)";
        });
        btn.addEventListener("mouseleave", () => {
            if (!answered) btn.style.transform = "";
        });

        btn.addEventListener("click", () => {
            if (answered) return;
            answered = true;

            onAttempt?.();

            optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");

            if (opt.correct) {
                btn.classList.add("time-option-correct");
                message.textContent = "🎉 Jó válasz!";
                message.className = "time-message time-message-good";

                if (!reported) {
                    reported = true;
                    onResult?.(true);
                }
            } else {
                btn.classList.add("time-option-wrong");
                optionsContainer.querySelectorAll("button").forEach(b => {
                    if (b.textContent === step.answer) {
                        b.classList.add("time-option-correct");
                    }
                });
                message.textContent = `🤔 Nem! A helyes meghatározás: ${step.answer}`;
                message.className = "time-message time-message-bad";

                if (!reported) {
                    reported = true;
                    onResult?.(false);
                }
            }

            const nextBtn = document.createElement("button");
            nextBtn.className = "time-next";
            nextBtn.textContent = "➡️ Tovább";
            nextBtn.addEventListener("click", () => onNext());
            card.append(nextBtn);
        });

        optionsContainer.append(btn);
    });

    card.append(optionsContainer, message);
    root.append(card);
}
