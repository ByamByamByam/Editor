// =========================================
// Chat Preview
// =========================================

// ---------- DOM ----------

const previewArea =
    document.getElementById("previewArea");

    // ---------- 캡처 구간 선택 상태 ----------

    let selectedRangeStartMessageId = null;
    let selectedRangeEndMessageId = null;
    let selectedRangeChapterId = null;

// =========================================
// 초기화
// =========================================

function initializePreview() {

    previewArea.addEventListener("click", event => {

        if (event.target === previewArea) {

            clearMessageEditor();

            clearSelectedMessageRange();

        }

    });

    renderPreview();

    console.log("Preview Ready");

}

// =========================================
// 미리보기 출력
// =========================================

function renderPreview() {

    previewArea.innerHTML = "";

    const chat = getSelectedChat();

    if (!chat) {
        showPreviewEmpty("채팅방을 선택해주세요.");
        return;
    }

    const chapter = getSelectedChapter();

    if (!chapter) {
        showPreviewEmpty("챕터를 선택해주세요.");
        return;
    }

    if (chapter.messages.length === 0) {
        showPreviewEmpty("등록된 메시지가 없습니다.");
        return;
    }

chapter.messages.forEach(message => {

    const speaker =
        chat.speakers.find(
            item =>
                item.id ===
                message.speakerId
        ) ?? null;

    const element =
        createMessageElement(
            message,
            speaker
        );

    if (!element) {
        return;
    }

    element.dataset.messageType =
        message.type || "chat";

    element.dataset.speakerKey =
        message.speakerId ||
        message.speakerOverride ||
        "";

    previewArea.appendChild(
        element
    );

});


applyConsecutiveMessageGrouping();

    if (
        typeof renderEventRanges ===
        "function"
    ) {
        renderEventRanges();
    }

    if (
        typeof updatePreviewMedia ===
        "function"
    ) {
        requestAnimationFrame(
            updatePreviewMedia
        );
    }

}

// =========================================
// 메시지 요소 생성
// =========================================

function createMessageElement(message, speaker) {

    const type = message.type ?? "chat";

    if (type === "desc") {
        return createDescriptionMessage(message);
    }

    if (
    type === "em" ||
    type === "emas"
    ) {
        return createEmoteMessage(message, speaker);
    }

        if (
        type === "as" ||
        type === "roll" ||
        type === "gmroll" ||
        type === "coccheck" ||
        type === "rollcard" ||
        type === "whisper"
    ) {
        return createChatMessage(
            message,
            speaker
        );
    }

    if (type === "system") {
        return createSystemMessage(message);
    }

    return createChatMessage(message, speaker);

}

// =========================================
// 일반 대화
// =========================================

function createChatMessage(message, speaker) {

    if (!speaker && !message.speakerOverride) {
    return null;
    }

    const displaySpeaker = speaker ?? {
        name: message.speakerOverride || "Unknown",
        profile: "",
        bubbleColor: "#ffffff",
        textColor: "#000000",
        nameColor: "#888888",
        align: "left"
    };

    const displayName =
        message.speakerOverride ||
        displaySpeaker.name;

        let messageClass =
        "messageChat";

    if (message.type === "roll") {
        messageClass += " messageRoll";
    }

    if (message.type === "gmroll") {
        messageClass += " messageGmRoll";
    }

    if (message.type === "whisper") {
        messageClass += " messageWhisper";
    }

    if (message.type === "coccheck") {
        messageClass += " messageCocCheck";
    }

    if (message.type === "rollcard") {
        messageClass += " messageRollCard";
    }

    const messageElement =
        createMessageContainer(
            message,
            messageClass
        );

    messageElement.classList.add(
        displaySpeaker.align === "right"
            ? "messageRight"
            : "messageLeft"
    );

    const profileType =
        (
            displaySpeaker.profileType ===
                "square" ||
            displaySpeaker.profileType ===
                "hidden"
        )
            ? displaySpeaker.profileType
            : "circle";

    const shouldShowProfile =
        message.type !== "as" &&
        profileType !== "hidden" &&
        Boolean(displaySpeaker.profile);

    if (shouldShowProfile) {

        const profile =
            document.createElement("img");

        profile.className =
            profileType === "square"
                ? "messageProfile profileSquare"
                : "messageProfile";

        profile.src = displaySpeaker.profile;
        profile.alt = `${displayName} 프로필`;
        profile.loading = "lazy";

        messageElement.appendChild(profile);

    }

    const messageContent =
        document.createElement("div");

    messageContent.className = "messageContent";

    const speakerNameElement =
        document.createElement("div");

    speakerNameElement.className = "messageSpeaker";
    speakerNameElement.textContent = displayName;

    speakerNameElement.style.color =
        displaySpeaker.nameColor ||
        "#888888";

    const bubble =
        document.createElement("div");

    bubble.className = "messageBubble";
    bubble.innerHTML = message.html;

        if (
        displaySpeaker
            .bubbleTransparent
    ) {

        bubble.style.backgroundColor =
            "transparent";

        bubble.style.borderColor =
            "transparent";

    } else if (
        message.type ===
            "whisper"
    ) {

        bubble.style.backgroundColor =
            convertHexColorToRgba(
                displaySpeaker.bubbleColor ||
                "#ffffff",
                0.8
            );

        bubble.style.borderColor =
            "rgba(0, 0, 0, 0.06)";

    } else {

        bubble.style.backgroundColor =
            displaySpeaker.bubbleColor ||
            "#ffffff";

        bubble.style.borderColor =
            "rgba(0, 0, 0, 0.08)";

    }

    const viewerSettings =
    getViewerSettings();

    if (message.type === "as") {

        bubble.style.backgroundColor =
            viewerSettings.asBubbleColor;

        bubble.style.color =
            viewerSettings.asTextColor;

    } else {

        bubble.style.color =
            displaySpeaker.textColor ||
            "#000000";

    }

    messageContent.append(
        speakerNameElement,
        bubble
    );

    messageElement.appendChild(messageContent);

    return messageElement;

}

