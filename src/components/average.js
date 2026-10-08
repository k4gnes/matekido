import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { createButton } from "./ui/button.js";
import { createHintBox } from "./ui/hintBox.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📊 Átlag a postán",
    racing: "🏁 Átlag a boxutcában",
    football: "⚽ Átlag a pályán",
    cooking: "🍳 Átlag a konyhában",
    animals: "🦁 Átlag az állatkertben",
    space: "🚀 Átlag az űrhajón",
    tram: "🚋 Átlag a villamoson"
};

function renderTable(step, card) {
    const table = document.createElement("div");
    table.className = "avg-table";

    step.values.forEach((value, i) => {
        const row = document.createElement("div");
        row.className = "avg-row";

        const label = document.createElement("span");
        label.className = "avg-label";
        label.textContent = step.labels[i];

        const cell = document.createElement("span");
        cell.className = "avg-value";
        if (step.mode === "missing" && i === step.missingIndex) {
            cell.textContent = "?";
            cell.classList.add("missing");
        } else {
            cell.textContent = String(value);
        }

        row.append(label, cell);
        table.append(row);
    });

    if (step.mode === "avg") {
        const row = document.createElement("div");
        row.className = "avg-row avg-total";

        const label = document.createElement("span");
        label.className = "avg-label";
        label.textContent = "Összesen";

        const cell = document.createElement("span");
        cell.className = "avg-value";
        cell.textContent = String(step.values.reduce((s, v) => s + v, 0));

        row.append(label, cell);
        table.append(row);
    }

    card.append(table);
}

function renderChart(step, card) {
    const chart = document.createElement("div");
    chart.className = "avg-chart";

    const knownMax = Math.max(...step.values.filter((_, i) =>
        !(step.mode === "missing" && i === step.missingIndex)));

    step.values.forEach((value, i) => {
        const col = document.createElement("div");
        col.className = "avg-col";

        const isMissing = step.mode === "missing" && i === step.missingIndex;

        if (!isMissing) {
            const number = document.createElement("span");
            number.className = "avg-bar-number";
            number.textContent = String(value);
            col.append(number);
        }

        const bar = document.createElement("div");
        bar.className = "avg-bar";

        if (isMissing) {
            bar.classList.add("missing");
            bar.textContent = "?";
        } else {
            bar.style.height = `${Math.max(12, Math.round(value / knownMax * 110))}px`;
        }

        const label = document.createElement("span");
        label.className = "avg-bar-label";
        label.textContent = step.labels[i];

        col.append(bar, label);
        chart.append(col);
    });

    card.append(chart);
}

export function renderAverage(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = TITLES[getActiveWorld()] ?? "📊 Táblázatok, diagramok, átlag";
    card.append(title);

    const contextLine = document.createElement("p");
    contextLine.className = "avg-context";
    contextLine.textContent = step.context;
    card.append(contextLine);

    const sum = step.values.reduce((s, v) => s + v, 0);
    const size = step.values.length;

    if (step.display === "chart") {
        renderChart(step, card);

        if (step.mode === "avg") {
            const totalLine = document.createElement("div");
            totalLine.className = "avg-total-line";
            totalLine.textContent = `Összesen: ${sum}`;
            card.append(totalLine);
        }
    } else {
        renderTable(step, card);
    }

    const prompt = document.createElement("p");
    prompt.className = "avg-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    let input = null;
    let submitButton = null;
    let choiceBox = null;

    if (step.interaction === "input") {
        input = document.createElement("input");
        input.type = "number";
        input.className = "avg-input";
        input.placeholder = "?";
        input.setAttribute("aria-label", step.question);
        card.append(input);

        submitButton = createButton("Ellenőrzöm", { onClick: submitAnswer });
        card.append(submitButton);
    } else {
        choiceBox = document.createElement("div");
        choiceBox.className = "avg-options";

        step.options.forEach(value => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "avg-option";
            btn.textContent = String(value);
            btn.dataset.value = value;
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

    function hintText() {
        if (step.mode === "missing") {
            return "💡 Az összeg = átlag × adatok száma; a hiányzó érték = összeg − a többi adat összege.";
        }
        return `💡 Az átlag = az adatok összege ÷ az adatok száma, ezért ${sum} ÷ ${size} osztást kell elvégezni.`;
    }

    function successText() {
        if (step.mode === "missing") {
            return `🎉 Ügyes! ${step.avg} × ${size} = ${sum}, ezért a hiányzó érték ${step.answer}`;
        }
        return `🎉 Ügyes! ${sum} ÷ ${size} = ${step.answer}`;
    }

    function checkAnswer(isCorrect) {
        if (feedback.isAnswered()) return;

        if (isCorrect) {
            if (input) {
                input.disabled = true;
                submitButton.disabled = true;
            } else if (choiceBox) {
                choiceBox.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
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

        const value = Number(input.value);
        if (input.value.trim() === "" || isNaN(value)) return;

        checkAnswer(value === step.answer);
    }

    if (input) {
        requestAnimationFrame(() => input.focus());
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") submitAnswer();
        }, { signal: ac.signal });
    } else {
        choiceBox.addEventListener("click", (e) => {
            const btn = e.target.closest(".avg-option");
            if (!btn || feedback.isAnswered()) return;

            const ok = String(btn.dataset.value) === String(step.answer);
            if (ok) markCorrect(btn);

            checkAnswer(ok);
        }, { signal: ac.signal });
    }

    return () => ac.abort();
}
