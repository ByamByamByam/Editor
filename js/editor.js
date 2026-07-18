// =========================================
// Message Editor
// =========================================

// ---------- DOM ----------

const messageSpeakerSelect =
    document.getElementById("speakerSelect");

const messageTypeSelect =
    document.getElementById("messageTypeSelect");

const messageInput =
    document.getElementById("messageInput");

const addMessageBtn =
    document.getElementById("addMessageBtn");

const saveMessageBtn =
    document.getElementById("saveMessageBtn");

const deleteMessageBtn =
    document.getElementById("deleteMessageBtn");


    // ---------- 선택 상태 ----------

let selectedMessageId = null;


// =========================================
// 초기화
// =========================================

function initializeEditor() {

    addMessageBtn.addEventListener(
        "click",
        addMessageAfterSelected
    );

    saveMessageBtn.addEventListener(
        "click",
        saveMessage
    );

    deleteMessageBtn.addEventListener(
        "click",
        deleteMessage
    );

    /*
        붙여넣을 때 외부 HTML 서식을 제거하고
        순수 텍스트만 입력한다.
    */
    messageInput.addEventListener(
        "paste",
        handleMessagePlainTextPaste
    );

    // Enter: 저장
    // Shift + Enter: 줄바꿈
    messageInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Enter"
            ) {
                return;
            }

            if (event.shiftKey) {
                return;
            }

            event.preventDefault();

            saveMessage();

        }
    );

    /*
        Escape:
        현재 메시지 편집 선택 해제
    */
    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Escape"
            ) {
                return;
            }

            clearMessageEditor();

        }
    );

    clearMessageEditor();

    console.log(
        "Message Editor Ready"
    );

}


// =========================================
// 순수 텍스트 붙여넣기
// =========================================

function handleMessagePlainTextPaste(
    event
) {

    event.preventDefault();

    const text =
        event.clipboardData
            ?.getData(
                "text/plain"
            ) ?? "";

    insertPlainTextAtCursor(
        text
    );

}

// =========================================
// 현재 커서 위치에 순수 텍스트 삽입
// =========================================

function insertPlainTextAtCursor(
    text
) {

    const selection =
        window.getSelection();

    if (
        !selection ||
        selection.rangeCount === 0
    ) {
        return;
    }

    const range =
        selection.getRangeAt(0);

    /*
        커서가 메시지 입력창 밖에 있다면
        입력창 맨 끝으로 이동한다.
    */
    if (
        !messageInput.contains(
            range.commonAncestorContainer
        )
    ) {

        messageInput.focus();

        const fallbackRange =
            document.createRange();

        fallbackRange.selectNodeContents(
            messageInput
        );

        fallbackRange.collapse(
            false
        );

        selection.removeAllRanges();

        selection.addRange(
            fallbackRange
        );

    }

    const activeRange =
        selection.getRangeAt(0);

    activeRange.deleteContents();

    const fragment =
        document.createDocumentFragment();

    const lines =
        String(text)
            .replace(
                /\r\n?/g,
                "\n"
            )
            .split("\n");

    lines.forEach(
        (line, index) => {

            if (index > 0) {

                fragment.appendChild(
                    document.createElement(
                        "br"
                    )
                );

            }

            fragment.appendChild(
                document.createTextNode(
                    line
                )
            );

        }
    );

    const lastNode =
        fragment.lastChild;

    activeRange.insertNode(
        fragment
    );

    /*
        붙여넣은 내용 뒤로 커서를 이동한다.
    */
    if (lastNode) {

        const caretRange =
            document.createRange();

        caretRange.setStartAfter(
            lastNode
        );

        caretRange.collapse(
            true
        );

        selection.removeAllRanges();

        selection.addRange(
            caretRange
        );

    }

    messageInput.focus();

}

// =========================================
// 메시지 저장
// =========================================

