import { createButton } from "./ui/button.js";
import { createExercise } from "./ui/exercise.js";

export function renderComparison(step, root, next, progress, onResult, onAttempt) {

    let answered = false;

    const title = document.createElement("h1");
    title.textContent = "⚖️ Melyik a nagyobb?";

    const equation = document.createElement("div");
    equation.className = "comparison-equation";

    const left = document.createElement("span");
    left.className = "comparison-side";
    left.textContent = step.leftExpr;

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

    const right = document.createElement("span");
    right.className = "comparison-side";
    right.textContent = step.rightExpr;

    equation.append(left, operators, right);

    const { message } = createExercise({
        root, title, progress,
        children: [equation]
    });
}