// =========================================
// HEX 색상 → RGBA
// =========================================

function convertHexColorToRgba(
    hexColor,
    alpha
) {

    const normalized =
        String(hexColor)
            .trim()
            .replace(
                "#",
                ""
            );

    if (
        !/^[0-9a-f]{6}$/i.test(
            normalized
        )
    ) {
        return `rgba(255, 255, 255, ${alpha})`;
    }

    const red =
        parseInt(
            normalized.slice(0, 2),
            16
        );

    const green =
        parseInt(
            normalized.slice(2, 4),
            16
        );

    const blue =
        parseInt(
            normalized.slice(4, 6),
            16
        );

    return (
        `rgba(` +
        `${red}, ` +
        `${green}, ` +
        `${blue}, ` +
        `${alpha}` +
        `)`
    );

}

// =========================================
// 장면 설명
// =========================================

function createDescriptionMessage(message) {

    const element =
        createMessageContainer(
            message,
            "messageDesc"
        );

    const content =
        document.createElement("div");

    content.className = "messageDescContent";
    content.innerHTML = message.html;

    element.appendChild(content);

    return element;

}

// =========================================
// 행동 표현
// =========================================

function createEmoteMessage(message, speaker) {

    const element =
        createMessageContainer(
            message,
            "messageEm"
        );

    const content =
        document.createElement("div");

    content.className =
        message.type === "emas"
            ? "messageEmContent messageEmasContent"
            : "messageEmContent";

    /*
        /em만 현재 등장인물 이름을 출력한다.
        /emas는 지정 이름을 메시지 앞에 별도로 붙이지 않는다.
    */
    const displayName =
        message.speakerOverride ||
        speaker?.name ||
        "";

    if (
        message.type === "em" &&
        displayName
    ) {

        const name =
            document.createElement(
                "strong"
            );

        name.textContent =
            displayName;

        content.appendChild(
            name
        );

        content.append(
            " "
        );

    }

    const text =
        document.createElement("span");

    text.innerHTML = message.html;

    content.appendChild(text);
    element.appendChild(content);

    return element;

}

// =========================================
// 시스템 메시지
// =========================================

function createSystemMessage(message) {

    const element =
        createMessageContainer(
            message,
            "messageSystem"
        );

    const label =
        document.createElement("div");

    label.className = "messageSystemLabel";
    label.textContent = "SYSTEM";

    const content =
        document.createElement("div");

    content.className = "messageSystemContent";
    content.innerHTML = message.html;

    element.append(label, content);

    return element;

}

// =========================================
// 공통 메시지 컨테이너
// =========================================

