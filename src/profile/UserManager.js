import { loadJSON, saveJSON, loadRaw, removeKeys } from "../storage.js";

const STORAGE_KEY = "matekido-users";
const LEGACY_KEY = "matekido-profile";

const DEFAULT_PROFILE = {
    stars: 0,
    lessonsCompleted: 0,
    perfectLessons: 0,
    lettersDelivered: 0,
    streak: 0,
    lastPlayed: null,
    unlockedThemes: ["postman"],
    activeWorld: "postman",
    grade: null,
    dailyQuest: {
        id: "three-lessons",
        progress: 0,
        date: null
    },
    dailyStats: {},
    lessonStats: {},
    favorites: [],
    skippedLessons: [],
    skippedCustomLessons: [],
    menuPrefs: null,
    statistics: {
        addition: { correct: 0, wrong: 0 },
        subtraction: { correct: 0, wrong: 0 },
        neighbours: { correct: 0, wrong: 0 },
        missingNumber: { correct: 0, wrong: 0 },
        bigger: { correct: 0, wrong: 0 }
    }
};

let nextId = 1;

function generateId() {
    return "user-" + (nextId++);
}

function syncNextId(players) {

    let max = 0;

    for (const p of players) {

        const match = p.id.match(/^user-(\d+)$/);

        if (match) {

            const num = parseInt(match[1], 10);

            if (num > max) {
                max = num;
            }

        }

    }

    if (max >= nextId) {
        nextId = max + 1;
    }

}

function migrateLegacy() {

    const legacy = loadRaw(LEGACY_KEY);

    if (!legacy) {
        return null;
    }

    let legacyProfile;
    try {
        legacyProfile = JSON.parse(legacy);
    } catch {
        return null;
    }

    const profile = { ...DEFAULT_PROFILE, ...legacyProfile };

    const player = {
        id: generateId(),
        name: "Játékos",
        avatar: "🦊",
        profile
    };

    const data = { players: [player], activeId: player.id };

    saveJSON(STORAGE_KEY, data);
    removeKeys(LEGACY_KEY);

    return data;
}

export function loadUsers() {

    const data = loadJSON(STORAGE_KEY);

    if (data && Array.isArray(data.players)) {
        syncNextId(data.players);
        return data;
    }

    const migrated = migrateLegacy();

    if (migrated) {
        syncNextId(migrated.players);
        return migrated;
    }

    const fresh = { players: [], activeId: null };
    saveJSON(STORAGE_KEY, fresh);

    return fresh;
}

export function saveUsers(data) {
    saveJSON(STORAGE_KEY, data);
}

export function listPlayers() {
    return loadUsers().players;
}

export function getActiveId() {
    return loadUsers().activeId;
}

export function getActiveProfile() {

    const data = loadUsers();
    const player = data.players.find(p => p.id === data.activeId);

    if (!player) {
        return { ...DEFAULT_PROFILE };
    }

    return { ...DEFAULT_PROFILE, ...player.profile };
}

export function saveActiveProfile(profile) {

    const data = loadUsers();
    const player = data.players.find(p => p.id === data.activeId);

    if (player) {
        player.profile = profile;
        saveUsers(data);
    }
}

export function createPlayer(name, avatar, grade = null) {

    const data = loadUsers();

    const player = {
        id: generateId(),
        name,
        avatar,
        profile: {
            ...DEFAULT_PROFILE,
            grade: grade ?? null
        }
    };

    data.players.push(player);
    data.activeId = player.id;

    saveUsers(data);

    return player;
}

export function deletePlayer(id) {

    const data = loadUsers();

    data.players = data.players.filter(p => p.id !== id);

    if (data.activeId === id) {
        data.activeId = data.players.length > 0 ? data.players[0].id : null;
    }

    saveUsers(data);
}

export function switchPlayer(id) {

    const data = loadUsers();
    data.activeId = id;
    saveUsers(data);

}

const TRANSFER_APP = "matekido";
const TRANSFER_TYPE = "matekido-profiles";
const TRANSFER_VERSION = 1;

export function exportUsers(playerIds) {

    const data = loadUsers();
    const wanted = playerIds ? new Set(playerIds) : null;
    const players = data.players
        .filter(p => !wanted || wanted.has(p.id))
        .map(p => ({
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            profile: p.profile
        }));

    return JSON.stringify({
        app: TRANSFER_APP,
        type: TRANSFER_TYPE,
        version: TRANSFER_VERSION,
        exportedAt: new Date().toISOString(),
        players
    });

}

function sumCounts(a, b) {
    return (a ?? 0) + (b ?? 0);
}

function pickLater(a, b) {
    if (!a) return b ?? null;
    if (!b) return a;
    return a > b ? a : b;
}

function unionList(local, incoming) {
    return [...new Set([...(local ?? []), ...(incoming ?? [])])];
}

