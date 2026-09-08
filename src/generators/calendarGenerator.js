function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const DAYS = ["hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat", "vasárnap"];
const MONTHS = ["január", "február", "március", "április", "május", "június", "július", "augusztus", "szeptember", "október", "november", "december"];
const SEASONS = ["tavasz", "nyár", "ősz", "tél"];
const SEASON_OF = {
    december: "tél",
    január: "tél",
    február: "tél",
    március: "tavasz",
    április: "tavasz",
    május: "tavasz",
    június: "nyár",
    július: "nyár",
    augusztus: "nyár",
    szeptember: "ősz",
    október: "ősz",
    november: "ősz"
};

function withDistractors(correct, pool, count) {
    const poolCopy = shuffle([...pool]).filter(x => x !== correct);
    const options = shuffle([correct, ...poolCopy.slice(0, count)]);
    return { options, answer: options.indexOf(correct) };
}

function withNumberDistractors(correct, numbers, count) {
    const pool = shuffle(numbers.filter(n => n !== correct)).slice(0, count);
    const options = shuffle([correct, ...pool]);
    return { options, answer: options.indexOf(correct) };
}

function buildTask() {
    const mode = pick(["next-day", "prev-day", "tomorrow", "yesterday", "between-days", "next-month", "prev-month", "season-of-month", "next-season", "count-days", "count-months"]);

    const dayIdx = Math.floor(Math.random() * DAYS.length);
    const monthIdx = Math.floor(Math.random() * MONTHS.length);

    if (mode === "next-day") {
        const day = DAYS[dayIdx];
        const correct = DAYS[(dayIdx + 1) % DAYS.length];
        const { options, answer } = withDistractors(correct, DAYS, 2);
        return { type: "calendar", mode, question: `Melyik nap jön a(z) ${day} után?`, options, answer };
    }

    if (mode === "prev-day") {
        const day = DAYS[dayIdx];
        const correct = DAYS[(dayIdx + 6) % DAYS.length];
        const { options, answer } = withDistractors(correct, DAYS, 2);
        return { type: "calendar", mode, question: `Melyik nap van a(z) ${day} előtt?`, options, answer };
    }

    if (mode === "tomorrow") {
        const day = DAYS[dayIdx];
        const correct = DAYS[(dayIdx + 1) % DAYS.length];
        const { options, answer } = withDistractors(correct, DAYS, 2);
        return { type: "calendar", mode, question: `Ha ma ${day} van, holnap melyik nap lesz?`, options, answer };
    }

    if (mode === "yesterday") {
        const day = DAYS[dayIdx];
        const correct = DAYS[(dayIdx + 6) % DAYS.length];
        const { options, answer } = withDistractors(correct, DAYS, 2);
        return { type: "calendar", mode, question: `Ha ma ${day} van, tegnap melyik nap volt?`, options, answer };
    }

    if (mode === "between-days") {
        const left = DAYS[dayIdx];
        const correct = DAYS[(dayIdx + 1) % DAYS.length];
        const right = DAYS[(dayIdx + 2) % DAYS.length];
        const { options, answer } = withDistractors(correct, DAYS, 2);
        return { type: "calendar", mode, question: `Melyik nap van ${left} és ${right} között?`, options, answer };
    }

    if (mode === "next-month") {
        const month = MONTHS[monthIdx];
        const correct = MONTHS[(monthIdx + 1) % MONTHS.length];
        const { options, answer } = withDistractors(correct, MONTHS, 2);
        return { type: "calendar", mode, question: `Melyik hónap jön a(z) ${month} után?`, options, answer };
    }

    if (mode === "prev-month") {
        const month = MONTHS[monthIdx];
        const correct = MONTHS[(monthIdx + 11) % MONTHS.length];
        const { options, answer } = withDistractors(correct, MONTHS, 2);
        return { type: "calendar", mode, question: `Melyik hónap van a(z) ${month} előtt?`, options, answer };
    }

    if (mode === "season-of-month") {
        const month = MONTHS[monthIdx];
        const correct = SEASON_OF[month];
        const { options, answer } = withDistractors(correct, SEASONS, 2);
        return { type: "calendar", mode, question: `Melyik évszakban van a(z) ${month}?`, options, answer };
    }

    if (mode === "next-season") {
        const season = SEASONS[monthIdx % SEASONS.length];
        const correct = SEASONS[(SEASONS.indexOf(season) + 1) % SEASONS.length];
        const { options, answer } = withDistractors(correct, SEASONS, 2);
        return { type: "calendar", mode, question: `Melyik évszak jön a(z) ${season} után?`, options, answer };
    }

    if (mode === "count-days") {
        const { options, answer } = withNumberDistractors(7, [4, 5, 6, 7, 8, 9], 2);
        return { type: "calendar", mode, question: "Hány napja van egy hétnek?", options, answer };
    }

    const { options, answer } = withNumberDistractors(12, [10, 11, 12, 13, 14], 2);
    return { type: "calendar", mode, question: "Hány hónapja van egy évnek?", options, answer };
}

export function generateCalendar(options = {}) {
    const { count = 5 } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        tasks.push(buildTask());
    }
    return tasks;
}