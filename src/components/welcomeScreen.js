import { createCard } from "./ui/card.js";
import { resetMenuPrefs } from "./lessonMenu.js";
import {
    listPlayers,
    switchPlayer,
    createPlayer,
    deletePlayer
} from "../profile/UserManager.js";

const AVATARS = [
    "🦊", "🐱", "🐰", "🐸",
    "🐵", "🐶", "🐼", "🦁",
    "🐯", "🐨", "🐧", "🐹",
    "🐢", "🦋", "🌟", "🦉",
    "🐒"
];

export function renderWelcomeScreen(root, onSelect, onHelp, lessonIndex) {

    root.replaceChildren();

    const wrapper = createCard("welcome-screen");

    const title = document.createElement("h1");
    const logo = document.createElement("img");
    logo.src = "assets/icons/icon.svg";
    logo.alt = "matekidő";
    logo.style.height = "2em";
    logo.style.width = "auto";
    logo.style.verticalAlign = "middle";
    title.append(logo, " matekidő");
    title.style.color = "var(--primary)";

    const subtitle = document.createElement("p");
    subtitle.textContent = "Ki játszik ma?";

    wrapper.append(title, subtitle);

    const grid = document.createElement("div");
    grid.className = "player-grid";

    const players = listPlayers();

    players.forEach(player => {
        grid.append(createPlayerCard(player, onSelect, () => {
            renderWelcomeScreen(root, onSelect, onHelp, lessonIndex);
        }));
    });

    grid.append(createAddCard(() => {
        showAddModal(root, onSelect, lessonIndex?.gradeConfig ?? []);
    }));

    wrapper.append(grid);

    const links = document.createElement("div");
    links.className = "welcome-links";

    const helpButton = document.createElement("button");
    helpButton.type = "button";
    helpButton.className = "parent-link";
    helpButton.textContent = "❓ Súgó";
    helpButton.addEventListener("click", () => {
        onHelp?.();
    });

    links.append(helpButton);
    wrapper.append(links);
    root.append(wrapper);
}

function createPlayerCard(player, onSelect, onRefresh) {

    const card = document.createElement("div");
    card.className = "player-card";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "player-delete";
    deleteBtn.textContent = "×";
    deleteBtn.setAttribute("aria-label", "Profil törlése");
    deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        showConfirmDialog(player.name, () => {
            deletePlayer(player.id);
            onRefresh();
        });
    });

    const avatar = document.createElement("div");
    avatar.className = "player-avatar";
    avatar.textContent = player.avatar;

    const name = document.createElement("div");
    name.className = "player-name";
    name.textContent = player.name;

    const grade = player.profile?.grade ?? null;
    const gradeEl = document.createElement("div");
    if (grade != null) {
        gradeEl.className = "player-grade";
        gradeEl.textContent = `🎓 ${grade}. osztály`;
        card.append(name, gradeEl);
    } else {
        card.append(name);
    }

    const stats = document.createElement("div");
    stats.className = "player-stats";

    const lessons = player.profile?.lessonsCompleted ?? 0;
    const streak = player.profile?.streak ?? 0;
    const stars = player.profile?.stars ?? 0;

    stats.innerHTML = `
        <span class="player-stat">⭐ ${stars}</span>
        <span class="player-stat">📚 ${lessons}</span>
        <span class="player-stat">🔥 ${streak}</span>
    `;

    card.append(stats);

    card.addEventListener("click", () => {
        switchPlayer(player.id);
        onSelect(player.id);
    });

    return card;
}

function createAddCard(onClick) {

    const card = document.createElement("div");
    card.className = "add-player-card";

    const icon = document.createElement("div");
    icon.className = "add-player-icon";
    icon.textContent = "+";

    const label = document.createElement("div");
    label.className = "add-player-label";
    label.textContent = "Új játékos";

    card.append(icon, label);
    card.addEventListener("click", onClick);

    return card;
}

function showAddModal(root, onSelect, gradeConfig) {

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    const modal = document.createElement("div");
    modal.className = "modal";

    const heading = document.createElement("h2");
    heading.textContent = "Új játékos";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "modal-input";
    input.placeholder = "Név";
    input.maxLength = 20;

    const avatarLabel = document.createElement("div");
    avatarLabel.className = "modal-label";
    avatarLabel.textContent = "Válassz avatart!";

    const avatarGrid = document.createElement("div");
    avatarGrid.className = "avatar-grid";

    let selectedAvatar = AVATARS[0];

    AVATARS.forEach(emoji => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "avatar-option" + (emoji === selectedAvatar ? " selected" : "");
        btn.textContent = emoji;

        btn.addEventListener("click", () => {
            selectedAvatar = emoji;
            avatarGrid.querySelectorAll(".avatar-option").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
        });

        avatarGrid.append(btn);
    });

    let selectedGrade = null;
    const gradeBlock = document.createElement("div");

    if (gradeConfig.length > 0) {
        selectedGrade = gradeConfig[0].grade;

        const gradeLabel = document.createElement("div");
        gradeLabel.className = "modal-label";
        gradeLabel.textContent = "Melyik osztályban játszol?";

        const gradeGrid = document.createElement("div");
        gradeGrid.className = "lesson-grid";

        gradeConfig.forEach(gc => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "profile-page-button" + (gc.grade === selectedGrade ? " selected" : "");
            btn.textContent = gc.title;

            btn.addEventListener("click", () => {
                selectedGrade = gc.grade;
                gradeGrid.querySelectorAll(".profile-page-button").forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
            });

            gradeGrid.append(btn);
        });

        gradeBlock.append(gradeLabel, gradeGrid);
    }

    const actions = document.createElement("div");
    actions.className = "modal-actions";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "modal-cancel";
    cancelBtn.textContent = "Mégse";
    cancelBtn.addEventListener("click", () => {
        overlay.remove();
    });

    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.className = "modal-confirm";
    confirmBtn.textContent = "Hozzáadás";
    confirmBtn.disabled = true;

    input.addEventListener("input", () => {
        confirmBtn.disabled = input.value.trim().length === 0;
    });

    confirmBtn.addEventListener("click", () => {
        const name = input.value.trim();
        if (!name) return;

        createPlayer(name, selectedAvatar, selectedGrade);
        resetMenuPrefs();
        overlay.remove();
        onSelect();
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && input.value.trim().length > 0) {
            confirmBtn.click();
        }
    });

    actions.append(cancelBtn, confirmBtn);
    modal.append(heading, input, avatarLabel, avatarGrid, gradeBlock, actions);
    overlay.append(modal);
    root.append(overlay);

    input.focus();
}

function showConfirmDialog(playerName, onConfirm) {

    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";

    const dialog = document.createElement("div");
    dialog.className = "confirm-dialog";

    const text = document.createElement("p");
    text.textContent = `Biztosan törlöd ${playerName} adatait?`;

    const actions = document.createElement("div");
    actions.className = "confirm-actions";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "confirm-cancel";
    cancelBtn.textContent = "Mégse";
    cancelBtn.addEventListener("click", () => {
        overlay.remove();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "confirm-delete";
    deleteBtn.textContent = "Törlés";
    deleteBtn.addEventListener("click", () => {
        onConfirm();
        overlay.remove();
    });

    actions.append(cancelBtn, deleteBtn);
    dialog.append(text, actions);
    overlay.append(dialog);
    document.body.append(overlay);
}
