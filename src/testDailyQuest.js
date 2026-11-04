// A napi küldetés csak rendes leckét számol, gyakorló/play leckét nem.
//
// Futtatás: make test

const store = {};

globalThis.localStorage = {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; }
};

const { createPlayer } = await import("./profile/UserManager.js");
const { completeLesson, loadProfile } = await import("./profile/Profile.js");

let failures = 0;

function check(cond, message) {
    if (!cond) {
        failures++;
        console.error(`HIBA: ${message}`);
    }
}

createPlayer("Teszt", "🦊", 1);

const start = loadProfile();
const startLessons = start.lessonsCompleted;
const startQuest = start.dailyQuest.progress;
const startSuns = start.napocskak?.postman ?? 0;

const practiceResult = completeLesson({ practice: true });
let profile = loadProfile();
check(profile.lessonsCompleted === startLessons, "gyakorlás nem növeli a leckeszámot");
check(profile.dailyQuest.progress === startQuest, "gyakorlás nem növeli a napi küldetést");
check(practiceResult.dailyQuestJustCompleted === false, "gyakorlás nem teljesíti a napi küldetést");
check((profile.napocskak?.postman ?? 0) === startSuns, "gyakorlás nem ad napocskát");
check(practiceResult.napocska === null, "gyakorlás napocskája null");

const first = completeLesson();
profile = loadProfile();
check(profile.dailyQuest.progress === startQuest + 1, "egy lecke után eggyel nő a küldetés");
check(first.dailyQuestJustCompleted === false, "egy lecke után még nincs kész");
check(first.napocska === null, "egy lecke után nincs napocska");

const second = completeLesson();
profile = loadProfile();
check(profile.dailyQuest.progress === startQuest + 2, "két lecke után kettővel nő a küldetés");
check(second.dailyQuestJustCompleted === false, "két lecke után még nincs kész");

const third = completeLesson();
profile = loadProfile();
check(profile.dailyQuest.progress === startQuest + 3, "három lecke után három a küldetés");
check(third.dailyQuestJustCompleted === true, "három lecke után teljesül a küldetés");
check(third.dailyQuestCompleted === true, "a küldetés completed jelzője igaz");
check(third.napocska?.world === "postman" && third.napocska?.count === startSuns + 1, "a napocska a teljesítés világához kerül");
check((profile.napocskak?.postman ?? 0) === startSuns + 1, "három lecke után +1 napocska a világ gyűjteményében");

const fourth = completeLesson();
profile = loadProfile();
check(profile.dailyQuest.progress === startQuest + 3, "a küldetés 3 felett nem nő tovább");
check(fourth.dailyQuestJustCompleted === false, "negyedik lecke után nincs újra teljesítés");
check(fourth.napocska === null && (profile.napocskak?.postman ?? 0) === startSuns + 1, "negyedik lecke nem ad újabb napocskát");

if (failures > 0) {
    console.error(`\nHIBA: ${failures} ellenőrzés bukott meg.`);
} else {
    console.log("\nNapi küldetés teszt OK ✔");
}
process.exit(failures > 0 ? 1 : 0);
