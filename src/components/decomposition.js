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

    /*
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
    
        card.append(inputs);*/

    const letters = document.createElement("div");
    letters.className = "decomposition-letters";

    card.append(letters); for (let i = 0; i < step.number; i++) {

        const letter = document.createElement("div");
        letter.className = "letter";
        //letter.innerHTML = `    <span class="letter-icon">✉️</span>`;
        const image = document.createElement("img");
        image.src = "./assets/images/mail.svg";
        image.alt = "Levél";

        letter.append(image);
        letter.classList.add("selected");

        letter.addEventListener("click", () => {

        });


        letters.append(letter);
    }



    const button = document.createElement("button");
    button.textContent = "Ellenőrzöm";

    card.append(button);

    const message = document.createElement("p");
    message.className = "message";

    card.append(message);

    const foundList = document.createElement("ul");
    foundList.className = "decomposition-found";

    card.append(foundList);

    button.addEventListener("click", () => {

        const first = Number(firstInput.value);
        const second = Number(secondInput.value);



        if (first + second === step.number) {

            foundPairs.push({
                first,
                second
            });
            message.textContent = "✅ Ügyes vagy!";

            const item = document.createElement("li");
            item.textContent = `${first} + ${second}`;

            foundList.append(item);

        } else {

            message.textContent = "🙂 Ez most nem jó. Próbáld újra!";

        }

    });

    root.append(card);

    firstInput.focus();

}