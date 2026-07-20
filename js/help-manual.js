// =========================================
// Help Manual Panel
// =========================================

function initializeHelpManual() {

    const openButton =
        document.getElementById(
            "helpManualBtn"
        );

    const closeButton =
        document.getElementById(
            "helpManualCloseBtn"
        );

    const overlay =
        document.getElementById(
            "helpManualOverlay"
        );

    const panel =
        document.getElementById(
            "helpManualPanel"
        );

    if (
        !openButton ||
        // !closeButton ||
        !overlay ||
        !panel
    ) {
        return;
    }

    const openManual =
        () => {

            overlay.hidden = false;
            panel.hidden = false;

            requestAnimationFrame(
                () => {
                    overlay.classList.add("open");
                    panel.classList.add("open");
                }
            );

            document.body.classList.add(
                "helpManualOpen"
            );

            openButton.setAttribute(
                "aria-expanded",
                "true"
            );

            panel.setAttribute(
                "aria-hidden",
                "false"
            );

            overlay.setAttribute(
                "aria-hidden",
                "false"
            );

            closeButton?.focus();

        };

    const closeManual =
        () => {

            overlay.classList.remove("open");
            panel.classList.remove("open");

            document.body.classList.remove(
                "helpManualOpen"
            );

            openButton.setAttribute(
                "aria-expanded",
                "false"
            );

            panel.setAttribute(
                "aria-hidden",
                "true"
            );

            overlay.setAttribute(
                "aria-hidden",
                "true"
            );

            window.setTimeout(
                () => {
                    overlay.hidden = true;
                    panel.hidden = true;
                },
                250
            );

        };

    openButton.addEventListener(
        "click",
        openManual
    );

    closeButton?.addEventListener(
        "click",
        closeManual
    );

    overlay.addEventListener(
        "click",
        closeManual
    );

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                panel.classList.contains(
                    "open"
                )
            ) {
                event.preventDefault();
                closeManual();
            }

        }
    );

}

document.addEventListener(
    "DOMContentLoaded",
    initializeHelpManual
);
