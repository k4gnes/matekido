export function renderProgress({ current, total }) {

    const progress = document.createElement("div");
    progress.className = "progress";

    for (let i = 1; i <= total; i++) {

        const house = document.createElement("span");

        if (i < current) {
            house.textContent = "🏠";
        } else if (i === current) {
            house.textContent = "📮";
        } else {
            house.textContent = "🏡";
        }

        progress.append(house);
    }

    return progress;
}