import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createCountRow } from "./ui/countRow.js";
import { createExercise } from "./ui/exerciseShell.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";
import { makeOptions } from "./ui/optionHelper.js";

const WORLD = {
    postman: { title: "📮 Hány levél van a rakományokban?", thousands: "🚚", hundreds: "🧺", tens: "📦", ones: "✉️" },
    racing: { title: "🏎️ Hány alkatrész kell a pályára?", thousands: "🏁", hundreds: "🏎️", tens: "⚙️", ones: "🔧" },
    football: { title: "⚽ Hány játékos van a bajnokságban?", thousands: "🏆", hundreds: "⚽", tens: "👨‍🏫", ones: "🏃" },
    cooking: { title: "🍳 Hány hozzávaló kell a nagy ebédhez?", thousands: "🥘", hundreds: "🍲", tens: "🍳", ones: "🥄" },
    animals: { title: "🦁 Hány állat van a füves pusztán?", thousands: "🦛", hundreds: "🦒", tens: "🦁", ones: "🐘" },
    space: { title: "🤖 Hány robotot küld az űrflotta?", thousands: "🛸", hundreds: "🚀", tens: "🛰️", ones: "🤖" },
    tram: { title: "🚋 Hány utast küld a villamosflotta?", thousands: "🚋", hundreds: "🚉", tens: "🚋", ones: "🚶" }
};

const PLACES = [
    { key: "millions", label: "millió" },
    { key: "hundredThousands", label: "százezer" },
    { key: "tenThousands", label: "tízezer" },
    { key: "thousands", label: "ezres" },
    { key: "hundreds", label: "százas" },
    { key: "tens", label: "tízes" },
    { key: "ones", label: "egyes" }
];

function activePlaces(number) {
    const first = PLACES.length - String(number).length;
    return PLACES.slice(Math.max(first, 0));
}

function nextPlaceUp(key) {
    const index = PLACES.findIndex(place => place.key === key);
    return index > 0 ? PLACES[index - 1] : null;
}

function partPlaces(keys) {
    return keys.map(key => PLACES.find(place => place.key === key)).filter(Boolean);
}

function magnitudeBounds(answer) {
    const digits = String(answer).length;
    if (digits <= 3) return [0, 999];
    return [Math.pow(10, digits - 1), Math.pow(10, digits) - 1];
}

function placeValueTable(places, step) {
    const table = document.createElement("table");
    table.style.cssText = "margin:0.5rem auto;border-collapse:separate;border-spacing:0.3rem;table-layout:fixed;";

    const head = document.createElement("tr");
    const body = document.createElement("tr");

    for (const place of places) {
        const th = document.createElement("th");
        th.style.cssText = "font-size:0.85rem;font-weight:600;color:var(--text-soft, #6b7280);padding:0.2rem 0.3rem;";
        th.textContent = place.label;

        const td = document.createElement("td");
        td.style.cssText = "font-size:2rem;font-weight:700;min-width:2.6rem;padding:0.3rem 0.4rem;text-align:center;background:var(--card-bg,#fff);border:1px solid var(--line,#e5e7eb);border-radius:0.5rem;";
        td.textContent = step[place.key];

        head.append(th);
        body.append(td);
    }

    table.append(head, body);
    return table;
}

function numberBoard(text) {
    const box = document.createElement("div");
    box.style.cssText = "font-size:2.2rem;font-weight:700;letter-spacing:0.05em;margin:0.6rem 0;padding:0.4rem 0.9rem;background:var(--card-bg,#fff);border:1px solid var(--line,#e5e7eb);border-radius:0.6rem;";
    box.textContent = text;
    return box;
}

function emojiBoard(places, step, w) {
    const area = document.createElement("div");
    area.style.cssText = "display:flex; flex-wrap:wrap; gap:0.8rem; justify-content:center; margin:0.5rem 0;";

    for (const place of places) {
        const col = document.createElement("div");
        col.style.cssText = "display:flex; flex-direction:column; align-items:center;";
        const lbl = document.createElement("div");
        lbl.style.cssText = "font-size:0.9rem; font-weight:bold; margin-top:0.2rem;";
        lbl.textContent = place.label;
        col.append(createCountRow(w[place.key], step[place.key]), lbl);
        area.append(col);
    }

    return area;
}

