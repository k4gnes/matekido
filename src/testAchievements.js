// A Napfényjáró jelvény: minden világban kell legalább 1 napocska.
//
// Futtatás: make test

const { ACHIEVEMENTS, getUnlockedAchievements } = await import("./profile/Achievements.js");

let failures = 0;

function check(cond, message) {
    if (!cond) {
        failures++;
        console.error(`HIBA: ${message}`);
    }
}

const ids = ["postman", "racing", "cooking", "football", "animals", "space", "tram"];
const suns = n => Object.fromEntries(ids.slice(0, n).map(id => [id, 1]));
const isUnlocked = profile => getUnlockedAchievements(profile).some(a => a.id === "sun-all-worlds");

const ach = ACHIEVEMENTS.find(a => a.id === "sun-all-worlds");
check(!!ach, "a Napfényjáró jelvény benne van a listában");
check(ach?.target === 7, "a jelvény célja 7 világ");

check(!isUnlocked({}), "üres profil nem old fel");
check(!isUnlocked({ napocskak: suns(6) }), "6 világ még nem old fel");
check(isUnlocked({ napocskak: suns(7) }), "mind a 7 világ feloldja");
check(!isUnlocked({ napocskak: Object.fromEntries(ids.map(id => [id, 0])) }), "0 napocska nem old fel");

if (failures > 0) {
    console.error(`\nHIBA: ${failures} ellenőrzés bukott meg.`);
} else {
    console.log("\nJelvény teszt OK ✔");
}
process.exit(failures > 0 ? 1 : 0);
