function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const FAMILIES = {
    road: {
        speedUnit: "km/h",
        timeUnit: "óra",
        distanceUnit: "km",
        speeds: [10, 20, 30, 40, 50, 60, 80, 100],
        times: [1, 2, 3, 4, 5, 6, 8, 10]
    },
    pace: {
        speedUnit: "m/perc",
        timeUnit: "perc",
        distanceUnit: "m",
        speeds: [40, 50, 60, 80, 100, 120, 150, 200],
        times: [2, 3, 4, 5, 6, 8, 10, 12, 15]
    }
};

const SUBJECTS = {
    road: {
        postman: ["🛵", "A postás robogója"],
        racing: ["🏎️", "A versenyautó"],
        football: ["🚌", "A szurkolói busz"],
        cooking: ["🛵", "A futár robogója"],
        animals: ["🚐", "Az állatkerti kisbusz"],
        space: ["🚀", "A gyors űrhajó"],
        tram: ["🚋", "A villamos"]
    },
    pace: {
        postman: ["🚶", "A kézbesítő gyalog"],
        racing: ["🔧", "A szerelő"],
        football: ["⚽", "A futballista"],
        cooking: ["👨‍🍳", "A szakács"],
        animals: ["🐇", "A nyúl"],
        space: ["🧑‍🚀", "Az űrhajós"],
        tram: ["🚶", "Az utas"]
    }
};

const FALLBACK_SUBJECTS = {
    road: ["🚗", "Egy autó"],
    pace: ["🚶", "Egy gyalogos"]
};

function questionFor(mode, units) {
    if (mode === "distance") return `Hány ${units.distanceUnit}-t tesz meg?`;
    if (mode === "time") return `Hány ${units.timeUnit} alatt ér oda?`;
    return `Hány ${units.speedUnit}?`;
}

function contextFor(mode, units, subject, speed, time, distance) {
    const lead = `${subject[0]} ${subject[1]}`;
    if (mode === "distance") {
        return `${lead} sebessége ${speed} ${units.speedUnit}, utazási ideje ${time} ${units.timeUnit}.`;
    }
    if (mode === "time") {
        return `${lead} ${distance} ${units.distanceUnit}-t tesz meg, sebessége ${speed} ${units.speedUnit}.`;
    }
    return `${lead} ${distance} ${units.distanceUnit}-t tesz meg ${time} ${units.timeUnit} alatt.`;
}

function naturalsFor(mode, answer, speed, time) {
    if (mode === "distance") return [speed + time, speed * 2, speed * time - speed];
    if (mode === "time") return [answer * 10, answer * 2, speed];
    return [answer * 10, answer * 2, time];
}

function makeOptions(answer, naturals) {
    const options = new Set([answer]);
    for (const candidate of naturals) {
        if (options.size >= 4) break;
        if (Number.isInteger(candidate) && candidate >= 1 && candidate <= 1200 && candidate !== answer) {
            options.add(candidate);
        }
    }
    let guard = 0;
    while (options.size < 4 && guard < 60) {
        guard++;
        const delta = random(2, Math.max(3, Math.round(answer / 5)));
        const candidate = answer + (Math.random() < 0.5 ? -1 : 1) * delta;
        if (candidate >= 1 && candidate <= 1200) options.add(candidate);
    }
    let k = 1;
    while (options.size < 4 && k < 400) {
        if (answer + k <= 1200) options.add(answer + k);
        if (answer - k >= 1) options.add(answer - k);
        k++;
    }
    return shuffle([...options]);
}

function pickPair(family, maxDistance) {
    const units = FAMILIES[family];
    const pairs = [];
    for (const speed of units.speeds) {
        for (const time of units.times) {
            if (speed * time <= maxDistance) pairs.push([speed, time]);
        }
    }
    if (pairs.length === 0) return [units.speeds[0], units.times[0]];
    return pairs[random(0, pairs.length - 1)];
}

function buildTask(mode, family, interaction, world, speed, time) {
    const units = FAMILIES[family];
    const distance = speed * time;
    const answer = mode === "distance" ? distance : mode === "time" ? time : speed;
    const subject = SUBJECTS[family][world] ?? FALLBACK_SUBJECTS[family];

    const task = {
        mode,
        family,
        speed,
        time,
        distance,
        answer,
        interaction,
        question: questionFor(mode, units),
        context: contextFor(mode, units, subject, speed, time, distance)
    };

    if (interaction === "choice") {
        task.options = makeOptions(answer, naturalsFor(mode, answer, speed, time));
    }

    return task;
}

export function generateSpeedTrip(options = {}) {
    const {
        count = 6,
        mode = "mixed",
        family = "road",
        interaction = "choice",
        maxDistance = 1000,
        world
    } = options;

    const tasks = [];
    const seen = new Set();
    let attempts = 0;

    while (tasks.length < count && attempts < 400) {
        attempts++;
        const index = tasks.length;
        const resolvedMode = mode === "mixed" ? ["distance", "time", "speed"][index % 3] : mode;
        const resolvedFamily = family === "both" ? ["road", "pace"][index % 2] : family;
        const resolvedInteraction = interaction === "mixed" ? ["choice", "input"][index % 2] : interaction;
        const [speed, time] = pickPair(resolvedFamily, maxDistance);
        const signature = `${resolvedMode}|${resolvedFamily}|${speed}|${time}`;
        if (seen.has(signature)) continue;
        seen.add(signature);
        tasks.push(buildTask(resolvedMode, resolvedFamily, resolvedInteraction, world, speed, time));
    }

    return tasks;
}
