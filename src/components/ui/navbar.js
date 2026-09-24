import { createButton } from "./button.js";
import { listPlayers, getActiveId } from "../../profile/UserManager.js";

export function createNavBar({ current = null, player = null, onLessons, onProfile, onStats, onHelp, onSwitch, onParent }) {

    const shell = document.createElement("div");
    shell.className = "nav-shell";

    const header = document.createElement("div");
    header.className = "app-header";
    const logo = document.createElement("img");
    logo.src = "assets/icons/icon.svg";
    logo.alt = "matekidő";
    const label = document.createElement("span");
    label.textContent = "matekidő";
    header.append(logo, label);

if (onParent) {
        const parentBtn = createButton("👪 Szülői", {
            className: "app-parent-btn" + (current === "parent" ? " active" : ""),
            onClick: onParent
        });
        header.append(parentBtn);
    }

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
    addButton("stats", "📊 Százalék", onStats);
    addButton("help", "❓ Súgó", onHelp);
    addButton("switch", "👤 Csere", onSwitch);

    shell.append(header, row);

    return shell;

}