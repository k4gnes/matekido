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

export function importUsers(jsonString) {

    let parsed;

    try {
        parsed = JSON.parse(jsonString);
    } catch {
        return { ok: false, error: "Nem érvényes mentési fájl." };
    }

    if (!parsed || parsed.app !== TRANSFER_APP || parsed.type !== TRANSFER_TYPE || !Array.isArray(parsed.players)) {
        return { ok: false, error: "Ez nem matekidős mentés." };
    }

    const data = loadUsers();
    const existing = new Set(data.players.map(p => p.name + "\u0000" + (p.avatar ?? "")));
    const imported = [];
    const skipped = [];

    for (const raw of parsed.players) {

        if (!raw || typeof raw.name !== "string" || !raw.name.trim()) {
            continue;
        }

        const name = raw.name.trim();
        const avatar = typeof raw.avatar === "string" && raw.avatar ? raw.avatar : "🦊";
        const key = name + "\u0000" + avatar;

        if (existing.has(key)) {
            skipped.push(name);
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
        saveUsers(data);
    }

    return {
        ok: true,
        imported: imported.length,
        skipped: skipped.length
    };

}