function mergeCounters(local, incoming) {

    local = { ...(local ?? {}) };

    for (const [key, counts] of Object.entries(incoming ?? {})) {
        const prev = local[key] ?? { correct: 0, wrong: 0 };
        local[key] = {
            correct: sumCounts(prev.correct, counts.correct),
            wrong: sumCounts(prev.wrong, counts.wrong)
        };
    }

    return local;

}

function mergeDailyStats(local, incoming) {

    local = { ...(local ?? {}) };

    for (const [date, day] of Object.entries(incoming ?? {})) {
        const prev = local[date] ?? { correct: 0, wrong: 0, lessonsPlayed: 0, byType: {} };
        const merged = {
            correct: sumCounts(prev.correct, day.correct),
            wrong: sumCounts(prev.wrong, day.wrong),
            lessonsPlayed: sumCounts(prev.lessonsPlayed, day.lessonsPlayed),
            byType: { ...(prev.byType ?? {}) }
        };
        for (const [type, counts] of Object.entries(day.byType ?? {})) {
            const prevType = merged.byType[type] ?? { correct: 0, wrong: 0 };
            merged.byType[type] = {
                correct: sumCounts(prevType.correct, counts.correct),
                wrong: sumCounts(prevType.wrong, counts.wrong)
            };
        }
        local[date] = merged;
    }

    return local;

}

function mergeLessonStats(local, incoming) {

    local = { ...(local ?? {}) };

    for (const [file, counts] of Object.entries(incoming ?? {})) {
        const prev = local[file] ?? { correct: 0, wrong: 0, lastDoneAt: null };
        local[file] = {
            correct: sumCounts(prev.correct, counts.correct),
            wrong: sumCounts(prev.wrong, counts.wrong),
            lastDoneAt: pickLater(prev.lastDoneAt, counts.lastDoneAt)
        };
    }

    return local;

}

function mergeProfiles(local, incoming) {

    return {
        stars: sumCounts(local.stars, incoming.stars),
        lessonsCompleted: sumCounts(local.lessonsCompleted, incoming.lessonsCompleted),
        perfectLessons: sumCounts(local.perfectLessons, incoming.perfectLessons),
        lettersDelivered: sumCounts(local.lettersDelivered, incoming.lettersDelivered),
        streak: Math.max(local.streak ?? 0, incoming.streak ?? 0),
        lastPlayed: pickLater(local.lastPlayed, incoming.lastPlayed),
        unlockedThemes: unionList(local.unlockedThemes, incoming.unlockedThemes),
        activeWorld: local.activeWorld ?? incoming.activeWorld ?? "postman",
        grade: local.grade ?? incoming.grade ?? null,
        dailyQuest: local.dailyQuest ?? incoming.dailyQuest ?? DEFAULT_PROFILE.dailyQuest,
        dailyStats: mergeDailyStats(local.dailyStats, incoming.dailyStats),
        lessonStats: mergeLessonStats(local.lessonStats, incoming.lessonStats),
        favorites: unionList(local.favorites, incoming.favorites),
        skippedLessons: unionList(local.skippedLessons, incoming.skippedLessons),
        skippedCustomLessons: unionList(local.skippedCustomLessons, incoming.skippedCustomLessons),
        menuPrefs: local.menuPrefs ?? incoming.menuPrefs ?? null,
        statistics: mergeCounters(local.statistics, incoming.statistics),
        skillStats: mergeCounters(local.skillStats, incoming.skillStats),
        doneCustomLessons: unionList(local.doneCustomLessons, incoming.doneCustomLessons)
    };

}

export function importUsers(jsonString) {

    let parsed;

    const cleaned = jsonString.trim().replace(/^\uFEFF/, "");

    try {
        parsed = JSON.parse(cleaned);
    } catch {
        return { ok: false, error: "Nem érvényes mentési fájl." };
    }

    if (!parsed || parsed.app !== TRANSFER_APP || parsed.type !== TRANSFER_TYPE || !Array.isArray(parsed.players)) {
        return { ok: false, error: "Ez nem matekidős mentés." };
    }

    const data = loadUsers();
    const existing = new Map(data.players.map(p => [p.name + "\u0000" + (p.avatar ?? ""), p]));
    const imported = [];
    let merged = 0;

    for (const raw of parsed.players) {

        if (!raw || typeof raw.name !== "string" || !raw.name.trim()) {
            continue;
        }

        const name = raw.name.trim();
        const avatar = typeof raw.avatar === "string" && raw.avatar ? raw.avatar : "🦊";
        const key = name + "\u0000" + avatar;

        const match = existing.get(key);

        if (match) {
            const profile = { ...DEFAULT_PROFILE, ...(raw.profile ?? {}) };
            match.profile = mergeProfiles(match.profile ?? {}, profile);
            merged++;
            continue;
        }

        imported.push({
            id: generateId(),
            name,
            avatar,
            profile: { ...DEFAULT_PROFILE, ...(raw.profile ?? {}) }
        });
    }

    if (imported.length > 0) {
        data.players.push(...imported);
    }

    if (imported.length > 0 || merged > 0) {
        saveUsers(data);
    }

    return {
        ok: true,
        imported: imported.length,
        merged
    };

}
