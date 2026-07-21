import { World } from "./World.js";

const WORLDS = [
    new World({
        id: "postman",
        name: "Postás",
        icon: "📮",
        description: "Levelek és csomagok kézbesítése",
        requiredStars: 0
    }),
    new World({
        id: "racing",
        name: "Versenyautó",
        icon: "🏎️",
        description: "Gyorsaság és precizitás a pályán",
        requiredStars: 30
    }),
    new World({
        id: "football",
        name: "Foci",
        icon: "⚽",
        description: "Gól rúgás és csapatmunka",
        requiredStars: 80
    })
];

export function getAllWorlds() {
    return WORLDS;
}

export function getWorld(id) {
    return WORLDS.find(w => w.id === id) ?? WORLDS[0];
}

export function getUnlockedWorlds(stars) {
    return WORLDS.filter(w => w.isUnlocked(stars));
}

export function getNextWorld(stars) {
    return WORLDS.find(w => !w.isUnlocked(stars)) ?? null;
}
