# Leckeszervezés – ✅ kész

*A terv 2026 nyarán készült, a leckeszervezés azóta megvalósult. Ellenőrizve: 2026-11-08.*

## Státusz

| Tervpont | Státusz | Hol látszik |
|---|---|---|
| 1. Egységes metaadatok | ✅ | Mind a **337** leckének van `id`, `category`, `skill`, `difficulty`, `grades` mezője (`src/data/lessons/index.json`) |
| 2. Kategóriák | ✅ | `src/data/skills.js` → `CATEGORIES`: numbers, fractions, operations, multiplication, practical, geometry, wordProblems |
| 3. Skill rendszer | ✅ | 76 skill, mindegyikhez tartozik lecke; a hiányzó mezők nem fordulnak elő |
| 4. Difficulty 1–4 | ✅ | Mind a négy szint használatban |
| 5. Több évfolyam | ✅ | 10 lecke több évfolyamhoz is tartozik (`grades: [1,2]` stb.) |
| 6. Menü kategóriák szerint | ✅ | `lessonMenu.js` `createGradeSection()` kategóriánként bont (`category-section`), plusz kategória-, készség-, típus- és nehézség-szűrők |
| 7. Statisztika készség-alapú | ✅ | `statsPage.js` „📊 Készségek" szekció, `profile.skillStats`; a szülői nézet gyenge készségeket listáz |
| 8. Adaptív gyakorlás | ✅ | „🎯 Gyakorlásra javasolt" a menüben (`getPracticeLessonFiles`) és a szülői nézetben (`computeWeakSkills` / `computeWeakLessons`), 90% alatt |
| 9. Hosszú távú cél | ✅ irány | Készség-alapú rendszerként működik: a skill az elsődleges tudáselem, a feladat a megvalósítás |

## Amit a tervből változtattunk

- **A kategória-nevek nem egyeznek a tervvel.** A tervben külön „Time", „Money", „Measurement" kategória szerepelt; ezek ma a `practical` kategórián belül vannak (`lessonMenu.js` a régi `time`/`money`/`measurement` kulcsokat `practical`-ra alakítja), külön szűrővel.
- **A menü nem teljesen készség-fa.** A terv a „kategória → készség → lecke" hierarchiát javasolta; a megvalósult menü kategória → lecke, a készség pedig szűrőként és a leckelap „skill badge"-jeként jelenik meg. Ez tudatos: a gyereknek a lecke a releváns egység.
- **A statisztika mindkét szintet mutatja.** Nem váltottuk le a lecke-statisztikát a készség-statisztikára, hanem a kettő egymás mellett van (lecke- és készség-százalékok), mert a szülői nézet a leckét, a gyakorlási javaslat a készséget keresi.

A 2026-07-i terv eredeti szövege a gitben megvan: `git show 28b6382:docs/TODO.md`.
