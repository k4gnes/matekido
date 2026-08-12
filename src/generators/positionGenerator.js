import { getActiveWorld } from "../profile/Profile.js";
import { REFERENCES, OBJECTS, POSITION_IDS, WORLD_REFS, WORLD_OBJECTS } from "../data/spatial.js";

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function distractorPool(position) {
    if (position === "beside") {
        return POSITION_IDS.filter(p => p !== "left" && p !== "right");
    }
    if (position === "left" || position === "right") {
        return POSITION_IDS.filter(p => p !== "beside");
    }
    return [...POSITION_IDS];
}

export function generatePosition(options = {}) {

    const { count = 5, refs = null, positions = null, objects = null } = options;

    const world = getActiveWorld();

    const worldRefs = WORLD_REFS[world] ?? null;
    const worldObjs = WORLD_OBJECTS[world] ?? null;

    const refPool = refs
        ? REFERENCES.filter(r => refs.includes(r.id))
        : worldRefs
            ? REFERENCES.filter(r => worldRefs.includes(r.id))
            : REFERENCES;
    const posPool = positions ? POSITION_IDS.filter(p => positions.includes(p)) : [...POSITION_IDS];
    const objPool = objects
        ? OBJECTS.filter(o => objects.includes(o.id))
        : worldObjs
            ? OBJECTS.filter(o => worldObjs.includes(o.id))
            : OBJECTS;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const ref = pick(refPool);
        const obj = pick(objPool);
        const position = pick(posPool);
        const answer = ref.labels[position];

        const pool = distractorPool(position).filter(p => p !== position);
        const distractors = shuffle(pool).slice(0, 3);

        const optionsArr = shuffle([
            { text: answer, correct: true },
            ...distractors.map(p => ({ text: ref.labels[p], correct: false }))
        ]);

        tasks.push({
            type: "spatial",
            ref: ref.id,
            object: obj.id,
            position,
            answer,
            options: optionsArr
        });
    }

    return tasks;
}
