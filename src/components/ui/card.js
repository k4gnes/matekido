export function createCard(className = "") {

    const card = document.createElement("div");
    card.className = className ? `card ${className}` : "card";

    return card;

}