function saveMessage() {

    const chat = getSelectedChat();

    if (!chat) {
        alert("먼저 채팅방을 선택해주세요.");
        return;
    }

    const chapter = getSelectedChapter();

    if (!chapter) {
        alert("먼저 챕터를 선택해주세요.");
        return;
    }

    const speakerId =
        messageSpeakerSelect.value;

    const plainText =
        messageInput.textContent.trim();

    const rawHtml =
        cleanEditorHtml(messageInput.innerHTML);

    const parsedMessage =
        parseMessageCommand(rawHtml, plainText);

    const messageType =
        parsedMessage.type;

    const content =
        parsedMessage.html;

    const isNewMessage =
        selectedMessageId === null;

    
    if (isNewMessage) {

        const message = new Message();

        message.speakerId = speakerId;

        message.speakerOverride =
            parsedMessage.speakerOverride;

        message.type = messageType;

        message.rawHtml =
            parsedMessage.rawHtml ??
            rawHtml;

        message.html = content;

        chapter.messages.push(message);

        selectedMessageId = message.id;

    } else {

        const message = chapter.messages.find(
            item => item.id === selectedMessageId
        );

        if (!message) {

            alert("선택한 메시지를 찾을 수 없습니다.");

            clearMessageEditor();
            renderPreview();

            return;

        }

        /*
            CoC 판정 카드는 편집용 텍스트를 다시 구조화하여
            저장하므로 일반 메시지로 풀리지 않는다.
        */
        if (
            message.type === "coccheck"
        ) {

            const editedCheck =
                parseEditableCocCheckText(
                    plainText,
                    message.cocCheckData
                );

            if (!editedCheck) {
                alert(
                    "판정 형식을 확인해주세요. 이름, 기준치와 굴림값이 필요합니다."
                );
                return;
            }

            message.speakerId =
                speakerId;

            message.type =
                "coccheck";

            message.cocCheckData =
                editedCheck;

            message.rawHtml =
                createEditableCocCheckText(
                    editedCheck
                );

            message.html =
                createCocCheckCardHtml(
                    editedCheck
                );

            renderPreview();
            selectMessage(
                selectedMessageId
            );

            return;

        }

        const editableRoll =
            (
                message.type === "roll" ||
                message.type === "gmroll"
            )
                ? parseEditableRollText(
                    plainText,
                    message
                )
                : null;

        if (editableRoll) {

            message.speakerId =
                speakerId;

            message.type =
                editableRoll.type;

            message.roll20RollExpression =
                editableRoll.expression;

            message.roll20RollData =
                JSON.stringify({
                    editableDice:
                        editableRoll.dice,
                    editableResults:
                        editableRoll.results,
                    editableTotal:
                        editableRoll.total,
                    total:
                        editableRoll.total
                });

            message.rawHtml =
                createEditableRollText(
                    editableRoll
                );

            message.html =
                createImportedRollResultHtml(
                    {
                        origRoll:
                            editableRoll.expression,
                        content:
                            message.roll20RollData
                    },
                    editableRoll.type ===
                        "gmroll"
                );

            renderPreview();
            selectMessage(
                selectedMessageId
            );

            return;

        }

                const wasImportedRoll =
            (
                message.type === "roll" ||
                message.type === "gmroll"
            ) &&
            Boolean(
                message.roll20RollData
            );

        const remainsRollMessage =
            messageType === "roll" ||
            messageType === "gmroll";

        const editedRollExpression =
            remainsRollMessage
                ? extractEditableRollExpression(
                    content
                )
                : "";

        const originalRollExpression =
            String(
                message.roll20RollExpression ||
                ""
            ).trim();

        const shouldKeepImportedResult =
            wasImportedRoll &&
            remainsRollMessage &&
            normalizeRollExpression(
                editedRollExpression
            ) ===
            normalizeRollExpression(
                originalRollExpression
            );

        message.speakerId = speakerId;

        message.speakerOverride =
            parsedMessage.speakerOverride;

        message.type = messageType;

        message.rawHtml =
            parsedMessage.rawHtml ??
            rawHtml;

        if (shouldKeepImportedResult) {

            /*
                원래 굴림식은 그대로이고
                CSS 문법만 바뀐 경우다.

                기존 Roll20 결과를 유지하면서
                굴림식 표시 부분에 편집한 HTML을 적용한다.
            */
            message.html =
                createImportedRollResultHtml(
                    {
                        origRoll:
                            message
                                .roll20RollExpression,

                        content:
                            message
                                .roll20RollData
                    },
                    messageType === "gmroll",
                    content
                );

        } else {

            /*
                굴림식 또는 메시지 유형이 바뀌었다.

                과거 주사위 결과는 더 이상
                현재 내용과 일치하지 않으므로 제거한다.
            */
            message.html =
                content;

            message.roll20RollData =
                "";

            message.roll20RollExpression =
                "";

            if (
                messageType !== "roll" &&
                messageType !== "gmroll"
            ) {
                message.roll20Type =
                    "";
            }

        }

    }

    renderPreview();

    if (isNewMessage) {

        clearMessageEditor();
        messageInput.focus();

    } else {

        selectMessage(selectedMessageId);

    }

    console.log(
        "메시지 저장 완료",
        chapter.messages
    );

}


