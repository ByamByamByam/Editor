// =========================================
// Project Inspector
// =========================================

// ---------- DOM ----------

const projectChatTitleInput =
    document.getElementById(
        "projectChatTitleInput"
    );

const projectChatSubtitleInput =
    document.getElementById(
        "projectChatSubtitleInput"
    );

const projectChatDescriptionInput =
    document.getElementById(
        "projectChatDescriptionInput"
    );

const saveProjectChatBtn =
    document.getElementById(
        "saveProjectChatBtn"
    );

const deleteProjectChatBtn =
    document.getElementById(
        "deleteProjectChatBtn"
    );

const deleteProjectChapterBtn =
document.getElementById(
    "deleteProjectChapterBtn"
);

const projectChapterTitleInput =
    document.getElementById(
        "projectChapterTitleInput"
    );

const saveProjectChapterBtn =
    document.getElementById(
        "saveProjectChapterBtn"
    );

const splitChapterBtn =
    document.getElementById(
        "splitChapterBtn"
    );

const mergePreviousChapterBtn =
    document.getElementById(
        "mergePreviousChapterBtn"
    );

const mergeNextChapterBtn =
    document.getElementById(
        "mergeNextChapterBtn"
    );

// =========================================
// 초기화
// =========================================

function initializeProjectInspector() {

    saveProjectChatBtn?.addEventListener(
        "click",
        saveSelectedChatInfo
    );

    saveProjectChapterBtn?.addEventListener(
        "click",
        saveSelectedChapterInfo
    );

    deleteProjectChatBtn?.addEventListener(
        "click",
        deleteSelectedChat
    );

    deleteProjectChapterBtn?.addEventListener(
        "click",
        deleteSelectedChapter
    );

    splitChapterBtn?.addEventListener(
        "click",
        splitSelectedChapter
    );

    mergePreviousChapterBtn?.addEventListener(
    "click",
    mergeWithPreviousChapter
    );

    mergeNextChapterBtn?.addEventListener(
        "click",
        mergeWithNextChapter
    );

    renderProjectInspector();

    console.log(
        "Project Inspector Ready"
    );

}

// =========================================
// 프로젝트 정보 표시
// =========================================

function renderProjectInspector() {

    renderSelectedChatInfo();
    renderSelectedChapterInfo();
    updateProjectChapterActionButtons();

}

// =========================================
// 선택 채팅 정보 표시
// =========================================

function renderSelectedChatInfo() {

    const chat =
        typeof getSelectedChat ===
        "function"
            ? getSelectedChat()
            : null;

    const hasChat =
        Boolean(chat);

    if (projectChatTitleInput) {

        projectChatTitleInput.value =
            chat?.title || "";

        projectChatTitleInput.disabled =
            !hasChat;

    }

    if (projectChatSubtitleInput) {

        projectChatSubtitleInput.value =
            chat?.subtitle || "";

        projectChatSubtitleInput.disabled =
            !hasChat;

    }

    if (projectChatDescriptionInput) {

        projectChatDescriptionInput.value =
            chat?.description || "";

        projectChatDescriptionInput.disabled =
            !hasChat;

    }

    if (saveProjectChatBtn) {

        saveProjectChatBtn.disabled =
            !hasChat;

    }

    if (deleteProjectChatBtn) {

        deleteProjectChatBtn.disabled =
            !hasChat;

    }

}

// =========================================
// 선택 챕터 정보 표시
// =========================================

function renderSelectedChapterInfo() {

    const chapter =
        typeof getSelectedChapter ===
        "function"
            ? getSelectedChapter()
            : null;

    const hasChapter =
        Boolean(chapter);

    if (projectChapterTitleInput) {

        projectChapterTitleInput.value =
            chapter?.title || "";

        projectChapterTitleInput.disabled =
            !hasChapter;

    }

    if (saveProjectChapterBtn) {

        saveProjectChapterBtn.disabled =
            !hasChapter;

    }

    if (deleteProjectChapterBtn) {

        deleteProjectChapterBtn.disabled =
            !hasChapter;

    }

}

// =========================================
// 채팅 정보 저장
// =========================================

