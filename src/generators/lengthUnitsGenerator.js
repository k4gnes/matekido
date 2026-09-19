function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const FACTS = [
    { emoji: "✏️", name: "A ceruza", text: "A ceruza hossza körülbelül", number: 15, unit: "cm" },
    { emoji: "📱", name: "A telefon", text: "Egy telefon hossza körülbelül", number: 14, unit: "cm" },
    { emoji: "📓", name: "A tankönyv", text: "Egy tankönyv magassága körülbelül", number: 24, unit: "cm" },
    { emoji: "📏", name: "A vonalzó", text: "A vonalzó hossza körülbelül", number: 30, unit: "cm" },
    { emoji: "🔑", name: "A kulcs", text: "Egy kulcs hossza körülbelül", number: 7, unit: "cm" },
    { emoji: "🛏️", name: "Az ágy", text: "Az ágy hossza körülbelül", number: 2, unit: "m" },
    { emoji: "🚪", name: "Az ajtó", text: "Az ajtó magassága körülbelül", number: 2, unit: "m" },
    { emoji: "🚗", name: "Az autó", text: "Egy kisebb autó hossza körülbelül", number: 4, unit: "m" },
    { emoji: "🦒", name: "A zsiráf", text: "A zsiráf magassága körülbelül", number: 5, unit: "m" },
    { emoji: "🌳", name: "A fa", text: "Egy magas fa magassága körülbelül", number: 15, unit: "m" },
    { emoji: "⚽", name: "A focipálya", text: "A focipálya hossza körülbelül", number: 100, unit: "m" },
    { emoji: "🚆", name: "Az utazás", text: "Budapest és Debrecen távolsága körülbelül", number: 230, unit: "km" },
    { emoji: "🏃", name: "A futás", text: "Egy átlagos futó edzésen lefut körülbelül", number: 12, unit: "km" },
    { emoji: "🌊", name: "A Balaton", text: "A Balaton hossza körülbelül", number: 77, unit: "km" },
    { emoji: "🚲", name: "A biciklizés", text: "Tíz perc biciklizés alatt megteszel körülbelül", number: 3, unit: "km" }
];

const UNIT_HINTS = {
    cm: "A centiméter kicsi távolságokra való – például egy ujjad is kb. 1 cm széles.",
    m: "A méter közepes távolságokra való – az osztályterem hossza is kb. 8 m.",
    km: "A kilométer nagy utakra való – két város között sok kilométer van."
};

export function generateLengthUnits(options = {}) {

    const { count = 5 } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {
        const fact = pick(FACTS);
        const units = shuffle(["cm", "m", "km"]);

        tasks.push({
            type: "length-units",
            emoji: fact.emoji,
            name: fact.name,
            text: fact.text,
            number: fact.number,
            unit: fact.unit,
            answer: units.indexOf(fact.unit),
            options: units,
            hint: UNIT_HINTS[fact.unit]
        });
    }

    return tasks;
}