// =========================================
// 편집한 주사위 굴림식 추출
// =========================================

function extractEditableRollExpression(
    parsedHtml
) {

    const container =
        document.createElement(
            "div"
        );

    container.innerHTML =
        String(
            parsedHtml ||
            ""
        );

    return container
        .textContent
        .trim();

}

// =========================================
// 주사위 굴림식 비교용 정리
// =========================================

function normalizeRollExpression(
    expression
) {

    return String(
        expression ||
        ""
    )
        .replace(
            /\s+/g,
            ""
        )
        .toLowerCase();

}

// =========================================
// 메시지 삭제
// =========================================

function deleteMessage() {

    const chapter = getSelectedChapter();

    if (!chapter) {
        alert("먼저 챕터를 선택해주세요.");
        return;
    }

    if (selectedMessageId === null) {
        alert("삭제할 메시지를 선택해주세요.");
        return;
    }

    const message = chapter.messages.find(
        item => item.id === selectedMessageId
    );

    if (!message) {

        alert("선택한 메시지를 찾을 수 없습니다.");

        clearMessageEditor();
        renderPreview();

        return;

    }

    const confirmed = confirm(
        "선택한 메시지를 삭제하시겠습니까?"
    );

    if (!confirmed) {
        return;
    }

    chapter.messages = chapter.messages.filter(
        item => item.id !== selectedMessageId
    );

    if (
    typeof clearSelectedMessageRange ===
    "function"
) {
    clearSelectedMessageRange(
        false
    );
}

    clearMessageEditor();
    renderPreview();

}
// =========================================
// 주사위 메시지 편집용 내용 생성
// =========================================

function getEditableMessageHtml(
    message
) {

    const savedRawHtml =
        String(
            message.rawHtml ||
            ""
        ).trim();

    if (
        message.type === "coccheck" &&
        message.cocCheckData
    ) {
        return createEditableCocCheckText(
            message.cocCheckData
        );
    }

    if (
        (
            message.type === "roll" ||
            message.type === "gmroll"
        ) &&
        message.roll20RollData
    ) {
        return createEditableRollTextFromMessage(
            message
        );
    }

    /*
        Roll20 로그는 명령어가 본문과 분리된
        message.type 값으로 저장된다.

        편집창에서는 다시 사람이 입력할 수 있는
        명령어 형태로 복원한다.
    */
    const commandHtml =
        createEditableCommandHtml(
            message,
            savedRawHtml
        );

    if (commandHtml !== null) {
        return commandHtml;
    }

    const isRollMessage =
        message.type === "roll" ||
        message.type === "gmroll";

    if (!isRollMessage) {

        return (
            savedRawHtml ||
            message.html ||
            ""
        );

    }

    /*
        현재 저장된 편집용 내용이 이미
        /r 또는 /gmroll 형식이면 그대로 사용한다.
    */

    if (
        /^\/(?:r|roll|gmroll|gm|gr)(?:\s+|$)/i
            .test(savedRawHtml)
    ) {
        return savedRawHtml;
    }

    /*
        새 필드에 보관된 굴림식을 우선 사용한다.
    */
    let expression =
        String(
            message.roll20RollExpression ||
            ""
        ).trim();

    /*
        예전에 가져온 메시지는 rawHtml에
        Roll20 JSON이 그대로 남아 있을 수 있다.
    */
    const rollDataText =
        String(
            message.roll20RollData ||
            savedRawHtml ||
            ""
        ).trim();

    if (!expression) {

        expression =
            extractRollExpressionFromStoredData(
                rollDataText
            );

    }

    const command =
        message.type === "gmroll"
            ? "/gmroll"
            : "/r";

    const editableHtml =
        expression
            ? `${command} ${expression}`
            : command;

    /*
        한 번 변환한 뒤에는 같은 JSON이
        다시 편집창에 나타나지 않도록 정리한다.
    */
    if (
        rollDataText &&
        looksLikeRoll20RollData(
            rollDataText
        )
    ) {

        message.roll20RollData =
            rollDataText;

    }

    message.roll20RollExpression =
        expression;

    message.rawHtml =
        editableHtml;

    return editableHtml;

}

