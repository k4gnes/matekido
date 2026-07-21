import { getActiveWorld, setActiveWorld, getUnlockedWorldIds } from "./Profile.js";
import { getAllWorlds, getWorld } from "../world/WorldRegistry.js";

export function getCurrentWorld() {
    const id = getActiveWorld();
    return getWorld(id);
}

export function switchWorld(worldId) {
    const unlocked = getUnlockedWorldIds();
    if (unlocked.includes(worldId)) {
        setActiveWorld(worldId);
        return true;
    }
    return false;
}

export function getAvailableWorlds() {
    const all = getAllWorlds();
    const unlocked = getUnlockedWorldIds();
    return all.map(w => ({
        ...w,
        unlocked: unlocked.includes(w.id)
    }));
}
