import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, sep } from "node:path";

const SRC = join(new URL("../", import.meta.url).pathname, "src");
const OUT = join(SRC, "sw-cache.js");
const EXCLUDE = new Set(["generateSWCache.js", "sw-cache.js"]);

const files = [];

function walk(dir) {
    for (const name of readdirSync(dir)) {
        if (EXCLUDE.has(name)) continue;

        const full = join(dir, name);
        if (statSync(full).isDirectory()) {
            walk(full);
        } else {
            const rel = full.slice(SRC.length).split(sep).join("/");
            files.push(rel);
        }
    }
}

walk(SRC);
files.sort();

const out = `const SW_CACHE_LIST = ${JSON.stringify(files, null, 4)};\n`;
writeFileSync(OUT, out);
console.log(`sw-cache.js: ${files.length} fájl`);
