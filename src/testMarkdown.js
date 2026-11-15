// Táblázat-parse teszt: a \| escape-elt cső nem oszthatja szét a sort (pl. |n| a cellában).
import assert from "node:assert";
import { renderMarkdown } from "./utils/markdown.js";

const md = [
    "| # | Lecke | Leírás |",
    "|---|-------|--------|",
    "| 8 | Ellentett | Ellentett és \\|n\\| |",
].join("\n");

const html = renderMarkdown(md);
assert.strictEqual((html.match(/<td>/g) || []).length, 3, "3 cella kell, nem több");
assert.ok(html.includes("<td>Ellentett és |n|</td>"), `a |n| egy cellában marad: ${html}`);
assert.strictEqual((html.match(/<th>/g) || []).length, 3, "a fejléc is 3 oszlop");

const plain = renderMarkdown(["| A | B |", "|---|---|", "| 1 | 2 |"].join("\n"));
assert.strictEqual((plain.match(/<td>/g) || []).length, 2, "a sima sor nem változik");

console.log("markdown teszt OK ✔");
