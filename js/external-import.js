// =========================================
// External Log Import
// Cocofolia / KakaoTalk / Notepad
// =========================================

// ---------- DOM ----------

const importCocofoliaBtn =
    document.getElementById(
        "importCocofoliaBtn"
    );

const cocofoliaFileInput =
    document.getElementById(
        "cocofoliaFileInput"
    );

const importKakaoBtn =
    document.getElementById(
        "importKakaoBtn"
    );

const kakaoFileInput =
    document.getElementById(
        "kakaoFileInput"
    );

const importNotepadBtn =
    document.getElementById(
        "importNotepadBtn"
    );

const notepadFileInput =
    document.getElementById(
        "notepadFileInput"
    );

// =========================================
// 초기화
// =========================================

function initializeExternalImport() {

    importCocofoliaBtn
        ?.addEventListener(
            "click",
            () =>
                cocofoliaFileInput
                    ?.click()
        );

    importKakaoBtn
        ?.addEventListener(
            "click",
            () =>
                kakaoFileInput
                    ?.click()
        );

    importNotepadBtn
        ?.addEventListener(
            "click",
            () =>
                notepadFileInput
                    ?.click()
        );

    cocofoliaFileInput
        ?.addEventListener(
            "change",
            handleCocofoliaImport
        );

    kakaoFileInput
        ?.addEventListener(
            "change",
            handleKakaoImport
        );

    notepadFileInput
        ?.addEventListener(
            "change",
            handleNotepadImport
        );

    console.log(
        "External Log Import Ready"
    );

}

// =========================================
// 코코포리아 가져오기
// =========================================

async function handleCocofoliaImport(
    event
) {

    const file =
        event.target.files?.[0];

    if (!file) {
        return;
    }

    try {

        const html =
            await file.text();

        const records =
            parseCocofoliaHtml(
                html
            );

        await importExternalRecords(
            file.name,
            "코코포리아",
            records
        );

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "코코포리아 로그를 가져오지 못했습니다."
        );

    } finally {

        event.target.value =
            "";

    }

}

function parseCocofoliaHtml(
    html
) {

    const documentData =
        new DOMParser()
            .parseFromString(
                html,
                "text/html"
            );

    const records = [];

    documentData
        .querySelectorAll("p")
        .forEach(paragraph => {

            const spans =
                Array.from(
                    paragraph.querySelectorAll(
                        ":scope > span"
                    )
                );

            if (spans.length < 3) {
                return;
            }

            const speakerName =
                normalizeImportedText(
                    spans[1].textContent
                );

            const content =
                normalizeImportedText(
                    spans
                        .slice(2)
                        .map(
                            span =>
                                span.textContent
                        )
                        .join(" ")
                );

            if (!content) {
                return;
            }

            const cocCheckData =
                parseCocofoliaCocCheck(
                    content
                );

            if (cocCheckData) {

                records.push({
                    type:
                        "coccheck",

                    speakerName:
                        speakerName ||
                        "판정",

                    content,

                    cocCheckData
                });

                return;

            }

            if (
                speakerName
                    .toLowerCase() ===
                "system"
            ) {

                records.push({
                    type:
                        "desc",

                    speakerName:
                        "",

                    content
                });

                return;

            }

            if (!speakerName) {

                const isJudgement =
                    /판정\s*$/u.test(
                        content
                    );

                records.push({
                    type:
                        isJudgement
                            ? "emas"
                            : "desc",

                    speakerName:
                        isJudgement
                            ? "판정"
                            : "",

                    content
                });

                return;

            }

            records.push({
                type:
                    "chat",

                speakerName,
                content
            });

        });

    return records;

}

// =========================================
// 코코포리아 CoC 판정 파싱
// =========================================

function parseCocofoliaCocCheck(
    content
) {

    const text =
        String(
            content ||
            ""
        )
            .replace(
                /\u00a0/g,
                " "
            )
            .trim();

    const header =
        text.match(
            /CC\s*<=\s*(\d+)\s+(.+?)\s*\(\s*1D100\s*<=\s*(\d+)\s*\)/i
        );

    if (!header) {
        return null;
    }

    const success =
        Number(
            header[1]
        );

    const name =
        String(
            header[2] ||
            "판정"
        ).trim();

    const modifierMatch =
        text.match(
            /보너스,\s*패널티\s*주사위\s*\[\s*([+-]?\d+)\s*\]/i
        );

    const greaterParts =
        text
            .split(
                /[＞>]/u
            )
            .map(
                part =>
                    part.trim()
            )
            .filter(Boolean);

    const resultText =
        greaterParts
            .at(-1) ||
        "";

    const numericParts =
        greaterParts
            .slice(1, -1)
            .map(
                part => {

                    const match =
                        part.match(
                            /-?\d+/
                        );

                    return match
                        ? Number(
                            match[0]
                        )
                        : null;

                }
            )
            .filter(
                value =>
                    value !== null
            );

    const mainRoll =
        numericParts.at(-1);

    if (
        !Number.isFinite(
            mainRoll
        )
    ) {
        return null;
    }

    return buildCocCheckData({
        source:
            "코코포리아",

        name,

        success,

        hard:
            Math.floor(
                success / 2
            ),

        extreme:
            Math.floor(
                success / 5
            ),

        rolls:
            numericParts.length > 0
                ? numericParts
                : [mainRoll],

        modifier:
            modifierMatch
                ? modifierMatch[1]
                : null,

        resultText
    });

}

