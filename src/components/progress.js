import { getActiveWorld } from "../profile/Profile.js";

const WORLD_PROGRESS = {
    postman: { done: "🏠", current: "📡", next: "🏡" },
    racing: { done: "🏁", current: "🏎️", next: "🛣️" },
    football: { done: "⚽", current: "🥅", next: "🏟️" }
};

export function renderProgress({ current, total }) {

    const world = getActiveWorld();
    const icons = WORLD_PROGRESS[world] ?? WORLD_PROGRESS.postman;

    const progress = document.createElement("div");
    progress.className = "progress";

    for (let i = 1; i <= total; i++) {

        const item = document.createElement("span");

        if (i < current) {
            item.textContent = icons.done;
        }
        else if (i === current) {
            item.textContent = icons.current;
        }
        else {
            item.textContent = icons.next;
        }

        progress.append(item);

    }

    return progress;

}
