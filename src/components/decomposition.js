export function renderDecomposition(step, root, onNext, progress) {

    root.innerHTML = "";

    const foundPairs = [];

    const card = document.createElement("div");
    card.className = "card";

    if (progress) {
        card.append(progress);
    }

    const titleElement = document.createElement("h1");
    titleElement.textContent = step.title;

    const numberElement = document.createElement("div");
    numberElement.className = "decomposition-number";
    numberElement.textContent = step.number;

    card.append(titleElement);
    card.append(numberElement);


    const inputs = document.createElement("div");
    inputs.className = "decomposition-inputs";

    const firstInput = document.createElement("input");
    firstInput.type = "number";
    firstInput.min = 0;

    const plus = document.createElement("span");
    plus.textContent = "+";

    const secondInput = document.createElement("input");
    secondInput.type = "number";
    secondInput.min = 0;

    inputs.append(firstInput, plus, secondInput);

    card.append(inputs);

    const button = document.createElement("button");
    button.textContent = "Ellenőrzöm";

    card.append(button);

    const message = document.createElement("p");
    message.className = "message";

    card.append(message);

    button.addEventListener("click", () => {

        const first = Number(firstInput.value);
        const second = Number(secondInput.value);

        if (first + second === step.number) {

            message.textContent = "✅ Ügyes vagy!";

            setTimeout(() => {
                onNext();
            }, 600);

        } else {

            message.textContent = "🙂 Ez most nem jó. Próbáld újra!";

        }

    });

    root.append(card);

    firstInput.focus();

}