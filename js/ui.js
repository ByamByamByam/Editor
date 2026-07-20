document.addEventListener(
    "DOMContentLoaded",
    initialize
);

function initialize() {

    initializeChat();
    initializeChapter();
    initializeSpeaker();
    initializeEditor();
    initializePreview();
    initializeEventRanges();
    initializeInspector();
    initializeProjectInspector();
    initializeFocusMode();
    initializeCapture();
    initializeStorage();
    initializeRoll20Import();
    initializeExternalImport();

    console.log(
        "Chat Archive Editor v0.2"
    );

}