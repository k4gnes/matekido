export function loadJSON(key, fallback = null) {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

export function saveJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

export function loadRaw(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

export function saveRaw(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch {
        return false;
    }
}

export function removeKeys(...keys) {
    try {
        keys.forEach(key => localStorage.removeItem(key));
    } catch {}
}
