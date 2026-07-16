import { createCard } from "./card.js";
import { createMessageBox } from "./messageBox.js";

export function createExercise({ root, title, progress, children }) {
    root.replaceChildren();

    const card = createCard();
    const message = createMessageBox();

    if (progress) card.append(progress);

    card.append(title);
    children.forEach(child => card.append(child));
    card.append(message.element);

    root.append(card);

    return { message };
}
