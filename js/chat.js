// =========================================
// Chat Room Manager
// =========================================

// ---------- DOM ----------

const chatList = document.getElementById("chatList");
const addChatBtn = document.getElementById("addChatBtn");

// ---------- 선택 상태 ----------

let selectedChatId = null;

let draggedChatId = null;

// =========================================
// 초기화
// =========================================

function initializeChat() {

    addChatBtn.addEventListener("click", addChatRoom);

    renderChatList();

    console.log("Chat Manager Ready");

}

// =========================================
// 채팅방 추가
// =========================================

function addChatRoom() {

    const chat = new ChatRoom();

    chat.title = `새 채팅 ${project.chats.length + 1}`;
    chat.subtitle = "";
    chat.description = "";
    chat.createdAt = new Date();

    const firstChapter = new Chapter();

    firstChapter.title = "새 챕터";

    chat.chapters.push(firstChapter);

    project.chats.push(chat);

    selectedChatId = chat.id;

    renderChatList();
    selectChatRoom(chat.id);


}

// =========================================
// 채팅방 목록 출력
// =========================================

function renderChatList() {

    chatList.innerHTML = "";

    if (
        project.chats.length === 0
    ) {

        /*
            빈 상태 문구는 표시하지 않고
            채팅 추가 버튼만 유지한다.
        */
        chatList.appendChild(
            addChatBtn
        );

        return;

    }

    project.chats.forEach(chat => {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "chatCard";

        card.dataset.chatId =
            chat.id;

        if (
            chat.id === selectedChatId
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

                draggedChatId =
                    chat.id;

                card.classList.add(
                    "dragging"
                );

                event.dataTransfer
                    .effectAllowed =
                        "move";

                event.dataTransfer
                    .setData(
                        "text/plain",
                        chat.id
                    );

            }
        );

        dragHandle.addEventListener(
            "dragend",
            () => {

                draggedChatId =
                    null;

                clearChatDragIndicators();

            }
        );

        // -------------------------
        // 채팅 선택 영역
        // -------------------------

        const selectButton =
            document.createElement(
                "button"
            );

        selectButton.type =
            "button";

        selectButton.className =
            "chatCardSelect";

        const content =
            document.createElement(
                "div"
            );

        content.className =
            "chatCardContent";

        const title =
            document.createElement(
                "div"
            );

        title.className =
            "chatTitle";

        title.textContent =
            chat.title;

        content.appendChild(
            title
        );

        if (
            chat.subtitle?.trim()
        ) {

            const subtitle =
                document.createElement(
                    "div"
                );

            subtitle.className =
                "chatSubtitle";

            subtitle.textContent =
                chat.subtitle;

            content.appendChild(
                subtitle
            );

        }

        selectButton.appendChild(
            content
        );

        selectButton.addEventListener(
            "click",
            () => {

                selectChatRoom(
                    chat.id
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
                    !draggedChatId ||
                    draggedChatId ===
                        chat.id
                ) {
                    return;
                }

                event.preventDefault();

                clearChatDragIndicators();

                const rect =
                    card.getBoundingClientRect();

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
                    !draggedChatId ||
                    draggedChatId ===
                        chat.id
                ) {

                    clearChatDragIndicators();

                    return;

                }

                const rect =
                    card.getBoundingClientRect();

                const insertAfter =
                    event.clientY >
                    rect.top +
                    rect.height / 2;

                reorderChats(
                    draggedChatId,
                    chat.id,
                    insertAfter
                );

            }
        );

        card.append(
            dragHandle,
            selectButton
        );

        chatList.appendChild(
            card
        );

    });

    /*
        모든 채팅 카드가 출력된 뒤
        추가 버튼을 목록 마지막에 붙인다.
    */
    chatList.appendChild(
        addChatBtn
    );

}

// =========================================
// 채팅방 선택
// =========================================

function selectChatRoom(chatId) {

    const chat =
        project.chats.find(
            item => item.id === chatId
        );

    if (!chat) {
        return;
    }

    selectedChatId = chat.id;

    // 채팅방 카드 선택 표시
    document
        .querySelectorAll(".chatCard")
        .forEach(card => {

            card.classList.toggle(
                "selected",
                card.dataset.chatId === chat.id
            );

        });

    /*
        이전 채팅방의 선택 상태를 먼저 모두 해제
    */

    if (
        typeof clearChapterSelection ===
        "function"
    ) {
        clearChapterSelection();
    }

    if (
        typeof clearSpeakerEditor ===
        "function"
    ) {
        clearSpeakerEditor();
    }

    if (
        typeof clearMessageEditor ===
        "function"
    ) {
        clearMessageEditor();
    }

    /*
        새로 선택된 채팅방의 목록 출력
    */

    if (
        typeof renderChapterList ===
        "function"
    ) {
        renderChapterList();
    }

    if (
        typeof renderSpeakerList ===
        "function"
    ) {
        renderSpeakerList();
    }

    if (
        typeof updateSpeakerSelect ===
        "function"
    ) {
        updateSpeakerSelect();
    }

    /*
        첫 번째 챕터 자동 선택
    */

    if (
        Array.isArray(chat.chapters) &&
        chat.chapters.length > 0
    ) {

        selectChapter(
            chat.chapters[0].id
        );

    } else {

        currentChapterTitle.textContent = "";

        if (
            typeof renderPreview ===
            "function"
        ) {
            renderPreview();
        }

    }
    if (
        typeof renderProjectInspector ===
        "function"
    ) {
        renderProjectInspector();
    }

    if (
        typeof applySelectedChatViewerSettings ===
            "function"
    ) {
        applySelectedChatViewerSettings();
    }

    requestAnimationFrame(() => {
        if (typeof previewArea !== "undefined" && previewArea) {
            previewArea.scrollTop = 0;
        }
    });

}

// =========================================
// 선택된 채팅방 가져오기
// =========================================

function getSelectedChat() {

    return project.chats.find(
        chat => chat.id === selectedChatId
    ) ?? null;

}

// =========================================
// 날짜 표시
// =========================================

function formatChatDate(value) {

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}.${month}.${day}`;

}

// =========================================
// 채팅 드래그 정렬
// =========================================

function reorderChats(
    sourceChatId,
    targetChatId,
    insertAfter
) {

    const sourceIndex =
        project.chats.findIndex(
            chat =>
                chat.id === sourceChatId
        );

    const targetIndex =
        project.chats.findIndex(
            chat =>
                chat.id === targetChatId
        );

    if (
        sourceIndex === -1 ||
        targetIndex === -1
    ) {

        clearChatDragIndicators();

        return;

    }

    const [movedChat] =
        project.chats.splice(
            sourceIndex,
            1
        );

    let newTargetIndex =
        project.chats.findIndex(
            chat =>
                chat.id === targetChatId
        );

    if (insertAfter) {
        newTargetIndex += 1;
    }

    project.chats.splice(
        newTargetIndex,
        0,
        movedChat
    );

    draggedChatId = null;

    renderChatList();

    /*
        선택된 채팅의 내용은 유지한다.
        목록 카드만 다시 그린다.
    */
    if (
        typeof renderProjectInspector ===
        "function"
    ) {
        renderProjectInspector();
    }

    setStorageStatus(
        "채팅 순서를 변경했습니다."
    );

}


// =========================================
// 채팅 드래그 표시 제거
// =========================================

function clearChatDragIndicators() {

    document
        .querySelectorAll(
            ".chatCard"
        )
        .forEach(card => {

            card.classList.remove(
                "dragging",
                "dragInsertBefore",
                "dragInsertAfter"
            );

        });

}