// =========================================
// 메시지 타입별 편집 명령어 복원
// =========================================

function createEditableCommandHtml(
    message,
    savedRawHtml
) {

    const type =
        String(
            message.type ||
            ""
        );

    const commandPatterns = {
        desc:
            /^\/desc(?:\s+|$)/i,

        em:
            /^\/em(?:\s+|$)/i,

        emas:
            /^\/emas(?:\s+|$)/i,

        as:
            /^\/as(?:\s+|$)/i,

        whisper:
            /^\/w(?:\s+|$)/i
    };

    const pattern =
        commandPatterns[type];

    if (!pattern) {
        return null;
    }

    /*
        직접 입력해 저장한 메시지는
        이미 명령어를 포함하므로 그대로 사용한다.
    */
    if (
        pattern.test(
            savedRawHtml
        )
    ) {
        return savedRawHtml;
    }

    const content =
        savedRawHtml ||
        String(
            message.html ||
            ""
        );

    if (type === "desc") {

        return joinEditableCommand(
            "/desc",
            "",
            content
        );

    }

    if (type === "em") {

        return joinEditableCommand(
            "/em",
            "",
            content
        );

    }

    if (type === "emas") {

        return joinEditableCommand(
            "/emas",
            message.speakerOverride,
            content
        );

    }

    if (type === "as") {

        return joinEditableCommand(
            "/as",
            message.speakerOverride,
            content
        );

    }

    if (type === "whisper") {

        return joinEditableCommand(
            "/w",
            extractEditableWhisperTarget(
                message.html
            ),
            content
        );

    }

    return null;

}

function joinEditableCommand(
    command,
    argument,
    content
) {

    return [
        String(command || "")
            .trim(),

        String(argument || "")
            .trim(),

        String(content || "")
            .trim()
    ]
        .filter(Boolean)
        .join(" ");

}

function extractEditableWhisperTarget(
    messageHtml
) {

    const container =
        document.createElement(
            "div"
        );

    container.innerHTML =
        String(
            messageHtml ||
            ""
        );

    const meta =
        container.querySelector(
            ".messageCommandMeta"
        );

    if (!meta) {
        return "";
    }

    const label =
        String(
            meta.textContent ||
            ""
        ).trim();

    const match =
        label.match(
            /^\(To\s+(.+)\)$/i
        );

    return match
        ? match[1].trim()
        : "";

}

// =========================================
// Roll20 주사위 JSON 여부 확인
// =========================================

function looksLikeRoll20RollData(
    value
) {

    const text =
        String(value || "")
            .trim();

    if (
        !text.startsWith("{") ||
        !text.endsWith("}")
    ) {
        return false;
    }

    try {

        const data =
            JSON.parse(text);

        return Boolean(
            data &&
            Array.isArray(data.rolls)
        );

    } catch (error) {

        return false;

    }

}

// =========================================
// 저장된 Roll20 데이터에서 굴림식 복원
// =========================================

function extractRollExpressionFromStoredData(
    value
) {

    const text =
        String(value || "")
            .trim();

    if (!text) {
        return "";
    }

    let rollData;

    try {

        rollData =
            JSON.parse(text);

    } catch (error) {

        return "";

    }

    if (
        !rollData ||
        !Array.isArray(
            rollData.rolls
        )
    ) {
        return "";
    }

    return rollData.rolls
        .map(
            rollPart =>
                createRollExpressionPart(
                    rollPart
                )
        )
        .join("")
        .trim();

}

// =========================================
// Roll20 굴림식 조각 복원
// =========================================

function createRollExpressionPart(
    rollPart
) {

    if (!rollPart) {
        return "";
    }

    /*
        일반 주사위

        예:
        dice: 2, sides: 10
        → 2d10
    */
    if (rollPart.type === "R") {

        const dice =
            Number(
                rollPart.dice
            );

        const sides =
            Number(
                rollPart.sides
            );

        if (
            Number.isFinite(dice) &&
            Number.isFinite(sides)
        ) {
            return `${dice}d${sides}`;
        }

        return "";

    }

    /*
        숫자 또는 수식

        예:
        { type: "M", expr: 2 }
        → 2
    */
    if (rollPart.type === "M") {

        return String(
            rollPart.expr ??
            ""
        );

    }

    /*
        문자열 조각

        예:
        { type: "C", text: "dr" }
        → dr
    */
    if (rollPart.type === "C") {

        return String(
            rollPart.text ??
            ""
        );

    }

    /*
        라벨
    */
    if (rollPart.type === "L") {

        return String(
            rollPart.text ??
            ""
        );

    }

    return "";

}

