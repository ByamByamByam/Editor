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

let focusScrollAnimationFrame =
    null;

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

    if (isFocusModeActive) {

        resetFocusClickAction();

    }

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
        typeof stopPreviewBgm ===
            "function"
    ) {
        stopPreviewBgm();
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

    if (
        focusScrollAnimationFrame !==
            null
    ) {
        cancelAnimationFrame(
            focusScrollAnimationFrame
        );

        focusScrollAnimationFrame =
            null;
    }

    isFocusModeActive =
        false;

focusVisibleMessageCount =
        0;

    document.body.classList.remove(
        "focusMode",
        "focusClickActionMode"
    );

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

function revealNextFocusMessage() {

    if (
        !isFocusModeActive
    ) {
        return;
    }

    const settings =
        getViewerSettings();

    if (!settings.clickActionEnabled) {
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
        return;
    }

    nextMessage.classList.remove(
        "focusMessageHidden"
    );

    nextMessage.classList.add(
        "focusMessageVisible"
    );

    if (
        settings.clickAnimation ===
            "slide"
    ) {

        nextMessage.classList.add(
            "focusMessageSlide"
        );

    }

    focusVisibleMessageCount += 1;

    requestAnimationFrame(() => {

        scrollFocusMessageToReadingPosition(
            nextMessage
        );

        if (
            typeof updatePreviewMedia ===
                "function"
        ) {

            updatePreviewMedia();

        }

    });

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
        previewArea.getBoundingClientRect();

    const messageRect =
        messageElement.getBoundingClientRect();

    const readableBottom =
        previewRect.top +
        previewRect.height * 0.72;

    const readableTop =
        previewRect.top +
        Math.min(
            48,
            previewRect.height * 0.08
        );

    let targetScrollTop =
        previewArea.scrollTop;

    if (
        messageRect.bottom >
        readableBottom
    ) {

        targetScrollTop +=
            messageRect.bottom -
            readableBottom +
            16;

    } else if (
        messageRect.top <
        readableTop
    ) {

        targetScrollTop -=
            readableTop -
            messageRect.top +
            16;

    } else {
        return;
    }

    targetScrollTop =
        Math.max(
            0,
            Math.min(
                targetScrollTop,
                previewArea.scrollHeight -
                previewArea.clientHeight
            )
        );

    animateReplayScroll(
        targetScrollTop,
        messageElement
    );

}

function animateReplayScroll(
    targetScrollTop,
    messageElement
) {

    if (!previewArea) {
        return;
    }

    if (
        focusScrollAnimationFrame !==
            null
    ) {
        cancelAnimationFrame(
            focusScrollAnimationFrame
        );
    }

    const startScrollTop =
        previewArea.scrollTop;

    const distance =
        targetScrollTop -
        startScrollTop;

    if (
        Math.abs(distance) < 1
    ) {
        previewArea.scrollTop =
            targetScrollTop;
        return;
    }

    /*
        기본 smooth보다 조금 느리게 움직이되,
        긴 메시지는 높이에 비례해 시간을 추가한다.
        너무 길어지지 않도록 최대 920ms로 제한한다.
    */
    const messageHeight =
        messageElement
            ?.getBoundingClientRect()
            ?.height ||
        0;

    const duration =
        Math.min(
            920,
            Math.max(
                430,
                390 +
                Math.abs(distance) * 0.28 +
                messageHeight * 0.22
            )
        );

    const startedAt =
        performance.now();

    const easeOutCubic =
        progress =>
            1 -
            Math.pow(
                1 - progress,
                3
            );

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

            previewArea.scrollTop =
                startScrollTop +
                distance *
                easeOutCubic(
                    progress
                );

            if (
                progress < 1
            ) {

                focusScrollAnimationFrame =
                    requestAnimationFrame(
                        step
                    );

                return;

            }

            focusScrollAnimationFrame =
                null;

            previewArea.scrollTop =
                targetScrollTop;

        };

    focusScrollAnimationFrame =
        requestAnimationFrame(
            step
        );

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