function saveSelectedChatInfo() {

    const chat =
        getSelectedChat();

    if (!chat) {

        alert(
            "먼저 채팅방을 선택해주세요."
        );

        return;

    }

    const title =
        projectChatTitleInput
            .value
            .trim();

    if (!title) {

        alert(
            "채팅 이름을 입력해주세요."
        );

        projectChatTitleInput.focus();

        return;

    }

    chat.title =
        title;

    chat.subtitle =
        projectChatSubtitleInput
            .value
            .trim();

    chat.description =
        projectChatDescriptionInput
            .value
            .trim();

    renderChatList();

    setStorageStatus(
        "채팅 정보를 저장했습니다."
    );

}

// =========================================
// 챕터 정보 저장
// =========================================

function saveSelectedChapterInfo() {

    const chapter =
        getSelectedChapter();

    if (!chapter) {

        alert(
            "먼저 챕터를 선택해주세요."
        );

        return;

    }

    const title =
        projectChapterTitleInput
            .value
            .trim();

    if (!title) {

        alert(
            "챕터 명을 입력해주세요."
        );

        projectChapterTitleInput.focus();

        return;

    }

    chapter.title =
        title;

    currentChapterTitle.textContent =
        chapter.title;

    renderChapterList();

    setStorageStatus(
        "챕터 정보를 저장했습니다."
    );

}

// =========================================
// 챕터 작업 버튼 상태
// =========================================

function updateProjectChapterActionButtons() {

    const chat =
        typeof getSelectedChat ===
        "function"
            ? getSelectedChat()
            : null;

    const chapter =
        typeof getSelectedChapter ===
        "function"
            ? getSelectedChapter()
            : null;

    if (
        !chat ||
        !chapter
    ) {

        if (splitChapterBtn) {
            splitChapterBtn.disabled =
                true;
        }

        if (mergePreviousChapterBtn) {
            mergePreviousChapterBtn.disabled =
                true;
        }

        if (mergeNextChapterBtn) {
            mergeNextChapterBtn.disabled =
                true;
        }

        return;

    }

    const chapterIndex =
        chat.chapters.findIndex(
            item =>
                item.id === chapter.id
        );

    const selectedMessageIndex =
        chapter.messages.findIndex(
            message =>
                message.id ===
                selectedMessageId
        );

    const isEventEditing =
        typeof isEventGuideVisible !==
            "undefined" &&
        isEventGuideVisible;

    const isFocusActive =
        typeof isFocusModeActive !==
            "undefined" &&
        isFocusModeActive;

    /*
        챕터 분리는 일반 미리보기에서만 허용한다.

        첫 번째 메시지에서 분리하면 기존 챕터가
        빈 챕터가 되므로 비활성화한다.
    */
    const canSplit =
        !isEventEditing &&
        !isFocusActive &&
        selectedMessageIndex > 0 &&
        selectedMessageIndex <
            chapter.messages.length;

    if (splitChapterBtn) {

        splitChapterBtn.disabled =
            !canSplit;

        splitChapterBtn.title =
            canSplit
                ? "선택한 메시지부터 새 챕터로 분리합니다."
                : "일반 미리보기에서 첫 메시지 이외의 메시지를 선택해주세요.";

    }

    if (mergePreviousChapterBtn) {

        mergePreviousChapterBtn.disabled =
            chapterIndex <= 0;

    }

    if (mergeNextChapterBtn) {

        mergeNextChapterBtn.disabled =
            chapterIndex === -1 ||
            chapterIndex >=
                chat.chapters.length - 1;

    }

}

// =========================================
// 선택 메시지부터 새 챕터로 분리
// =========================================

