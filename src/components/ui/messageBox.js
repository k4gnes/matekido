export function createMessageBox() {

    const element = document.createElement("p");
    element.className = "message";
    element.setAttribute("aria-live", "polite");

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
