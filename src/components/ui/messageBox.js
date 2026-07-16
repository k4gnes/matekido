export function createMessageBox() {

    const element = document.createElement("p");
    element.className = "message";

    function show(text, state = "") {

        element.textContent = text;
        element.className = state ? `message ${state}` : "message";

    }

    function clear() {

        element.textContent = "";
        element.className = "message";

    }

    return { element, show, clear };

}
