export function createCard(title) {

    const card = document.createElement("div");
    card.className = "card";

    const heading = document.createElement("h2");
    heading.className = "card-title";
    heading.textContent = title;

    card.append(heading);

    return card;

}