// =========================================
// Chat-specific Log Font Settings
// =========================================

const logFontImportInput =
    document.getElementById(
        "logFontImportInput"
    );

const applyLogFontImportBtn =
    document.getElementById(
        "applyLogFontImportBtn"
    );

const logFontStyleElement =
    document.createElement(
        "style"
    );

logFontStyleElement.id =
    "chatLogFontStyle";

document.head.appendChild(
    logFontStyleElement
);

function extractImportedFontFamily(
    importCode
) {

    const familyMatch =
        String(importCode || "")
            .match(
                /family=([^:&"')]+)/i
            );

    if (!familyMatch) {
        return (
            '"Pretendard", ' +
            '"맑은 고딕", ' +
            "sans-serif"
        );
    }

    const family =
        decodeURIComponent(
            familyMatch[1]
        )
            .replace(/\+/g, " ")
            .trim();

    if (!family) {
        return (
            '"Pretendard", ' +
            '"맑은 고딕", ' +
            "sans-serif"
        );
    }

    return (
        `"${family}", ` +
        '"Pretendard", ' +
        '"맑은 고딕", ' +
        "sans-serif"
    );

}

function applyCurrentLogFontSettings() {

    const settings =
        getViewerSettings();

    logFontStyleElement.textContent =
        settings.logFontImport ||
        "";

    document.documentElement
        .style.setProperty(
            "--log-font-family",
            settings.logFontFamily
        );

}

function syncLogFontSettings() {

    const settings =
        getViewerSettings();

    if (logFontImportInput) {
        logFontImportInput.value =
            settings.logFontImport ||
            "";
    }

    applyCurrentLogFontSettings();

}

function saveLogFontSettings() {

    const settings =
        getViewerSettings();

    const importCode =
        logFontImportInput
            ?.value
            ?.trim() ||
        "";

    settings.logFontImport =
        importCode;

    settings.logFontFamily =
        importCode
            ? extractImportedFontFamily(
                importCode
            )
            : (
                '"Pretendard", ' +
                '"맑은 고딕", ' +
                "sans-serif"
            );

    applyCurrentLogFontSettings();

    if (
        typeof renderPreview ===
            "function"
    ) {
        renderPreview();
    }

    if (
        typeof setStorageStatus ===
            "function"
    ) {
        setStorageStatus(
            importCode
                ? "현재 채팅방에 로그 웹폰트를 적용했습니다."
                : "현재 채팅방의 로그 웹폰트를 초기화했습니다."
        );
    }

}

function initializeLogFontSettings() {

    applyLogFontImportBtn
        ?.addEventListener(
            "click",
            saveLogFontSettings
        );

    syncLogFontSettings();

}

document.addEventListener(
    "DOMContentLoaded",
    initializeLogFontSettings
);
