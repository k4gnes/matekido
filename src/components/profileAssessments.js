import { createCard } from "./ui/card.js";
import { createNavBar } from "./ui/navbar.js";
import { getAssessments } from "../profile/Profile.js";
import { formatDuration, runTooltip, sortRunsByList } from "../utils/assessment.js?v=6";

// A 📝 Felmérések külön oldala: a profilról a kattintható sor visz ide, hogy a
// táblázat ne nyomja el a profil adatait. Egy futás = egy sor, a lista neve
// szerint csoportosítva, azonos néven belül a legfrissebb felül.
export function renderProfileAssessmentsPage({ root, onProfile, onLessons, onStats, onHelp, onSwitch, onParent }) {

    root.replaceChildren();

    const card = createCard();
    card.classList.add("profile-page", "profile-assessments-page");

    const title = document.createElement("h1");
    title.textContent = "📝 Felmérések";

    const subtitle = document.createElement("p");
    subtitle.className = "skill-map-subtitle";
    subtitle.textContent = "Az ⏱️ Időmérővel lefutott felmérések eredményei.";

    const section = document.createElement("div");
    section.className = "profile-assessments";

    const heading = document.createElement("h2");
    heading.textContent = "Futások";
    section.append(heading);

    const assessments = getAssessments();

    if (assessments.length === 0) {

        const empty = document.createElement("p");
        empty.textContent = "Még nincs felmérés. A gyerek menüjében a 📝 lista kártyájáról indul a felmérés.";
        section.append(empty);

    } else {

        const cell = (className, text) => {
            const td = document.createElement("td");
            td.className = className;
            td.textContent = text;
            return td;
        };

        const table = document.createElement("table");
        table.className = "assessment-table";

        sortRunsByList(assessments.slice(0, 10)).forEach(run => {
            const row = document.createElement("tr");

            const started = run.startedAt ? new Date(run.startedAt).toLocaleString("hu-HU") : "";
            const label = run.label ?? "";
            const headingText = label ? `${started} · ${label}` : started;

            // tooltip: mely leckékből állt a felmérés
            row.title = runTooltip(run, headingText);

            row.append(
                cell("assessment-when", started),
                cell("assessment-label", label),
                cell("assessment-nums", `⏱ ${formatDuration(run.seconds)}`),
                cell("assessment-nums", `✅ ${run.correct ?? 0}`),
                cell("assessment-nums", `❌ ${run.wrong ?? 0}`)
            );
            table.append(row);
        });

        section.append(table);

    }

    const navbar = createNavBar({
        current: "profile",
        onLessons,
        onProfile,
        onStats,
        onHelp,
        onSwitch,
        onParent
    });

    card.append(navbar, title, subtitle, section);
    root.append(card);

}
