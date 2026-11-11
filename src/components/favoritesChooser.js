import { createButton } from "./ui/button.js";

// A kedvencek listájának megnyitásakor jelenik meg: időmérő felmérés vagy a
// megszokott gyakorlás közül lehet választani, mielőtt az első lecke elindul.
export function openFavoritesChooser({ lessons, onChoose }) {

    document.querySelector(".favorites-chooser")?.remove();

    const area = document.createElement("div");
    area.className = "favorites-chooser";

    const title = document.createElement("h2");
    title.textContent = `❤️ Kedvenceim (${lessons.length})`;
    area.append(title);

    const list = document.createElement("ol");
    lessons.forEach(lesson => {
        const item = document.createElement("li");
        item.textContent = lesson.title ?? lesson.file;
        list.append(item);
    });
    area.append(list);

    const hint = document.createElement("p");
    hint.className = "favorites-chooser-hint";
    hint.textContent = "⏱️ Időmérő: felmérés – méri az összidőt és a hibákat, a végén rövid kiértékelés. 🎲 Játék: gyakorlás, ahogy eddig.";
    area.append(hint);

    function choose(mode) {
        area.remove();
        onChoose(mode);
    }

    const actions = document.createElement("div");
    actions.className = "favorites-chooser-actions";
    actions.append(
        createButton("⏱️ Időmérő", { className: "nav-bar-btn", onClick: () => choose("assessment") }),
        createButton("🎲 Játék", { className: "nav-bar-btn", onClick: () => choose("practice") }),
        createButton("✗ Bezárás", { className: "nav-bar-btn", onClick: () => area.remove() })
    );
    area.append(actions);

    document.body.append(area);

}
