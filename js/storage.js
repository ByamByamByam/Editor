// =========================================
// Project Storage
// =========================================

// ---------- DOM ----------

const newProjectBtn =
    document.getElementById("newProjectBtn");

const openProjectBtn =
    document.getElementById("openProjectBtn");

const saveProjectBtn =
    document.getElementById("saveProjectBtn");

const projectFileInput =
    document.getElementById("projectFileInput");

const statusBar =
    document.getElementById("statusBar");

let currentProjectFileHandle = null;

let currentProjectDirectoryHandle = null;

// =========================================
// 초기화
// =========================================

function initializeStorage() {

    newProjectBtn.addEventListener(
        "click",
        createNewProject
    );

    openProjectBtn.addEventListener(
        "click",
        openProject
    );

    saveProjectBtn.addEventListener(
        "click",
        saveProjectFile
    );

    projectFileInput.addEventListener(
        "change",
        openProjectFile
    );

    document.addEventListener(
        "keydown",
        event => {

            const isControlKey =
                event.ctrlKey || event.metaKey;

            if (
                isControlKey &&
                event.key.toLowerCase() === "s"
            ) {

                event.preventDefault();
                saveProjectFile();

            }

        }
    );

    console.log("Project Storage Ready");

}

// =========================================
// 새 프로젝트
// =========================================

function createNewProject() {

    const hasData =
        project.chats.length > 0;

    if (hasData) {

        const confirmed = confirm(
            "현재 프로젝트의 저장하지 않은 내용이 사라질 수 있습니다.\n새 프로젝트를 만드시겠습니까?"
        );

        if (!confirmed) {
            return;
        }

    }

    project = createEmptyProject();

    currentProjectFileHandle = null;
    currentProjectDirectoryHandle = null;

    resetEditorSelection();

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

    renderEntireProject();

    setStorageStatus("새 프로젝트를 만들었습니다.");

}

// =========================================
// 빈 프로젝트 생성
// =========================================

function createEmptyProject() {

    return {
        version: "0.2",

        title: "새 프로젝트",

        createdAt: new Date(),

                viewerSettings: {
            messageGap: 18,
            groupConsecutiveMessages: false,
            clickActionEnabled: false,
            clickAnimation: "instant",

            performanceDividerVisible:
                true,

            descTextColor:
                "#555555",

            emTextColor:
                "#666666",

            emasTextColor:
                "#666666",

            asBubbleColor:
                "#ffffff",

            asTextColor:
                "#000000",

            logFontImport:
                "",

            logFontFamily:
                '"Pretendard", "맑은 고딕", sans-serif' 
        },

        chats: []
    };

}

// =========================================
// 프로젝트 저장
// =========================================

async function saveProjectFile() {

    try {

        const saveData =
            serializeProject(project);

        const json =
            JSON.stringify(
                saveData,
                null,
                2
            );

        /*
            프로젝트 폴더가 아직 연결되지 않았다면
            저장할 폴더를 먼저 선택한다.
        */
        if (
            !currentProjectDirectoryHandle &&
            "showDirectoryPicker" in window
        ) {

            currentProjectDirectoryHandle =
                await window.showDirectoryPicker({
                    mode: "readwrite"
                });

            await prepareProjectDirectories(
                currentProjectDirectoryHandle
            );

        }

        /*
            프로젝트 폴더 방식
        */
        if (currentProjectDirectoryHandle) {

            const fileHandle =
                await currentProjectDirectoryHandle
                    .getFileHandle(
                        "project.cae",
                        {
                            create: true
                        }
                    );

            await writeProjectFile(
                fileHandle,
                json
            );

            currentProjectFileHandle =
                fileHandle;

            setStorageStatus(
                `📁 ${currentProjectDirectoryHandle.name} | 저장 완료`
            );

            return;

        }

        /*
            폴더 선택 API를 지원하지 않는 브라우저는
            기존 파일 저장 방식을 사용한다.
        */
        if ("showSaveFilePicker" in window) {

            if (!currentProjectFileHandle) {

                currentProjectFileHandle =
                    await window.showSaveFilePicker({
                        suggestedName:
                            `${sanitizeFilename(
                                project.title ||
                                "새 프로젝트"
                            )}.cae`,

                        types: [
                            {
                                description:
                                    "Chat Archive Editor 프로젝트",

                                accept: {
                                    "application/json": [
                                        ".cae"
                                    ]
                                }
                            }
                        ]
                    });

            }

            await writeProjectFile(
                currentProjectFileHandle,
                json
            );

        } else {

            downloadProjectFile(json);

        }

        setStorageStatus(
            "프로젝트를 저장했습니다."
        );

    } catch (error) {

        if (error.name === "AbortError") {
            return;
        }

        console.error(error);

        alert(
            "프로젝트를 저장하지 못했습니다."
        );

        setStorageStatus(
            "저장 중 오류가 발생했습니다."
        );

    }

}