function splitSelectedChapter() {

    const chat =
        getSelectedChat();

    const chapter =
        getSelectedChapter();

    if (
        !chat ||
        !chapter
    ) {

        alert(
            "먼저 채팅방과 챕터를 선택해주세요."
        );

        return;

    }

    const isEventEditing =
        typeof isEventGuideVisible !==
            "undefined" &&
        isEventGuideVisible;

    const isFocusActive =
        typeof isFocusModeActive !==
            "undefined" &&
        isFocusModeActive;

    if (
        isEventEditing ||
        isFocusActive
    ) {

        alert(
            "일반 미리보기에서 메시지를 선택해주세요."
        );

        return;

    }

    if (!selectedMessageId) {

        alert(
            "새 챕터의 첫 메시지를 선택해주세요."
        );

        return;

    }

    const splitIndex =
        chapter.messages.findIndex(
            message =>
                message.id ===
                selectedMessageId
        );

    if (splitIndex === -1) {

        alert(
            "선택한 메시지를 찾을 수 없습니다."
        );

        return;

    }

    if (splitIndex === 0) {

        alert(
            "현재 챕터의 첫 메시지에서는 분리할 수 없습니다."
        );

        return;

    }

    const chapterIndex =
        chat.chapters.findIndex(
            item =>
                item.id === chapter.id
        );

    if (chapterIndex === -1) {
        return;
    }

    const movedMessageCount =
        chapter.messages.length -
        splitIndex;

    const confirmed =
        confirm(
            `선택한 메시지부터 아래의 ${movedMessageCount}개 메시지를 새 챕터로 분리하시겠습니까?`
        );

    if (!confirmed) {
        return;
    }

    /*
        연출의 기존 시작·끝 위치를 계산하기 위해
        메시지 배열을 변경하기 전에 복사한다.
    */
    const originalMessages =
        [...chapter.messages];

    const newChapter =
        new Chapter();

    newChapter.title =
        `${chapter.title} (분리)`;

    newChapter.description = "";

    /*
        메시지 배열을 실제로 나누기 전에
        연출 구간을 먼저 분리한다.
    */
    splitChapterEvents(
        chapter,
        newChapter,
        originalMessages,
        splitIndex
    );

    chapter.messages =
        originalMessages.slice(
            0,
            splitIndex
        );

    newChapter.messages =
        originalMessages.slice(
            splitIndex
        );

    /*
        새 챕터는 현재 챕터 바로 다음에 삽입한다.
    */
    chat.chapters.splice(
        chapterIndex + 1,
        0,
        newChapter
    );

    /*
        기존 메시지 선택을 해제한 뒤
        새 챕터를 자동 선택한다.
    */
    if (
        typeof clearMessageEditor ===
        "function"
    ) {
        clearMessageEditor();
    }

    if (
        typeof clearCaptureMessageRange ===
        "function"
    ) {
        clearCaptureMessageRange(
            false
        );
    }

    renderChapterList();

    selectChapter(
        newChapter.id
    );

    renderProjectInspector();

    setStorageStatus(
        `메시지 ${movedMessageCount}개를 새 챕터로 분리했습니다.`
    );

}

// =========================================
// 챕터 연출 구간 분리
// =========================================

function splitChapterEvents(
    sourceChapter,
    targetChapter,
    originalMessages,
    splitIndex
) {

    const sourceEvents = [];
    const targetEvents = [];

    const splitStartMessage =
        originalMessages[
            splitIndex
        ];

    const previousMessage =
        originalMessages[
            splitIndex - 1
        ];

    sourceChapter.events.forEach(
        eventRange => {

            const startIndex =
                originalMessages.findIndex(
                    message =>
                        message.id ===
                        eventRange.startMessageId
                );

            const endIndex =
                originalMessages.findIndex(
                    message =>
                        message.id ===
                        eventRange.endMessageId
                );

            /*
                시작·끝 메시지를 찾지 못한 이벤트는
                원본 챕터에 그대로 둔다.
            */
            if (
                startIndex === -1 ||
                endIndex === -1
            ) {

                sourceEvents.push(
                    eventRange
                );

                return;

            }

            /*
                효과음은 단일 메시지 이벤트이므로
                해당 메시지가 이동하는지 여부만 확인한다.
            */
            if (
                eventRange.type ===
                "sound"
            ) {

                if (
                    startIndex >=
                    splitIndex
                ) {

                    targetEvents.push(
                        eventRange
                    );

                } else {

                    sourceEvents.push(
                        eventRange
                    );

                }

                return;

            }

            /*
                연출이 분리 기준보다 완전히 앞에 있으면
                기존 챕터에 유지한다.
            */
            if (
                endIndex <
                splitIndex
            ) {

                sourceEvents.push(
                    eventRange
                );

                return;

            }

            /*
                연출이 분리 기준부터 시작하면
                새 챕터로 그대로 이동한다.
            */
            if (
                startIndex >=
                splitIndex
            ) {

                targetEvents.push(
                    eventRange
                );

                return;

            }

            /*
                배경/BGM 구간이 분리 지점을 가로지르면
                원본과 새 챕터 양쪽으로 나눈다.
            */
            const originalEndMessageId =
                eventRange.endMessageId;

            eventRange.endMessageId =
                previousMessage.id;

            sourceEvents.push(
                eventRange
            );

            const dividedEvent =
                cloneEventRangeForChapter(
                    eventRange
                );

            dividedEvent.startMessageId =
                splitStartMessage.id;

            dividedEvent.endMessageId =
                originalEndMessageId;

            targetEvents.push(
                dividedEvent
            );

        }
    );

    sourceChapter.events =
        sourceEvents;

    targetChapter.events =
        targetEvents;

}

