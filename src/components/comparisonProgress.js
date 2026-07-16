export function renderComparisonProgress({ current, total }) {

    const progress = document.createElement("div");
    progress.className = "progress";

    for (let i = 1; i <= total; i++) {

        const item = document.createElement("span");

        if (i < current) {
            item.textContent = "⚖️";
        }
        else if (i === current) {
            item.textContent = "🔍";
        }
        else {
            item.textContent = "💰";
        }

        progress.append(item);

    }

    return progress;

}
