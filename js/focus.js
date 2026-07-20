// =========================================
// Focus Mode
// =========================================

// ---------- DOM ----------

const focusModeBtn =
    document.getElementById(
        "focusModeBtn"
    );

const focusMessageGapInput =
    document.getElementById(
        "focusMessageGapInput"
    );

const focusMessageGapOutput =
    document.getElementById(
        "focusMessageGapOutput"
    );

const groupConsecutiveMessagesInput =
    document.getElementById(
        "groupConsecutiveMessagesInput"
    );

const focusClickActionInput =
    document.getElementById(
        "focusClickActionInput"
    );

const focusLongMessageClickInput =
    document.getElementById(
        "focusLongMessageClickInput"
    );

const focusClickAnimationSelect =
    document.getElementById(
        "focusClickAnimationSelect"
    );

const performanceDividerInput =
    document.getElementById(
        "performanceDividerInput"
    );

const descTextColorInput =
    document.getElementById(
        "descTextColorInput"
    );

const emTextColorInput =
    document.getElementById(
        "emTextColorInput"
    );

const emasTextColorInput =
    document.getElementById(
        "emasTextColorInput"
    );

const asBubbleColorInput =
    document.getElementById(
        "asBubbleColorInput"
    );

const asTextColorInput =
    document.getElementById(
        "asTextColorInput"
    );

const resetPerformanceStylesBtn =
    document.getElementById(
        "resetPerformanceStylesBtn"
    );

const focusPreviewViewport =
    document.getElementById(
        "previewViewport"
    );

// ---------- 상태 ----------

let isFocusModeActive =
    false;

let focusVisibleMessageCount =
    0;

let isReplayMessageRevealPending =
    false;

const LONG_MESSAGE_MIN_HEIGHT = 371;
const LONG_MESSAGE_SCROLL_STEP = 400;
const LONG_MESSAGE_LAST_MERGE = 150;

let replayLongMessageState = null;

// =========================================
// 설정 기본값
// =========================================

function getViewerSettings() {

    const chat =
        typeof getSelectedChat ===
            "function"
            ? getSelectedChat()
            : null;

    /*
        채팅방이 선택되어 있으면 해당 채팅방 설정을 사용한다.
        채팅방이 없을 때만 프로젝트 기본 설정을 사용한다.
    */
    if (chat) {

        chat.viewerSettings =
            createDefaultViewerSettings(
                chat.viewerSettings ||
                project.viewerSettings ||
                {}
            );

        return chat.viewerSettings;

    }

    project.viewerSettings =
        createDefaultViewerSettings(
            project.viewerSettings ||
            {}
        );

    return project.viewerSettings;

}

function applySelectedChatViewerSettings() {

    syncFocusSettingsControls();
    applyFocusMessageGap();
    applyPerformanceSettings();

    if (
        typeof syncLogFontSettings ===
            "function"
    ) {
        syncLogFontSettings();
    }

    if (
        typeof renderPreview ===
            "function"
    ) {
        renderPreview();
    }

}


// =========================================
// 초기화
// =========================================

function initializeFocusMode() {

    if (!focusModeBtn) {

        console.warn(
            "리플레이 초기화 누락: focusModeBtn"
        );

        return;

    }

    focusModeBtn.addEventListener(
        "click",
        toggleFocusMode
    );

focusMessageGapInput
        ?.addEventListener(
            "input",
            handleFocusMessageGapInput
        );

    groupConsecutiveMessagesInput
        ?.addEventListener(
            "change",
            handleGroupConsecutiveMessagesChange
        );

    focusClickActionInput
        ?.addEventListener(
            "change",
            handleFocusClickActionChange
        );

    focusLongMessageClickInput
        ?.addEventListener(
            "change",
            handleFocusLongMessageClickChange
        );

    focusClickAnimationSelect
        ?.addEventListener(
            "change",
            handleFocusClickAnimationChange
        );

    performanceDividerInput
        ?.addEventListener(
            "change",
            handlePerformanceSettingInput
        );

    descTextColorInput
        ?.addEventListener(
            "input",
            handlePerformanceSettingInput
        );

    emTextColorInput
        ?.addEventListener(
            "input",
            handlePerformanceSettingInput
        );

    emasTextColorInput
        ?.addEventListener(
            "input",
            handlePerformanceSettingInput
        );

    asBubbleColorInput
        ?.addEventListener(
            "input",
            handlePerformanceSettingInput
        );

    asTextColorInput
        ?.addEventListener(
            "input",
            handlePerformanceSettingInput
        );

    resetPerformanceStylesBtn
        ?.addEventListener(
            "click",
            resetPerformanceStyles
        );

    focusPreviewViewport
        ?.addEventListener(
            "click",
            handleFocusViewportClick
        );

    document.addEventListener(
        "keydown",
        handleFocusModeKeydown
    );

    syncFocusSettingsControls();

    applyFocusMessageGap();

    applyPerformanceSettings();

    console.log(
        "Focus Mode Ready"
    );

}