// =========================================
// 챕터 분리용 연출 복제
// =========================================

function cloneEventRangeForChapter(
    sourceEvent
) {

    const clonedEvent =
        new EventRange();

    /*
        배경색, 투명도, 어두움, 볼륨 등
        현재와 이후에 추가될 속성까지 모두 복사한다.
    */
    Object.assign(
        clonedEvent,
        sourceEvent
    );

    /*
        원본 이벤트와 별개의 이벤트가 되도록
        새 ID를 지정한다.
    */
    clonedEvent.id =
        crypto.randomUUID();

    return clonedEvent;

}


// =========================================
// 이전 챕터와 합치기
// =========================================

function mergeWithPreviousChapter() {

    const chat =
        getSelectedChat();

    const chapter =
        getSelectedChapter();

    if (
        !chat ||
        !chapter
    ) {

        alert(
            "먼저 챕터를 선택해주세요."
        );

        return;

    }

    const chapterIndex =
        chat.chapters.findIndex(
            item =>
                item.id === chapter.id
        );

    if (chapterIndex <= 0) {

        alert(
            "이전 챕터가 없습니다."
        );

        return;

    }

    const previousChapter =
        chat.chapters[
            chapterIndex - 1
        ];

    const confirmed =
        confirm(
            `"${chapter.title}" 챕터를 ` +
            `"${previousChapter.title}" 챕터 뒤에 합치시겠습니까?\n\n` +
            `"${previousChapter.title}" 챕터만 남게 됩니다.`
        );

    if (!confirmed) {
        return;
    }

    mergeAdjacentChapters(
        chat,
        previousChapter,
        chapter
    );

    /*
        현재 챕터를 목록에서 제거한다.
    */
    chat.chapters.splice(
        chapterIndex,
        1
    );

    clearChapterMergeSelection();

    renderChapterList();

    /*
        남은 이전 챕터를 선택한다.
    */
    selectChapter(
        previousChapter.id
    );

    renderProjectInspector();

    setStorageStatus(
        "이전 챕터와 합쳤습니다."
    );

}


// =========================================
// 다음 챕터와 합치기
// =========================================

function mergeWithNextChapter() {

    const chat =
        getSelectedChat();

    const chapter =
        getSelectedChapter();

    if (
        !chat ||
        !chapter
    ) {

        alert(
            "먼저 챕터를 선택해주세요."
        );

        return;

    }

    const chapterIndex =
        chat.chapters.findIndex(
            item =>
                item.id === chapter.id
        );

    if (
        chapterIndex === -1 ||
        chapterIndex >=
            chat.chapters.length - 1
    ) {

        alert(
            "다음 챕터가 없습니다."
        );

        return;

    }

    const nextChapter =
        chat.chapters[
            chapterIndex + 1
        ];

    const confirmed =
        confirm(
            `"${nextChapter.title}" 챕터를 ` +
            `"${chapter.title}" 챕터 뒤에 합치시겠습니까?\n\n` +
            `"${chapter.title}" 챕터만 남게 됩니다.`
        );

    if (!confirmed) {
        return;
    }

    mergeAdjacentChapters(
        chat,
        chapter,
        nextChapter
    );

    /*
        다음 챕터를 목록에서 제거한다.
    */
    chat.chapters.splice(
        chapterIndex + 1,
        1
    );

    clearChapterMergeSelection();

    renderChapterList();

    /*
        현재 챕터는 그대로 유지한다.
    */
    selectChapter(
        chapter.id
    );

    renderProjectInspector();

    setStorageStatus(
        "다음 챕터와 합쳤습니다."
    );

}


// =========================================
// 인접한 두 챕터 데이터 합치기
// =========================================