export function renderPlaceValueThousands(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();

    const world = getActiveWorld();
    const w = WORLD[world] ?? WORLD.postman;

    const useChoice = step.interaction === "choice";

    const number = step.number ?? step.answer;
    const places = step.parts ? partPlaces(step.parts) : activePlaces(number);
    const isSumTask = step.task !== "value" && step.task !== "digit";
    const hasEmoji = isSumTask && places.length > 0 && places.every(place => w[place.key]);
    const hasTwoDigit = places.some(place => step[place.key] >= 10);

    const title = document.createElement("h1");
    const defaultTitle = step.task === "value" ? "🔢 Mennyit ér a számjegy?"
        : step.task === "digit" ? "🔢 Melyik számjegy van itt?"
        : hasTwoDigit ? "🔢 Mennyi ez összesen?"
        : hasEmoji ? w.title
        : "🔢 Írd le a számot!";
    title.textContent = step.title ?? defaultTitle;

    const leadPlace = hasTwoDigit ? places.find(place => step[place.key] >= 10) : null;

    let board = null;

    if (step.task === "digit") {
        board = numberBoard(step.numberText ?? String(number));
    } else if (step.task === "value") {
        board = placeValueTable(places, step);
    } else if (hasEmoji) {
        board = emojiBoard(places, step, w);
    }

    const equation = document.createElement("div");
    equation.className = "equation";

    let prompt;

    if (step.task === "value") {
        prompt = `A(z) ${step.digit} számjegy a(z) ${step.placeLabel} helyen mennyit ér?`;
    } else if (step.task === "digit") {
        prompt = `Melyik számjegy van a(z) ${step.placeLabel} helyen?`;
    } else {
        prompt = places.map(place => `${step[place.key]} ${place.label}`).join(" + ") + " =";
    }

    const desc = document.createElement("span");
    desc.textContent = prompt;

    let input;
    let optionsContainer;
    let button;

    if (useChoice) {
        equation.append(desc);
        optionsContainer = document.createElement("div");
        optionsContainer.className = "mult-options";

        const [boundMin, boundMax] = magnitudeBounds(step.answer);
        const options = step.options ?? makeOptions(step.answer, boundMin, boundMax);
        options.forEach(value => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "mult-option";
            btn.textContent = value;
            btn.dataset.value = value;
            optionsContainer.append(btn);
        });
    } else {
        input = createNumberInput();
        input.style.width = `${String(step.answer).length + 2}ch`;
        equation.append(desc, input);

        button = createButton("Ellenőrzöm", { className: "nav-bar-btn" });
    }

    const children = [];

    if (leadPlace) {
        const count = step[leadPlace.key];
        const label = leadPlace.label;
        const higher = nextPlaceUp(leadPlace.key);
        let text = `${count} ${label} több, mint 10!`;
        if (higher) {
            text = count < 20
                ? `Tipp: 10 ${label} = 1 ${higher.label}! Írd le, ${count} ${label} hány ${higher.label} és hány ${label}.`
                : `Tipp: 10 ${label} = 1 ${higher.label}!`;
        }
        const note = document.createElement("div");
        note.style.cssText = "text-align:center; font-size:0.95rem; margin:0.2rem 0; color:var(--text-soft, #6b7280);";
        note.textContent = text;
        children.push(note);
    }

    if (board) children.push(board);
    children.push(equation);
    if (optionsContainer) children.push(optionsContainer);
    if (button) children.push(button);

    const { message, card } = createExercise({
        root, title, progress,
        children
    });

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    function check() {
        if (feedback.isAnswered()) return;

        const answer = Number(input.value);
        if (isNaN(answer)) return;

        if (answer === step.answer) {
            input.disabled = true;
            button.disabled = true;
            feedback.success();
        } else {
            feedback.retry();
            input.focus();
            input.select();
        }
    }

    if (input) {
        requestAnimationFrame(() => {
            input.focus();
        });

        button.addEventListener("click", check);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") check();
        }, { signal: ac.signal });
    }

    if (useChoice && optionsContainer) {
        optionsContainer.addEventListener("click", (e) => {
            const btn = e.target.closest(".mult-option");
            if (!btn || feedback.isAnswered()) return;
            const value = Number(btn.dataset.value);

            if (value === step.answer) {
                markCorrect(btn);
                optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
                feedback.success();
            } else {
                feedback.retry();
            }
        });
    }
}