// =========================================
// 선택한 파일에 직접 저장
// =========================================

async function writeProjectFile(
    fileHandle,
    content
) {

    const writable =
        await fileHandle.createWritable();

    await writable.write(content);
    await writable.close();

}

// =========================================
// 프로젝트 자원 폴더 준비
// =========================================

async function prepareProjectDirectories(
    directoryHandle
) {

    if (!directoryHandle) {
        return;
    }

    await directoryHandle.getDirectoryHandle(
        "images",
        {
            create: true
        }
    );

    await directoryHandle.getDirectoryHandle(
        "bgm",
        {
            create: true
        }
    );

    await directoryHandle.getDirectoryHandle(
        "se",
        {
            create: true
        }
    );

}

// =========================================
// 다운로드 방식 저장
// =========================================

function downloadProjectFile(json) {

    const blob =
        new Blob(
            [json],
            {
                type:
                    "application/json;charset=utf-8"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        `${sanitizeFilename(
            project.title ||
            "새 프로젝트"
        )}.cae`;

    document.body.appendChild(link);

    link.click();
    link.remove();

    URL.revokeObjectURL(url);

}

// =========================================
// 저장용 데이터 생성
// =========================================

function serializeProject(sourceProject) {

    return {
        format:
            "chat-archive-editor-project",

        version:
            sourceProject.version || "0.2",

        title:
            sourceProject.title || "새 프로젝트",

        createdAt:
            dateToISOString(
                sourceProject.createdAt
            ),

        savedAt:
    new Date().toISOString(),

viewerSettings: {
    messageGap:
        Number(
            sourceProject
                .viewerSettings
                ?.messageGap
        ) || 18,

    groupConsecutiveMessages:
        Boolean(
            sourceProject
                .viewerSettings
                ?.groupConsecutiveMessages
        ),

    clickActionEnabled:
        Boolean(
            sourceProject
                .viewerSettings
                ?.clickActionEnabled
        ),

    clickAnimation:
        sourceProject
            .viewerSettings
            ?.clickAnimation ===
                "slide"
                ? "slide"
                : "instant",

    performanceDividerVisible:
        sourceProject
            .viewerSettings
            ?.performanceDividerVisible !==
                false,

    descTextColor:
        String(
            sourceProject
                .viewerSettings
                ?.descTextColor ||
            "#555555"
        ),

    emTextColor:
        String(
            sourceProject
                .viewerSettings
                ?.emTextColor ||
            "#666666"
        ),

        emasTextColor:
        String(
            sourceProject
                .viewerSettings
                ?.emasTextColor ||
            "#666666"
        ),

    asBubbleColor:
        String(
            sourceProject
                .viewerSettings
                ?.asBubbleColor ||
            "#ffffff"
        ),

    asTextColor:
        String(
            sourceProject
                .viewerSettings
                ?.asTextColor ||
            "#000000"
        ),

    logFontImport:
        String(
            sourceProject
                .viewerSettings
                ?.logFontImport ||
            ""
        ),

    logFontFamily:
        String(
            sourceProject
                .viewerSettings
                ?.logFontFamily ||
            '"Pretendard", "맑은 고딕", sans-serif'
        )
},

chats:
    sourceProject.chats
    };

}


// =========================================
// 프로젝트 열기
// =========================================

async function openProject() {

    /*
        Chrome / Edge 등:
        프로젝트 폴더를 선택하고
        폴더 안의 project.cae를 연다.
    */
    if ("showDirectoryPicker" in window) {

        try {

            const directoryHandle =
                await window.showDirectoryPicker({
                    mode: "readwrite"
                });

            let fileHandle;

            try {

                fileHandle =
                    await directoryHandle
                        .getFileHandle(
                            "project.cae"
                        );

            } catch (error) {

                if (error.name === "NotFoundError") {

                    alert(
                        "선택한 폴더에 project.cae 파일이 없습니다."
                    );

                    return;

                }

                throw error;

            }

            const file =
                await fileHandle.getFile();

            currentProjectDirectoryHandle =
            directoryHandle;

            currentProjectFileHandle =
                fileHandle;

            if (
                typeof clearProjectResourceUrlCache ===
                "function"
            ) {
                clearProjectResourceUrlCache();
            }

            await loadProjectFromFile(file);


            await prepareProjectDirectories(
                directoryHandle
            );

            setStorageStatus(
                `📁 ${directoryHandle.name} | 프로젝트 불러오기 완료`
            );

        } catch (error) {

            if (error.name === "AbortError") {
                return;
            }

            console.error(error);

            alert(
                error.message ||
                "프로젝트 폴더를 열지 못했습니다."
            );

        }

        return;

    }

    /*
        폴더 선택 API 미지원 브라우저
    */
    projectFileInput.click();

}


// =========================================
// 프로젝트 불러오기
// =========================================

async function openProjectFile(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }

    try {

        await loadProjectFromFile(file);

        /*
            일반 input으로 연 파일은
            파일 핸들이 없으므로 직접 덮어쓸 수 없다.
        */
        currentProjectFileHandle = null;
        currentProjectDirectoryHandle = null;

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "프로젝트 파일을 불러오지 못했습니다."
        );

        setStorageStatus(
            "불러오기 중 오류가 발생했습니다."
        );

    } finally {

        projectFileInput.value = "";

    }

}

