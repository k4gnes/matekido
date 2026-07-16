export function renderComparison(step, root, next, progress) {

    let answered = false;

    root.replaceChildren();

    const card = document.createElement("div");
    card.className = "card";

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

        const btn = document.createElement("button");
        btn.className = "comparison-op";
        btn.textContent = op;

        btn.addEventListener("click", () => {

            if (answered) return;

            answered = true;

            if (op === step.operator) {
                message.textContent = "😊 Szép munka!";
                message.className = "message success";
                setTimeout(() => next(), 800);
            } else {
                message.textContent = `🤔 Nem, a helyes válasz: ${step.operator}`;
                message.className = "message retry";
                setTimeout(() => next(), 1500);
            }

        });

        operators.append(btn);
    });

    const right = document.createElement("span");
    right.className = "comparison-side";
    right.textContent = step.rightExpr;

    equation.append(left, operators, right);

    const message = document.createElement("p");
    message.className = "message";

    if (progress) {
        card.append(progress);
    }

    card.append(title, equation, message);

    root.append(card);
}