// =========================================
// 설정창 동기화
// =========================================

function syncFocusSettingsControls() {

    const settings =
        getViewerSettings();

    if (focusMessageGapInput) {

        focusMessageGapInput.value =
            String(settings.messageGap);

            focusMessageGapInput.disabled =
            settings.groupConsecutiveMessages;

    }

    if (focusMessageGapOutput) {

        focusMessageGapOutput.value =
            `${settings.messageGap}px`;

    }

    if (groupConsecutiveMessagesInput) {

        groupConsecutiveMessagesInput.checked =
            settings.groupConsecutiveMessages;

    }

    if (focusClickActionInput) {

        focusClickActionInput.checked =
            settings.clickActionEnabled;

    }

    if (focusLongMessageClickInput) {

        focusLongMessageClickInput.checked =
            settings.longMessageClickEnabled;

        focusLongMessageClickInput.disabled =
            !settings.clickActionEnabled;

    }

    if (focusClickAnimationSelect) {

        focusClickAnimationSelect.value =
            settings.clickAnimation;

        focusClickAnimationSelect.disabled =
            !settings.clickActionEnabled;

    }

    if (performanceDividerInput) {

        performanceDividerInput.checked =
            settings.performanceDividerVisible;

    }

    if (descTextColorInput) {

        descTextColorInput.value =
            settings.descTextColor;

    }

    if (emTextColorInput) {

        emTextColorInput.value =
            settings.emTextColor;

    }

    if (emasTextColorInput) {

        emasTextColorInput.value =
            settings.emasTextColor;

    }

    if (asBubbleColorInput) {

    asBubbleColorInput.value =
        settings.asBubbleColor;

    }

    if (asTextColorInput) {

        asTextColorInput.value =
            settings.asTextColor;

    }

}

// =========================================
// 메시지 간격
// =========================================

function handleFocusMessageGapInput() {

    const settings =
        getViewerSettings();

    settings.messageGap =
        Number(
            focusMessageGapInput.value
        );

    focusMessageGapOutput.value =
        `${settings.messageGap}px`;

    applyFocusMessageGap();

}

function applyFocusMessageGap() {

    const settings =
        getViewerSettings();

    document.documentElement
        .style.setProperty(
            "--focus-message-gap",
            `${settings.messageGap}px`
        );

}

// =========================================
// 연속 대화 묶기
// =========================================

function handleGroupConsecutiveMessagesChange() {

    const settings =
        getViewerSettings();

    settings.groupConsecutiveMessages =
        groupConsecutiveMessagesInput.checked;

    /*
        연속 대화 묶기를 사용하면
        메시지 간격은 의미가 없어지므로
        슬라이더를 잠근다.
    */
    if (focusMessageGapInput) {

        focusMessageGapInput.disabled =
            settings.groupConsecutiveMessages;

    }

    if (
        typeof renderPreview ===
        "function"
    ) {
        renderPreview();
    }

}

// =========================================
// 클릭 액션 설정
// =========================================

function handleFocusClickActionChange() {

    const settings =
        getViewerSettings();

    settings.clickActionEnabled =
        focusClickActionInput.checked;

    focusClickAnimationSelect.disabled =
        !settings.clickActionEnabled;

    if (focusLongMessageClickInput) {
        focusLongMessageClickInput.disabled =
            !settings.clickActionEnabled;
    }

    if (isFocusModeActive) {

        resetFocusClickAction();

    }

}

function handleFocusLongMessageClickChange() {

    const settings =
        getViewerSettings();

    settings.longMessageClickEnabled =
        focusLongMessageClickInput.checked;

    replayLongMessageState = null;

}

