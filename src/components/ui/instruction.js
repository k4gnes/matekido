export function createInstructionHelp(title, text) {

    const help = document.createElement("span");
    help.className = "instruction-help";
    help.tabIndex = 0;
    help.setAttribute("role", "button");
    help.setAttribute("aria-label", "Feladat útmutató");
    help.textContent = "?";

    const tooltip = document.createElement("div");
    tooltip.className = "instruction-tooltip";

    if (title) {
        const heading = document.createElement("strong");
        heading.textContent = title;
        tooltip.append(heading);
    }

    if (text) {
        const paragraph = document.createElement("p");
        paragraph.textContent = text;
        tooltip.append(paragraph);
    }

    help.append(tooltip);

    const show = () => tooltip.classList.add("show");
    const hide = () => tooltip.classList.remove("show");

    help.addEventListener("mouseenter", show);
    help.addEventListener("mouseleave", hide);
    help.addEventListener("focus", show);
    help.addEventListener("blur", hide);

    return help;
}