// =========================================
// 카카오톡 가져오기
// =========================================

async function handleKakaoImport(
    event
) {

    const file =
        event.target.files?.[0];

    if (!file) {
        return;
    }

    try {

        const text =
            await file.text();

        const records =
            parseKakaoText(
                text
            );

        await importExternalRecords(
            file.name,
            "카카오톡",
            records
        );

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "카카오톡 로그를 가져오지 못했습니다."
        );

    } finally {

        event.target.value =
            "";

    }

}

function parseKakaoText(
    sourceText
) {

    const lines =
        normalizeImportedNewlines(
            sourceText
        )
            .split("\n");

    const records = [];

    let currentRecord =
        null;

    const headerPattern =
        /^\[([^\]]+)\]\s+\[(?:(오전|오후)\s*)?(\d{1,2}:\d{2})\]\s*(.*)$/u;

    const flushCurrentRecord =
        () => {

            if (!currentRecord) {
                return;
            }

            currentRecord.content =
                normalizeImportedMultilineText(
                    currentRecord.content
                );

            if (
                currentRecord.content
            ) {
                records.push(
                    currentRecord
                );
            }

            currentRecord =
                null;

        };

    lines.forEach(line => {

        const match =
            line.match(
                headerPattern
            );

        if (match) {

            flushCurrentRecord();

            currentRecord = {
                type:
                    "chat",

                speakerName:
                    normalizeImportedText(
                        match[1]
                    ),

                content:
                    match[4] || ""
            };

            return;

        }

        if (
            /^-+\s*.+\s*-+$/u.test(
                line
            ) ||
            /님과 카카오톡 대화$/u.test(
                line.trim()
            ) ||
            /^저장한 날짜\s*:/u.test(
                line.trim()
            )
        ) {
            return;
        }

        if (
            currentRecord
        ) {

            currentRecord.content +=
                `\n${line}`;

        }

    });

    flushCurrentRecord();

    return records;

}

// =========================================
// 메모장 로그 가져오기
// =========================================

async function handleNotepadImport(
    event
) {

    const file =
        event.target.files?.[0];

    if (!file) {
        return;
    }

    try {

        const text =
            await file.text();

        const records =
            parseNotepadText(
                text
            );

        await importExternalRecords(
            file.name,
            "메모장",
            records
        );

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "메모장 로그를 가져오지 못했습니다."
        );

    } finally {

        event.target.value =
            "";

    }

}

function parseNotepadText(
    sourceText
) {

    const lines =
        normalizeImportedNewlines(
            sourceText
        )
            .split("\n");

    const records = [];

    let currentRecord =
        null;

    const headerPattern =
        /^\[[^\]]+\]\s+([^:]+?)\s*:\s*(.*)$/u;

    const flushCurrentRecord =
        () => {

            if (!currentRecord) {
                return;
            }

            currentRecord.content =
                normalizeImportedMultilineText(
                    currentRecord.content
                );

            if (
                currentRecord.content
            ) {
                records.push(
                    currentRecord
                );
            }

            currentRecord =
                null;

        };

    lines.forEach(line => {

        const match =
            line.match(
                headerPattern
            );

        if (match) {

            flushCurrentRecord();

            const speakerName =
                normalizeImportedText(
                    match[1]
                );

            const isSystem =
                /^\(?system\)?$/i.test(
                    speakerName
                );

            currentRecord = {
                type:
                    isSystem
                        ? "desc"
                        : "chat",

                speakerName:
                    isSystem
                        ? ""
                        : speakerName,

                content:
                    match[2] || ""
            };

            return;

        }

        if (!currentRecord) {
            return;
        }

        currentRecord.content +=
            `\n${line}`;

    });

    flushCurrentRecord();

    return records;

}

// =========================================
// 공통 가져오기
// =========================================