function handleFocusClickAnimationChange() {

    const settings =
        getViewerSettings();

    settings.clickAnimation =
        focusClickAnimationSelect.value ===
            "slide"
            ? "slide"
            : "instant";

}

// =========================================
// 기본 연출 설정
// =========================================

function handlePerformanceSettingInput() {

    const settings =
        getViewerSettings();

    settings.performanceDividerVisible =
        performanceDividerInput
            ?.checked !== false;

    settings.descTextColor =
        descTextColorInput
            ?.value ||
        "#555555";

    settings.emTextColor =
        emTextColorInput
            ?.value ||
        "#666666";

    settings.emasTextColor =
        emasTextColorInput
            ?.value ||
        "#666666";

    settings.asBubbleColor =
        asBubbleColorInput?.value ||
        "#ffffff";

    settings.asTextColor =
        asTextColorInput?.value ||
        "#000000";

    applyPerformanceSettings();

    if (
        typeof renderPreview ===
            "function"
    ) {
        renderPreview();
    }

}

// =========================================
// 연출 색상 스타일 초기화
// =========================================

function resetPerformanceStyles() {

    const settings =
        getViewerSettings();

    settings.descTextColor =
        "#555555";

    settings.emTextColor =
        "#666666";

    settings.emasTextColor =
        "#666666";

    settings.asBubbleColor =
        "#ffffff";

    settings.asTextColor =
        "#000000";

    syncFocusSettingsControls();
    applyPerformanceSettings();

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
            "연출 색상 스타일을 기본값으로 초기화했습니다."
        );
    }

}

function applyPerformanceSettings() {

    const settings =
        getViewerSettings();

    document.documentElement
        .classList.toggle(
            "performanceDividerHidden",
            !settings
                .performanceDividerVisible
        );

    document.documentElement
        .style.setProperty(
            "--desc-text-color",
            settings.descTextColor
        );

    document.documentElement
        .style.setProperty(
            "--em-text-color",
            settings.emTextColor
        );

    document.documentElement
        .style.setProperty(
            "--emas-text-color",
            settings.emasTextColor
        );

    document.documentElement
    .style.setProperty(
        "--as-bubble-color",
        settings.asBubbleColor
    );

    document.documentElement
    .style.setProperty(
        "--as-text-color",
        settings.asTextColor
    );

}

// =========================================
// 리플레이 전환
// =========================================

function toggleFocusMode() {

    if (isFocusModeActive) {

        closeFocusMode();

        return;

    }

    openFocusMode();

}

// =========================================
// 리플레이 열기
// =========================================

function openFocusMode() {

    const chapter =
        typeof getSelectedChapter ===
        "function"
            ? getSelectedChapter()
            : null;

    if (!chapter) {

        alert(
            "먼저 챕터를 선택해주세요."
        );

        return;

    }

    if (
        typeof isEventGuideVisible !==
            "undefined" &&
        isEventGuideVisible &&
        typeof toggleEventGuide ===
            "function"
    ) {

        toggleEventGuide();

    }

    if (
        typeof clearSelectedMessageRange ===
            "function"
    ) {

        clearSelectedMessageRange(
            false
        );

    }

    if (
        typeof clearMessageEditor ===
            "function"
    ) {

        clearMessageEditor();

    }


        /*
        리플레이 진입 시 현재 BGM을 완전히 정지한다.
        이후 리플레이 레이아웃 기준으로 처음부터 다시 재생한다.
    */
    if (
        typeof stopPreviewBgmImmediately ===
            "function"
    ) {
        stopPreviewBgmImmediately();
    }

    if (
        typeof resetPreviewSoundState ===
            "function"
    ) {
        resetPreviewSoundState();
    }

    if (
        typeof playedSoundEventIds !==
            "undefined"
    ) {
        playedSoundEventIds.clear();
    }


    isFocusModeActive =
        true;

document.body.classList.add(
        "focusMode"
    );

    focusModeBtn.classList.add(
        "active"
    );

    focusModeBtn.setAttribute(
        "aria-pressed",
        "true"
    );

    focusModeBtn.textContent =
        "돌아가기";

if (
        typeof updateCaptureButtonState ===
            "function"
    ) {

        updateCaptureButtonState();

    }

    applyFocusMessageGap();

    resetFocusClickAction();

    requestAnimationFrame(() => {

        if (
            typeof updatePreviewMedia ===
                "function"
        ) {

            updatePreviewMedia();

        }

    });

}

