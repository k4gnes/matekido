import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { createButton } from "./ui/button.js";
import { createHintBox } from "./ui/hintBox.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "🛵 Gyors kézbesítés",
    racing: "🏁 Versenytempó",
    football: "⚽ Meccsre menet",
    cooking: "🍳 Kiszállítás",
    animals: "🦁 Szafarifutam",
    space: "🚀 Űrsebesség",
    tram: "🚋 Villamosjárat"
};

const FAMILY_UNITS = {
    road: { speed: "km/h", time: "óra", distance: "km" },
    pace: { speed: "m/perc", time: "perc", distance: "m" }
};

export function renderSpeedTrip(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = TITLES[getActiveWorld()] ?? "🚗 Sebesség és út";
    card.append(title);

    const units = FAMILY_UNITS[step.family] ?? FAMILY_UNITS.road;

    const contextLine = document.createElement("p");
    contextLine.className = "stt-context";
    contextLine.textContent = step.context;
    card.append(contextLine);

    const prompt = document.createElement("p");
    prompt.className = "stt-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    let input = null;
    let submitButton = null;
    let choiceBox = null;

    if (step.interaction === "input") {
        input = document.createElement("input");
        input.type = "number";
        input.className = "stt-input";
        input.placeholder = "?";
        input.setAttribute("aria-label", step.question);
        card.append(input);

        submitButton = createButton("Ellenőrzöm", { onClick: submitAnswer });
        card.append(submitButton);
    } else {
        choiceBox = document.createElement("div");
        choiceBox.className = "stt-options";

        step.options.forEach(value => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "stt-option";
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
        if (step.mode === "distance") {
            return `💡 Az út = sebesség × idő, ezért ${step.speed} × ${step.time} szorzatot kell kiszámolni.`;
        }
        if (step.mode === "time") {
            return `💡 Az idő = út ÷ sebesség, ezért ${step.distance} ÷ ${step.speed} osztást kell elvégezni.`;
        }
        return `💡 A sebesség = út ÷ idő, ezért ${step.distance} ÷ ${step.time} osztást kell elvégezni.`;
    }

    function successText() {
        if (step.mode === "distance") {
            return `🎉 Ügyes! ${step.speed} × ${step.time} = ${step.answer} ${units.distance}`;
        }
        if (step.mode === "time") {
            return `🎉 Ügyes! ${step.distance} ÷ ${step.speed} = ${step.answer} ${units.time}`;
        }
        return `🎉 Ügyes! ${step.distance} ÷ ${step.time} = ${step.answer} ${units.speed}`;
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
            const btn = e.target.closest(".stt-option");
            if (!btn || feedback.isAnswered()) return;

            const ok = String(btn.dataset.value) === String(step.answer);
            if (ok) markCorrect(btn);

            checkAnswer(ok);
        }, { signal: ac.signal });
    }

    return () => ac.abort();
}
