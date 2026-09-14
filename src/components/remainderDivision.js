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

export function renderRemainderDivision(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();
    const world = getActiveWorld();
    const w = WORLD[world] ?? WORLD.postman;

    const title = document.createElement("h1");
    title.textContent = step.mode === "groups"
        ? `${w.emoji} Hány teljes csoport?`
        : `${w.emoji} Osztás maradékkal`;

    const useChoice = step.interaction === "choice";

    const children = [];

    if (step.mode === "groups") {
        const visual = document.createElement("div");
        visual.className = "rm-visual";

        const fullGroups = Math.floor((step.a - step.remainder) / step.b);

        for (let g = 0; g < fullGroups; g++) {
            const group = document.createElement("div");
            group.className = "rm-group";
            for (let i = 0; i < step.b; i++) {
                const item = document.createElement("span");
                item.textContent = step.emoji;
                group.append(item);
            }
            visual.append(group);
        }

        if (step.remainder > 0) {
            const leftover = document.createElement("div");
            leftover.className = "rm-group rm-leftover";
            for (let i = 0; i < step.remainder; i++) {
                const item = document.createElement("span");
                item.textContent = step.emoji;
                leftover.append(item);
            }
            visual.append(leftover);
        }

        children.push(visual);

        const groupsPrompt = document.createElement("p");
        groupsPrompt.className = "rm-prompt rm-prompt-bottom";
        groupsPrompt.textContent = "Hány teljes csoportot látsz, és hány darab maradt ki?";
        children.push(groupsPrompt);
    }

    const expression = document.createElement("div");
    expression.className = "rm-expression";

    const aSpan = document.createElement("span");
    aSpan.textContent = step.a;

    const divSpan = document.createElement("span");
    divSpan.textContent = "÷";

    const bSpan = document.createElement("span");
    bSpan.textContent = `${step.b} =`;

    expression.append(aSpan, divSpan, bSpan);
    children.push(expression);

    if (useChoice) {
        const resultEl = document.createElement("span");
        resultEl.className = "rm-result";
        resultEl.textContent = "?";
        expression.append(resultEl);

        const choiceHint = document.createElement("p");
        choiceHint.className = "rm-choice-hint";
        children.push(choiceHint);

        const qOptions = document.createElement("div");
        qOptions.className = "rm-row";
        const qLabel = document.createElement("div");
        qLabel.className = "rm-row-label";
        qLabel.textContent = "Hányados (hányszor fér bele):";
        qOptions.append(qLabel);

        step.quotientOptions.forEach((option) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "rm-option";
            btn.textContent = option;
            btn.dataset.value = option;
            qOptions.append(btn);
        });

        const rOptions = document.createElement("div");
        rOptions.className = "rm-row";
        const rLabel = document.createElement("div");
        rLabel.className = "rm-row-label";
        rLabel.textContent = "Maradék (ami kimarad):";
        rOptions.append(rLabel);

        step.remainderOptions.forEach((option) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "rm-option";
            btn.textContent = option;
            btn.dataset.value = option;
            rOptions.append(btn);
        });

        children.push(qOptions, rOptions);
        rOptions.style.display = "none";

        qOptions.addEventListener("click", (e) => {
            const btn = e.target.closest(".rm-option");
            if (!btn || qSolved) return;

            if (Number(btn.dataset.value) === step.quotient) {
                markCorrect(btn);
                qOptions.querySelectorAll("button").forEach(b => b.disabled = true);
                qSolved = true;
                resultEl.textContent = `${step.quotient}`;
                rOptions.style.display = "";
                rOptions.classList.add("rm-row-appear");
                checkChoiceDone();
            } else {
                feedback.retry();

                if (feedback.getMistakes() >= 2 && !hintShown) {
                    hintButton.style.display = "inline-block";
                }
            }
        });

        rOptions.addEventListener("click", (e) => {
            const btn = e.target.closest(".rm-option");
            if (!btn || rSolved) return;

            if (Number(btn.dataset.value) === step.remainder) {
                markCorrect(btn);
                rOptions.querySelectorAll("button").forEach(b => b.disabled = true);
                rSolved = true;
                resultEl.textContent = `${step.quotient}, maradék ${step.remainder}`;
                feedback.success();
            } else {
                feedback.retry();

                if (feedback.getMistakes() >= 2 && !hintShown) {
                    hintButton.style.display = "inline-block";
                }
            }
        });

        let qSolved = false;
        let rSolved = false;

        function checkChoiceDone() {
            const what = qSolved ? "a maradékot" : "a hányadost";
            choiceHint.textContent = `Keressük meg ${what}!`;
        }

        choiceHint.textContent = "Kattints a helyes hányadosra!";
    } else {
        const qInput = document.createElement("input");
        qInput.type = "number";
        qInput.min = "0";
        qInput.className = "rm-input";
        qInput.placeholder = "?";

        const inputResult = document.createElement("span");
        inputResult.className = "rm-result";
        inputResult.textContent = " , maradék";

        expression.append(qInput, inputResult);

        const rInput = document.createElement("input");
        rInput.type = "number";
        rInput.min = "0";
        rInput.className = "rm-input rm-input-remainder";
        rInput.placeholder = "?";
        expression.append(rInput);

        const button = createButton("Ellenőrzöm", { className: "nav-bar-btn" });
        children.push(button);

        function check() {
            if (feedback.isAnswered()) return;

            const q = Number(qInput.value);
            const r = Number(rInput.value);

            if (isNaN(q) || isNaN(r) || qInput.value.trim() === "" || rInput.value.trim() === "") {
                return;
            }

            if (q === step.quotient && r === step.remainder) {
                qInput.disabled = true;
                rInput.disabled = true;
                button.disabled = true;
                feedback.success();
            } else {
                feedback.retry();

                if (feedback.getMistakes() >= 2 && !hintShown) {
                    hintButton.style.display = "inline-block";
                }

                qInput.focus();
                qInput.select();
            }
        }

        button.addEventListener("click", check);
        qInput.addEventListener("input", () => {
            if (qInput.value.length > 0) {
                requestAnimationFrame(() => rInput.focus());
            }
        }, { signal: ac.signal });
        qInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                rInput.focus();
            }
        }, { signal: ac.signal });
        rInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") check();
        }, { signal: ac.signal });

        requestAnimationFrame(() => qInput.focus());
    }

    const hint = createHintBox();

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.textContent = `Próbáld meg, hányszor fér bele a ${step.b} a ${step.a}-ba! Ami nem fér, az a maradék.`;
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    let hintShown = false;

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
}