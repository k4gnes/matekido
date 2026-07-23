import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_DECOMPOSITION = {
    postman: {
        button: "📮 Bélyegzés után postázd!",
        alreadyDone: "🙂 Ezt már kézbesítetted.",
        success: "😊 Ügyes vagy!",
        itemAlt: "Levél",
        imgNormal: "./assets/images/mail.svg",
        imgSelected: "./assets/images/mail-stamped.svg"
    },
    racing: {
        button: "🏁 Rajt!",
        alreadyDone: "🙂 Ezt már teljesítetted.",
        success: "😊 Ügyes vagy!",
        itemAlt: "Gumi",
        imgNormal: null,
        imgSelected: null
    },
    football: {
        button: "⚽ Gól!",
        alreadyDone: "🙂 Ezt már rúgtad.",
        success: "😊 Ügyes vagy!",
        itemAlt: "Labda",
        imgNormal: null,
        imgSelected: null
    },
    cooking: {
        button: "🍳 Tálalás!",
        alreadyDone: "🙂 Ezt már elkészítetted.",
        success: "😊 Ügyes vagy!",
        itemAlt: "Hozzávaló",
        imgNormal: null,
        imgSelected: null
    }
};

const WORLD_EMOJI = {
    postman: { normal: "✉️", selected: "💌" },
    racing: { normal: "🛞", selected: "🏁" },
    football: { normal: "⚽", selected: "🥅" },
    cooking: { normal: "🍲", selected: "🍳" }
};

export function renderDecomposition(step, root, onNext, progress, onResult) {

    root.innerHTML = "";

    const world = getActiveWorld();
    const t = WORLD_DECOMPOSITION[world] ?? WORLD_DECOMPOSITION.postman;
    const emoji = WORLD_EMOJI[world] ?? WORLD_EMOJI.postman;

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

    const mailbox = createButton(t.button, { className: "mailbox" });

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

            result.textContent = t.alreadyDone;

        } else {

            found.add(key);

            result.textContent = `⭐ ${first} + ${second}`;

            renderFoundList();

            if (found.size === number + 1) {
                result.textContent = t.success;
                result.style.color = "#2e7d32";
                letters.forEach(l => {
                    l.selected = false;
                    if (t.imgNormal && l.element._imageEl) {
                        l.element._imageEl.src = t.imgNormal;
                    } else {
                        l.element.textContent = emoji.normal;
                    }
                });
                onResult?.(true);
                setTimeout(() => onNext(), 2500);
            }

        }

        letters.forEach(letter => {

            letter.selected = false;

            if (t.imgNormal && letter.element._imageEl) {
                letter.element._imageEl.src = t.imgNormal;
            } else {
                letter.element.textContent = emoji.normal;
            }

        });

        selectedCount = 0;

    });

    card.append(mailbox);
    card.append(result);
    card.append(foundList);

    for (let i = 0; i < number; i++) {

        const letter = document.createElement("div");
        letter.className = "letter";

        if (t.imgNormal) {
            const image = document.createElement("img");
            image.src = t.imgNormal;
            image.alt = t.itemAlt;
            letter.append(image);
            letter._imageEl = image;
        } else {
            letter.textContent = emoji.normal;
            letter.style.fontSize = "2rem";
            letter.style.cursor = "pointer";
        }

        letter.addEventListener("click", () => {
            const current = letters[i];

            current.selected = !current.selected;

            selectedCount += current.selected ? 1 : -1;

            if (t.imgNormal && letter._imageEl) {
                letter._imageEl.src = current.selected
                    ? t.imgSelected
                    : t.imgNormal;
            } else {
                letter.textContent = current.selected
                    ? emoji.selected
                    : emoji.normal;
            }

        });
        letters.push({
            element: letter,
            selected: false
        });
        lettersContainer.append(letter);
    }

    root.append(card);

}