async function importExternalRecords(
    filename,
    sourceName,
    records
) {

    if (
        !Array.isArray(records) ||
        records.length === 0
    ) {

        throw new Error(
            "가져올 메시지가 없습니다."
        );

    }

    const confirmed =
        confirm(
            `${records.length}개의 메시지를 ${sourceName} 로그에서 가져오시겠습니까?`
        );

    if (!confirmed) {
        return;
    }

    const chat =
        createExternalImportChat(
            filename,
            sourceName,
            records
        );

    project.chats.push(
        chat
    );

    renderChatList();
    selectChatRoom(
        chat.id
    );

    if (
        typeof setStorageStatus ===
            "function"
    ) {

        setStorageStatus(
            `${sourceName} 로그 ${records.length}개를 가져왔습니다.`
        );

    }

    alert(
        `${records.length}개의 메시지를 가져왔습니다.`
    );

}

function createExternalImportChat(
    filename,
    sourceName,
    records
) {

    const chat =
        new ChatRoom();

    chat.title =
        removeImportedExtension(
            filename
        );

    chat.description =
        `${sourceName} 로그에서 가져온 채팅방`;

    chat.createdAt =
        new Date();

    const chapter =
        new Chapter();

    chapter.title =
        "가져온 로그";

    chapter.description =
        `${sourceName} 파일에서 가져온 메시지`;

    const speakerMap =
        new Map();

    records.forEach(record => {

        const content =
            normalizeImportedMultilineText(
                record.content
            );

        if (!content) {
            return;
        }

        const message =
            new Message();

        message.type =
            record.type ||
            "chat";

        const contentHtml =
            createImportedMessageHtml(
                content
            );

        if (
            message.type ===
            "chat"
        ) {

            const speaker =
                getOrCreateImportedSpeaker(
                    chat,
                    speakerMap,
                    record.speakerName
                );

            message.speakerId =
                speaker.id;

            message.rawHtml =
                content;

            message.html =
                contentHtml;

        } else if (
            message.type ===
            "desc"
        ) {

            message.rawHtml =
                `/desc ${content}`;

            message.html =
                contentHtml;

        } else if (
            message.type ===
            "coccheck"
        ) {

            const speaker =
                getOrCreateImportedSpeaker(
                    chat,
                    speakerMap,
                    record.speakerName ||
                    "판정"
                );

            message.speakerId =
                speaker.id;

            message.cocCheckData =
                record.cocCheckData;

            message.rawHtml =
                content;

            message.html =
                createCocCheckCardHtml(
                    record.cocCheckData
                );

        } else if (
            message.type ===
            "emas"
        ) {

            message.speakerOverride =
                record.speakerName ||
                "판정";

            message.rawHtml =
                `/emas "${message.speakerOverride}" ${content}`;

            message.html =
                contentHtml;

        }

        chapter.messages.push(
            message
        );

    });

    chat.chapters.push(
        chapter
    );

    return chat;

}

function getOrCreateImportedSpeaker(
    chat,
    speakerMap,
    sourceName
) {

    const speakerName =
        normalizeImportedText(
            sourceName
        ) ||
        "이름 없음";

    const key =
        speakerName
            .toLocaleLowerCase();

    if (
        speakerMap.has(
            key
        )
    ) {
        return speakerMap.get(
            key
        );
    }

    const speaker =
        new Speaker();

    speaker.name =
        speakerName;

    chat.speakers.push(
        speaker
    );

    speakerMap.set(
        key,
        speaker
    );

    return speaker;

}

function createImportedMessageHtml(
    plainText
) {

    const escapedHtml =
        escapeImportedHtml(
            plainText
        )
            .replace(
                /\n/g,
                "<br>"
            );

    if (
        typeof parseRoll20StyledContent ===
            "function"
    ) {

        return parseRoll20StyledContent(
            escapedHtml
        );

    }

    return escapedHtml;

}

// =========================================
// 문자열 정리
// =========================================

function normalizeImportedNewlines(
    value
) {

    return String(
        value ||
        ""
    )
        .replace(
            /\r\n?/g,
            "\n"
        );

}

function normalizeImportedText(
    value
) {

    return String(
        value ||
        ""
    )
        .replace(
            /\u00a0/g,
            " "
        )
        .replace(
            /[ \t]+/g,
            " "
        )
        .trim();

}

function normalizeImportedMultilineText(
    value
) {

    return normalizeImportedNewlines(
        value
    )
        .split("\n")
        .map(
            line =>
                line.replace(
                    /[ \t]+$/g,
                    ""
                )
        )
        .join("\n")
        .replace(
            /^\n+/,
            ""
        )
        .replace(
            /\n+$/,
            ""
        )
        .replace(
            /\n{3,}/g,
            "\n\n"
        )
        .trim();

}

function escapeImportedHtml(
    value
) {

    return String(
        value ||
        ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}

function removeImportedExtension(
    filename
) {

    return String(
        filename ||
        "가져온 로그"
    )
        .replace(
            /\.(?:html?|txt)$/i,
            ""
        )
        .trim() ||
        "가져온 로그";

}