// =========================================
// 파일 검사
// =========================================

function validateProjectFile(data) {

    if (
        !data ||
        typeof data !== "object"
    ) {
        throw new Error(
            "올바른 프로젝트 파일이 아닙니다."
        );
    }

    if (!Array.isArray(data.chats)) {
        throw new Error(
            "프로젝트의 채팅방 데이터가 없습니다."
        );
    }

    if (
        data.format &&
        data.format !==
            "chat-archive-editor-project"
    ) {
        throw new Error(
            "지원하지 않는 파일 형식입니다."
        );
    }

}

// =========================================
// 프로젝트 복원
// =========================================

function restoreProject(data) {

    return {
        version:
            String(data.version || "0.2"),

        title:
            String(
                data.title || "새 프로젝트"
            ),

        createdAt:
    restoreDate(
        data.createdAt
    ),

viewerSettings: {
    messageGap:
        Number(
            data.viewerSettings
                ?.messageGap
        ) || 18,

    groupConsecutiveMessages:
        Boolean(
            data.viewerSettings
                ?.groupConsecutiveMessages
        ),

    clickActionEnabled:
        Boolean(
            data.viewerSettings
                ?.clickActionEnabled
        ),

        clickAnimation:
        data.viewerSettings
            ?.clickAnimation ===
                "slide"
                ? "slide"
                : "instant",

    performanceDividerVisible:
        data.viewerSettings
            ?.performanceDividerVisible !==
                false,

    descTextColor:
        String(
            data.viewerSettings
                ?.descTextColor ||
            "#555555"
        ),

    emTextColor:
        String(
            data.viewerSettings
                ?.emTextColor ||
            "#666666"
        ),

    emasTextColor:
        String(
            data.viewerSettings
                ?.emasTextColor ||
            "#666666"
        ),

    asBubbleColor:
        String(
            data.viewerSettings
                ?.asBubbleColor ||
            "#ffffff"
        ),

    asTextColor:
        String(
            data.viewerSettings
                ?.asTextColor ||
            "#000000"
        ),

    logFontImport:
        String(
            data.viewerSettings
                ?.logFontImport ||
            ""
        ),

    logFontFamily:
        String(
            data.viewerSettings
                ?.logFontFamily ||
            '"Pretendard", "맑은 고딕", sans-serif'
        )
},

chats:
    data.chats.map(
        restoreChatRoom
    )
    };

}