// =========================================
// 리플레이 닫기
// =========================================

function closeFocusMode() {

    isReplayMessageRevealPending =
        false;

    replayLongMessageState =
        null;

    isFocusModeActive =
        false;

focusVisibleMessageCount =
        0;

    document.body.classList.remove(
        "focusMode",
        "focusClickActionMode"
    );

    if (
        typeof clearSelectedMessageRange ===
            "function"
    ) {

        clearSelectedMessageRange(
            false
        );

    }

    if (
        typeof clearMessageEditor ===
            "function"
    ) {

        clearMessageEditor();

    }

    document
        .querySelectorAll(
            "#previewArea .message"
        )
        .forEach(element => {

            element.classList.remove(
                "focusMessageHidden",
                "focusMessageVisible",
                "focusMessageSlide"
            );

        });

focusModeBtn.classList.remove(
        "active"
    );

    focusModeBtn.setAttribute(
        "aria-pressed",
        "false"
    );

    focusModeBtn.textContent =
        "리플레이";

requestAnimationFrame(() => {

        if (
            typeof updatePreviewMedia ===
                "function"
        ) {

            updatePreviewMedia();

        }

    });

}

// =========================================
// 클릭 액션
// =========================================

function resetFocusClickAction() {

    replayLongMessageState =
        null;

    const settings =
        getViewerSettings();

    const messages =
        Array.from(
            document.querySelectorAll(
                "#previewArea .message"
            )
        );

    messages.forEach(element => {

        element.classList.remove(
            "focusMessageHidden",
            "focusMessageVisible",
            "focusMessageSlide"
        );

    });

    document.body.classList.toggle(
        "focusClickActionMode",
        isFocusModeActive &&
        settings.clickActionEnabled
    );

    if (
        !isFocusModeActive ||
        !settings.clickActionEnabled
    ) {

        focusVisibleMessageCount =
            messages.length;

        return;

    }

    focusVisibleMessageCount =
        0;

    messages.forEach(element => {

        element.classList.add(
            "focusMessageHidden"
        );

    });

    if (previewArea) {

        previewArea.scrollTop =
            0;

    }

}

async function revealNextFocusMessage() {

    if (
        !isFocusModeActive ||
        isReplayMessageRevealPending
    ) {
        return;
    }

    const settings =
        getViewerSettings();

    if (!settings.clickActionEnabled) {
        return;
    }

    if (
        settings.longMessageClickEnabled &&
        replayLongMessageState?.bubbleElement
    ) {
        await continueReplayLongMessage();
        return;
    }

    const messages =
        Array.from(
            document.querySelectorAll(
                "#previewArea .message"
            )
        );

    const nextMessage =
        messages[
            focusVisibleMessageCount
        ];

    if (!nextMessage) {
        moveReplayToNextChapter();
        return;
    }

    isReplayMessageRevealPending =
        true;

    try {

        if (
            typeof applyPreviewBackgroundForMessage ===
                "function"
        ) {
            await applyPreviewBackgroundForMessage(
                nextMessage.dataset.messageId
            );
        }

        const bubbleHeight =
            measureHiddenReplayMessageBubbleHeight(
                nextMessage
            );

        const isLongMessage =
            bubbleHeight >=
                LONG_MESSAGE_MIN_HEIGHT;

        revealReplayMessageElement(
            nextMessage,
            settings
        );

        const isFirstReplayMessage =
            focusVisibleMessageCount === 0;

        focusVisibleMessageCount += 1;

        if (
            isLongMessage &&
            settings.longMessageClickEnabled
        ) {

            const bubbleElement =
                nextMessage.querySelector(
                    ".messageBubble"
                );

            replayLongMessageState = {
                bubbleElement
            };

            await waitForReplayLayout();

            const remainingHeight =
                getReplayBubbleRemainingHeight(
                    bubbleElement
                );

            if (remainingHeight <= 1) {
                replayLongMessageState = null;
            } else if (!isFirstReplayMessage) {
                await continueReplayLongMessage(
                    true
                );
            }

        } else {

            replayLongMessageState = null;

            requestAnimationFrame(
                () => {

                    scrollFocusMessageToReadingPosition(
                        nextMessage
                    );

                }
            );

        }

        requestAnimationFrame(
            () => {

                if (
                    typeof updatePreviewMedia ===
                        "function"
                ) {
                    updatePreviewMedia();
                }

            }
        );

    } finally {

        isReplayMessageRevealPending =
            false;

    }

}


