export const CATEGORIES = {
    numbers: {
        title: "Számok",
        icon: "🔢",
        skills: ["neighbours", "comparison", "ordering", "missing-number", "place-value", "rounding", "number-sequence", "even-odd", "pattern"]
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
    practical: {
        title: "Gyakorlati matek",
        icon: "🧮",
        skills: ["length", "mass", "volume", "hour", "minute", "calendar", "coins", "banknotes", "shopping"]
    },
    geometry: {
        title: "Geometria",
        icon: "📐",
        skills: ["shapes", "perimeter", "area", "position"]
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
    "number-sequence": { title: "Számsor", category: "numbers" },
    "even-odd": { title: "Páros és páratlan", category: "numbers" },
    pattern: { title: "Sorminta", category: "numbers" },
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
    length: { title: "Hosszúság", category: "practical" },
    mass: { title: "Tömeg", category: "practical" },
    volume: { title: "Űrtartalom", category: "practical" },

    // Time
    hour: { title: "Óra", category: "practical" },
    minute: { title: "Perc", category: "practical" },
    calendar: { title: "Naptár", category: "practical" },

    // Money
    coins: { title: "Érmék", category: "practical" },
    banknotes: { title: "Bankjegyek", category: "practical" },
    shopping: { title: "Vásárlás", category: "practical" },

    // Geometry
    shapes: { title: "Alakzatok", category: "geometry" },
    perimeter: { title: "Kerület", category: "geometry" },
    area: { title: "Terület", category: "geometry" },
    position: { title: "Térbeli tájékozódás", category: "geometry" },

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
