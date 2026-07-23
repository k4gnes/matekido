import { createButton } from "./ui/button.js";
import { createExercise } from "./ui/exercise.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_EMOJI = {
    postman: "✉️",
    racing: "🔧",
    football: "⚽",
    cooking: "🥄"
};

function renderEmojiGroup(container, emoji, count) {
    if (count <= 10) {
        container.textContent = emoji.repeat(count);
        return;
    }
    const fullGroups = Math.floor(count / 10);
    const remainder = count % 10;
    for (let i = 0; i < fullGroups; i++) {
        const group = document.createElement("div");
        group.textContent = emoji.repeat(10);
        container.append(group);
    }
    if (remainder > 0) {
        const group = document.createElement("div");
        group.textContent = emoji.repeat(remainder);
        container.append(group);
    }
}

export function renderComparison(step, root, next, progress, onResult, onAttempt) {

    let answered = false;

    const world = getActiveWorld();
    const emoji = WORLD_EMOJI[world] ?? "🍎";

    const title = document.createElement("h1");
    title.textContent = "⚖️ Melyik a nagyobb?";

    const equation = document.createElement("div");
    equation.className = "comparison-equation";

    const leftWrap = document.createElement("div");
    leftWrap.style.cssText = "display:flex; flex-direction:column; align-items:center;";
    const left = document.createElement("span");
    left.className = "comparison-side";
    left.textContent = step.leftExpr;
    const leftEmoji = document.createElement("div");
    leftEmoji.style.cssText = "font-size:1.2rem; line-height:1.4; margin-top:0.3rem;";
    renderEmojiGroup(leftEmoji, emoji, step.leftValue);
    leftWrap.append(left, leftEmoji);

    const operators = document.createElement("div");
    operators.className = "comparison-operators";

    ["<", "=", ">"].forEach(op => {

        const btn = createButton(op, {
            className: "comparison-op",
            onClick: () => {
                if (answered) return;

                answered = true;
                onAttempt?.();

                if (op === step.operator) {
                    message.show("😊 Szép munka!", "success");
                    onResult?.(true);
                    setTimeout(() => next(), 800);
                } else {
                    message.show(`🤔 Nem, a helyes válasz: ${step.operator}`, "retry");
                    onResult?.(false);
                    setTimeout(() => next(), 1500);
                }
            }
        });

        operators.append(btn);
    });

    const rightWrap = document.createElement("div");
    rightWrap.style.cssText = "display:flex; flex-direction:column; align-items:center;";
    const right = document.createElement("span");
    right.className = "comparison-side";
    right.textContent = step.rightExpr;
    const rightEmoji = document.createElement("div");
    rightEmoji.style.cssText = "font-size:1.2rem; line-height:1.4; margin-top:0.3rem;";
    renderEmojiGroup(rightEmoji, emoji, step.rightValue);
    rightWrap.append(right, rightEmoji);

    equation.append(leftWrap, operators, rightWrap);

    const { message } = createExercise({
        root, title, progress,
        children: [equation]
    });
}
