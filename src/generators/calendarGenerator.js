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
const MONTH_DAYS = {
    január: 31,
    február: 28,
    március: 31,
    április: 30,
    május: 31,
    június: 30,
    július: 31,
    augusztus: 31,
    szeptember: 30,
    október: 31,
    november: 30,
    december: 31
};
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

function buildTask(advanced) {
    const modes = advanced
        ? ["days-in-month", "leap-february", "weekend-workday", "month-of-season", "season-months", "two-weeks-days", "long-month"]
        : ["next-day", "prev-day", "tomorrow", "yesterday", "between-days", "next-month", "prev-month", "season-of-month", "next-season", "count-days", "count-months"];
    const mode = pick(modes);

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

    if (mode === "season-of-month" || mode === "month-of-season") {
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

    if (mode === "count-months") {
        const { options, answer } = withNumberDistractors(12, [10, 11, 12, 13, 14], 2);
        return { type: "calendar", mode, question: "Hány hónapja van egy évnek?", options, answer };
    }

    if (mode === "days-in-month") {
        const month = MONTHS[monthIdx];
        const correct = MONTH_DAYS[month];
        const { options, answer } = withNumberDistractors(correct, [28, 29, 30, 31], 2);
        return { type: "calendar", mode, question: `Hány napja van a(z) ${month} hónapnak?`, options, answer };
    }

    if (mode === "leap-february") {
        const correct = 29;
        const { options, answer } = withNumberDistractors(correct, [28, 29, 30, 31], 2);
        return { type: "calendar", mode, question: "Hány napja van februárnak szökőévben?", options, answer };
    }

    if (mode === "weekend-workday") {
        const day = DAYS[dayIdx];
        const weekday = dayIdx < 5;
        const correct = weekday ? "hétköznap" : "hétvége";
        const { options, answer } = withDistractors(correct, ["hétköznap", "hétvége"], 1);
        return { type: "calendar", mode, question: `A(z) ${day} hétköznap vagy hétvége?`, options, answer };
    }

    if (mode === "season-months") {
        const season = SEASONS[monthIdx % SEASONS.length];
        const seasonMonths = MONTHS.filter(m => SEASON_OF[m] === season);
        const anchor = pick(seasonMonths);
        const correct = pick(seasonMonths.filter(m => m !== anchor));
        const article = /^[aeiouáéíóöőúüű]/.test(anchor) ? "Az" : "A";
        const { options, answer } = withDistractors(correct, MONTHS.filter(m => SEASON_OF[m] !== season), 2);
        return { type: "calendar", mode, question: `${article} ${anchor} ${season}i hónap. Melyik hónap ${season}i még?`, options, answer };
    }

    if (mode === "two-weeks-days") {
        const { options, answer } = withNumberDistractors(14, [7, 14, 21, 28], 2);
        return { type: "calendar", mode, question: "Hány nap van 2 hétben?", options, answer };
    }

    if (mode === "long-month") {
        const correct = pick(MONTHS.filter(m => MONTH_DAYS[m] === 31));
        const shortMonths = MONTHS.filter(m => MONTH_DAYS[m] !== 31);
        const { options, answer } = withDistractors(correct, shortMonths.map(m => m), 2);
        return { type: "calendar", mode, question: "Melyik hónapnak van 31 napja?", options, answer };
    }

    const { options, answer } = withNumberDistractors(12, [10, 11, 12, 13, 14], 2);
    return { type: "calendar", mode, question: "Hány hónapja van egy évnek?", options, answer };
}

export function generateCalendar(options = {}) {
    const { count = 5, advanced = false } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        tasks.push(buildTask(advanced));
    }
    return tasks;
}