// =========================================
// 리플레이 다음 챕터 이동
// =========================================

function moveReplayToNextChapter() {

    const chat =
        typeof getSelectedChat === "function"
            ? getSelectedChat()
            : null;

    const chapter =
        typeof getSelectedChapter === "function"
            ? getSelectedChapter()
            : null;

    if (!chat || !chapter || !Array.isArray(chat.chapters)) {
        return false;
    }

    const currentIndex = chat.chapters.findIndex(
        item => item.id === chapter.id
    );

    const nextChapter = chat.chapters[currentIndex + 1];

    if (!nextChapter) {
        return false;
    }

    replayLongMessageState = null;
    isReplayMessageRevealPending = false;

    if (typeof selectChapter === "function") {
        selectChapter(nextChapter.id);
    }

    requestAnimationFrame(() => {
        resetFocusClickAction();

        if (previewArea) {
            previewArea.scrollTop = 0;
        }

        if (typeof updatePreviewMedia === "function") {
            updatePreviewMedia();
        }
    });

    return true;

}

async function continueReplayLongMessage(
    pendingAlreadyLocked = false
) {

    const bubbleElement =
        replayLongMessageState
            ?.bubbleElement;

    if (
        !previewArea ||
        !bubbleElement
    ) {
        replayLongMessageState = null;
        return;
    }

    if (!pendingAlreadyLocked) {
        isReplayMessageRevealPending = true;
    }

    try {

        await waitForReplayLayout();

        const remainingHeight =
            getReplayBubbleRemainingHeight(
                bubbleElement
            );

        if (remainingHeight <= 1) {
            replayLongMessageState = null;
            return;
        }

        let scrollDistance =
            Math.min(
                LONG_MESSAGE_SCROLL_STEP,
                remainingHeight
            );

        const afterScrollRemaining =
            remainingHeight -
            scrollDistance;

        if (
            afterScrollRemaining > 0 &&
            afterScrollRemaining <=
                LONG_MESSAGE_LAST_MERGE
        ) {
            scrollDistance +=
                afterScrollRemaining;
        }

        await scrollReplayByReservedHeight(
            scrollDistance
        );

        await waitForReplayLayout();

        const actualRemainingHeight =
            getReplayBubbleRemainingHeight(
                bubbleElement
            );

        if (actualRemainingHeight <= 1) {
            replayLongMessageState = null;
        }

    } finally {

        if (!pendingAlreadyLocked) {
            isReplayMessageRevealPending = false;
        }

    }

}

function getReplayBubbleRemainingHeight(
    bubbleElement
) {

    if (
        !previewArea ||
        !bubbleElement
    ) {
        return 0;
    }

    const previewRect =
        previewArea.getBoundingClientRect();

    const bubbleRect =
        bubbleElement.getBoundingClientRect();

    const previewStyle =
        window.getComputedStyle(
            previewArea
        );

    const paddingBottom =
        Number.parseFloat(
            previewStyle.paddingBottom
        ) || 0;

    const visibleBottom =
        previewRect.bottom -
        paddingBottom;

    return Math.max(
        0,
        Math.ceil(
            bubbleRect.bottom -
            visibleBottom
        )
    );

}

function waitForReplayLayout() {

    return new Promise(
        resolve => {
            requestAnimationFrame(
                () => {
                    requestAnimationFrame(
                        resolve
                    );
                }
            );
        }
    );

}

function revealReplayMessageElement(
    messageElement,
    settings
) {

    messageElement.classList.remove(
        "focusMessageHidden"
    );

    messageElement.classList.add(
        "focusMessageVisible"
    );

    if (
        settings.clickAnimation ===
            "slide"
    ) {

        messageElement.classList.add(
            "focusMessageSlide"
        );

    }

}

