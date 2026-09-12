import { createButton } from "./button.js";
import { listPlayers, getActiveId } from "../../profile/UserManager.js";

export function createNavBar({ current = null, player = null, onLessons, onProfile, onStats, onHelp, onSwitch }) {

    const row = document.createElement("div");
    row.className = "nav-bar";

    const active = player ?? listPlayers().find(p => p.id === getActiveId()) ?? null;

    function addButton(key, label, onClick) {
        if (!onClick) return;
        const btn = createButton(label, { onClick });
        btn.className = "nav-bar-btn" + (key === current ? " active" : "");
        row.append(btn);
    }

    if (active) {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "nav-bar-player" + (current === "profile" ? " active" : "");
        chip.textContent = `${active.avatar} ${active.name}`;
        chip.title = "Profil";
        chip.setAttribute("aria-label", "Profil: " + active.name);
        chip.addEventListener("click", () => onProfile?.());
        row.append(chip);
    } else {
        addButton("profile", "👤 Profil", onProfile);
    }

    addButton("lessons", "📚 Leckék", onLessons);
    addButton("stats", "📋 Értékek", onStats);
    addButton("help", "❓ Súgó", onHelp);
    addButton("switch", "👤 Játékos", onSwitch);

    return row;

}