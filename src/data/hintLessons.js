export const HINT_TYPES = new Set([
    "addition",
    "subtraction",
    "mixed",
    "estimate",
    "written-operation",
    "written-division",
    "remainder-division",
    "polygon",
    "compound-shape",
    "shape-formula",
    "length-units",
    "measure-units"
]);

export function lessonHasHint(lessonMeta) {
    return HINT_TYPES.has(lessonMeta?.type);
}
