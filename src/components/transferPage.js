import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createBackupPanel } from "./backupPanel.js?v=2";

export function renderTransferPage(root, onBack) {

    root.replaceChildren();

    const wrapper = createCard("parent-page");

    const backButton = createButton("⬅️ Vissza", {
        onClick: () => onBack()
    });
    backButton.className = "nav-bar-btn";

    const backRow = document.createElement("div");
    backRow.style.cssText = "display:flex; justify-content:center; margin-bottom:1rem;";
    backRow.append(backButton);

    const title = document.createElement("h1");
    title.className = "parent-title";
    title.textContent = "💾 Profilok átvitele";

    const subtitle = document.createElement("p");
    subtitle.className = "parent-subtitle";
    subtitle.textContent = "Játékosadatok mozgatása egyik eszközről a másikra: fájlként vagy QR-kóddal.";

    wrapper.append(backRow, title, subtitle);

    wrapper.append(createBackupPanel({
        onChanged: () => renderTransferPage(root, onBack)
    }));

    root.append(wrapper);

}
