// =========================================
// Chapter Manager
// =========================================

// ---------- DOM ----------

const chapterList =
    document.getElementById("chapterList");

const addChapterBtn =
    document.getElementById("addChapterBtn");

const currentChapterTitle =
    document.getElementById("currentChapterTitle");

// ---------- 선택 상태 ----------

let selectedChapterId = null;

let draggedChapterId = null;

// =========================================
// 초기화
// =========================================

function initializeChapter() {

    addChapterBtn.addEventListener(
        "click",
        addChapter
    );

    renderChapterList();

    console.log("Chapter Manager Ready");

}

// =========================================
// 챕터 추가
// =========================================

function addChapter() {

    const chat = getSelectedChat();

    if (!chat) {
        alert("먼저 채팅방을 선택해주세요.");
        return;
    }

    const chapter = new Chapter();

    chapter.title = "새 챕터";

    chat.chapters.push(chapter);

    renderChapterList();
    selectChapter(chapter.id);

}


// =========================================
// 챕터 목록 출력
// =========================================

function renderChapterList() {

    chapterList.innerHTML = "";

    const chat =
        getSelectedChat();

    /*
        채팅방이 선택되지 않은 상태
    */
    if (!chat) {

        currentChapterTitle.textContent =
            "";

        addChapterBtn.disabled =
            true;

        /*
            빈 상태 문구는 표시하지 않고
            챕터 추가 버튼만 유지한다.
        */
        chapterList.appendChild(
            addChapterBtn
        );

        return;

    }

    /*
        채팅이 선택되면 챕터 추가 가능
    */
    addChapterBtn.disabled =
        false;

    /*
        선택한 채팅에 챕터가 없는 상태
    */
    if (
        chat.chapters.length === 0
    ) {

        currentChapterTitle.textContent =
            "";

        chapterList.appendChild(
            addChapterBtn
        );

        return;

    }

    chat.chapters.forEach(
        chapter => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "chapterCard";

            card.dataset.chapterId =
                chapter.id;

            if (
                chapter.id ===
                selectedChapterId
            ) {
                card.classList.add(
                    "selected"
                );
            }

            // -------------------------
            // 드래그 손잡이
            // -------------------------

            const dragHandle =
                document.createElement(
                    "button"
                );

            dragHandle.type =
                "button";

            dragHandle.className =
                "listDragHandle";

            dragHandle.textContent =
                "☰";

            dragHandle.title =
                "드래그하여 순서 변경";

            dragHandle.draggable =
                true;

            dragHandle.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                }
            );

            dragHandle.addEventListener(
                "dragstart",
                event => {

                    draggedChapterId =
                        chapter.id;

                    card.classList.add(
                        "dragging"
                    );

                    event.dataTransfer
                        .effectAllowed =
                            "move";

                    event.dataTransfer
                        .setData(
                            "text/plain",
                            chapter.id
                        );

                }
            );

            dragHandle.addEventListener(
                "dragend",
                () => {

                    draggedChapterId =
                        null;

                    clearChapterDragIndicators();

                }
            );

            // -------------------------
            // 챕터 선택 영역
            // -------------------------

            const selectButton =
                document.createElement(
                    "button"
                );

            selectButton.type =
                "button";

            selectButton.className =
                "chapterCardSelect";

            const title =
                document.createElement(
                    "span"
                );

            title.className =
                "chapterTitle";

            title.textContent =
                chapter.title;

            selectButton.appendChild(
                title
            );

            selectButton.addEventListener(
                "click",
                () => {

                    selectChapter(
                        chapter.id
                    );

                }
            );

            // -------------------------
            // 드래그 위치 판별
            // -------------------------

            card.addEventListener(
                "dragover",
                event => {

                    if (
                        !draggedChapterId ||
                        draggedChapterId ===
                            chapter.id
                    ) {
                        return;
                    }

                    event.preventDefault();

                    clearChapterDragIndicators();

                    const rect =
                        card
                            .getBoundingClientRect();

                    const insertAfter =
                        event.clientY >
                        rect.top +
                        rect.height / 2;

                    card.classList.add(
                        insertAfter
                            ? "dragInsertAfter"
                            : "dragInsertBefore"
                    );

                }
            );

            card.addEventListener(
                "drop",
                event => {

                    event.preventDefault();

                    if (
                        !draggedChapterId ||
                        draggedChapterId ===
                            chapter.id
                    ) {

                        clearChapterDragIndicators();

                        return;

                    }

                    const rect =
                        card
                            .getBoundingClientRect();

                    const insertAfter =
                        event.clientY >
                        rect.top +
                        rect.height / 2;

                    reorderChapters(
                        draggedChapterId,
                        chapter.id,
                        insertAfter
                    );

                }
            );

            card.append(
                dragHandle,
                selectButton
            );

            chapterList.appendChild(
                card
            );

        }
    );

    /*
        모든 챕터 카드가 출력된 뒤
        추가 버튼을 목록 마지막에 붙인다.
    */
    chapterList.appendChild(
        addChapterBtn
    );

}


