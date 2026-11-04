export const ACHIEVEMENTS = [
    {
        id: "first-postman",
        icon: "📯",
        title: "Első postás",
        category: "lessons",
        target: 10,
        worldTitles: {
            racing: "Első pilóta",
            cooking: "Első szakács",
            football: "Első játékos",
            animals: "Első gondozó",
            space: "Első robotpilóta",
            tram: "Első villamosos"
        },
        worldIcons: {
            racing: "🏁",
            cooking: "🍳",
            football: "⚽",
            animals: "🦁",
            space: "🤖",
            tram: "🎫"
        }
    },
    {
        id: "experienced-postman",
        icon: "📮",
        title: "Tapasztalt postás",
        category: "lessons",
        target: 25,
        worldTitles: {
            racing: "Tapasztalt pilóta",
            cooking: "Tapasztalt szakács",
            football: "Tapasztalt játékos",
            animals: "Tapasztalt gondozó",
            space: "Tapasztalt robotpilóta",
            tram: "Tapasztalt villamosos"
        },
        worldIcons: {
            racing: "🏆",
            cooking: "👨‍🍳",
            football: "🏆",
            animals: "🦒",
            space: "🚀",
            tram: "🎟️"
        }
    },
    {
        id: "master-postman",
        icon: "🏆",
        title: "Mesterpostás",
        category: "lessons",
        target: 50,
        worldTitles: {
            racing: "Bajnok pilóta",
            cooking: "Séf mester",
            football: "Bajnok játékos",
            animals: "Mestergondozó",
            space: "Űrkapitány",
            tram: "Villamosguru"
        },
        worldIcons: {
            racing: "🥇",
            cooking: "🥇",
            football: "🥇",
            animals: "🦁",
            space: "🛸",
            tram: "⚡"
        }
    },
    {
        id: "perfect-one",
        icon: "🌟",
        title: "Tökéletes",
        category: "perfect",
        target: 1
    },
    {
        id: "perfect-five",
        icon: "💯",
        title: "Hibátlan ötös",
        category: "perfect",
        target: 5
    },
    {
        id: "perfect-fifteen",
        icon: "👑",
        title: "Mesterlövész",
        category: "perfect",
        target: 15
    },
    {
        id: "perfect-fifty",
        icon: "🏅",
        title: "Nagymester",
        category: "perfect",
        target: 50
    },
    {
        // shortcut: target = a napocskával gyűjtött világok száma, új világnál növelni
        id: "sun-all-worlds",
        icon: "☀️",
        title: "Napfényjáró",
        category: "napocska",
        target: 7
    }
];

export function getUnlockedAchievements(profile) {

    const perfect = profile.perfectLessons || 0;

    return ACHIEVEMENTS.filter(ach => {
        if (ach.category === "lessons") {
            return profile.lessonsCompleted >= ach.target;
        }
        if (ach.category === "perfect") {
            return perfect >= ach.target;
        }
        if (ach.category === "napocska") {
            const worlds = Object.values(profile.napocskak || {}).filter(n => n >= 1).length;
            return worlds >= ach.target;
        }
        return false;
    });

}
