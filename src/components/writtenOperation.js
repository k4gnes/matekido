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

function rightAlignDigits(n, width) {
    const cells = new Array(width).fill(null);
    const s = String(n);
    const start = width - s.length;
    for (let i = 0; i < s.length; i++) {
        cells[start + i] = Number(s[i]);
    }
    return cells;
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

    const OP_LABELS = { add: "Összeadás", sub: "Kivonás", mul: "Szorzás" };
    const OP_SIGNS = { add: "+", sub: "−", mul: "×" };
    const opLabel = OP_LABELS[step.op] ?? "Művelet";
    const opSign = OP_SIGNS[step.op] ?? "+";
    const title = document.createElement("h1");
    title.textContent = `${w.emoji} Írásbeli ${opLabel.toLowerCase()}`;

    const PLACE_NAMES = ["tízezres", "ezres", "százas", "tízes", "egyes"];

    const isMul = step.op === "mul";
    const isMul2 = isMul && step.b >= 10;
    const aLen = digitCount(step.a);
    const bLen = digitCount(step.b);
    const answerDigits = digitCount(step.answer);

    const width = isMul
        ? Math.max(aLen, answerDigits)
        : Math.max(aLen, bLen, answerDigits);

    const extraCols = isMul ? 1 + bLen : 0;
    const cols = width + extraCols;

    const aD = rightAlignDigits(step.a, width);
    const bD = isMul
        ? String(step.b).split("").map(Number)
        : rightAlignDigits(step.b, width);

    const useChoice = step.interaction === "choice" && !isMul2;

    const table = document.createElement("div");
    table.className = "wo-table";
    table.style.setProperty("--wo-cols", cols);
    if (isMul2) table.style.setProperty("--wo-rows", 7);

    const places = PLACE_NAMES.slice(PLACE_NAMES.length - width);

    function addCell(value, className) {
        const cell = document.createElement("div");
        if (value !== null && value !== "") {
            cell.textContent = value;
        }
        if (className) {
            cell.className = className;
        }
        table.append(cell);
    }

    table.append(document.createElement("div"));

    places.forEach(p => addCell(p, "wo-place"));

    for (let i = 0; i < extraCols; i++) {
        table.append(document.createElement("div"));
    }

    table.append(document.createElement("div"));

    aD.forEach(d => addCell(d, d === null ? null : "wo-digit"));

    if (isMul) {
        const sign = document.createElement("div");
        sign.className = "wo-op";
        sign.textContent = opSign;
        table.append(sign);
        bD.forEach(d => addCell(d, "wo-digit"));
    } else {
        const sign = document.createElement("div");
        sign.className = "wo-op";
        sign.textContent = opSign;
        table.append(sign);
        bD.forEach(d => addCell(d, d === null ? null : "wo-digit"));
    }

    const line = document.createElement("div");
    line.className = "wo-line";
    table.append(line);

    const inputs = [];
    let optionsContainer;

    function buildRow(columns, asInputs) {
        const rowInputs = [];
        table.append(document.createElement("div"));
        columns.forEach(d => {
            if (d === null) {
                table.append(document.createElement("div"));
            } else if (asInputs) {
                const input = document.createElement("input");
                input.type = "number";
                input.min = "0";
                input.max = "9";
                input.maxLength = "1";
                input.className = "wo-input";
                table.append(input);
                rowInputs.push(input);
            } else {
                const cell = document.createElement("div");
                cell.className = "wo-digit";
                cell.textContent = d;
                table.append(cell);
            }
        });
        for (let i = 0; i < extraCols; i++) {
            table.append(document.createElement("div"));
        }
        return rowInputs;
    }

    const inputGroups = [];

    if (useChoice) {
        optionsContainer = document.createElement("div");
        optionsContainer.className = "mult-options";

        const choiceMin = width <= 1 ? 0 : Math.pow(10, width - 1);
        const choiceMax = Math.pow(10, width) - 1;
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
        if (isMul2) {
            const onesCols = rightAlignDigits(step.onesPart, width);
            const tensCols = [...rightAlignDigits(step.tensPart, width - 1), null];
            const ansCols = padDigits(step.answer, width);
            inputGroups.push(buildRow(onesCols, true));
            inputGroups.push(buildRow(tensCols, true));
            const line2 = document.createElement("div");
            line2.className = "wo-line";
            table.append(line2);
            inputGroups.push(buildRow(ansCols, true));
        } else {
            inputGroups.push(buildRow(padDigits(step.answer, width), true));
        }
    }

    inputs.push(...inputGroups.flat());

    inputGroups.forEach((group, gi) => {
        group.forEach((input, pi) => {
            input.dataset.gi = gi;
            input.dataset.pi = pi;
        });
    });

    const hint = createHintBox();

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.textContent = step.op === "sub"
                ? "Egyesektől haladj balra! Ha egy oszlopban nem elég a felső szám, kérj kölcsön egyet a tőle balra lévő oszlopból, és a maradékot számold ki azzal!"
                : step.op === "mul" && isMul2
                    ? "Először a szorzó egyeseivel szorozd meg a felső számot! Ezután a szorzó tízesével is szorozd meg, és az eredményt írd egy jeggyel balra! Végül add össze a két részt!"
                    : step.op === "mul"
                        ? "Egyesektől haladj balra! Szorozd meg a szorzóval a felső szám minden számjegyét, és ha 10 vagy több a szorzat, vidd tovább a tízeseket balra!"
                        : "Egyesektől haladj balra! Ha egy oszlopban az összeg 10 vagy több, írd le az egyesét, a többit pedig vidd tovább a balra lévő oszlopba!";
            hintButton.style.display = "none";
            if (!useChoice && inputs.length > 0) {
                const target = isMul2 ? inputGroups[0][inputGroups[0].length - 1] : inputs[inputs.length - 1];
                target.focus();
            }
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

        const correct = isMul2
            ? inputGroups.map(group =>
                group.map(input => input.value.trim()).join("")
            ).join("") === `${step.onesPart}${step.tensPart}${step.answer}`
            : values.reduce((acc, v) => acc * 10 + v, 0) === step.answer;

        if (correct) {
            inputs.forEach(input => {
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
            input.addEventListener("input", () => {
                const v = input.value;
                const digits = v.replace(/\D/g, "");
                const last = digits[digits.length - 1];
                if (last !== undefined) {
                    input.value = last;
                    const gi = Number(input.dataset.gi);
                    const pi = Number(input.dataset.pi);
                    if (pi === 0) {
                        const next = inputGroups[gi + 1];
                        if (next) next[next.length - 1].focus();
                    } else {
                        const prev = inputs[i - 1];
                        if (prev) prev.focus();
                    }
                }
            }, { signal: ac.signal });

            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    check();
                } else if (e.key === "Backspace") {
                    if (input.value === "") {
                        const gi = Number(input.dataset.gi);
                        const pi = Number(input.dataset.pi);
                        const sg = inputGroups[gi];
                        if (pi === sg.length - 1) {
                            const prevGroup = inputGroups[gi - 1];
                            if (prevGroup) prevGroup[0].focus();
                        } else {
                            const neighbor = inputs[i + 1];
                            if (neighbor) {
                                neighbor.focus();
                                neighbor.select();
                            }
                        }
                    }
                }
            }, { signal: ac.signal });
        });

        const initial = isMul2 ? inputGroups[0][inputGroups[0].length - 1] : inputs[inputs.length - 1];
        requestAnimationFrame(() => initial.focus());
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