// =========================================
// 채팅방 복원
// =========================================

function restoreChatRoom(data) {

    const chat =
        new ChatRoom();

    chat.id =
        data.id || crypto.randomUUID();

    chat.title =
        String(data.title || "");

    chat.subtitle =
        String(data.subtitle || "");

    chat.description =
        String(data.description || "");

    chat.thumbnail =
        String(data.thumbnail || "");

    chat.createdAt =
        restoreDate(data.createdAt);

    /*
        기존 프로젝트에는 채팅방별 설정이 없으므로
        프로젝트 공통 설정을 초기값으로 복사한다.
    */
    chat.viewerSettings =
        createDefaultViewerSettings(
            data.viewerSettings ||
            project?.viewerSettings ||
            {}
        );

    chat.speakers =
        Array.isArray(data.speakers)
            ? data.speakers.map(
                restoreSpeaker
            )
            : [];

    chat.chapters =
        Array.isArray(data.chapters)
            ? data.chapters.map(
                restoreChapter
            )
            : [];

    return chat;

}

// =========================================
// 화자 복원
// =========================================

function restoreSpeaker(data) {

    const speaker =
        new Speaker();

    speaker.id =
        data.id || crypto.randomUUID();

    speaker.name =
        String(data.name || "");

    speaker.profile =
        String(data.profile || "");

    speaker.profileType =
        (
            data.profileType === "square" ||
            data.profileType === "hidden"
        )
            ? data.profileType
            : "circle";

    speaker.bubbleColor =
        String(
            data.bubbleColor || "#ffffff"
        );

    speaker.textColor =
        String(
            data.textColor || "#000000"
        );

    speaker.nameColor =
        String(
            data.nameColor ||
            "#888888"
        );

    speaker.align =
        data.align === "right"
            ? "right"
            : "left";

    speaker.notes =
        String(data.notes || "");

    return speaker;

}

// =========================================
// 챕터 복원
// =========================================

function restoreChapter(data) {

    const chapter =
        new Chapter();

    chapter.id =
        data.id || crypto.randomUUID();

    chapter.title =
        String(
            data.title || "새 챕터"
        );

    chapter.description =
        String(data.description || "");

    chapter.createdAt =
        restoreDate(data.createdAt);

    chapter.messages =
        Array.isArray(data.messages)
            ? data.messages.map(
                restoreMessage
            )
            : [];

    chapter.events =
        Array.isArray(data.events)
            ? data.events.map(
                restoreEventRange
            )
            : [];

    return chapter;

}

// =========================================
// 메시지 복원
// =========================================

function restoreMessage(data) {

    const message =
        new Message();

    message.id =
        data.id || crypto.randomUUID();

    message.speakerId =
        String(data.speakerId || "");

    message.speakerOverride =
        String(
            data.speakerOverride || ""
        );

    message.type =
        String(data.type || "chat");

    message.rawHtml =
        String(data.rawHtml || "");

    message.html =
        String(
            data.html ||
            data.rawHtml ||
            ""
        );

    message.roll20Type =
        String(
            data.roll20Type || ""
        );

    message.roll20MessageId =
        String(
            data.roll20MessageId || ""
        );

    message.roll20RollData =
        String(
            data.roll20RollData || ""
        );

    message.roll20RollExpression =
        String(
            data.roll20RollExpression || ""
        );

    message.cocCheckData =
        data.cocCheckData &&
        typeof data.cocCheckData === "object"
            ? structuredClone(
                data.cocCheckData
            )
            : null;

    message.createdAt =
        restoreDate(data.createdAt);

    return message;

}

