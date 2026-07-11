import { generateAddition } from "./generators/additionGenerator.js";

console.table(
    generateAddition({
        count: 10,
        carry: "never"
    })
);