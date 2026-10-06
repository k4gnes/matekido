const SEPARATOR = "\u00A0";
const TEXT_NUMBER = /(^|[^\d.,\/:\p{L}])(\d{4,})(?=$|[^\d.,\/:\p{L}])/gu;
const INTEGER = /^(-?)(\d+)(.*)$/;
const SKIPPED_TAGS = new Set(["INPUT", "TEXTAREA", "SCRIPT", "STYLE", "NOSCRIPT"]);

export function formatThousands(value) {

    const text = String(value);
    const match = text.match(INTEGER);

    if (!match) return text;

    return match[1] + match[2].replace(/\B(?=(\d{3})+(?!\d))/g, SEPARATOR) + match[3];

}

export function formatNumbersInText(text) {

    return String(text).replace(TEXT_NUMBER, (match, prefix, digits) =>
        prefix + digits.replace(/\B(?=(\d{3})+(?!\d))/g, SEPARATOR));

}

function isFormatTarget(node) {

    if (node.nodeType !== Node.TEXT_NODE) return false;
    if (!/\d{4}/.test(node.nodeValue)) return false;

    const parent = node.parentElement;
    if (!parent || SKIPPED_TAGS.has(parent.tagName)) return false;

    return true;

}

function formatTextNode(node) {

    if (!isFormatTarget(node)) return;

    const formatted = formatNumbersInText(node.nodeValue);
    if (formatted !== node.nodeValue) node.nodeValue = formatted;

}

export function formatBigNumbers(root) {

    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const targets = [];

    let node = walker.nextNode();

    while (node) {
        if (isFormatTarget(node)) targets.push(node);
        node = walker.nextNode();
    }

    for (const target of targets) {
        formatTextNode(target);
    }

}

export function observeBigNumbers(root) {

    formatBigNumbers(root);

    if (!root || typeof MutationObserver === "undefined") return () => {};

    const observer = new MutationObserver(records => {
        for (const record of records) {
            if (record.type === "characterData") {
                formatTextNode(record.target);
                continue;
            }
            for (const added of record.addedNodes) {
                if (added.nodeType === Node.TEXT_NODE) {
                    formatTextNode(added);
                } else if (added.nodeType === Node.ELEMENT_NODE) {
                    formatBigNumbers(added);
                }
            }
        }
    });

    observer.observe(root, { subtree: true, childList: true, characterData: true });

    return () => observer.disconnect();

}
