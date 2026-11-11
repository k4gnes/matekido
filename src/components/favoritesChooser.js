import { createButton } from "./ui/button.js";

// A lista megnyitásakor jelenik meg: időmérő felmérés vagy a megszokott
// gyakorlás közül lehet választani, mielőtt az első lecke elindul.
// A `heading` a lista címe (kedvencek vagy felmérő), nélküle a kedvenceké jön.
export function openFavoritesChooser({ lessons, onChoose, heading = null }) {

    document.querySelector(".favorites-chooser")?.remove();

    const area = document.createElement("div");
    area.className = "favorites-chooser";

    const title = document.createElement("h2");
    title.textContent = heading ?? `❤️ Kedvenceim (${lessons.length})`;
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
    hint.textContent = "Kezdjük! – a szokásos gyakorlás, ahogy eddig. ⏱️ Időmérő: felmérés – méri az összidőt és a hibákat, a végén rövid kiértékelés.";
    area.append(hint);

    function choose(mode) {
        area.remove();
        onChoose(mode);
    }

    const actions = document.createElement("div");
    actions.className = "favorites-chooser-actions";
    actions.append(
        createButton("Kezdjük!", { className: "nav-bar-btn", onClick: () => choose("practice") }),
        createButton("⏱️ Időmérő", { className: "nav-bar-btn", onClick: () => choose("assessment") }),
        createButton("✗ Bezárás", { className: "nav-bar-btn", onClick: () => area.remove() })
    );
    area.append(actions);

    document.body.append(area);

}
