import { createButton } from "./ui/button.js";
import { createExercise } from "./ui/exerciseShell.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_EMOJI = {
    postman: "✉️",
    racing: "🔧",
    football: "⚽",
    cooking: "🥄",
    animals: "🦁",
    space: "🤖"
};

function renderEmojiGroup(container, emoji, count) {
    for (let i = 0; i < count; i++) {
        const chip = document.createElement("span");
        chip.className = "comparison-chip";
        chip.textContent = emoji;
        container.append(chip);
    }
}

export function renderComparison(step, root, next, progress, onResult, onAttempt) {

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
    leftEmoji.className = "comparison-emojis";
    if (step.emoji !== false) {
        renderEmojiGroup(leftEmoji, emoji, step.leftValue);
        leftWrap.append(left, leftEmoji);
    } else {
        leftWrap.append(left);
    }

    const operators = document.createElement("div");
    operators.className = "comparison-operators";

    const rightWrap = document.createElement("div");
    rightWrap.style.cssText = "display:flex; flex-direction:column; align-items:center;";
    const right = document.createElement("span");
    right.className = "comparison-side";
    right.textContent = step.rightExpr;
    const rightEmoji = document.createElement("div");
    rightEmoji.className = "comparison-emojis";
    if (step.emoji !== false) {
        renderEmojiGroup(rightEmoji, emoji, step.rightValue);
        rightWrap.append(right, rightEmoji);
    } else {
        rightWrap.append(right);
    }

    equation.append(leftWrap, operators, rightWrap);

    const { message, card } = createExercise({
        root, title, progress,
        children: [equation]
    });

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    ["<", "=", ">"].forEach(op => {

        const btn = createButton(op, {
            className: "comparison-op",
            onClick: () => {
                if (feedback.isAnswered()) return;

                if (op === step.operator) {
                    markCorrect(btn);
                    feedback.success();
                } else {
                    feedback.retry();
                }
            }
        });

        operators.append(btn);
    });
}