function createMessageContainer(
    message,
    extraClass
) {

    const element =
        document.createElement("div");

    element.className =
        `message ${extraClass}`;

    element.dataset.messageId =
        message.id;

    if (
        message.id ===
        selectedMessageId
    ) {
        element.classList.add(
            "selected"
        );
    }

    if (
        isMessageInSelectedRange(
            message.id
        )
    ) {
        element.classList.add(
            "messageRangeSelected"
        );
    }

    element.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            /*
                Shift + 클릭은 일반 화면·편집 화면 모두에서
                PNG 캡처용 메시지 범위를 선택한다.

                첫 Shift 클릭은 단일 선택,
                다음 Shift 클릭은 처음 메시지부터 현재 메시지까지 범위 선택이다.
            */
            if (event.shiftKey) {

                event.preventDefault();

                selectMessageRange(
                    message.id
                );

                return;

            }

            /*
                리플레이의 일반 클릭은 기존처럼
                다음 메시지를 공개한다.
            */
            if (
                typeof isFocusModeActive !==
                    "undefined" &&
                isFocusModeActive
            ) {

                if (
                    typeof revealNextFocusMessage ===
                        "function"
                ) {
                    revealNextFocusMessage();
                }

                return;

            }

            /*
                연출 편집 모드에서는 단일 메시지를
                연출 대상 및 메시지 편집 대상으로 선택한다.
            */
            if (
                typeof isEventGuideVisible !==
                    "undefined" &&
                isEventGuideVisible
            ) {

                selectSingleMessageRange(
                    message.id
                );

                selectMessage(
                    message.id
                );

                return;

            }

            /*
                일반 클릭은 메시지 편집만 수행한다.
                Shift로 선택한 캡처 범위는 유지한다.
            */
            selectMessage(
                message.id
            );

        }
);

    return element;

}

// =========================================
// 캡처 메시지 구간 선택
// =========================================

function selectMessageRange(
    endMessageId
) {

    const chapter =
        getSelectedChapter();

    if (!chapter) {
        return;
    }

    /*
        챕터가 바뀌었거나 시작점이 없다면
        현재 단일 선택 메시지를 시작점으로 사용한다.
    */
    if (
        selectedRangeChapterId !==
            chapter.id ||
        !selectedRangeStartMessageId
    ) {

        selectedRangeStartMessageId =
            endMessageId;

        selectedRangeEndMessageId =
            endMessageId;

        selectedRangeChapterId =
            chapter.id;

    }

    const startIndex =
        chapter.messages.findIndex(
            message =>
                message.id ===
                selectedRangeStartMessageId
        );

    const endIndex =
        chapter.messages.findIndex(
            message =>
                message.id ===
                endMessageId
        );

    if (
        startIndex === -1 ||
        endIndex === -1
    ) {

        clearSelectedMessageRange();

        return;

    }

    selectedRangeEndMessageId =
        endMessageId;

renderSelectedRange();

    if (
        typeof updateDirectCaptureButtonState ===
        "function"
    ) {
        updateDirectCaptureButtonState();
    }

    



}

// =========================================
// 메시지가 캡처 구간에 포함되는지 확인
// =========================================

function isMessageInSelectedRange(
    messageId
) {

    const chapter =
        getSelectedChapter();

    if (
        !chapter ||
        selectedRangeChapterId !==
            chapter.id ||
        !selectedRangeStartMessageId ||
        !selectedRangeEndMessageId
    ) {
        return false;
    }

    const messageIndex =
        chapter.messages.findIndex(
            message =>
                message.id === messageId
        );

    const startIndex =
        chapter.messages.findIndex(
            message =>
                message.id ===
                selectedRangeStartMessageId
        );

    const endIndex =
        chapter.messages.findIndex(
            message =>
                message.id ===
                selectedRangeEndMessageId
        );

    if (
        messageIndex === -1 ||
        startIndex === -1 ||
        endIndex === -1
    ) {
        return false;
    }

    const rangeStart =
        Math.min(
            startIndex,
            endIndex
        );

    const rangeEnd =
        Math.max(
            startIndex,
            endIndex
        );

    return (
        messageIndex >= rangeStart &&
        messageIndex <= rangeEnd
    );

}

// =========================================
// 캡처 구간 선택 표시 갱신
// =========================================

function renderSelectedRange() {

    document
        .querySelectorAll(
            "#previewArea .message"
        )
        .forEach(element => {

            element.classList.toggle(
                "messageRangeSelected",
                isMessageInSelectedRange(
                    element.dataset.messageId
                )
            );

        });

}

// =========================================
// 캡처 구간 선택 해제
// =========================================

function clearSelectedMessageRange(
    render = true
) {

    selectedRangeStartMessageId =
        null;

    selectedRangeEndMessageId =
        null;

    selectedRangeChapterId =
        null;

    document
        .querySelectorAll(
            "#previewArea " +
            ".messageRangeSelected"
        )
        .forEach(element => {

            element.classList.remove(
                "messageRangeSelected"
            );

        });

    if (
        render &&
        typeof renderSelectedRange ===
            "function"
    ) {
        renderSelectedRange();
    }

    if (
        typeof updateDirectCaptureButtonState ===
        "function"
    ) {
        updateDirectCaptureButtonState();
    }

}

