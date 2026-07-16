import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";

export function renderDecomposition(step, root, onNext, progress) {

    root.innerHTML = "";

    const number = Math.floor(Math.random() * 10) + 1;

    let selectedCount = 0;
    const found = new Set();
    const letters = [];
    const foundPairs = [];

    const card = createCard("decomposition-card");

    if (progress) {
        card.append(progress);
    }

    const titleElement = document.createElement("h1");
    titleElement.textContent = `🧩 Bontsd fel a ${number} számot összegekre!`;

    const numberElement = document.createElement("div");
    numberElement.className = "decomposition-number";
    numberElement.textContent = number;

    card.append(titleElement);
    card.append(numberElement);

    const lettersContainer = document.createElement("div");
    lettersContainer.className = "decomposition-letters";

    card.append(lettersContainer);

    const mailbox = createButton("📮 Bélyegzés után postázd!", { className: "mailbox" });

    const result = document.createElement("div");
    result.className = "decomposition-result";

    const foundList = document.createElement("div");
    foundList.className = "found-list";

    function renderFoundList() {

        foundList.replaceChildren();

        for (let first = 0; first <= number; first++) {

            const second = number - first;

            const key = `${first}-${second}`;

            if (!found.has(key)) continue;

            const row = document.createElement("div");
            row.className = "found-row";

            row.textContent = `✅ ${first} + ${second}`;

            foundList.append(row);

        }

    }
    renderFoundList();

    mailbox.addEventListener("click", () => {

        const first = selectedCount;
        const second = number - selectedCount;

        const key = `${first}-${second}`;

        if (found.has(key)) {

            result.textContent = "🙂 Ezt már kézbesítetted.";

        } else {

            found.add(key);

            result.textContent = `⭐ ${first} + ${second}`;

            renderFoundList();

            if (found.size === number + 1) {
                result.textContent = "😊 Ügyes vagy!";
                result.style.color = "#2e7d32";
                setTimeout(() => onNext(), 2500);
            }

        }

        letters.forEach(letter => {

            letter.selected = false;

            letter.image.src = "./assets/images/mail.svg";

        });

        selectedCount = 0;

    });

    card.append(mailbox);
    card.append(result);
    card.append(foundList);

    for (let i = 0; i < number; i++) {

        const letter = document.createElement("div");
        letter.className = "letter";
        const image = document.createElement("img");
        image.src = "./assets/images/mail.svg";
        image.alt = "Levél";

        letter.append(image);

        letter.addEventListener("click", () => {
            const current = letters[i];

            current.selected = !current.selected;

            selectedCount += current.selected ? 1 : -1;

            current.image.src = current.selected
                ? "./assets/images/mail-stamped.svg"
                : "./assets/images/mail.svg";

        });
        letters.push({
            element: letter,
            image,
            selected: false
        });
        lettersContainer.append(letter);
    }

    root.append(card);

}
