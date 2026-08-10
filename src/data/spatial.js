export const POSITION_IDS = [
    "above",
    "below",
    "in-front",
    "behind",
    "beside",
    "left",
    "right"
];

export const REFERENCES = [
    {
        id: "doboz",
        name: "doboz",
        bbox: { x: 80, y: 40, w: 60, h: 100 },
        labels: {
            above: "a doboz felett",
            below: "a doboz alatt",
            "in-front": "a doboz előtt",
            behind: "a doboz mögött",
            beside: "a doboz mellett",
            left: "a doboztól balra",
            right: "a doboztól jobbra"
        }
    },
    {
        id: "fa",
        name: "fa",
        bbox: { x: 75, y: 35, w: 70, h: 130 },
        labels: {
            above: "a fa felett",
            below: "a fa alatt",
            "in-front": "a fa előtt",
            behind: "a fa mögött",
            beside: "a fa mellett",
            left: "a fától balra",
            right: "a fától jobbra"
        }
    },
    {
        id: "szek",
        name: "szék",
        bbox: { x: 80, y: 58, w: 60, h: 107 },
        labels: {
            above: "a szék felett",
            below: "a szék alatt",
            "in-front": "a szék előtt",
            behind: "a szék mögött",
            beside: "a szék mellett",
            left: "a széktől balra",
            right: "a széktől jobbra"
        }
    },
    {
        id: "asztal",
        name: "asztal",
        bbox: { x: 55, y: 85, w: 110, h: 80 },
        labels: {
            above: "az asztal felett",
            below: "az asztal alatt",
            "in-front": "az asztal előtt",
            behind: "az asztal mögött",
            beside: "az asztal mellett",
            left: "az asztaltól balra",
            right: "az asztaltól jobbra"
        }
    },
    {
        id: "haz",
        name: "ház",
        bbox: { x: 70, y: 45, w: 80, h: 120 },
        labels: {
            above: "a ház felett",
            below: "a ház alatt",
            "in-front": "a ház előtt",
            behind: "a ház mögött",
            beside: "a ház mellett",
            left: "a háztól balra",
            right: "a háztól jobbra"
        }
    }
];

export const OBJECTS = [
    { id: "labda", name: "labda", article: "a", emoji: "⚽" },
    { id: "alma", name: "alma", article: "az", emoji: "🍎" },
    { id: "virag", name: "virág", article: "a", emoji: "🌸" },
    { id: "pillango", name: "pillangó", article: "a", emoji: "🦋" },
    { id: "macska", name: "macska", article: "a", emoji: "🐱" },
    { id: "kutya", name: "kutya", article: "a", emoji: "🐶" },
    { id: "eger", name: "egér", article: "az", emoji: "🐭" }
];