// =========================================
// 메시지 선택
// =========================================

function selectMessage(messageId) {

    const chapter = getSelectedChapter();

    if (!chapter) {
        return;
    }

    const message = chapter.messages.find(
        item => item.id === messageId
    );

    if (!message) {
        return;
    }

    selectedMessageId = message.id;

    messageSpeakerSelect.value =
        message.speakerId ?? "";

        messageInput.innerHTML =
        getEditableMessageHtml(
            message
        );

    addMessageBtn.disabled = false;
    deleteMessageBtn.disabled = false;

    document
        .querySelectorAll(".message")
        .forEach(element => {

            element.classList.toggle(
                "selected",
                element.dataset.messageId === message.id
            );

        });


    if (
        typeof updateProjectChapterActionButtons ===
        "function"
    ) {
        updateProjectChapterActionButtons();
    }


}

// =========================================
// 메시지 선택 해제
// =========================================

function clearMessageEditor() {

    selectedMessageId = null;

    messageInput.innerHTML = "";

    addMessageBtn.disabled = true;
    deleteMessageBtn.disabled = true;

    document
        .querySelectorAll(".message.selected")
        .forEach(element => {

            element.classList.remove(
                "selected"
            );

        });


    if (
        typeof updateProjectChapterActionButtons ===
        "function"
    ) {
        updateProjectChapterActionButtons();
    }


}

// =========================================
// 편집기 HTML 정리
// =========================================

function cleanEditorHtml(html) {

    return html
        .replace(/<div><br><\/div>/gi, "<br>")
        .replace(/<div>/gi, "<br>")
        .replace(/<\/div>/gi, "")
        .replace(/^(<br>\s*)+/gi, "")
        .replace(/(<br>\s*)+$/gi, "")
        .trim();

}

// =========================================
// 선택한 메시지 아래에 추가
// =========================================

function addMessageAfterSelected() {

    const chapter =
        getSelectedChapter();

    if (!chapter) {

        alert(
            "먼저 챕터를 선택해주세요."
        );

        return;

    }

    if (!selectedMessageId) {

        alert(
            "메시지를 선택해주세요."
        );

        return;

    }

    const index =
        chapter.messages.findIndex(
            item =>
                item.id ===
                selectedMessageId
        );

    if (index === -1) {
        return;
    }

    const source =
        chapter.messages[index];

    const message =
        new Message();

    /*
        화자 유지
    */

    message.speakerId =
        source.speakerId;

    message.speakerOverride =
        source.speakerOverride;

    /*
        타입 유지
    */

    message.type =
        source.type;

    /*
        내용은 비움
    */

    message.rawHtml = "";

    message.html = "";

    /*
        바로 아래 삽입
    */

    chapter.messages.splice(
        index + 1,
        0,
        message
    );

    renderPreview();

    /*
        새 메시지를 바로 편집
    */

    selectMessage(
        message.id
    );

    messageInput.focus();

}

// =========================================
// 판정 카드 편집 텍스트
// =========================================

function createEditableCocCheckText(
    data
) {

    const rolls =
        Array.isArray(data.rolls)
            ? data.rolls.join(", ")
            : "";

    const damage =
        data.damage !== null &&
        data.damage !== undefined
            ? ` | 피해=${data.damage}`
            : "";

    return (
        `/coc 이름="${data.name || "판정"}"` +
        ` | 성공=${data.success}` +
        ` | 어려움=${data.hard}` +
        ` | 극단=${data.extreme}` +
        ` | 굴림=${rolls}` +
        `${damage}`
    );

}