function measureHiddenReplayMessageBubbleHeight(
    messageElement
) {

    const clone =
        messageElement.cloneNode(
            true
        );

    const bubble =
        clone.querySelector(
            ".messageBubble"
        );

    if (!bubble) {
        return 0;
    }

    clone.classList.remove(
        "focusMessageHidden",
        "focusMessageVisible",
        "focusMessageSlide",
        "selected",
        "messageRangeSelected"
    );

    clone.style.position =
        "absolute";

    clone.style.left =
        "-100000px";

    clone.style.top =
        "0";

    clone.style.width =
        `${messageElement.parentElement?.clientWidth || 0}px`;

    clone.style.visibility =
        "hidden";

    clone.style.pointerEvents =
        "none";

    clone.style.display =
        "flex";

    document.body.appendChild(
        clone
    );

    const height =
        Math.ceil(
            bubble.getBoundingClientRect().height
        );

    clone.remove();

    return height;

}

function scrollReplayByReservedHeight(
    reservedHeight
) {

    return new Promise(
        resolve => {

            if (
                !previewArea ||
                reservedHeight <= 0
            ) {
                resolve(0);
                return;
            }

            const start =
                previewArea.scrollTop;

            const maximum =
                Math.max(
                    0,
                    previewArea.scrollHeight -
                    previewArea.clientHeight
                );

            const target =
                Math.min(
                    maximum,
                    start +
                    reservedHeight
                );

            const distance =
                target -
                start;

            if (
                Math.abs(distance) < 1
            ) {
                previewArea.scrollTop =
                    target;
                resolve(0);
                return;
            }

            const duration =
                Math.min(
                    520,
                    Math.max(
                        300,
                        260 +
                        reservedHeight * 0.22
                    )
                );

            const startedAt =
                performance.now();

            const step =
                now => {

                    const progress =
                        Math.min(
                            1,
                            (
                                now -
                                startedAt
                            ) /
                            duration
                        );

                    const eased =
                        1 -
                        Math.pow(
                            1 - progress,
                            3
                        );

                    previewArea.scrollTop =
                        start +
                        distance *
                        eased;

                    if (
                        progress < 1
                    ) {
                        requestAnimationFrame(
                            step
                        );
                        return;
                    }

                    previewArea.scrollTop =
                        target;

                    resolve(
                        Math.max(
                            0,
                            previewArea.scrollTop -
                            start
                        )
                    );

                };

            requestAnimationFrame(
                step
            );

        }
    );

}

// =========================================
// 리플레이 메시지 읽기 위치 보정
// =========================================

function scrollFocusMessageToReadingPosition(
    messageElement
) {

    if (
        !previewArea ||
        !messageElement
    ) {
        return;
    }

    const previewRect =
        previewArea
            .getBoundingClientRect();

    const messageRect =
        messageElement
            .getBoundingClientRect();

    /*
        읽기 영역의 하단을 전체 높이의 72%로 잡는다.

        새 메시지가 이 선보다 아래에 나타날 경우,
        메시지 하단이 시선 높이 안쪽으로 올라오도록
        필요한 거리만 스크롤한다.
    */
    const readableBottom =
        previewRect.top +
        previewRect.height * 0.72;

    const readableTop =
        previewRect.top +
        Math.min(
            48,
            previewRect.height * 0.08
        );

    if (
        messageRect.bottom >
        readableBottom
    ) {

        const overflow =
            messageRect.bottom -
            readableBottom;

        previewArea.scrollTo({
            top:
                previewArea.scrollTop +
                overflow +
                16,

            behavior:
                "smooth"
        });

        return;
    }

    if (
        messageRect.top <
        readableTop
    ) {

        const overflow =
            readableTop -
            messageRect.top;

        previewArea.scrollTo({
            top:
                Math.max(
                    0,
                    previewArea.scrollTop -
                    overflow -
                    16
                ),

            behavior:
                "smooth"
        });

    }

}

function handleFocusViewportClick(
    event
) {

    if (
        !isFocusModeActive
    ) {
        return;
    }

    if (
        event.target.closest(
            "#eventButtons"
        )
    ) {
        return;
    }

    revealNextFocusMessage();

}

// =========================================
// ESC로 리플레이 종료
// =========================================

function handleFocusModeKeydown(
    event
) {

    if (
        event.key !== "Escape" ||
        !isFocusModeActive
    ) {
        return;
    }

    event.preventDefault();

    closeFocusMode();

}

// =========================================
// 외부 초기화용
// =========================================

function resetFocusMode() {

    if (!isFocusModeActive) {
        return;
    }

    closeFocusMode();

}