// Őrzi a Gyakorlásra javasolt lista szabályát: az utolsó próba számít, nem a teljes előélet.
//
// Futtatás: make test

const store = {};

globalThis.localStorage = {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; }
};

const { createPlayer } = await import("./profile/UserManager.js");
const { recordLessonResult, getLessonStats, loadProfile, saveProfile } = await import("./profile/Profile.js");
const { getPracticeLessonFiles, latestPercentage } = await import("./components/practicePage.js");

let failures = 0;

function check(cond, message) {
    if (!cond) {
        failures++;
        console.error(`HIBA: ${message}`);
    }
}

const DAY = 24 * 60 * 60 * 1000;
const FILE = "grade1/addition-01.json";
const index = { lessons: [{ file: FILE, grades: [1] }] };

createPlayer("Teszt", "🦊", 1);

const onPracticeList = () => getPracticeLessonFiles(index, 1).includes(FILE);

recordLessonResult(FILE, 7, 3);
check(onPracticeList(), "70%-os lecke a gyakorlás listán van");

recordLessonResult(FILE, 10, 0);
check(!onPracticeList(), "hibátlan ismétlés után lekerül a gyakorlás listáról");
check(getLessonStats(FILE).lastPercentage === 100, "az utolsó próba 100%");
check(getLessonStats(FILE).percentage === 85, "az összesített eredmény marad 85%");

const profile = loadProfile();
profile.lessonStats[FILE].lastDoneAt = Date.now() - 15 * DAY;
saveProfile(profile);
check(onPracticeList(), "15 nap után ismét felajánlja gyakorlásra");
check(latestPercentage(getLessonStats(FILE)) === 100, "a régi mentésből is az utolsó próba jön");

recordLessonResult(FILE, 10, 0);
check(!onPracticeList(), "ismétlés után megint lekerül a listáról");

if (failures > 0) {
    console.error(`\nHIBA: ${failures} ellenőrzés bukott meg.`);
} else {
    console.log("\nGyakorlás lista teszt OK ✔");
}
process.exit(failures > 0 ? 1 : 0);
