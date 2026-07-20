// =========================================
// Inspector Accordion
// =========================================

const inspectorSectionHeaders =
    document.querySelectorAll(
        ".inspectorSectionHeader"
    );

const inspectorAnimationDuration =
    240;

// =========================================
// 초기화
// =========================================

function initializeInspector() {

    inspectorSectionHeaders.forEach(
        header => {

            if (
                header.dataset
                    .inspectorInitialized ===
                    "true"
            ) {
                return;
            }

            header.dataset
                .inspectorInitialized =
                    "true";

            header.addEventListener(
                "click",
                () =>
                    openInspectorSection(
                        header
                    )
            );

        }
    );

    document
        .querySelectorAll(
            ".inspectorSection"
        )
        .forEach(
            section => {

                const body =
                    section.querySelector(
                        ".inspectorSectionBody"
                    );

                if (!body) {
                    return;
                }

                if (
                    section.classList
                        .contains(
                            "open"
                        )
                ) {

                    body.hidden =
                        false;

                    body.style.maxHeight =
                        "none";

                } else {

                    body.hidden =
                        true;

                    body.style.maxHeight =
                        "0px";

                }

            }
        );
        

    console.log(
        "Inspector Ready"
    );

}

// =========================================
// 아코디언 열기
// =========================================

function openInspectorSection(
    selectedHeader
) {

    const targetId =
        selectedHeader
            .dataset
            .inspectorTarget;

    const targetBody =
        document.getElementById(
            targetId
        );

    if (!targetBody) {
        return;
    }

    const selectedSection =
        selectedHeader.closest(
            ".inspectorSection"
        );

    const isAlreadyOpen =
        selectedSection
            .classList
            .contains(
                "open"
            );

    document
        .querySelectorAll(
            ".inspectorSection"
        )
        .forEach(
            section => {

                if (
                    section !==
                    selectedSection
                ) {
                    closeInspectorSection(
                        section
                    );
                }

            }
        );

    if (isAlreadyOpen) {

        closeInspectorSection(
            selectedSection
        );

        return;

    }

    expandInspectorSection(
        selectedSection
    );

}

function expandInspectorSection(
    section
) {

    const header =
        section.querySelector(
            ".inspectorSectionHeader"
        );

    const body =
        section.querySelector(
            ".inspectorSectionBody"
        );

    const arrow =
        section.querySelector(
            ".inspectorArrow"
        );

    if (!body) {
        return;
    }

    section.classList.add(
        "open"
    );

    header?.setAttribute(
        "aria-expanded",
        "true"
    );

    if (arrow) {
        arrow.textContent =
            "▼";
    }

    body.hidden =
        false;

    body.style.maxHeight =
        "0px";

    requestAnimationFrame(
        () => {

            body.style.maxHeight =
                `${body.scrollHeight}px`;

        }
    );

    window.setTimeout(
        () => {

            if (
                section.classList
                    .contains("open")
            ) {
                body.style.maxHeight =
                    "none";
            }

        },
        inspectorAnimationDuration
    );

}

function closeInspectorSection(
    section
) {

    if (
        !section ||
        !section.classList
            .contains(
                "open"
            )
    ) {
        return;
    }

    const header =
        section.querySelector(
            ".inspectorSectionHeader"
        );

    const body =
        section.querySelector(
            ".inspectorSectionBody"
        );

    const arrow =
        section.querySelector(
            ".inspectorArrow"
        );

    section.classList.remove(
        "open"
    );

    header?.setAttribute(
        "aria-expanded",
        "false"
    );

    if (arrow) {
        arrow.textContent =
            "▶";
    }

    if (!body) {
        return;
    }

    body.style.maxHeight =
        `${body.scrollHeight}px`;

    requestAnimationFrame(
        () => {

            body.style.maxHeight =
                "0px";

        }
    );

    window.setTimeout(
        () => {

            if (
                !section.classList
                    .contains(
                        "open"
                    )
            ) {
                body.hidden =
                    true;
            }

        },
        inspectorAnimationDuration
    );

}

// =========================================
// 코드에서 특정 영역 열기
// =========================================

function showInspectorSection(
    sectionName
) {

    const targetId =
        `${sectionName}InspectorBody`;

    const selectedHeader =
        document.querySelector(
            `.inspectorSectionHeader[data-inspector-target="${targetId}"]`
        );

    if (!selectedHeader) {
        return;
    }

    const selectedSection =
        selectedHeader.closest(
            ".inspectorSection"
        );

    if (
        selectedSection
            ?.classList
            .contains(
                "open"
            )
    ) {
        return;
    }

    document
        .querySelectorAll(
            ".inspectorSection"
        )
        .forEach(
            section => {

                if (
                    section !==
                    selectedSection
                ) {
                    closeInspectorSection(
                        section
                    );
                }

            }
        );

    expandInspectorSection(
        selectedSection
    );

}
