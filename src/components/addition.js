export function renderAddition(step, root, next) {

    root.replaceChildren();

    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h1");
    title.textContent = step.title;

    const text = document.createElement("p");
    text.textContent = `${step.a} + ${step.b} =`;

    const input = document.createElement("input");
    input.type = "number";
    input.placeholder = "?";
    input.autofocus = true;

    const button = document.createElement("button");
    button.textContent = "Ellenőrzöm";

    card.append(title, text, input, button);

    root.append(card);

    button.addEventListener("click", () => {

    const answer = Number(input.value);
    const correctAnswer = step.a + step.b;

    console.log("Beírt:", answer);
    console.log("Helyes:", correctAnswer);

    
    if (answer === correctAnswer) {
        next();
    } else {
        alert("Próbáld meg még egyszer! 😊");
    }
});
}