// =========================================
// 선택한 캡처 구간 메시지 반환
// =========================================

function getSelectedRangeMessages() {

    const chapter =
        getSelectedChapter();

    if (
        !chapter ||
        selectedRangeChapterId !==
            chapter.id ||
        !selectedRangeStartMessageId ||
        !selectedRangeEndMessageId
    ) {
        return [];
    }

    const startIndex =
        chapter.messages.findIndex(
            message =>
                message.id ===
                selectedRangeStartMessageId
        );

    const endIndex =
        chapter.messages.findIndex(
            message =>
                message.id ===
                selectedRangeEndMessageId
        );

    if (
        startIndex === -1 ||
        endIndex === -1
    ) {
        return [];
    }

    const rangeStart =
        Math.min(
            startIndex,
            endIndex
        );

    const rangeEnd =
        Math.max(
            startIndex,
            endIndex
        );

    return chapter.messages.slice(
        rangeStart,
        rangeEnd + 1
    );

}

// =========================================
// 현재 선택 범위의 시작·끝 메시지 반환
// =========================================

function getSelectedMessageRangeBounds() {

    const chapter =
        getSelectedChapter();

    if (
        !chapter ||
        selectedRangeChapterId !==
            chapter.id ||
        !selectedRangeStartMessageId ||
        !selectedRangeEndMessageId
    ) {
        return null;
    }

    const startIndex =
        chapter.messages.findIndex(
            message =>
                message.id ===
                selectedRangeStartMessageId
        );

    const endIndex =
        chapter.messages.findIndex(
            message =>
                message.id ===
                selectedRangeEndMessageId
        );

    if (
        startIndex === -1 ||
        endIndex === -1
    ) {
        return null;
    }

    const firstIndex =
        Math.min(
            startIndex,
            endIndex
        );

    const lastIndex =
        Math.max(
            startIndex,
            endIndex
        );

    return {
        startMessageId:
            chapter.messages[firstIndex].id,

        endMessageId:
            chapter.messages[lastIndex].id,

        messageCount:
            lastIndex - firstIndex + 1
    };

}

// =========================================
// 메시지 하나를 선택 범위로 지정
// =========================================

function selectSingleMessageRange(
    messageId
) {

    const chapter =
        getSelectedChapter();

    if (!chapter) {
        return;
    }

    selectedRangeStartMessageId =
        messageId;

    selectedRangeEndMessageId =
        messageId;

    selectedRangeChapterId =
        chapter.id;

    renderSelectedRange();

    if (
        typeof updateDirectCaptureButtonState ===
        "function"
    ) {
        updateDirectCaptureButtonState();
    }

}



// =========================================
// 연속 대화 묶기
// =========================================

function applyConsecutiveMessageGrouping() {

    const settings =
        typeof getViewerSettings ===
            "function"
            ? getViewerSettings()
            : null;

    const messages =
        Array.from(
            previewArea.children
        );

    messages.forEach(element => {

        element.classList.remove(
            "messageGroupStart",
            "messageGroupMiddle",
            "messageGroupEnd"
        );

    });

    if (
        !settings ||
        !settings.groupConsecutiveMessages
    ) {
        return;
    }

    messages.forEach(
        (current, index) => {

            if (
                !current.classList.contains(
                    "messageChat"
                )
            ) {
                return;
            }

            const previous =
                messages[index - 1] ||
                null;

            const next =
                messages[index + 1] ||
                null;

            const matchesPrevious =
                Boolean(
                    previous &&
                    previous.classList.contains(
                        "messageChat"
                    ) &&
                    previous.dataset.speakerKey &&
                    previous.dataset.speakerKey ===
                        current.dataset.speakerKey
                );

            const matchesNext =
                Boolean(
                    next &&
                    next.classList.contains(
                        "messageChat"
                    ) &&
                    next.dataset.speakerKey &&
                    next.dataset.speakerKey ===
                        current.dataset.speakerKey
                );

            if (
                !matchesPrevious &&
                matchesNext
            ) {

                current.classList.add(
                    "messageGroupStart"
                );

                return;

            }

            if (
                matchesPrevious &&
                matchesNext
            ) {

                current.classList.add(
                    "messageGroupMiddle"
                );

                return;

            }

            if (
                matchesPrevious &&
                !matchesNext
            ) {

                current.classList.add(
                    "messageGroupEnd"
                );

            }

        }
    );

}


// =========================================
// 빈 미리보기 문구
// =========================================

function showPreviewEmpty(text) {

    const empty =
        document.createElement("div");

    empty.className = "previewEmpty";
    empty.textContent = text;

    previewArea.appendChild(empty);

}