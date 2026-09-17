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

function addCell(table, value, className) {
    const cell = document.createElement("div");
    if (value !== null && value !== "") {
        cell.textContent = value;
    }
    if (className) {
        cell.className = className;
    }
    table.append(cell);
}

function addEmptyCells(table, count) {
    for (let i = 0; i < count; i++) table.append(document.createElement("div"));
}

export function renderWrittenDivision(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();
    const world = getActiveWorld();
    const w = WORLD[world] ?? WORLD.postman;

    const title = document.createElement("h1");
    title.textContent = `${w.emoji} Írásbeli osztás`;

    const n = digitCount(step.a);

    const table = document.createElement("div");
    table.className = "wo-table";
    table.style.setProperty("--wo-cols", n);
    table.style.setProperty("--wo-rows", 3 * n + 3);

    const line = () => {
        const l = document.createElement("div");
        l.className = "wo-line";
        table.append(l);
    };

    const showNumberRow = (value, endCol, cls) => {
        const k = digitCount(value);
        addEmptyCells(table, endCol + 2 - k);
        for (let i = 0; i < k; i++) {
            addCell(table, Number(String(value)[i]), cls);
        }
        addEmptyCells(table, n - endCol - 1);
    };

    addEmptyCells(table, 1);

    const qInputs = [];
    for (let i = 0; i < n; i++) {
        const input = document.createElement("input");
        input.type = "number";
        input.min = "0";
        input.max = "9";
        input.maxLength = "1";
        input.className = "wo-input";
        table.append(input);
        qInputs.push(input);
    }

    addCell(table, `${step.b} )`, "wd-divisor");
    String(step.a).split("").forEach(d => addCell(table, d, "wo-digit"));

    line();

    for (let i = 0; i < n; i++) {
        const st = step.steps[i];
        if (i === 0) {
            showNumberRow(st.product, i, "wo-digit");
            line();
        } else {
            showNumberRow(st.partial, i, "wo-digit");
            showNumberRow(st.product, i, "wo-digit");
            line();
        }
    }

    const remLabel = document.createElement("div");
    remLabel.className = "wd-remainder-label";
    remLabel.textContent = "maradék:";
    remLabel.style.gridColumn = `1 / ${n + 1}`;
    table.append(remLabel);

    const rInput = document.createElement("input");
    rInput.type = "number";
    rInput.min = "0";
    rInput.max = String(step.b - 1);
    rInput.maxLength = "1";
    rInput.className = "wo-input wd-remainder-input";
    rInput.setAttribute("aria-label", "maradék");
    table.append(rInput);

    const inputs = [...qInputs, rInput];

    const hint = createHintBox();

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.textContent = "Balról jobbra haladj! Nézd meg, hogy az osztó hányszor van meg a részben. Írd be a hányados számjegyét, a kivonásokat mutatja a kép, a végén a maradékot írd be!";
            hintButton.style.display = "none";
            qInputs[0].focus();
        }
    });
    hintButton.style.display = "none";

    let hintShown = false;

    const button = createButton("Ellenőrzöm", { className: "nav-bar-btn" });

    const children = [table, button, hintButton, hint];

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

        const q = qInputs.map(inp => inp.value.trim()).join("");
        const r = rInput.value.trim();

        if (q.length !== n || r === "") return;

        if (Number(q) === step.quotient && Number(r) === step.remainder) {
            inputs.forEach(inp => {
                inp.disabled = true;
                markCorrect(inp);
            });
            feedback.success();
        } else {
            feedback.retry();

            if (feedback.getMistakes() >= 2 && !hintShown) {
                hintButton.style.display = "inline-block";
            }

            const firstEmpty = qInputs.find(inp => inp.value.trim() === "");
            const target = firstEmpty ?? rInput;
            target.focus();
            target.select();
        }
    }

    qInputs.forEach((input, i) => {
        input.addEventListener("input", () => {
            const v = input.value;
            const digits = v.replace(/\D/g, "");
            const last = digits[digits.length - 1];
            if (last !== undefined) {
                input.value = last;
                const next = i + 1 < n ? qInputs[i + 1] : rInput;
                next.focus();
            }
        }, { signal: ac.signal });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                check();
            } else if (e.key === "Backspace") {
                if (input.value === "" && i > 0) {
                    e.preventDefault();
                    qInputs[i - 1].focus();
                    qInputs[i - 1].select();
                }
            }
        }, { signal: ac.signal });
    });

    rInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            check();
        }
    }, { signal: ac.signal });

    button.addEventListener("click", check);

    requestAnimationFrame(() => qInputs[0].focus());
}