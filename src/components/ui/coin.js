export function createCoin(value, { size = 48, onClick = null, className = "" } = {}) {

    const el = document.createElement(onClick ? "button" : "span");
    if (onClick) {
        el.type = "button";
    }

    el.className = "money-coin" + (className ? ` ${className}` : "");
    el.style.width = size + "px";
    el.style.height = size + "px";
    el.style.fontSize = Math.round(size * 0.34) + "px";
    el.dataset.value = value;

    el.textContent = value;

    if (onClick) {
        el.addEventListener("click", onClick);
    }

    return el;
}
