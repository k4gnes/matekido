export function renderAddition(step, root, next) {
    root.replaceChildren();
    const card=document.createElement("div");
    card.className="card";
    const title=document.createElement("h1");
    title.textContent=step.title;
    const equation=document.createElement("div");
    equation.className="equation";
    const first=document.createElement("span"); first.textContent=step.a;
    const plus=document.createElement("span"); plus.textContent="+";
    const second=document.createElement("span"); second.textContent=step.b;
    const equal=document.createElement("span"); equal.textContent="=";
    const input=document.createElement("input");
    input.type="number"; input.placeholder="?"; input.autofocus=true;
    equation.append(first,plus,second,equal,input);
    const button=document.createElement("button");
    button.textContent="Ellenőrzöm";
 
    root.append(card);
    const message = document.createElement("p");
    message.className = "message";

    
    card.append(title, equation, button, message);
    button.addEventListener("click",()=>{
        const answer=Number(input.value);
        const correctAnswer=step.a+step.b;

        if (answer === correctAnswer) {

    message.textContent = "😊 Szép munka!";
    message.className = "message success";

    setTimeout(() => next(), 800);

} else {

    message.textContent = "💡 Próbáld meg még egyszer!";
    message.className = "message error";

    input.focus();
    input.select();
}
    });
}
