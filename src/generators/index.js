import { generateAddition } from "./additionGenerator.js?v=3";

export function generate(step) {

    switch (step.generator) {

        case "addition":
            return generateAddition(step.options);
        case "subtraction":
        case "multiplication":
        case "division":

        default:
            throw new Error(
                `Ismeretlen generátor: ${step.generator}`
            );
    }

}