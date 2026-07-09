import { renderStory } from "./components/story.js";

const app = document.getElementById("app");

const step = {
    title: "📮 Segíts a postásnak!",
    text: "A postás ma öt házba visz levelet. Segíts neki kiszámolni, hány levelet kell kézbesítenie!"
};

renderStory(step, app);