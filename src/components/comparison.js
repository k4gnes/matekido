import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";

export function renderComparison(step, root, next, progress) {

    let answered = false;

    root.replaceChildren();

    const card = createCard();

    const title = document.createElement("h1");
    title.textContent = "⚖️ Melyik a nagyobb?";

    const equation = document.createElement("div");
    equation.className = "comparison-equation";

    const left = document.createElement("span");
    left.className = "comparison-side";
    left.textContent = step.leftExpr;

    const operators = document.createElement("div");
    operators.className = "comparison-operators";

    const message = createMessageBox();

    ["<", "=", ">"].forEach(op => {

        const btn = createButton(op, {
            className: "comparison-op",
            onClick: () => {
                if (answered) return;

                answered = true;

                if (op === step.operator) {
                    message.show("😊 Szép munka!", "success");
                    setTimeout(() => next(), 800);
                } else {
                    message.show(`🤔 Nem, a helyes válasz: ${step.operator}`, "retry");
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

    if (progress) {
        card.append(progress);
    }

    card.append(title, equation, message.element);

    root.append(card);
}
