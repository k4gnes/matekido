// Felmérés (⏱️ Időmérő) üzemmód: a kedvenc-leckékből álló futás összesített ideje,
// feladatonkénti helyessége és a korábbi futásokkal való összevetés.
// A mentés a Profile.js-ben van, itt csak futásállapot + tiszta függvények,
// hogy tesztelhető legyen DOM és localStorage nélkül.

let run = null;

export function formatDuration(seconds) {

    const s = Math.max(0, Math.round(seconds ?? 0));

    if (s < 60) return `${s} mp`;

    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

}

// Ugyanaz a kedvenc-halmaz mindig ugyanaz a kulcs: a lista sorrendje nem számít,
// így a későbbi, újrarendezett kedvenc-listára is rá talál a korábbi futásokra.
export function runKey(files) {

    return [...(files ?? [])].sort().join("|");

}

// A tárolt felmérő lista elemei a lecke id-jai (a tananyag `?lesson=` hivatkozásai),
// a játék viszont leckefájlokkal dolgozik: itt alakítjuk át, a hiányzó lecke kimarad.
export function resolveAssessmentLessons(ids, lessons) {

    const byId = new Map((lessons ?? []).map(l => [l.id, l]));

    return (ids ?? []).map(id => byId.get(id)).filter(Boolean);

}

// A `label` a lista neve a mentett futáson ("5 kedvenc", "5 felmérő"); nélküle
// a régi kedvenc-felirat marad.
export function beginRun(files, startedAt = Date.now(), label = null) {

    run = {
        key: runKey(files),
        files: [...(files ?? [])],
        startedAt,
        label,
        lessons: [],
        timeBefore: 0,
        finished: false
    };

    return run;

}

export function recordRunLesson(entry) {

    if (!run || run.finished) return null;

    const seconds = Math.max(0, Math.round(entry?.seconds ?? 0));

    run.lessons.push({ ...entry, seconds });
    run.timeBefore += seconds;

    return run;

}

// A látható óra a már elvégzett leckék idejét + az épp futó leckét mutatja.
export function runSeconds(elapsed = 0) {

    return (run?.timeBefore ?? 0) + Math.max(0, Math.round(elapsed));

}

export function finishRun(now = Date.now()) {

    if (!run || run.finished) return null;

    run.finished = true;

    const lessons = run.lessons.map(l => ({ ...l }));

    return {
        key: run.key,
        files: [...run.files],
        label: run.label ?? `${run.files.length} kedvenc`,
        startedAt: run.startedAt,
        finishedAt: now,
        date: new Date(now).toISOString().slice(0, 10),
        seconds: lessons.reduce((sum, l) => sum + l.seconds, 0),
        correct: lessons.reduce((sum, l) => sum + (l.correct ?? 0), 0),
        wrong: lessons.reduce((sum, l) => sum + (l.wrong ?? 0), 0),
        lessons
    };

}

export function previousRuns(assessments, key, excludeStartedAt = null, limit = 5) {

    return (assessments ?? [])
        .filter(a => a?.key === key && a.startedAt !== excludeStartedAt)
        .slice(0, limit);

}

// A legtöbb hibás futás sorszáma (a „mikor volt több hibája” jelöléshez),
// -1, ha nincs hibás futás a listában.
export function worstRunIndex(runs) {

    let worst = -1;
    let max = 0;

    (runs ?? []).forEach((r, i) => {
        if ((r?.wrong ?? 0) > max) {
            max = r.wrong;
            worst = i;
        }
    });

    return worst;

}

// Semleges tényközlés az előző futáshoz képest: hiba és idő, minősítés nélkül.
export function compareText(current, previous) {

    if (!current || !previous) return null;

    return [
        `hiba: ${previous.wrong ?? 0} → ${current.wrong ?? 0}`,
        `idő: ${formatDuration(previous.seconds)} → ${formatDuration(current.seconds)}`
    ].join(" · ");

}

// Egy futás sora alá: a benne szereplő kedvenc leckék tooltipként.
export function runTooltip(run, heading = null) {

    const parts = run?.lessons?.length
        ? run.lessons.map(l => l.title ?? l.file)
        : (run?.files ?? []);

    return [heading, ...parts.map(t => `• ${t}`)].filter(Boolean).join("\n");

}

// A lefutó óra a body-ra kerül, hogy a leckeléptetés ne törlje le.
export function mountTimer(readSeconds) {

    document.querySelector(".assessment-timer")?.remove();

    const el = document.createElement("div");
    el.className = "assessment-timer";

    const paint = () => { el.textContent = `⏱️ ${formatDuration(readSeconds())}`; };
    paint();

    const id = setInterval(paint, 1000);
    document.body.append(el);

    return () => {
        clearInterval(id);
        el.remove();
    };

}
