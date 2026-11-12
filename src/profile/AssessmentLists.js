import { loadJSON, saveJSON, loadRaw } from "../storage.js";
import { listPlayers } from "./UserManager.js";

// A 📝 Felmérő listák: a szülő évfolyamonként több, saját nevű listát állít
// össze. Eszköz-szintű a tárolás, nem játékoshoz kötött – minden gyerek ugyanazt
// látja a menüjében. Az érték lecke-id (`?lesson=`), nem fájlnév.
const STORAGE_KEY = "matekido-felmerek";

function loadAll() {
    const data = loadJSON(STORAGE_KEY, null);
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
}

function saveAll(all) {
    saveJSON(STORAGE_KEY, all);
}

export function getAssessmentLists(grade) {
    const lists = loadAll()[grade];
    return Array.isArray(lists) ? lists : [];
}

export function createAssessmentList(grade, name) {
    const trimmed = String(name ?? "").trim();
    if (!trimmed) return null;

    const list = {
        id: `felmero-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        name: trimmed,
        lessons: []
    };

    const all = loadAll();
    all[grade] = [...getAssessmentLists(grade), list];
    saveAll(all);

    return list;
}

export function removeAssessmentList(grade, listId) {
    const all = loadAll();
    all[grade] = getAssessmentLists(grade).filter(list => list.id !== listId);
    saveAll(all);
}

export function isInAssessmentList(grade, listId, lessonId) {
    const list = getAssessmentLists(grade).find(entry => entry.id === listId);
    return !!list && list.lessons.includes(lessonId);
}

export function toggleAssessmentLesson(grade, listId, lessonId) {
    const all = loadAll();

    all[grade] = getAssessmentLists(grade).map(list => {
        if (list.id !== listId) return list;
        const lessons = list.lessons.includes(lessonId)
            ? list.lessons.filter(id => id !== lessonId)
            : [...list.lessons, lessonId];
        return { ...list, lessons };
    });

    saveAll(all);

    return isInAssessmentList(grade, listId, lessonId);
}

// A régi, játékosonkénti pipák átvezetése az első indításkor: minden évfolyamra
// egy „Felmérő” lista készül az összes korábbi kijelölésből. Egyszer fut, mert a
// kulcs megléte jelzi, hogy már migráltunk.
export function migrateAssessmentLists(lessons) {

    if (loadRaw(STORAGE_KEY) !== null) return;

    const legacy = [];
    listPlayers().forEach(player => {
        (player.profile?.assessmentLessons ?? []).forEach(id => {
            if (!legacy.includes(id)) legacy.push(id);
        });
    });

    const byGrade = {};
    legacy.forEach(id => {
        const lesson = (lessons ?? []).find(entry => entry.id === id);
        (lesson?.grades ?? []).forEach(grade => {
            byGrade[grade] = byGrade[grade] ?? [];
            if (!byGrade[grade].includes(id)) byGrade[grade].push(id);
        });
    });

    const migrated = Object.fromEntries(Object.entries(byGrade).map(([grade, ids]) => [
        grade,
        [{ id: "felmero-rogzitett", name: "Felmérő", lessons: ids }]
    ]));

    saveAll(migrated);

}

export function exportAssessmentLists() {
    return loadAll();
}

// Importkor csak bővülhet, törlést nem okozhat – és a hálózatról jövő adatot
// itt ellenőrizzük, mert bárki beadhat saját fájlt.
export function mergeAssessmentLists(incoming) {

    if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) return;

    const all = loadAll();

    for (const [grade, lists] of Object.entries(incoming)) {
        if (!Array.isArray(lists)) continue;

        const current = all[grade] ?? [];

        lists.forEach(entry => {
            if (!entry || typeof entry !== "object" || typeof entry.id !== "string" || !entry.id) return;

            const name = typeof entry.name === "string" && entry.name.trim() ? entry.name.trim() : "Felmérő";
            const lessons = (Array.isArray(entry.lessons) ? entry.lessons : [])
                .filter(id => typeof id === "string" && id);

            const existing = current.find(list => list.id === entry.id);
            if (existing) {
                existing.lessons = [...new Set([...existing.lessons, ...lessons])];
            } else {
                current.push({ id: entry.id, name, lessons: [...new Set(lessons)] });
            }
        });

        all[grade] = current;
    }

    saveAll(all);

}
