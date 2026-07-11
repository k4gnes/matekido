export function renderHint(root, text) {

    root.innerHTML = "";

    const hint = document.createElement("div");
    hint.className = "hint";

    hint.textContent = text;

    root.append(hint);

}