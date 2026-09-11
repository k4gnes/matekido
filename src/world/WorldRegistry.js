import { World } from "./World.js";

const WORLDS = [
    new World({
        id: "postman",
        name: "Postás",
        icon: "📮",
        description: "Levelek és csomagok kézbesítése",
        requiredStars: 0,
        tagline: "Postám van 📮"
    }),
    new World({
        id: "racing",
        name: "Versenyautó",
        icon: "🏎️",
        description: "Gyorsaság és precizitás a pályán",
        requiredStars: 15,
        tagline: "A versenypályám vár 🏎️"
    }),
    new World({
        id: "cooking",
        name: "Szakács",
        icon: "👨‍🍳",
        description: "Receptek és hozzávalók számolgatása",
        requiredStars: 40,
        tagline: "Az én konyhám forr 👨‍🍳"
    }),
    new World({
        id: "football",
        name: "Foci",
        icon: "⚽",
        description: "Gól rúgás és csapatmunka",
        requiredStars: 80,
        tagline: "A csapatom győzni jött ⚽"
    }),
    new World({
        id: "animals",
        name: "Állatkert",
        icon: "🦁",
        description: "Állatok gondozása az állatkertben",
        requiredStars: 100,
        tagline: "Az én állataim várnak 🦁"
    }),
    new World({
        id: "space",
        name: "Űr",
        icon: "🤖",
        description: "Robotok és utazás a világűrben",
        requiredStars: 120,
        tagline: "Az űrhajóm ránk vár 🤖"
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
