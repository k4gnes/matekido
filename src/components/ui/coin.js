export function createCoin(value, { size = 48, note = false, onClick = null, className = "" } = {}) {

    const el = document.createElement(onClick ? "button" : "span");
    if (onClick) {
        el.type = "button";
    }

    el.className = "money-coin" + (note ? " money-note" : "") + (className ? ` ${className}` : "");
    el.style.width = (note ? Math.round(size * 1.45) : size) + "px";
    el.style.height = (note ? Math.round(size * 0.55) : size) + "px";
    el.style.fontSize = Math.round(size * 0.34) + "px";
    el.dataset.value = value;

    el.textContent = value;

    if (onClick) {
        el.addEventListener("click", onClick);
    }

    return el;
}
