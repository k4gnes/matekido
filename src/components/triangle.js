import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createHintRequest } from "./ui/hintBox.js?v=2";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📐 Háromszögek a postán",
    racing: "🏎️ Háromszögek a pályán",
    football: "⚽ Háromszögek a pályán",
    cooking: "🍳 Háromszögek a konyhában",
    animals: "🦁 Háromszögek az állatkertben",
    space: "🤖 Háromszögek az űrben",
    tram: "🚋 Háromszögek a városban"
};

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function createTriangleSvg(step) {
    const svg = svgEl("svg", { viewBox: "0 0 160 140", class: "tri-svg" });

    svg.append(svgEl("polygon", {
        points: "20,120 140,120 70,20",
        fill: "#fef3c7",
        stroke: "#1e293b",
        "stroke-width": 2.5,
        "stroke-linejoin": "round"
    }));

    const label = (x, y, text) => {
        const t = svgEl("text", {
            x,
            y,
            "text-anchor": "middle",
            "font-size": "14",
            "font-weight": "700",
            fill: "#1e293b",
            stroke: "#ffffff",
            "stroke-width": "4",
            "paint-order": "stroke"
        });
        t.textContent = text;
        svg.append(t);
    };

    label(30, 112, `${step.a}°`);
    label(130, 112, `${step.b}°`);
    label(70, 44, "?");

    return svg;
}

function hintText(step) {
    if (step.mode === "angle-sum") {
        return "A háromszög belső szögeinek összege 180°. A hiányzó szög: 180° − a két ismert szög.";
    }
    if (step.mode === "angle-type") {
        return "Ha minden szög hegyes, a háromszög hegyesszögű; ha van derékszög, derékszögű; ha van tompaszög, tompaszögű.";
    }
    if (step.mode === "iso-base") {
        return "Az egyenlőszárú háromszög két alapszöge egyenlő. Számold ki: 180° − szárszög, majd oszd el kettővel.";
    }
    if (step.mode === "exterior") {
        return "A külső szög egyenlő a két nem mellette fekvő belső szög összegével.";
    }
    if (step.mode === "classify-sides") {
        return "Egyenlő oldalú, ha mindhárom oldal egyforma; egyenlőszárú, ha kettő egyforma; általános, ha mind különböző.";
    }
    if (step.mode === "max-side") {
        return `A harmadik oldal rövidebb kell legyen, mint a másik kettő összege (${step.a} + ${step.b}), de a legnagyobb egész szám, ami még megfelel, az ${step.a + step.b} − 1.`;
    }
    if (step.mode === "min-side") {
        return `A harmadik oldalnak nagyobbnak kell lennie, mint a két ismert oldal különbsége (${Math.abs(step.a - step.b)}), ezért a legkisebb egész szám, ami megfelel, az ${Math.abs(step.a - step.b)} + 1.`;
    }
    return "Három szakaszból akkor szerkeszthető háromszög, ha a két rövidebb összege nagyobb, mint a leghosszabb.";
}

export function renderTriangle(step, root, next, progress, onResult, onAttempt) {

    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = TITLES[world] ?? TITLES.postman;
    card.append(title);

    if (step.mode === "angle-sum") {
        const figure = document.createElement("div");
        figure.className = "tri-figure";
        figure.append(createTriangleSvg(step));
        card.append(figure);
    }

    const question = document.createElement("p");
    question.className = "tri-question";
    question.textContent = step.question;
    card.append(question);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "tri-options";

    step.options.forEach(option => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tri-option";
        btn.dataset.correct = option.correct ? "1" : "0";
        btn.textContent = option.text;
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
        if (step.mode === "angle-sum") {
            return `😊 Ügyes! 180° − ${step.a}° − ${step.b}° = ${step.answer}°.`;
        }
        if (step.mode === "angle-type") {
            return `😊 Ügyes! A szögek összege 180°, és ez a háromszög ${step.answer.toLowerCase()}.`;
        }
        if (step.mode === "iso-base") {
            return `😊 Ügyes! 180° − ${step.apex}° = ${180 - step.apex}°, ennek a fele ${step.answer}°, tehát a két alapszög ${step.answer}° és ${step.answer}°.`;
        }
        if (step.mode === "exterior") {
            return `😊 Ügyes! A külső szög a két nem mellette fekvő belső szög összege: ${step.a}° + ${step.b}° = ${step.answer}°.`;
        }
        if (step.mode === "classify-sides") {
            return `😊 Ügyes! Ez a háromszög ${step.answer.toLowerCase()}.`;
        }
        if (step.mode === "max-side") {
            return `😊 Ügyes! ${step.a} + ${step.b} = ${step.a + step.b}, de a háromszög csak akkor zárul be, ha a harmadik oldal kisebb ennél, így a legnagyobb egész érték ${step.answer} cm.`;
        }
        if (step.mode === "min-side") {
            return `😊 Ügyes! A harmadik oldalnak nagyobbnak kell lennie, mint ${Math.abs(step.a - step.b)} cm, ezért a legkisebb egész érték ${step.answer} cm.`;
        }
        const sorted = [step.a, step.b, step.c].sort((x, y) => x - y);
        if (step.answer) {
            return `😊 Ügyes! ${sorted[0]} + ${sorted[1]} > ${sorted[2]}, ezért megszerkeszthető.`;
        }
        return `😊 Ügyes! ${sorted[0]} + ${sorted[1]} ≤ ${sorted[2]}, ezért nem szerkeszthető.`;
    }

    optionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".tri-option");
        if (!btn || feedback.isAnswered()) return;

        const ok = btn.dataset.correct === "1";

        if (ok) markCorrect(btn);

        if (ok) {
            optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
            feedback.success(successText());
        } else {
            feedback.retry();
            maybeShowHint();
        }
    });
}
