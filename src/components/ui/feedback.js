import { createButton } from "./button.js";

export function markCorrect(el) {
    if (el) el.classList.add("option-correct");
}

export function createFeedback({ message, container, onNext, onResult, onAttempt }) {

    let answered = false;
    let reported = false;
    let mistakes = 0;
    let navigated = false;

    function success(text = "😊 Szép munka!") {
        if (answered) return;
        answered = true;

        onAttempt?.();

        message.show(text, "success");

        if (!reported) {
            reported = true;
            onResult?.(true);
        }

        container.querySelectorAll("button").forEach(btn => {
            if (btn.textContent.trim() === "Ellenőrzöm") {
                btn.remove();
            }
        });

        const nextBtn = createButton("➡️ Tovább", {
            className: "next-btn",
            onClick: () => {
                if (navigated) return;
                navigated = true;
                onNext?.();
            }
        });
        container.append(nextBtn);
        setTimeout(() => nextBtn.focus(), 0);
    }

    function retry(customText) {
        if (answered) return;

        onAttempt?.();

        message.show(customText ?? (mistakes === 1
            ? "🙂 Majdnem! Próbáld meg még egyszer!"
            : "🤔 Még nem sikerült."), "retry");

        mistakes++;

        if (!reported) {
            reported = true;
            onResult?.(false);
        }
    }

    return {
        success,
        retry,
        isAnswered: () => answered,
        getMistakes: () => mistakes
    };

}