function parseEditableCocCheckText(
    text,
    fallbackData = {}
) {

    const source =
        String(text || "").trim();

    if (
        !/^\/coc(?:\s+|$)/i.test(
            source
        )
    ) {
        return null;
    }

    const readField =
        name => {

            const match =
                source.match(
                    new RegExp(
                        `${name}\\\\s*=\\\\s*(?:"([^"]*)"|([^|]+))`,
                        "i"
                    )
                );

            return String(
                match?.[1] ??
                match?.[2] ??
                ""
            ).trim();

        };

    const name =
        readField("이름") ||
        fallbackData.name ||
        "판정";

    const success =
        Number(
            readField("성공")
        );

    const hard =
        Number(
            readField("어려움")
        );

    const extreme =
        Number(
            readField("극단")
        );

    const rolls =
        readField("굴림")
            .split(/[,\s]+/)
            .map(Number)
            .filter(Number.isFinite);

    const damageText =
        readField("피해");

    if (
        !Number.isFinite(success) ||
        rolls.length === 0
    ) {
        return null;
    }

    return buildCocCheckData({
        source:
            fallbackData.source ||
            "편집",

        name,
        success,

        hard:
            Number.isFinite(hard)
                ? hard
                : Math.floor(
                    success / 2
                ),

        extreme:
            Number.isFinite(extreme)
                ? extreme
                : Math.floor(
                    success / 5
                ),

        rolls,

        damage:
            damageText === ""
                ? null
                : Number(
                    damageText
                )
    });

}

// =========================================
// 주사위 카드 편집 텍스트
// =========================================

function createEditableRollText(
    data
) {

    const command =
        data.type === "gmroll"
            ? "/gmroll"
            : "/r";

    const dice =
        Array.isArray(data.dice)
            ? data.dice.join(", ")
            : "";

    const results =
        Array.isArray(data.results)
            ? data.results.join(", ")
            : "";

    const total =
        data.total !== null &&
        data.total !== undefined &&
        data.total !== ""
            ? ` | 합계=${data.total}`
            : "";

    return (
        `${command} ${data.expression || ""}` +
        ` | 굴림값=${dice}` +
        ` | 결과값=${results}` +
        `${total}`
    ).trim();

}

function createEditableRollTextFromMessage(
    message
) {

    let data = {};

    try {
        data =
            JSON.parse(
                message.roll20RollData ||
                "{}"
            );
    } catch (error) {
        data = {};
    }

    const dice =
        Array.isArray(data.editableDice)
            ? data.editableDice
            : (
                typeof extractImportedDiceResults ===
                    "function"
                    ? extractImportedDiceResults(
                        data
                    )
                    : []
            );

    const results =
        Array.isArray(data.editableResults)
            ? data.editableResults
            : dice;

    return createEditableRollText({
        type:
            message.type,

        expression:
            message.roll20RollExpression ||
            "",

        dice,
        results,

        total:
            data.editableTotal ??
            data.total ??
            ""
    });

}

function parseEditableRollText(
    text,
    message
) {

    const source =
        String(text || "").trim();

    const commandMatch =
        source.match(
            /^\/(r|roll|gm|gmroll|gr)(?:\s+|$)/i
        );

    if (!commandMatch) {
        return null;
    }

    const command =
        commandMatch[1]
            .toLowerCase();

    const type =
        /^(?:gm|gmroll|gr)$/
            .test(command)
                ? "gmroll"
                : "roll";

    const body =
        source.slice(
            commandMatch[0].length
        );

    const parts =
        body.split("|")
            .map(
                part =>
                    part.trim()
            );

    const expression =
        parts.shift() ||
        message.roll20RollExpression ||
        "";

    const readList =
        label => {

            const part =
                parts.find(
                    item =>
                        item
                            .toLowerCase()
                            .startsWith(
                                `${label.toLowerCase()}=`
                            )
                );

            if (!part) {
                return [];
            }

            return part
                .slice(
                    part.indexOf("=") + 1
                )
                .split(/[,\s]+/)
                .map(Number)
                .filter(Number.isFinite);

        };

    const readNumber =
        label => {

            const part =
                parts.find(
                    item =>
                        item
                            .toLowerCase()
                            .startsWith(
                                `${label.toLowerCase()}=`
                            )
                );

            if (!part) {
                return null;
            }

            const value =
                Number(
                    part.slice(
                        part.indexOf("=") + 1
                    ).trim()
                );

            return Number.isFinite(value)
                ? value
                : null;

        };

    const dice =
        readList(
            "굴림값"
        );

    const results =
        readList(
            "결과값"
        );

    const total =
        readNumber(
            "합계"
        );

    /*
        이전 간단한 /r 입력도 허용한다.
        카드 데이터가 없으면 일반 메시지 처리로 넘긴다.
    */
    if (
        dice.length === 0 &&
        results.length === 0 &&
        total === null
    ) {
        return null;
    }

    return {
        type,
        expression,
        dice,
        results:
            results.length > 0
                ? results
                : dice,
        total
    };

}
