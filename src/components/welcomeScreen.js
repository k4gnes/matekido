import { createCard } from "./ui/card.js";
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

export function renderWelcomeScreen(root, onSelect) {

    root.replaceChildren();

    const wrapper = createCard("welcome-screen");

    const title = document.createElement("h1");
    title.textContent = "📚 Matekidő";

    const subtitle = document.createElement("p");
    subtitle.textContent = "Ki játszik ma?";

    wrapper.append(title, subtitle);

    const grid = document.createElement("div");
    grid.className = "player-grid";

    const players = listPlayers();

    players.forEach(player => {
        grid.append(createPlayerCard(player, onSelect, () => {
            renderWelcomeScreen(root, onSelect);
        }));
    });

    grid.append(createAddCard(() => {
        showAddModal(root, onSelect);
    }));

    wrapper.append(grid);
    root.append(wrapper);
}

function createPlayerCard(player, onSelect, onRefresh) {

    const card = document.createElement("div");
    card.className = "player-card";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "player-delete";
    deleteBtn.textContent = "×";
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

    const stats = document.createElement("div");
    stats.className = "player-stats";

    const lessons = player.profile?.lessonsCompleted ?? 0;
    const streak = player.profile?.streak ?? 0;

    stats.innerHTML = `
        <span class="player-stat">📚 ${lessons}</span>
        <span class="player-stat">🔥 ${streak}</span>
    `;

    card.append(deleteBtn, avatar, name, stats);

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

function showAddModal(root, onSelect) {

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

        createPlayer(name, selectedAvatar);
        overlay.remove();
        onSelect();
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && input.value.trim().length > 0) {
            confirmBtn.click();
        }
    });

    actions.append(cancelBtn, confirmBtn);
    modal.append(heading, input, avatarLabel, avatarGrid, actions);
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