function mergeAdjacentChapters(
    chat,
    targetChapter,
    sourceChapter
) {

    if (
        !chat ||
        !targetChapter ||
        !sourceChapter
    ) {
        return;
    }

    /*
        sourceChapter의 메시지를
        targetChapter 끝에 순서대로 붙인다.
    */
    targetChapter.messages.push(
        ...sourceChapter.messages
    );

    /*
        배경, BGM, 효과음도 함께 이동한다.

        연출은 메시지 ID를 기준으로 연결되어 있으므로
        시작·끝 ID를 수정할 필요가 없다.
    */
    targetChapter.events.push(
        ...sourceChapter.events
    );

}

// =========================================
// 챕터 합치기 후 선택 상태 정리
// =========================================

function clearChapterMergeSelection() {

    if (
        typeof clearMessageEditor ===
        "function"
    ) {
        clearMessageEditor();
    }

    if (
        typeof clearCaptureMessageRange ===
        "function"
    ) {
        clearCaptureMessageRange(
            false
        );
    }

    if (
        typeof clearSelectedEventRange ===
        "function"
    ) {
        clearSelectedEventRange();
    }

}

// =========================================
// 선택한 채팅 삭제
// =========================================

function deleteSelectedChat() {

    const chat =
        getSelectedChat();

    if (!chat) {

        alert(
            "삭제할 채팅을 선택해주세요."
        );

        return;

    }

    const confirmed =
        confirm(
            `"${chat.title}" 채팅을 삭제하시겠습니까?\n\n` +
            "채팅에 포함된 모든 챕터, 메시지, 화자와 연출이 함께 삭제됩니다."
        );

    if (!confirmed) {
        return;
    }

    const chatIndex =
        project.chats.findIndex(
            item =>
                item.id === chat.id
        );

    if (chatIndex === -1) {
        return;
    }

    project.chats.splice(
        chatIndex,
        1
    );

    /*
        삭제된 채팅 내부의 선택 상태와
        재생 중인 미디어를 모두 초기화한다.
    */
    if (
        typeof resetEditorSelection ===
        "function"
    ) {
        resetEditorSelection();
    }

    if (
        typeof clearCaptureMessageRange ===
        "function"
    ) {
        clearCaptureMessageRange(
            false
        );
    }

    if (
        typeof clearSelectedEventRange ===
        "function"
    ) {
        clearSelectedEventRange();
    }

    if (
        typeof resetAllPreviewMedia ===
        "function"
    ) {
        resetAllPreviewMedia();
    }

    /*
        renderEntireProject()는 남은 첫 채팅을
        자동으로 선택한다.
    */
    renderEntireProject();

    renderProjectInspector();

    setStorageStatus(
        "채팅을 삭제했습니다."
    );

}

// =========================================
// 선택한 챕터 삭제
// =========================================

function deleteSelectedChapter() {

    const chat =
        getSelectedChat();

    const chapter =
        getSelectedChapter();

    if (
        !chat ||
        !chapter
    ) {

        alert(
            "삭제할 챕터를 선택해주세요."
        );

        return;

    }

    const confirmed =
        confirm(
            `"${chapter.title}" 챕터를 삭제하시겠습니까?\n\n` +
            "챕터의 모든 메시지와 연출이 함께 삭제됩니다."
        );

    if (!confirmed) {
        return;
    }

    const chapterIndex =
        chat.chapters.findIndex(
            item =>
                item.id === chapter.id
        );

    if (chapterIndex === -1) {
        return;
    }

    chat.chapters.splice(
        chapterIndex,
        1
    );

    if (
        typeof clearMessageEditor ===
        "function"
    ) {
        clearMessageEditor();
    }

    if (
        typeof clearCaptureMessageRange ===
        "function"
    ) {
        clearCaptureMessageRange(
            false
        );
    }

    if (
        typeof clearSelectedEventRange ===
        "function"
    ) {
        clearSelectedEventRange();
    }

    if (
        typeof resetAllPreviewMedia ===
        "function"
    ) {
        resetAllPreviewMedia();
    }

    renderChapterList();

    /*
        삭제한 위치에 다음 챕터가 있으면 그것을,
        없으면 이전 챕터를 선택한다.
    */
    const nextChapter =
        chat.chapters[
            Math.min(
                chapterIndex,
                chat.chapters.length - 1
            )
        ] ?? null;

    if (nextChapter) {

        selectChapter(
            nextChapter.id
        );

    } else {

        clearChapterSelection();

        if (
            typeof renderPreview ===
            "function"
        ) {
            renderPreview();
        }

    }

    renderProjectInspector();

    setStorageStatus(
        "챕터를 삭제했습니다."
    );

}