// =========================================
// 파일 내용 복원
// =========================================

async function loadProjectFromFile(file) {

    const text =
        await file.text();

    const rawData =
        JSON.parse(text);

    validateProjectFile(rawData);

    project =
    restoreProject(
        rawData
    );

if (
    typeof syncFocusSettingsControls ===
        "function"
) {
    syncFocusSettingsControls();
}

if (
    typeof applyFocusMessageGap ===
        "function"
) {
    applyFocusMessageGap();
}

if (
    typeof applyPerformanceSettings ===
        "function"
) {
    applyPerformanceSettings();
}

/*
    프로젝트에 저장된 Google Fonts @import를
    실제 로그와 입력창에 함께 복원한다.
*/
if (
    typeof applySavedLogFont ===
        "function"
) {
    applySavedLogFont();
}

if (
    typeof syncLogFontImportControl ===
        "function"
) {
    syncLogFontImportControl();
}

resetEditorSelection();

renderEntireProject();

    setStorageStatus(
        `"${project.title}" 프로젝트를 불러왔습니다.`
    );

}


// =========================================
// 연출 구간 복원
// =========================================

function restoreEventRange(data) {

    const eventRange =
        new EventRange();

    eventRange.id =
        data.id || crypto.randomUUID();

    eventRange.type =
        String(data.type || "");

    eventRange.startMessageId =
        String(
            data.startMessageId || ""
        );

    eventRange.endMessageId =
        String(
            data.endMessageId || ""
        );

    eventRange.source =
        String(data.source || "");

    /*
        프로젝트 파일, 임베드 파일, URL을
        모두 그대로 복원한다.
    */
    const savedSourceType =
        String(data.sourceType || "");

    if (
        savedSourceType === "project-file" ||
        savedSourceType === "embedded" ||
        savedSourceType === "url"
    ) {

        eventRange.sourceType =
            savedSourceType;

    } else if (
        eventRange.source.startsWith(
            "data:"
        )
    ) {

        /*
            예전 프로젝트 호환:
            Data URL은 임베드 파일로 판단한다.
        */
        eventRange.sourceType =
            "embedded";

    } else if (
        /^(images|bgm|se)\//i.test(
            eventRange.source
        )
    ) {

        /*
            예전 프로젝트 호환:
            프로젝트 상대 경로를 자동 판별한다.
        */
        eventRange.sourceType =
            "project-file";

    } else {

        eventRange.sourceType =
            "url";

    }

    const volume =
        Number(data.volume);

    eventRange.volume =
        Number.isFinite(volume)
            ? Math.min(
                1,
                Math.max(0, volume)
            )
            : 0.5;

    eventRange.loop =
        data.loop !== false;

    /*
        배경 레이어 설정 복원
    */
    eventRange.backgroundColor =
        String(
            data.backgroundColor ||
            "#eeeeee"
        );

    const imageOpacity =
        Number(data.imageOpacity);

    eventRange.imageOpacity =
        Number.isFinite(imageOpacity)
            ? Math.min(
                1,
                Math.max(
                    0,
                    imageOpacity
                )
            )
            : 1;

    const darkness =
        Number(data.darkness);

    eventRange.darkness =
        Number.isFinite(darkness)
            ? Math.min(
                1,
                Math.max(
                    0,
                    darkness
                )
            )
            : 0;

    const fadeDuration =
        Number(data.fadeDuration);

    eventRange.fadeDuration =
        Number.isFinite(fadeDuration)
            ? Math.max(
                0,
                fadeDuration
            )
            : 0.5;

    /*
        이전 데이터와의 호환을 위해 유지
    */
    eventRange.fadeIn =
        Number(data.fadeIn) || 0;

    eventRange.fadeOut =
        Number(data.fadeOut) || 0;

    return eventRange;

}