// =========================================
// 챕터 선택
// =========================================

function selectChapter(chapterId) {

    const chat = getSelectedChat();

    if (!chat) {
        return;
    }

    const chapter = chat.chapters.find(
        item => item.id === chapterId
    );

    if (!chapter) {
        return;
    }

    selectedChapterId =
    chapter.id;

    if (
        typeof syncChapterBackgroundColorInput ===
            "function"
    ) {
        syncChapterBackgroundColorInput();
    }

    currentChapterTitle.textContent =
        chapter.title;

        if (
            typeof renderProjectInspector ===
            "function"
        ) {
            renderProjectInspector();
        }

    document
        .querySelectorAll(".chapterCard")
        .forEach(card => {

            card.classList.toggle(
                "selected",
                card.dataset.chapterId === chapter.id
            );

        });

    if (
        typeof clearMessageEditor === "function"
    ) {
        clearMessageEditor();
    }


    if (
        typeof cancelPendingBackgroundRange ===
        "function"
    ) {
        cancelPendingBackgroundRange();
    }

    if (
        typeof cancelPendingBgmRange ===
        "function"
    ) {
        cancelPendingBgmRange();
    }

    if (
        typeof stopPreviewBgm ===
        "function"
    ) {
        stopPreviewBgm();
    }

    if (
        typeof resetPreviewSoundState ===
        "function"
    ) {
        resetPreviewSoundState();
    }

        selectedEventRangeId =
        null;

    if (
        typeof hideAllEventApplyButtons ===
        "function"
    ) {
        hideAllEventApplyButtons();
    }
    
    if (
        typeof renderPreview === "function"
    ) {
        renderPreview();
    }



}

// =========================================
// 선택된 챕터 가져오기
// =========================================

function getSelectedChapter() {

    const chat = getSelectedChat();

    if (!chat) {
        return null;
    }

    return chat.chapters.find(
        chapter =>
            chapter.id === selectedChapterId
    ) ?? null;

}

// =========================================
// 챕터 선택 초기화
// =========================================

function clearChapterSelection() {

    selectedChapterId = null;

    currentChapterTitle.textContent = "";

    if (
        typeof syncChapterBackgroundColorInput ===
            "function"
    ) {
        syncChapterBackgroundColorInput();
    }

    document
        .querySelectorAll(".chapterCard.selected")
        .forEach(card => {

            card.classList.remove("selected");

        });

}

// =========================================
// 빈 목록 표시
// =========================================

function showChapterEmpty(text) {

    const empty =
        document.createElement("div");

    empty.className = "chapterEmpty";
    empty.textContent = text;

    chapterList.appendChild(empty);

}


// =========================================
// 챕터 드래그 정렬
// =========================================

function reorderChapters(
    sourceChapterId,
    targetChapterId,
    insertAfter
) {

    const chat =
        getSelectedChat();

    if (!chat) {
        return;
    }

    const sourceIndex =
        chat.chapters.findIndex(
            chapter =>
                chapter.id ===
                sourceChapterId
        );

    const targetIndex =
        chat.chapters.findIndex(
            chapter =>
                chapter.id ===
                targetChapterId
        );

    if (
        sourceIndex === -1 ||
        targetIndex === -1
    ) {
        clearChapterDragIndicators();
        return;
    }

    const [
        movedChapter
    ] =
        chat.chapters.splice(
            sourceIndex,
            1
        );

    let newTargetIndex =
        chat.chapters.findIndex(
            chapter =>
                chapter.id ===
                targetChapterId
        );

    if (insertAfter) {
        newTargetIndex += 1;
    }

    chat.chapters.splice(
        newTargetIndex,
        0,
        movedChapter
    );

    draggedChapterId = null;

    renderChapterList();

    if (
        typeof renderProjectInspector ===
        "function"
    ) {
        renderProjectInspector();
    }

    setStorageStatus(
        "챕터 순서를 변경했습니다."
    );

}

function clearChapterDragIndicators() {

    document
        .querySelectorAll(
            ".chapterCard"
        )
        .forEach(card => {

            card.classList.remove(
                "dragging",
                "dragInsertBefore",
                "dragInsertAfter"
            );

        });

}