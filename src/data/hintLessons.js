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
    "measure-units",
    "fraction-common-den",
    "fraction-times-int",
    "fraction-times-frac",
    "fraction-divide",
    "percent",
    "speed-trip",
    "average",
    "integer",
    "number-line",
    "integer-ops",
    "integer-muldiv",
    "divisibility-rule"
]);

export function lessonHasHint(lessonMeta) {
    return HINT_TYPES.has(lessonMeta?.type);
}
