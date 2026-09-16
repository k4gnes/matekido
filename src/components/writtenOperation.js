import { createButton } from "./ui/button.js";
import { createExercise } from "./ui/exerciseShell.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { createHintBox } from "./ui/hintBox.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD = {
    postman: { emoji: "📮" },
    racing: { emoji: "🏎️" },
    football: { emoji: "⚽" },
    cooking: { emoji: "🍳" },
    animals: { emoji: "🦁" },
    space: { emoji: "🤖" }
};

function digitCount(n) {
    return String(n).length;
}

function padDigits(n, width) {
    const arr = [];
    for (let d = width - 1; d >= 0; d--) {
        arr.push(Math.floor(n / Math.pow(10, d)) % 10);
    }
    return arr;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function makeWrittenOptions(answer, min, max, count = 4) {
    const ones = answer % 10;
    const options = [answer];
    const seen = new Set([answer]);
    const deltas = [10, -10, 20, -20, 30, -30, 100, -100];
    for (const d of deltas) {
        if (options.length >= count) break;
        const v = answer + d;
        if (v >= min && v <= max && v % 10 === ones && !seen.has(v)) {
            seen.add(v);
            options.push(v);
        }
    }
    for (let v = min; v <= max && options.length < count; v++) {
        if (v % 10 === ones && !seen.has(v)) {
            seen.add(v);
            options.push(v);
        }
    }
    return shuffle(options);
}

export function renderWrittenOperation(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();
    const world = getActiveWorld();
    const w = WORLD[world] ?? WORLD.postman;

    const opLabel = step.op === "sub" ? "Kivonás" : "Összeadás";
    const title = document.createElement("h1");
    title.textContent = `${w.emoji} Írásbeli ${opLabel.toLowerCase()}`;

    const PLACE_NAMES = ["tízezres", "ezres", "százas", "tízes", "egyes"];

    const width = Math.max(digitCount(step.a), digitCount(step.b), digitCount(step.answer));
    const aD = padDigits(step.a, width);
    const bD = padDigits(step.b, width);
    const correctD = padDigits(step.answer, width);

    const useChoice = step.interaction === "choice";

    const table = document.createElement("div");
    table.className = "wo-table";
    table.style.setProperty("--wo-cols", width);

    const places = PLACE_NAMES.slice(PLACE_NAMES.length - width);

    table.append(document.createElement("div"));

    places.forEach(p => {
        const cell = document.createElement("div");
        cell.className = "wo-place";
        cell.textContent = p;
        table.append(cell);
    });

    table.append(document.createElement("div"));

    aD.forEach(d => {
        const cell = document.createElement("div");
        cell.className = "wo-digit";
        cell.textContent = d;
        table.append(cell);
    });

    const sign = document.createElement("div");
    sign.className = "wo-op";
    sign.textContent = step.op === "sub" ? "−" : "+";

    table.append(sign);

    bD.forEach(d => {
        const cell = document.createElement("div");
        cell.className = "wo-digit";
        cell.textContent = d;
        table.append(cell);
    });

    const line = document.createElement("div");
    line.className = "wo-line";
    table.append(line);

    const inputs = [];
    let optionsContainer;

    if (useChoice) {
        optionsContainer = document.createElement("div");
        optionsContainer.className = "mult-options";

        const choiceMin = step.answer >= 1000 ? 1000 : 100;
        const choiceMax = step.answer >= 1000 ? 9999 : 999;
        const options = makeWrittenOptions(step.answer, choiceMin, choiceMax);
        options.forEach(value => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "mult-option";
            btn.textContent = value;
            btn.dataset.value = value;
            optionsContainer.append(btn);
        });
    } else {
        table.append(document.createElement("div"));

        correctD.forEach(() => {
            const input = document.createElement("input");
            input.type = "number";
            input.min = "0";
            input.max = "9";
            input.maxLength = "1";
            input.className = "wo-input";
            table.append(input);
            inputs.push(input);
        });
    }

    const hint = createHintBox();

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.textContent = step.op === "sub"
                ? "Egyesektől balra haladj! Ha nem elég a tízes, kérj kölcsön a százasoktól!"
                : "Egyesektől balra haladj! Amikor 10 fölé visz, írd le az egyest, és vidd tovább a tízesátlépést!";
            hintButton.style.display = "none";
            if (!useChoice && inputs.length > 0) inputs[inputs.length - 1].focus();
        }
    });
    hintButton.style.display = "none";

    let hintShown = false;

    const button = useChoice ? null : createButton("Ellenőrzöm", { className: "nav-bar-btn" });

    const children = [table];
    if (optionsContainer) children.push(optionsContainer);
    if (button) children.push(button);
    children.push(hintButton, hint);

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

        const values = inputs.map(input => {
            const v = input.value.trim();
            return v === "" ? null : Number(v);
        });

        if (values.some(v => v === null || isNaN(v) || v < 0 || v > 9)) return;

        const guess = values.reduce((acc, v) => acc * 10 + v, 0);

        if (guess === step.answer) {
            inputs.forEach((input, i) => {
                input.value = correctD[i];
                input.disabled = true;
                markCorrect(input);
            });
            feedback.success();
        } else {
            feedback.retry();

            if (feedback.getMistakes() >= 2 && !hintShown) {
                hintButton.style.display = "inline-block";
            }

            const firstEmpty = [...inputs].reverse().find(input => input.value.trim() === "");
            const target = firstEmpty ?? inputs[inputs.length - 1];
            target.focus();
            target.select();
        }
    }

    if (inputs.length > 0) {
        inputs.forEach((input, i) => {
            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    check();
                } else if (e.key >= "0" && e.key <= "9" && input.value === "") {
                    requestAnimationFrame(() => {
                        const prevInput = inputs[i - 1];
                        if (prevInput) prevInput.focus();
                    });
                }
            }, { signal: ac.signal });
        });

        requestAnimationFrame(() => inputs[inputs.length - 1].focus());
    }

    if (button) {
        button.addEventListener("click", check);
    }

    if (optionsContainer) {
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

                if (feedback.getMistakes() >= 2 && !hintShown) {
                    hintButton.style.display = "inline-block";
                }
            }
        });
    }
}