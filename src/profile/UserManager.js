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
    dailyQuest: {
        id: "three-lessons",
        progress: 0,
        date: null
    },
    dailyStats: {},
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

    const legacy = localStorage.getItem(LEGACY_KEY);

    if (!legacy) {
        return null;
    }

    const profile = { ...DEFAULT_PROFILE, ...JSON.parse(legacy) };

    const player = {
        id: generateId(),
        name: "Játékos",
        avatar: "🦊",
        profile
    };

    const data = { players: [player], activeId: player.id };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.removeItem(LEGACY_KEY);

    return data;
}

export function loadUsers() {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
        const data = JSON.parse(saved);
        syncNextId(data.players);
        return data;
    }

    const migrated = migrateLegacy();

    if (migrated) {
        syncNextId(migrated.players);
        return migrated;
    }

    const data = { players: [], activeId: null };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    return data;
}

export function saveUsers(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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

export function createPlayer(name, avatar) {

    const data = loadUsers();

    const player = {
        id: generateId(),
        name,
        avatar,
        profile: { ...DEFAULT_PROFILE }
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