// =========================================
// 선택 상태 초기화
// =========================================

function resetEditorSelection() {

    selectedChatId = null;
    selectedChapterId = null;
    selectedSpeakerId = null;
    selectedMessageId = null;

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

}

// =========================================
// 전체 화면 갱신
// =========================================

function renderEntireProject() {

    renderChatList();
    renderChapterList();
    renderSpeakerList();
    updateSpeakerSelect();
    renderPreview();

    currentChapterTitle.textContent = "";

    if (project.chats.length === 0) {
        return;
    }

    const firstChat =
        project.chats[0];

    selectChatRoom(firstChat.id);

}

// =========================================
// 날짜 처리
// =========================================

function restoreDate(value) {

    const date =
        new Date(value);

    if (
        Number.isNaN(date.getTime())
    ) {
        return new Date();
    }

    return date;

}

function dateToISOString(value) {

    const date =
        new Date(value);

    if (
        Number.isNaN(date.getTime())
    ) {
        return new Date().toISOString();
    }

    return date.toISOString();

}

// =========================================
// 파일명 정리
// =========================================

function sanitizeFilename(value) {

    const filename =
        String(value)
            .trim()
            .replace(
                /[\\/:*?"<>|]/g,
                "_"
            );

    return filename || "새 프로젝트";

}

// =========================================
// 상태바 표시
// =========================================

function setStorageStatus(message) {

    if (!statusBar) {
        return;
    }

    statusBar.textContent = message;

}


// =========================================
// 프로젝트 폴더 파일 목록 읽기
// =========================================

async function listProjectFiles(
    folderName,
    allowedExtensions = []
) {

    if (!currentProjectDirectoryHandle) {
        throw new Error(
            "먼저 프로젝트를 저장하거나 프로젝트 폴더를 열어주세요."
        );
    }

    const directoryHandle =
        await currentProjectDirectoryHandle
            .getDirectoryHandle(
                folderName,
                {
                    create: true
                }
            );

    const files = [];

    for await (
        const entry of directoryHandle.values()
    ) {

        if (entry.kind !== "file") {
            continue;
        }

        const extension =
            getFileExtension(entry.name);

        if (
            allowedExtensions.length > 0 &&
            !allowedExtensions.includes(extension)
        ) {
            continue;
        }

        files.push({
            name: entry.name,
            path: `${folderName}/${entry.name}`
        });

    }

    files.sort(
        (a, b) =>
            a.name.localeCompare(
                b.name,
                "ko",
                {
                    numeric: true
                }
            )
    );

    return files;

}

// =========================================
// 프로젝트 리소스 파일 읽기
// =========================================

async function getProjectResourceFile(
    relativePath
) {

    if (!currentProjectDirectoryHandle) {
        throw new Error(
            "프로젝트 폴더가 연결되어 있지 않습니다."
        );
    }

    const normalizedPath =
        String(relativePath)
            .replace(/\\/g, "/")
            .replace(/^\/+/, "");

    const parts =
        normalizedPath
            .split("/")
            .filter(Boolean);

    if (parts.length < 2) {
        throw new Error(
            "프로젝트 리소스 경로가 올바르지 않습니다."
        );
    }

    const filename =
        parts.pop();

    let directoryHandle =
        currentProjectDirectoryHandle;

    for (const folderName of parts) {

        directoryHandle =
            await directoryHandle
                .getDirectoryHandle(
                    folderName
                );

    }

    const fileHandle =
        await directoryHandle
            .getFileHandle(filename);

    return fileHandle.getFile();

}

// =========================================
// 파일 확장자 가져오기
// =========================================

function getFileExtension(filename) {

    const match =
        String(filename)
            .toLowerCase()
            .match(/\.([^.]+)$/);

    return match
        ? `.${match[1]}`
        : "";

}