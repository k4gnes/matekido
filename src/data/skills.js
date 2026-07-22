export const CATEGORIES = {
    numbers: {
        title: "Számok",
        icon: "🔢",
        skills: ["neighbours", "comparison", "ordering", "missing-number", "place-value", "rounding"]
    },
    operations: {
        title: "Összeadás-Kivonás",
        icon: "➕",
        skills: ["addition", "subtraction", "mixed", "missing-operand", "tens-crossing"]
    },
    multiplication: {
        title: "Szorzás & Osztás",
        icon: "✖️",
        skills: ["multiplication", "division", "missing-factor"]
    },
    measurement: {
        title: "Mérés",
        icon: "📏",
        skills: ["length", "mass", "volume"]
    },
    time: {
        title: "Idő",
        icon: "🕐",
        skills: ["hour", "minute", "calendar"]
    },
    money: {
        title: "Pénz",
        icon: "💰",
        skills: ["coins", "banknotes", "shopping"]
    },
    geometry: {
        title: "Geometria",
        icon: "📐",
        skills: ["shapes", "perimeter", "area"]
    },
    wordProblems: {
        title: "Szöveges feladatok",
        icon: "📝",
        skills: ["one-step", "two-step"]
    }
};

export const SKILLS = {
    // Numbers
    neighbours: { title: "Számszomszédok", category: "numbers" },
    comparison: { title: "Nagyobb-kisebb", category: "numbers" },
    ordering: { title: "Számrendezés", category: "numbers" },
    "missing-number": { title: "Hiányzó szám", category: "numbers" },
    "place-value": { title: "Helyi érték", category: "numbers" },
    rounding: { title: "Kerekítés", category: "numbers" },

    // Operations
    addition: { title: "Összeadás", category: "operations" },
    subtraction: { title: "Kivonás", category: "operations" },
    mixed: { title: "Vegyes műveletek", category: "operations" },
    "missing-operand": { title: "Hiányzó tag", category: "operations" },
    "tens-crossing": { title: "Tízes átlépés", category: "operations" },

    // Multiplication & Division
    multiplication: { title: "Szorzás", category: "multiplication" },
    division: { title: "Osztás", category: "multiplication" },
    "missing-factor": { title: "Hiányzó tényező", category: "multiplication" },

    // Measurement
    length: { title: "Hosszúság", category: "measurement" },
    mass: { title: "Tömeg", category: "measurement" },
    volume: { title: "Űrtartalom", category: "measurement" },

    // Time
    hour: { title: "Óra", category: "time" },
    minute: { title: "Perc", category: "time" },
    calendar: { title: "Naptár", category: "time" },

    // Money
    coins: { title: "Érmék", category: "money" },
    banknotes: { title: "Bankjegyek", category: "money" },
    shopping: { title: "Vásárlás", category: "money" },

    // Geometry
    shapes: { title: "Alakzatok", category: "geometry" },
    perimeter: { title: "Kerület", category: "geometry" },
    area: { title: "Terület", category: "geometry" },

    // Word Problems
    "one-step": { title: "Egylépéses", category: "wordProblems" },
    "two-step": { title: "Kétlépéses", category: "wordProblems" }
};

export const DIFFICULTY = {
    1: "Alap",
    2: "Gyakorló",
    3: "Haladó",
    4: "Mester"
};
