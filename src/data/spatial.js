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
    { id: "eger", name: "egér", article: "az", emoji: "🐭" },
    { id: "level", name: "levél", article: "a", emoji: "✉️" },
    { id: "csomag", name: "csomag", article: "a", emoji: "📦" },
    { id: "kulcs", name: "kulcs", article: "a", emoji: "🗝️" },
    { id: "kerek", name: "kerék", article: "a", emoji: "🛞" },
    { id: "sisak", name: "sisak", article: "a", emoji: "⛑️" },
    { id: "kesztyu", name: "kesztyű", article: "a", emoji: "🧤" },
    { id: "tojas", name: "tojás", article: "a", emoji: "🥚" },
    { id: "gomba", name: "gomba", article: "a", emoji: "🍄" },
    { id: "jatekos", name: "játékos", article: "a", emoji: "🧑" },
    { id: "zaszlo", name: "zászló", article: "a", emoji: "🚩" }
];

export const WORLD_REFS = {
    postman: ["postalada", "auto", "haz"],
    racing: ["versenyauto", "garazs", "rajtkapu"],
    cooking: ["tuzhely", "hutosekreny", "tal"],
    football: ["kapu", "lelato", "labdatarto"]
};

export const WORLD_OBJECTS = {
    postman: ["level", "csomag", "kulcs"],
    racing: ["kerek", "sisak", "kesztyu"],
    cooking: ["tojas", "alma", "gomba"],
    football: ["labda", "jatekos", "zaszlo"]
};

export const WORLD_REFERENCES = {
    postalada: {
        id: "postalada",
        name: "postaláda",
        bbox: { x: 80, y: 50, w: 60, h: 90 },
        labels: {
            above: "a postaláda felett",
            below: "a postaláda alatt",
            "in-front": "a postaláda előtt",
            behind: "a postaláda mögött",
            beside: "a postaláda mellett",
            left: "a postaládától balra",
            right: "a postaládától jobbra"
        }
    },
    auto: {
        id: "auto",
        name: "autó",
        bbox: { x: 60, y: 88, w: 100, h: 53 },
        labels: {
            above: "az autó felett",
            below: "az autó alatt",
            "in-front": "az autó előtt",
            behind: "az autó mögött",
            beside: "az autó mellett",
            left: "az autótól balra",
            right: "az autótól jobbra"
        }
    },
    versenyauto: {
        id: "versenyauto",
        name: "versenyautó",
        bbox: { x: 60, y: 104, w: 100, h: 42 },
        labels: {
            above: "a versenyautó felett",
            below: "a versenyautó alatt",
            "in-front": "a versenyautó előtt",
            behind: "a versenyautó mögött",
            beside: "a versenyautó mellett",
            left: "a versenyautótól balra",
            right: "a versenyautótól jobbra"
        }
    },
    garazs: {
        id: "garazs",
        name: "garázs",
        bbox: { x: 60, y: 55, w: 100, h: 90 },
        labels: {
            above: "a garázs felett",
            below: "a garázs alatt",
            "in-front": "a garázs előtt",
            behind: "a garázs mögött",
            beside: "a garázs mellett",
            left: "a garázstól balra",
            right: "a garázstól jobbra"
        }
    },
    rajtkapu: {
        id: "rajtkapu",
        name: "rajtkapu",
        bbox: { x: 60, y: 58, w: 100, h: 77 },
        labels: {
            above: "a rajtkapu felett",
            below: "a rajtkapu alatt",
            "in-front": "a rajtkapu előtt",
            behind: "a rajtkapu mögött",
            beside: "a rajtkapu mellett",
            left: "a rajtkaputól balra",
            right: "a rajtkaputól jobbra"
        }
    },
    tuzhely: {
        id: "tuzhely",
        name: "tűzhely",
        bbox: { x: 60, y: 70, w: 100, h: 80 },
        labels: {
            above: "a tűzhely felett",
            below: "a tűzhely alatt",
            "in-front": "a tűzhely előtt",
            behind: "a tűzhely mögött",
            beside: "a tűzhely mellett",
            left: "a tűzhelytől balra",
            right: "a tűzhelytől jobbra"
        }
    },
    hutosekreny: {
        id: "hutosekreny",
        name: "hűtőszekrény",
        bbox: { x: 80, y: 45, w: 60, h: 110 },
        labels: {
            above: "a hűtőszekrény felett",
            below: "a hűtőszekrény alatt",
            "in-front": "a hűtőszekrény előtt",
            behind: "a hűtőszekrény mögött",
            beside: "a hűtőszekrény mellett",
            left: "a hűtőszekrénytől balra",
            right: "a hűtőszekrénytől jobbra"
        }
    },
    tal: {
        id: "tal",
        name: "tál",
        bbox: { x: 70, y: 60, w: 80, h: 85 },
        labels: {
            above: "a tál felett",
            below: "a tál alatt",
            "in-front": "a tál előtt",
            behind: "a tál mögött",
            beside: "a tál mellett",
            left: "a táltól balra",
            right: "a táltól jobbra"
        }
    },
    kapu: {
        id: "kapu",
        name: "kapu",
        bbox: { x: 60, y: 50, w: 100, h: 100 },
        labels: {
            above: "a kapu felett",
            below: "a kapu alatt",
            "in-front": "a kapu előtt",
            behind: "a kapu mögött",
            beside: "a kapu mellett",
            left: "a kaputól balra",
            right: "a kaputól jobbra"
        }
    },
    lelato: {
        id: "lelato",
        name: "lelátó",
        bbox: { x: 60, y: 94, w: 100, h: 56 },
        labels: {
            above: "a lelátó felett",
            below: "a lelátó alatt",
            "in-front": "a lelátó előtt",
            behind: "a lelátó mögött",
            beside: "a lelátó mellett",
            left: "a lelátótól balra",
            right: "a lelátótól jobbra"
        }
    },
    labdatarto: {
        id: "labdatarto",
        name: "labdatartó",
        bbox: { x: 70, y: 45, w: 80, h: 83 },
        labels: {
            above: "a labdatartó felett",
            below: "a labdatartó alatt",
            "in-front": "a labdatartó előtt",
            behind: "a labdatartó mögött",
            beside: "a labdatartó mellett",
            left: "a labdatartótól balra",
            right: "a labdatartótól jobbra"
        }
    }
};

REFERENCES.push(...Object.values(WORLD_REFERENCES));
