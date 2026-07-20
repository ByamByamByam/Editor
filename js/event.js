// =========================================
// Event Range Manager
// =========================================

// ---------- DOM ----------

const backgroundAddBtn =
    document.getElementById(
        "backgroundAddBtn"
    );

const backgroundDeleteBtn =
    document.getElementById("backgroundDeleteBtn");

const eventPreviewArea =
    document.getElementById("previewArea");

const eventGuideToggleBtn =
    document.getElementById("eventGuideToggleBtn");

    const bgmAddBtn =
    document.getElementById(
        "bgmAddBtn"
    );

const bgmDeleteBtn =
    document.getElementById("bgmDeleteBtn");

const previewBgmPlayer =
    document.getElementById("previewBgmPlayer");

const backgroundSourceInput =
    document.getElementById(
        "backgroundSourceInput"
    );

const backgroundFileInput =
    document.getElementById(
        "backgroundFileInput"
    );


const chapterBackgroundColorInput =
    document.getElementById(
        "chapterBackgroundColorInput"
    );
    

const backgroundOpacityInput =
    document.getElementById(
        "backgroundOpacityInput"
    );

const backgroundOpacityOutput =
    document.getElementById(
        "backgroundOpacityOutput"
    );

const backgroundDarknessInput =
    document.getElementById(
        "backgroundDarknessInput"
    );

const backgroundDarknessOutput =
    document.getElementById(
        "backgroundDarknessOutput"
    );

const backgroundFadeInput =
    document.getElementById(
        "backgroundFadeInput"
    );

const backgroundFadeOutput =
    document.getElementById(
        "backgroundFadeOutput"
    );

const previewColorLayer =
    document.getElementById(
        "previewColorLayer"
    );

const previewImageLayer =
    document.getElementById(
        "previewImageLayer"
    );

const previewDarknessLayer =
    document.getElementById(
        "previewDarknessLayer"
    );

const soundAddBtn =
    document.getElementById("soundAddBtn");

const soundDeleteBtn =
    document.getElementById("soundDeleteBtn");

const previewSoundPlayer =
    document.getElementById(
        "previewSoundPlayer"
    );

const bgmSourceInput =
document.getElementById("bgmSourceInput");

const bgmVolumeInput =
    document.getElementById("bgmVolumeInput");

const soundSourceInput =
    document.getElementById("soundSourceInput");

const soundVolumeInput =
    document.getElementById("soundVolumeInput");

const bgmDelayInputs =
    document.querySelectorAll(
        'input[name="bgmDelay"]'
    );

const soundDelayInputs =
    document.querySelectorAll(
        'input[name="soundDelay"]'
    );

const backgroundProjectFileSelect =
    document.getElementById(
        "backgroundProjectFileSelect"
    );

const backgroundProjectFileList =
    document.getElementById(
        "backgroundProjectFileList"
    );

const refreshBackgroundFilesBtn =
    document.getElementById(
        "refreshBackgroundFilesBtn"
    );

const bgmProjectFileSelect =
    document.getElementById(
        "bgmProjectFileSelect"
    );

const refreshBgmFilesBtn =
    document.getElementById(
        "refreshBgmFilesBtn"
    );

const soundProjectFileSelect =
    document.getElementById(
        "soundProjectFileSelect"
    );

const refreshSoundFilesBtn =
    document.getElementById(
        "refreshSoundFilesBtn"
    );
    

    const backgroundApplyBtn =
    document.getElementById(
        "backgroundApplyBtn"
    );

const bgmApplyBtn =
    document.getElementById(
        "bgmApplyBtn"
    );

const soundApplyBtn =
    document.getElementById(
        "soundApplyBtn"
    );

// ---------- 구간 지정 상태 ----------


let eventScrollFrame = null;

let isEventGuideVisible = false;

let activeBgmEventId = null;

let activeBgmSourceKey = "";

let pendingBgmTimer = null;
let pendingBgmEventId = null;
let bgmFadeToken = 0;
let isBgmFadingOut = false;

let pendingSoundTimer = null;
let pendingSoundEventId = null;

let lastActiveSoundMessageId = null;

const playedSoundEventIds =
    new Set();

let backgroundTransitionToken = 0;

let activeBackgroundEventId = null;

let activeBackgroundSourceKey = null;

let activeBackgroundFadeDuration = 0;

let selectedEventRangeId = null;


const projectResourceUrlCache =
    new Map();

// =========================================
// 초기화
// =========================================

function initializeEventRanges() {


    addSafeClickListener(
    backgroundApplyBtn,
    applySelectedBackgroundChanges,
    "backgroundApplyBtn"
    );

    addSafeClickListener(
        bgmApplyBtn,
        applySelectedBgmChanges,
        "bgmApplyBtn"
    );

    addSafeClickListener(
        soundApplyBtn,
        applySelectedSoundChanges,
        "soundApplyBtn"
    );

    addSafeClickListener(
        backgroundDeleteBtn,
        deleteBackgroundRangeAtSelectedMessage,
        "backgroundDeleteBtn"
    );

    addSafeClickListener(
        eventGuideToggleBtn,
        toggleEventGuide,
        "eventGuideToggleBtn"
    );



    addSafeClickListener(
        bgmDeleteBtn,
        deleteBgmRangeAtSelectedMessage,
        "bgmDeleteBtn"
    );

    addSafeClickListener(
        soundAddBtn,
        addSoundEventToSelectedMessage,
        "soundAddBtn"
    );

    addSafeClickListener(
        backgroundAddBtn,
        addBackgroundToSelectedRange,
        "backgroundAddBtn"
    );

    addSafeClickListener(
        bgmAddBtn,
        addBgmToSelectedRange,
        "bgmAddBtn"
    );

    addSafeClickListener(
        soundDeleteBtn,
        deleteSoundEventAtSelectedMessage,
        "soundDeleteBtn"
    );

    addSafeClickListener(
    refreshBackgroundFilesBtn,
    refreshBackgroundProjectFiles,
    "refreshBackgroundFilesBtn"
    );

    addSafeClickListener(
        refreshBgmFilesBtn,
        refreshBgmProjectFiles,
        "refreshBgmFilesBtn"
    );

    addSafeClickListener(
        refreshSoundFilesBtn,
        refreshSoundProjectFiles,
        "refreshSoundFilesBtn"
    );

    if (eventPreviewArea) {

        eventPreviewArea.addEventListener(
            "scroll",
            requestPreviewMediaUpdate
        );

        eventPreviewArea.addEventListener(
            "click",
            event => {

                if (
                    !isEventGuideVisible ||
                    event.target.closest(
                        ".eventRailLabel"
                    )
                ) {
                    return;
                }

                if (selectedEventRangeId) {
                    clearSelectedEventRange();
                }

            }
        );

    } else {

        console.warn(
            "연출 초기화 누락: previewArea"
        );

    }

    backgroundOpacityInput?.addEventListener(
    "input",
        updateBackgroundSettingOutputs
    );

    backgroundDarknessInput?.addEventListener(
        "input",
        updateBackgroundSettingOutputs
    );

    backgroundFadeInput?.addEventListener(
        "input",
        updateBackgroundSettingOutputs
    );

    chapterBackgroundColorInput
    ?.addEventListener(
        "input",
        updateChapterBackgroundColor
    );

    updateBackgroundSettingOutputs();

    syncChapterBackgroundColorInput();

    disableAllEventApplyButtons();

    setNewEventButtonsEnabled(
        true
    );


    console.log(
        "Event Range Manager Ready"
    );

}

function updateBackgroundSettingOutputs() {

    if (backgroundOpacityOutput) {
        backgroundOpacityOutput.value =
            `${backgroundOpacityInput.value}%`;
    }

    if (backgroundDarknessOutput) {
        backgroundDarknessOutput.value =
            `${backgroundDarknessInput.value}%`;
    }

    if (backgroundFadeOutput) {
        backgroundFadeOutput.value =
            `${backgroundFadeInput.value}초`;
    }

}

// =========================================
// 챕터 기본 배경색 입력 동기화
// =========================================

function syncChapterBackgroundColorInput() {

    if (!chapterBackgroundColorInput) {
        return;
    }

    const chapter =
        getSelectedChapter();

    chapterBackgroundColorInput.disabled =
        !chapter;

    chapterBackgroundColorInput.value =
        chapter?.backgroundColor ||
        "#eeeeee";

}


// =========================================
// 챕터 기본 배경색 변경
// =========================================

function updateChapterBackgroundColor() {

    const chapter =
        getSelectedChapter();

    if (!chapter) {
        return;
    }

    chapter.backgroundColor =
        chapterBackgroundColorInput.value ||
        "#eeeeee";

    applyChapterBackgroundColor();

    setStorageStatus(
        "챕터 기본 배경색을 변경했습니다."
    );

}


// =========================================
// 챕터 기본 배경색 적용
// =========================================

function applyChapterBackgroundColor() {

    if (!previewColorLayer) {
        return;
    }

    const chapter =
        getSelectedChapter();

    previewColorLayer.style.backgroundColor =
        chapter?.backgroundColor ||
        "#eeeeee";

}

// =========================================
// 안전한 클릭 이벤트 연결
// =========================================

function addSafeClickListener(
    element,
    handler,
    elementName
) {

    if (!element) {

        console.warn(
            `연출 초기화 누락: ${elementName}`
        );

        return;

    }

    element.addEventListener(
        "click",
        handler
    );

}


// =========================================
// 프로젝트 이미지 목록 새로고침
// =========================================

async function refreshBackgroundProjectFiles() {

    if (
        !refreshBackgroundFilesBtn ||
        refreshBackgroundFilesBtn.disabled
    ) {
        return;
    }

    refreshBackgroundFilesBtn.disabled =
        true;


    try {

        const files =
            await listProjectFiles(
                "images",
                [
                    ".png",
                    ".jpg",
                    ".jpeg",
                    ".gif",
                    ".webp",
                    ".bmp"
                ]
            );

        await renderBackgroundThumbnailList(
            files
        );

        setStorageStatus(
            `이미지 ${files.length}개를 불러왔습니다.`
        );

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "이미지 목록을 불러오지 못했습니다."
        );

    } finally {

    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                1000
            )
    );

    refreshBackgroundFilesBtn.disabled =
        false;

    isBackgroundRefreshRunning =
        false;

}
}


// ---------------------------------------------

async function renderBackgroundThumbnailList(
    files
) {

    if (!backgroundProjectFileList) {
        return;
    }

    const previousValue =
        backgroundProjectFileSelect.value;

    /*
        목록이 로딩 도중 갑자기 작아지지 않도록
        현재 높이를 임시로 유지한다.
    */
    const previousHeight =
        backgroundProjectFileList
            .getBoundingClientRect()
            .height;

    if (previousHeight > 0) {

        backgroundProjectFileList
            .style.minHeight =
                `${previousHeight}px`;

    }

    /*
        기존 썸네일을 먼저 제거한다.

        이전 목록과 새 목록이 동시에 존재하지 않으므로
        이미지 메모리와 디코딩 부하가 중복되지 않는다.
    */
    backgroundProjectFileList
        .replaceChildren();

    if (files.length === 0) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "resourceListEmpty";

        empty.textContent =
            "images 폴더에 이미지가 없습니다.";

        backgroundProjectFileList
            .appendChild(
                empty
            );

        backgroundProjectFileSelect.value =
            "";

        backgroundProjectFileList
            .style.minHeight =
                "";

        return;

    }

    for (const fileInfo of files) {

        const button =
            document.createElement(
                "button"
            );

        button.type =
            "button";

        button.className =
            "backgroundThumbnailItem";

        button.dataset.path =
            fileInfo.path;

        const image =
            document.createElement(
                "img"
            );

        image.className =
            "backgroundThumbnailImage";

        image.alt =
            fileInfo.name;

        image.loading =
            "lazy";

        const name =
            document.createElement(
                "div"
            );

        name.className =
            "backgroundThumbnailName";

        name.textContent =
            fileInfo.name;

        button.append(
            image,
            name
        );

        button.addEventListener(
            "click",
            () => {

                selectBackgroundThumbnail(
                    fileInfo.path,
                    button
                );

            }
        );

        /*
            먼저 카드 자리를 추가한다.
            이미지가 준비되는 동안에도
            목록 구조가 순서대로 유지된다.
        */
        backgroundProjectFileList
            .appendChild(
                button
            );

        try {

            const file =
                await getProjectResourceFile(
                    fileInfo.path
                );

            const objectUrl =
                URL.createObjectURL(
                    file
                );

            image.addEventListener(
                "load",
                () => {

                    URL.revokeObjectURL(
                        objectUrl
                    );

                },
                {
                    once: true
                }
            );

            image.addEventListener(
                "error",
                () => {

                    URL.revokeObjectURL(
                        objectUrl
                    );

                },
                {
                    once: true
                }
            );

            image.src =
                objectUrl;

        } catch (error) {

            console.warn(
                `${fileInfo.name} 썸네일을 불러오지 못했습니다.`,
                error
            );

        }

        if (
            fileInfo.path ===
            previousValue
        ) {

            selectBackgroundThumbnail(
                fileInfo.path,
                button
            );

        }

    }

    /*
        목록 생성이 끝났으므로
        임시 높이 제한을 해제한다.
    */
    backgroundProjectFileList
        .style.minHeight =
            "";

}

// =========================================
// 배경 썸네일 선택
// =========================================

function selectBackgroundThumbnail(
    path,
    selectedButton
) {

    backgroundProjectFileSelect.value =
        path;

    document
        .querySelectorAll(
            "#backgroundProjectFileList " +
            ".backgroundThumbnailItem"
        )
        .forEach(button => {

            button.classList.toggle(
                "selected",
                button === selectedButton
            );

        });

}

function clearBackgroundProjectSelection() {

    backgroundProjectFileSelect.value = "";

    document
        .querySelectorAll(
            "#backgroundProjectFileList " +
            ".backgroundThumbnailItem"
        )
        .forEach(button => {

            button.classList.remove(
                "selected"
            );

        });

}

// =========================================
// 프로젝트 BGM 목록 새로고침
// =========================================

async function refreshBgmProjectFiles() {

    try {

        const files =
            await listProjectFiles(
                "bgm",
                [
                    ".mp3",
                    ".ogg",
                    ".wav",
                    ".m4a",
                    ".aac",
                    ".flac"
                ]
            );

        fillProjectFileSelect(
            bgmProjectFileSelect,
            files,
            "bgm 폴더에서 선택"
        );

        setStorageStatus(
            `BGM ${files.length}개를 불러왔습니다.`
        );

    } catch (error) {

        console.error(error);
        alert(error.message);

    }

}

// =========================================
// 프로젝트 효과음 목록 새로고침
// =========================================

async function refreshSoundProjectFiles() {

    try {

        const files =
            await listProjectFiles(
                "se",
                [
                    ".mp3",
                    ".ogg",
                    ".wav",
                    ".m4a",
                    ".aac",
                    ".flac"
                ]
            );

        fillProjectFileSelect(
            soundProjectFileSelect,
            files,
            "se 폴더에서 선택"
        );

        setStorageStatus(
            `효과음 ${files.length}개를 불러왔습니다.`
        );

    } catch (error) {

        console.error(error);
        alert(error.message);

    }

}

// =========================================
// 파일 목록 select 출력
// =========================================

function fillProjectFileSelect(
    selectElement,
    files,
    placeholder
) {

    if (!selectElement) {
        return;
    }

    const previousValue =
        selectElement.value;

    selectElement.replaceChildren();

    const defaultOption =
        document.createElement("option");

    defaultOption.value = "";
    defaultOption.textContent = placeholder;

    selectElement.appendChild(
        defaultOption
    );

    files.forEach(fileInfo => {

        const option =
            document.createElement("option");

        option.value =
            fileInfo.path;

        option.textContent =
            fileInfo.name;

        selectElement.appendChild(option);

    });

    if (
        Array.from(selectElement.options)
            .some(
                option =>
                    option.value ===
                    previousValue
            )
    ) {
        selectElement.value =
            previousValue;
    }

}

// =========================================
// 연출 편집 표시 토글
// =========================================

function toggleEventGuide() {

    isEventGuideVisible =
        !isEventGuideVisible;

    /*
        편집 모드는 연출 UI 표시만 전환한다.
        메시지 선택과 채팅 편집 상태는 그대로 유지한다.
    */

    eventGuideToggleBtn.setAttribute(
        "aria-pressed",
        String(isEventGuideVisible)
    );

    eventGuideToggleBtn.textContent =
        isEventGuideVisible
            ? "편집 모드"
            : "편집 모드";

    eventGuideToggleBtn.classList.toggle(
        "active",
        isEventGuideVisible
    );

    document.body.classList.toggle(
        "eventGuideMode",
        isEventGuideVisible
    );

    renderEventRanges();

}


// =========================================
// 선택 메시지/구간에 배경 적용
// =========================================

async function addBackgroundToSelectedRange() {

    if (!isEventGuideVisible) {

        alert(
            "먼저 연출 편집을 켜주세요."
        );

        return;

    }

    const chapter =
        getSelectedChapter();

    if (!chapter) {

        alert(
            "먼저 챕터를 선택해주세요."
        );

        return;

    }

    const range =
        typeof getSelectedMessageRangeBounds ===
        "function"
            ? getSelectedMessageRangeBounds()
            : null;

    if (!range) {

        alert(
            "배경을 적용할 메시지 또는 구간을 선택해주세요."
        );

        return;

    }

    const projectSource =
        backgroundProjectFileSelect.value;

    const urlSource =
        backgroundSourceInput
            ?.value
            ?.trim() ||
        "";

    if (
        !projectSource &&
        !urlSource
    ) {

        alert(
            "배경 이미지 URL을 입력하거나 프로젝트 이미지 목록에서 배경을 선택해주세요."
        );

        return;

    }

    if (
        urlSource &&
        !/^https?:\/\//i.test(
            urlSource
        )
    ) {

        alert(
            "올바른 http 또는 https 배경 이미지 URL을 입력해주세요."
        );

        return;

    }

    const eventRange =
        new EventRange();

    eventRange.type =
        "background";

    eventRange.startMessageId =
        range.startMessageId;

    eventRange.endMessageId =
        range.endMessageId;


    eventRange.imageOpacity =
        Number(
            backgroundOpacityInput.value
        ) / 100;

    eventRange.darkness =
        Number(
            backgroundDarknessInput.value
        ) / 100;

    eventRange.fadeDuration =
        Number(
            backgroundFadeInput.value
        );

    eventRange.sourceType =
        projectSource
            ? "project-file"
            : "url";

    eventRange.source =
        projectSource ||
        urlSource;

    normalizeOverlappingEventRanges(
        chapter,
        "background",
        eventRange.startMessageId,
        eventRange.endMessageId
    );

    chapter.events.push(
        eventRange
    );

    clearBackgroundProjectSelection();

    if (backgroundSourceInput) {
        backgroundSourceInput.value = "";
    }

    clearSelectedMessageRange(
        false
    );

    renderPreview();

    setStorageStatus(
        range.messageCount === 1
            ? "선택한 메시지에 배경을 적용했습니다."
            : `선택한 ${range.messageCount}개 메시지 구간에 배경을 적용했습니다.`
    );

}


// =========================================
// 이미지 파일 임베드
// =========================================

function readImageFileAsDataUrl(file) {

    return new Promise(
        (resolve, reject) => {

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                reject(
                    new Error(
                        "이미지 파일이 아닙니다."
                    )
                );

                return;

            }

            const reader =
                new FileReader();

            reader.addEventListener(
                "load",
                () => {

                    resolve(
                        String(reader.result)
                    );

                }
            );

            reader.addEventListener(
                "error",
                () => {

                    reject(
                        reader.error ||
                        new Error(
                            "파일 읽기 오류"
                        )
                    );

                }
            );

            reader.readAsDataURL(file);

        }
    );

}



// =========================================
// 선택한 배경 구간 삭제
// =========================================

function deleteBackgroundRangeAtSelectedMessage() {

    const chapter =
        getSelectedChapter();

    if (!chapter) {

        alert(
            "먼저 챕터를 선택해주세요."
        );

        return;

    }

    let rangeIndex = -1;

    /*
        1순위:
        연출 라벨을 직접 선택한 경우
    */
    if (selectedEventRangeId) {

        rangeIndex =
            chapter.events.findIndex(
                eventRange =>
                    eventRange.id ===
                        selectedEventRangeId &&
                    eventRange.type ===
                        "background"
            );

    }

    /*
        2순위:
        메시지 하나 또는 구간을 선택한 경우

        연출 편집 모드에서는 selectedMessageId가 아니라
        getSelectedMessageRangeBounds()가 선택 상태를 가진다.
    */
    if (rangeIndex === -1) {

        const selectedRange =
            typeof getSelectedMessageRangeBounds ===
                "function"
                ? getSelectedMessageRangeBounds()
                : null;

        if (selectedRange) {

            const selectedIndex =
                findMessageIndex(
                    chapter,
                    selectedRange.startMessageId
                );

            if (selectedIndex !== -1) {

                rangeIndex =
                    findBackgroundRangeIndexAtMessage(
                        chapter,
                        selectedIndex
                    );

            }

        }

    }

    /*
        이전 일반 메시지 선택 방식도
        호환용으로 남긴다.
    */
    if (
        rangeIndex === -1 &&
        selectedMessageId
    ) {

        const selectedIndex =
            findMessageIndex(
                chapter,
                selectedMessageId
            );

        if (selectedIndex !== -1) {

            rangeIndex =
                findBackgroundRangeIndexAtMessage(
                    chapter,
                    selectedIndex
                );

        }

    }

    if (rangeIndex === -1) {

        alert(
            "삭제할 배경 라벨이나 배경 구간 안의 메시지를 선택해주세요."
        );

        return;

    }

    const eventRange =
        chapter.events[rangeIndex];

    if (
        !eventRange ||
        eventRange.type !== "background"
    ) {

        alert(
            "선택한 배경 구간을 찾을 수 없습니다."
        );

        return;

    }

    const confirmed =
        confirm(
            "선택한 배경 구간을 삭제하시겠습니까?"
        );

    if (!confirmed) {
        return;
    }

    chapter.events.splice(
        rangeIndex,
        1
    );

    /*
        삭제한 라벨 선택과 메시지 구간 선택을 정리한다.
    */
    selectedEventRangeId =
        null;

    disableAllEventApplyButtons();

    if (
        typeof setNewEventButtonsEnabled ===
        "function"
    ) {
        setNewEventButtonsEnabled(
            true
        );
    }

    if (
        typeof clearSelectedMessageRange ===
        "function"
    ) {
        clearSelectedMessageRange(
            false
        );
    }

    renderPreview();

    setStorageStatus(
        "배경 구간을 삭제했습니다."
    );

}

// =========================================
// 재생 대기 설정
// =========================================

function getSelectedDelaySeconds(
    inputName
) {

    const value =
        document.querySelector(
            `input[name="${inputName}"]:checked`
        )?.value;

    const seconds = Number(value);

    return [0, 1, 2].includes(seconds)
        ? seconds
        : 0;

}

function setSelectedDelaySeconds(
    inputName,
    value
) {

    const normalized =
        [0, 1, 2].includes(Number(value))
            ? Number(value)
            : 0;

    document
        .querySelectorAll(
            `input[name="${inputName}"]`
        )
        .forEach(input => {
            input.checked =
                Number(input.value) ===
                normalized;
        });

}

function moveSelectedEventRangeIfNeeded(
    eventRange,
    { singleMessage = false } = {}
) {

    const range =
        typeof getSelectedMessageRangeBounds ===
            "function"
            ? getSelectedMessageRangeBounds()
            : null;

    if (!range) {
        return true;
    }

    if (
        singleMessage &&
        range.messageCount !== 1
    ) {
        alert(
            "효과음은 메시지 하나에만 적용할 수 있습니다."
        );
        return false;
    }

    eventRange.startMessageId =
        range.startMessageId;

    eventRange.endMessageId =
        singleMessage
            ? range.startMessageId
            : range.endMessageId;

    return true;

}

// =========================================
// 선택 메시지/구간에 BGM 적용
// =========================================

function addBgmToSelectedRange() {

    if (!isEventGuideVisible) {

        alert(
            "먼저 연출 편집을 켜주세요."
        );

        return;

    }

    const chapter =
        getSelectedChapter();

    if (!chapter) {

        alert(
            "먼저 챕터를 선택해주세요."
        );

        return;

    }

    const range =
        typeof getSelectedMessageRangeBounds ===
        "function"
            ? getSelectedMessageRangeBounds()
            : null;

    if (!range) {

        alert(
            "BGM을 적용할 메시지 또는 구간을 선택해주세요."
        );

        return;

    }

    const projectSource =
        bgmProjectFileSelect.value;

    const urlSource =
        bgmSourceInput.value.trim();

    if (
        !projectSource &&
        !urlSource
    ) {

        alert(
            "프로젝트 BGM 또는 BGM 주소를 선택해주세요."
        );

        return;

    }

    if (urlSource && isUnsupportedSoundCloudShortUrl(urlSource)) {
        alert(
            "on.soundcloud.com 단축 링크는 직접 재생할 수 없습니다.\n" +
            "브라우저에서 링크를 연 뒤 주소창의 최종 soundcloud.com/아티스트/트랙 주소를 입력해주세요."
        );
        return;
    }

    if (
        urlSource &&
        !isSupportedExternalMediaUrl(
            urlSource
        )
    ) {
        alert(
            "BGM 주소는 YouTube 또는 SoundCloud의 원본 트랙 링크만 사용할 수 있습니다."
        );
        return;
    }

    const volumeNumber =
        Number(
            bgmVolumeInput.value
        );

    if (
        !Number.isFinite(
            volumeNumber
        ) ||
        volumeNumber < 0 ||
        volumeNumber > 100
    ) {

        alert(
            "볼륨은 0부터 100 사이로 입력해주세요."
        );

        return;

    }

    const eventRange =
        new EventRange();

    eventRange.type =
        "bgm";

    eventRange.startMessageId =
        range.startMessageId;

    eventRange.endMessageId =
        range.endMessageId;

    eventRange.source =
        projectSource ||
        urlSource;

    eventRange.sourceType =
        projectSource
            ? "project-file"
            : "url";

    eventRange.volume =
        volumeNumber / 100;

    eventRange.loop =
        true;

    eventRange.delay =
        getSelectedDelaySeconds(
            "bgmDelay"
        );

    normalizeOverlappingEventRanges(
        chapter,
        "bgm",
        eventRange.startMessageId,
        eventRange.endMessageId
    );

    chapter.events.push(
        eventRange
    );

    bgmSourceInput.value = "";
    bgmProjectFileSelect.value = "";
    setSelectedDelaySeconds(
        "bgmDelay",
        0
    );

    clearSelectedMessageRange(
        false
    );

    renderPreview();

    setStorageStatus(
        range.messageCount === 1
            ? "선택한 메시지에 BGM을 적용했습니다."
            : `선택한 ${range.messageCount}개 메시지 구간에 BGM을 적용했습니다.`
    );

}


// =========================================
// 선택한 BGM 구간 삭제
// =========================================

function deleteBgmRangeAtSelectedMessage() {

    const chapter =
        getSelectedChapter();

    if (!chapter) {

        alert(
            "먼저 챕터를 선택해주세요."
        );

        return;

    }

    let rangeIndex = -1;

    /*
        1순위:
        BGM 라벨을 직접 선택한 경우
    */
    if (selectedEventRangeId) {

        rangeIndex =
            chapter.events.findIndex(
                eventRange =>
                    eventRange.id ===
                        selectedEventRangeId &&
                    eventRange.type ===
                        "bgm"
            );

    }

    /*
        2순위:
        연출 편집 모드에서
        메시지 하나 또는 구간을 선택한 경우
    */
    if (rangeIndex === -1) {

        const selectedRange =
            typeof getSelectedMessageRangeBounds ===
                "function"
                ? getSelectedMessageRangeBounds()
                : null;

        if (selectedRange) {

            const selectedIndex =
                findMessageIndex(
                    chapter,
                    selectedRange.startMessageId
                );

            if (selectedIndex !== -1) {

                rangeIndex =
                    findEventRangeIndexAtMessage(
                        chapter,
                        selectedIndex,
                        "bgm"
                    );

            }

        }

    }

    /*
        일반 메시지 선택 방식 호환
    */
    if (
        rangeIndex === -1 &&
        selectedMessageId
    ) {

        const selectedIndex =
            findMessageIndex(
                chapter,
                selectedMessageId
            );

        if (selectedIndex !== -1) {

            rangeIndex =
                findEventRangeIndexAtMessage(
                    chapter,
                    selectedIndex,
                    "bgm"
                );

        }

    }

    if (rangeIndex === -1) {

        alert(
            "삭제할 BGM 라벨이나 BGM 구간 안의 메시지를 선택해주세요."
        );

        return;

    }

    const eventRange =
        chapter.events[rangeIndex];

    if (
        !eventRange ||
        eventRange.type !== "bgm"
    ) {

        alert(
            "선택한 BGM 구간을 찾을 수 없습니다."
        );

        return;

    }

    const confirmed =
        confirm(
            "선택한 BGM 구간을 삭제하시겠습니까?"
        );

    if (!confirmed) {
        return;
    }

    chapter.events.splice(
        rangeIndex,
        1
    );

    selectedEventRangeId =
        null;

    disableAllEventApplyButtons();

    if (
        typeof setNewEventButtonsEnabled ===
        "function"
    ) {
        setNewEventButtonsEnabled(
            true
        );
    }

    if (
        typeof clearSelectedMessageRange ===
        "function"
    ) {
        clearSelectedMessageRange(
            false
        );
    }

    stopPreviewBgm();

    renderPreview();

    setStorageStatus(
        "BGM 구간을 삭제했습니다."
    );

}



// =========================================
// 선택 메시지에 효과음 추가
// =========================================

async function addSoundEventToSelectedMessage() {

    const chapter =
        getSelectedChapter();

    if (!chapter) {
        alert("먼저 챕터를 선택해주세요.");
        return;
    }

    if (!isEventGuideVisible) {

    alert(
        "먼저 연출 편집을 켜주세요."
    );

    return;

}

const range =
    typeof getSelectedMessageRangeBounds ===
    "function"
        ? getSelectedMessageRangeBounds()
        : null;

if (!range) {

    alert(
        "효과음을 넣을 메시지를 선택해주세요."
    );

    return;

}

if (range.messageCount !== 1) {

    alert(
        "효과음은 메시지 하나에만 적용할 수 있습니다."
    );

    return;

}

const targetMessageId =
    range.startMessageId;

    const projectSource =
        soundProjectFileSelect.value;

    const urlSource =
        soundSourceInput.value.trim();

    if (!projectSource && !urlSource) {
        alert(
            "프로젝트 효과음을 선택하거나 효과음 주소를 입력해주세요."
        );
        return;
    }

    if (
        urlSource &&
        !isSupportedExternalMediaUrl(
            urlSource
        )
    ) {
        alert(
            "효과음 주소는 YouTube 또는 SoundCloud 링크만 사용할 수 있습니다."
        );
        return;
    }

    const volumeNumber =
        Number(soundVolumeInput.value);

    if (
        !Number.isFinite(volumeNumber) ||
        volumeNumber < 0 ||
        volumeNumber > 100
    ) {
        alert(
            "볼륨은 0부터 100 사이로 입력해주세요."
        );
        return;
    }

    const soundEvent =
        new EventRange();

    soundEvent.type = "sound";

    soundEvent.startMessageId =
    targetMessageId;

    soundEvent.endMessageId =
        targetMessageId;

    soundEvent.source =
        projectSource || urlSource;

    soundEvent.sourceType =
        projectSource
            ? "project-file"
            : "url";

    soundEvent.volume =
        volumeNumber / 100;

    soundEvent.loop = false;

    soundEvent.delay =
        getSelectedDelaySeconds(
            "soundDelay"
        );

    chapter.events.push(soundEvent);
    clearSelectedMessageRange(
        false
    );

    soundSourceInput.value = "";
    soundProjectFileSelect.value = "";
    soundVolumeInput.value = "70";
    setSelectedDelaySeconds(
        "soundDelay",
        0
    );

    renderEventRanges();

    setStorageStatus(
        "효과음을 등록했습니다."
    );

}

// =========================================
// 선택한 효과음 삭제
// =========================================

function deleteSoundEventAtSelectedMessage() {

    const chapter =
        getSelectedChapter();

    if (!chapter) {

        alert(
            "먼저 챕터를 선택해주세요."
        );

        return;

    }

    let targetEventId = null;
    let targetMessageId = null;

    /*
        1순위:
        효과음 라벨을 직접 선택한 경우

        라벨 선택은 특정 효과음 하나를 가리키므로
        해당 효과음 하나만 삭제한다.
    */
    if (selectedEventRangeId) {

        const selectedEvent =
            chapter.events.find(
                eventRange =>
                    eventRange.id ===
                        selectedEventRangeId &&
                    eventRange.type ===
                        "sound"
            );

        if (selectedEvent) {

            targetEventId =
                selectedEvent.id;

            targetMessageId =
                selectedEvent.startMessageId;

        }

    }

    /*
        2순위:
        메시지 하나를 선택한 경우
    */
    if (!targetEventId) {

        const selectedRange =
            typeof getSelectedMessageRangeBounds ===
                "function"
                ? getSelectedMessageRangeBounds()
                : null;

        if (selectedRange) {

            if (
                selectedRange.messageCount !== 1
            ) {

                alert(
                    "효과음을 삭제할 메시지 하나만 선택해주세요."
                );

                return;

            }

            targetMessageId =
                selectedRange.startMessageId;

        }

    }

    /*
        일반 메시지 선택 방식 호환
    */
    if (
        !targetEventId &&
        !targetMessageId &&
        selectedMessageId
    ) {

        targetMessageId =
            selectedMessageId;

    }

    if (
        !targetEventId &&
        !targetMessageId
    ) {

        alert(
            "삭제할 효과음 라벨이나 효과음이 등록된 메시지를 선택해주세요."
        );

        return;

    }

    let soundIndexes = [];

    /*
        라벨을 선택했다면
        특정 효과음 하나만 삭제
    */
    if (targetEventId) {

        const index =
            chapter.events.findIndex(
                eventRange =>
                    eventRange.id ===
                        targetEventId &&
                    eventRange.type ===
                        "sound"
            );

        if (index !== -1) {
            soundIndexes = [index];
        }

    } else {

        /*
            메시지를 선택했다면
            해당 메시지의 효과음을 모두 삭제
        */
        chapter.events.forEach(
            (eventRange, index) => {

                if (
                    eventRange.type ===
                        "sound" &&
                    eventRange.startMessageId ===
                        targetMessageId
                ) {
                    soundIndexes.push(
                        index
                    );
                }

            }
        );

    }

    if (soundIndexes.length === 0) {

        alert(
            "선택한 위치에는 등록된 효과음이 없습니다."
        );

        return;

    }

    const confirmed =
        confirm(
            targetEventId
                ? "선택한 효과음을 삭제하시겠습니까?"
                : (
                    soundIndexes.length > 1
                        ? `이 메시지에 등록된 효과음 ${soundIndexes.length}개를 모두 삭제하시겠습니까?`
                        : "이 메시지의 효과음을 삭제하시겠습니까?"
                )
        );

    if (!confirmed) {
        return;
    }

    for (
        let index =
            soundIndexes.length - 1;

        index >= 0;

        index -= 1
    ) {

        chapter.events.splice(
            soundIndexes[index],
            1
        );

    }

    selectedEventRangeId =
        null;

    disableAllEventApplyButtons();

    if (
        typeof setNewEventButtonsEnabled ===
        "function"
    ) {
        setNewEventButtonsEnabled(
            true
        );
    }

    if (
        typeof clearSelectedMessageRange ===
        "function"
    ) {
        clearSelectedMessageRange(
            false
        );
    }

    resetPreviewSoundState();

    renderPreview();

    setStorageStatus(
        "효과음을 삭제했습니다."
    );

}

// =========================================
// 메시지 위치 검색
// =========================================

function findMessageIndex(
    chapter,
    messageId
) {

    return chapter.messages.findIndex(
        message => message.id === messageId
    );

}

// =========================================
// 특정 메시지의 배경 구간 검색
// =========================================

function findBackgroundRangeIndexAtMessage(
    chapter,
    messageIndex
) {

    return findEventRangeIndexAtMessage(
        chapter,
        messageIndex,
        "background"
    );

}

function findEventRangeIndexAtMessage(
    chapter,
    messageIndex,
    eventType
) {

    let foundIndex = -1;

    chapter.events.forEach(
        (eventRange, index) => {

            if (
                eventRange.type !== eventType
            ) {
                return;
            }

            const startIndex =
                findMessageIndex(
                    chapter,
                    eventRange.startMessageId
                );

            const endIndex =
                findMessageIndex(
                    chapter,
                    eventRange.endMessageId
                );

            if (
                startIndex === -1 ||
                endIndex === -1
            ) {
                return;
            }

            if (
                messageIndex >= startIndex &&
                messageIndex <= endIndex
            ) {
                foundIndex = index;
            }

        }
    );

    return foundIndex;

}

// =========================================
// 같은 종류의 연출 구간 중첩 정리
// =========================================

function normalizeOverlappingEventRanges(
    chapter,
    eventType,
    newStartMessageId,
    newEndMessageId,
    excludeEventId = null
) {

    const newStartIndex =
        findMessageIndex(
            chapter,
            newStartMessageId
        );

    const newEndIndex =
        findMessageIndex(
            chapter,
            newEndMessageId
        );

    if (
        newStartIndex === -1 ||
        newEndIndex === -1
    ) {
        return;
    }

    const normalizedEvents = [];

    chapter.events.forEach(
        eventRange => {

            if (
                eventRange.type !== eventType ||
                eventRange.id === excludeEventId
            ) {
                normalizedEvents.push(eventRange);
                return;
            }

            const oldStartIndex =
                findMessageIndex(
                    chapter,
                    eventRange.startMessageId
                );

            const oldEndIndex =
                findMessageIndex(
                    chapter,
                    eventRange.endMessageId
                );

            if (
                oldStartIndex === -1 ||
                oldEndIndex === -1
            ) {
                return;
            }

            if (
                oldEndIndex < newStartIndex ||
                oldStartIndex > newEndIndex
            ) {
                normalizedEvents.push(eventRange);
                return;
            }

            /* 새 구간 왼쪽에 남는 부분 */
            if (oldStartIndex < newStartIndex) {
                const leftRange =
                    oldEndIndex > newEndIndex
                        ? Object.assign(
                            Object.create(
                                Object.getPrototypeOf(eventRange)
                            ),
                            eventRange
                        )
                        : eventRange;

                leftRange.endMessageId =
                    chapter.messages[
                        newStartIndex - 1
                    ].id;

                normalizedEvents.push(leftRange);
            }

            /* 새 구간 오른쪽에 남는 부분 */
            if (oldEndIndex > newEndIndex) {
                const rightRange =
                    oldStartIndex < newStartIndex
                        ? Object.assign(
                            Object.create(
                                Object.getPrototypeOf(eventRange)
                            ),
                            eventRange,
                            {
                                id: createId()
                            }
                        )
                        : eventRange;

                rightRange.startMessageId =
                    chapter.messages[
                        newEndIndex + 1
                    ].id;

                normalizedEvents.push(rightRange);
            }

        }
    );

    chapter.events = normalizedEvents;

}

// =========================================
// 리소스 파일명
// =========================================

function getEventResourceName(
    eventRange
) {

    if (!eventRange?.source) {
        return "";
    }

    return String(eventRange.source)
        .split("/")
        .pop()
        .split("\\")
        .pop();

}


// =========================================
// 지정한 아코디언 열기
// =========================================

function openInspectorBody(
    bodyId
) {

    const targetBody =
        document.getElementById(
            bodyId
        );

    if (!targetBody) {
        return;
    }

    const targetSection =
        targetBody.closest(
            ".inspectorSection"
        );

    document
        .querySelectorAll(
            ".inspectorSection"
        )
        .forEach(
            section => {

                if (
                    section ===
                    targetSection
                ) {
                    return;
                }

                if (
                    typeof closeInspectorSection ===
                        "function"
                ) {
                    closeInspectorSection(
                        section
                    );
                } else {

                    section.classList.remove(
                        "open"
                    );

                    const body =
                        section.querySelector(
                            ".inspectorSectionBody"
                        );

                    if (body) {
                        body.hidden = true;
                        body.style.maxHeight =
                            "0px";
                    }

                }

            }
        );

    if (
        typeof expandInspectorSection ===
            "function"
    ) {
        expandInspectorSection(
            targetSection
        );
        return;
    }

    targetSection?.classList.add(
        "open"
    );

    targetBody.hidden = false;

    requestAnimationFrame(() => {
        targetBody.style.maxHeight =
            `${targetBody.scrollHeight}px`;
});

}


// =========================================
// 현재 선택한 연출 검색
// =========================================

function getSelectedEventRange() {

    if (!selectedEventRangeId) {
        return null;
    }

    const chapter =
        getSelectedChapter();

    if (!chapter) {
        return null;
    }

    return chapter.events.find(
        eventRange =>
            eventRange.id ===
            selectedEventRangeId
    ) ?? null;

}

// =========================================
// 새 연출 적용 버튼 상태 변경
// =========================================

function setNewEventButtonsEnabled(
    enabled
) {

    const buttons = [
        backgroundAddBtn,
        bgmAddBtn,
        soundAddBtn
    ];

    buttons.forEach(button => {

        if (!button) {
            return;
        }

        button.disabled =
            !enabled;

        button.title =
            enabled
                ? ""
                : "선택한 연출을 수정한 뒤 변경 적용을 눌러주세요.";

    });

}


// =========================================
// 모든 연출 적용 버튼 비활성화
// =========================================

function disableAllEventApplyButtons() {

    setEventApplyButtonEnabled(
        backgroundApplyBtn,
        false
    );

    setEventApplyButtonEnabled(
        bgmApplyBtn,
        false
    );

    setEventApplyButtonEnabled(
        soundApplyBtn,
        false
    );

}

// =========================================
// 선택한 연출 상태 해제
// =========================================

function clearSelectedEventRange() {

    selectedEventRangeId = null;

    disableAllEventApplyButtons();

    setNewEventButtonsEnabled(
        true
    );

    clearBackgroundProjectSelection();

    if (backgroundSourceInput) {
        }

    if (backgroundFileInput) {
        }

    if (bgmProjectFileSelect) {
        bgmProjectFileSelect.value = "";
    }

    if (bgmSourceInput) {
        bgmSourceInput.value = "";
    }

    if (soundProjectFileSelect) {
        soundProjectFileSelect.value = "";
    }

    if (soundSourceInput) {
        soundSourceInput.value = "";
    }

    renderEventRanges();

}

// =========================================
// 연출 적용 버튼 상태 변경
// =========================================

function setEventApplyButtonEnabled(
    button,
    enabled
) {

    if (!button) {
        return;
    }

    button.disabled =
        !enabled;

    button.title =
        enabled
            ? "선택한 연출의 변경 사항을 적용합니다."
            : "현재 선택된 영역이 없습니다.";

}


// =========================================
// 미리보기 구간 표시
// =========================================

function renderEventRanges() {

    document
        .querySelectorAll(
            "#previewArea .message"
        )
        .forEach(element => {

            element.classList.remove(
                "eventRangeMessage",
                "backgroundRangeMessage",
                "backgroundRangeStart",
                "backgroundRangeEnd",
                "bgmRangeMessage",
                "bgmRangeStart",
                "bgmRangeEnd",
                "soundEventMessage"
            );

        });

    document
    .querySelectorAll(
        "#previewArea .eventRailLabels"
    )
    .forEach(element => {

        element.remove();

    });

    document
    .querySelectorAll(
        "#previewArea .eventRangeRails"
    )
    .forEach(element => {

        element.remove();

    });

    document
    .querySelectorAll(
        "#previewArea .hasEventRailLabels"
    )
    .forEach(element => {

        element.classList.remove(
            "hasEventRailLabels"
        );

    });

    // 연출 편집이 꺼져 있으면
    // 모든 가이드 표시를 숨긴다.
    if (!isEventGuideVisible) {
        return;
    }

    const chapter =
        getSelectedChapter();

    if (!chapter) {
        return;
    }

    // 이하 기존 배경/BGM 구간 표시 코드

    chapter.events.forEach(eventRange => {

        if (
            eventRange.type !==
            "background"
        ) {
            return;
        }

        const startIndex =
            findMessageIndex(
                chapter,
                eventRange.startMessageId
            );

        const endIndex =
            findMessageIndex(
                chapter,
                eventRange.endMessageId
            );

        if (
            startIndex === -1 ||
            endIndex === -1
        ) {
            return;
        }

        for (
            let index = startIndex;
            index <= endIndex;
            index += 1
        ) {

            const message =
                chapter.messages[index];

            const element =
                findPreviewMessageElement(
                    message.id
                );

            if (!element) {
                continue;
            }

            element.classList.add(
                "backgroundRangeMessage",
                 "eventRangeMessage"
            );

            addEventRangeRail(
                message.id,
                "backgroundEventRail"
            );
            

            if (index === startIndex) {

                element.classList.add(
                    "backgroundRangeStart"
                );

                addEventRailLabel(
                    message.id,
                    `🖼 배경 ${getEventResourceName(
                        eventRange
                    )}`,
                    "backgroundRailLabel",
                    eventRange
                );

            }

            if (index === endIndex) {
                element.classList.add(
                    "backgroundRangeEnd"
                );
            }

        }

    });

    chapter.events.forEach(eventRange => {

        if (eventRange.type !== "sound") {
            return;
        }

        const element =
            findPreviewMessageElement(
                eventRange.startMessageId
            );

        if (!element) {
            return;
        }

        element.classList.add(
            "soundEventMessage",
            "eventRangeMessage"
        );

        addEventRangeRail(
            eventRange.startMessageId,
            "soundEventRail"
        );
        
        addEventRailLabel(
            eventRange.startMessageId,
            `🔊 효과음 ${getEventResourceName(
                eventRange
            )}`,
            "soundRailLabel",
            eventRange
        );
        
    });

    

    chapter.events.forEach(eventRange => {

    if (eventRange.type !== "bgm") {
        return;
    }

    const startIndex =
        findMessageIndex(
            chapter,
            eventRange.startMessageId
        );

    const endIndex =
        findMessageIndex(
            chapter,
            eventRange.endMessageId
        );

    if (
        startIndex === -1 ||
        endIndex === -1
    ) {
        return;
    }

    for (
        let index = startIndex;
        index <= endIndex;
        index += 1
    ) {

        const message =
            chapter.messages[index];

        const element =
            findPreviewMessageElement(
                message.id
            );

        if (!element) {
            continue;
        }

        element.classList.add(
            "bgmRangeMessage",
            "eventRangeMessage"
        );

        addEventRangeRail(
            message.id,
            "bgmEventRail"
        );

        if (index === startIndex) {
            element.classList.add(
                "bgmRangeStart"
            );

            addEventRailLabel(
                message.id,
                `🎵 BGM ${getEventResourceName(
                    eventRange
                )}`,
                "bgmRailLabel",
                eventRange
            );

        }

        if (index === endIndex) {
            element.classList.add(
                "bgmRangeEnd"
            );
        }

    }

    });


        

}

// =========================================
// 미리보기 메시지 요소 검색
// =========================================

function findPreviewMessageElement(
    messageId
) {

    return Array
        .from(
            document.querySelectorAll(
                "#previewArea .message"
            )
        )
        .find(
            element =>
                element.dataset.messageId ===
                messageId
        ) ?? null;

}


// =========================================
// 메시지 왼쪽에 연출별 레일 추가
// =========================================

function addEventRangeRail(
    messageId,
    railClassName
) {

    const messageElement =
        findPreviewMessageElement(
            messageId
        );

    if (!messageElement) {
        return;
    }

    let railContainer =
        messageElement.querySelector(
            ".eventRangeRails"
        );

    if (!railContainer) {

        railContainer =
            document.createElement("div");

        railContainer.className =
            "eventRangeRails";

        messageElement.insertAdjacentElement(
            "afterbegin",
            railContainer
        );

    }

    /*
        같은 메시지에 같은 종류의 레일을
        두 번 만들지 않는다.
    */
    if (
        railContainer.querySelector(
            `.${railClassName}`
        )
    ) {
        return;
    }

    const rail =
        document.createElement("span");

    rail.className =
        `eventRangeRail ${railClassName}`;

    railContainer.insertAdjacentElement(
        "beforeend",
        rail
    );

}



// =========================================
// 메시지의 연출 라벨 표시
// =========================================

function addEventRailLabel(
    messageId,
    text,
    className,
    eventRange
) {

    const messageElement =
        findPreviewMessageElement(
            messageId
        );

    if (!messageElement) {
        return;
    }

    let labelContainer =
        messageElement.querySelector(
            ".eventRailLabels"
        );

    if (!labelContainer) {

        labelContainer =
            document.createElement("div");

        labelContainer.className =
            "eventRailLabels";

        messageElement.insertAdjacentElement(
            "afterbegin",
            labelContainer
        );

    }

    messageElement.classList.add(
        "hasEventRailLabels"
    );

    const label =
        document.createElement("button");

    label.type = "button";

    label.className =
        `eventRailLabel ${className}`;

    label.textContent =
        text;

    label.dataset.eventRangeId =
        eventRange.id;

        if (
                selectedEventRangeId ===
                eventRange.id
            ) {

                label.classList.add(
                    "selected"
                );

            }

    label.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            openEventRangeEditor(
                eventRange.id
            );

        }
    );

    labelContainer.insertAdjacentElement(
        "beforeend",
        label
    );

}

// =========================================
// 연출 라벨 클릭
// =========================================

async function openEventRangeEditor(
    eventRangeId
) {

    const chapter =
        getSelectedChapter();

    if (!chapter) {
        return;
    }

    const eventRange =
        chapter.events.find(
            item =>
                item.id ===
                eventRangeId
        );

    if (!eventRange) {
        return;
    }

    /*
        라벨을 선택한 직후에는 메시지 범위를 비운다.
        그대로 적용하면 기존 연출 범위를 유지하고,
        새 메시지 범위를 선택한 뒤 적용하면 범위를 이동한다.
    */
    clearSelectedMessageRange(false);
    clearMessageEditor();

    /* 라벨 미리듣기는 한 종류만 재생한다. */
    stopPreviewBgmImmediately();
    resetPreviewSoundState();

    if (
        selectedEventRangeId ===
        eventRange.id
    ) {

        clearSelectedEventRange();

        return;

    }

    selectedEventRangeId =
        eventRange.id;

    renderEventRanges();

    disableAllEventApplyButtons();

    setNewEventButtonsEnabled(
        false
    );

    if (
        eventRange.type ===
        "background"
    ) {

        openInspectorBody(
            "backgroundInspectorBody"
        );

        await loadBackgroundEventIntoEditor(
            eventRange
        );

        setEventApplyButtonEnabled(
            backgroundApplyBtn,
            true
        );

        return;

    }

    if (eventRange.type === "bgm") {

        openInspectorBody(
            "bgmInspectorBody"
        );

        await loadBgmEventIntoEditor(
            eventRange
        );

        setEventApplyButtonEnabled(
            bgmApplyBtn,
            true
        );

        await playPreviewBgm(
            eventRange
        );

        return;

    }

    if (eventRange.type === "sound") {

        openInspectorBody(
            "soundInspectorBody"
        );

        await loadSoundEventIntoEditor(
            eventRange
        );

        setEventApplyButtonEnabled(
            soundApplyBtn,
            true
        );

        await playPreviewSound(
            eventRange
        );

    }

}

// =========================================
// 배경 설정 불러오기
// =========================================

async function loadBackgroundEventIntoEditor(
    eventRange
) {

    backgroundOpacityInput.value =
        String(
            Math.round(
                (
                    eventRange.imageOpacity ??
                    1
                ) * 100
            )
        );

    backgroundDarknessInput.value =
        String(
            Math.round(
                (
                    eventRange.darkness ??
                    0
                ) * 100
            )
        );

    backgroundFadeInput.value =
        String(
            eventRange.fadeDuration ??
            0.5
        );


    clearBackgroundProjectSelection();

    if (backgroundSourceInput) {
        backgroundSourceInput.value =
            eventRange.sourceType === "url"
                ? eventRange.source
                : "";
    }

    if (
        eventRange.sourceType ===
        "project-file"
    ) {

        await refreshBackgroundProjectFiles();

        const selectedButton =
            Array
                .from(
                    document.querySelectorAll(
                        "#backgroundProjectFileList " +
                        ".backgroundThumbnailItem"
                    )
                )
                .find(
                    button =>
                        button.dataset.path ===
                        eventRange.source
                );

        if (selectedButton) {

            selectBackgroundThumbnail(
                eventRange.source,
                selectedButton
            );

        }
    }

    updateBackgroundSettingOutputs();

}

// =========================================
// BGM 설정 불러오기
// =========================================

async function loadBgmEventIntoEditor(
    eventRange
) {

    bgmSourceInput.value = "";

    if (
        eventRange.sourceType ===
        "project-file"
    ) {

        await refreshBgmProjectFiles();

        bgmProjectFileSelect.value =
            eventRange.source;

    } else {

        bgmProjectFileSelect.value = "";

        bgmSourceInput.value =
            eventRange.source;

    }

    bgmVolumeInput.value =
        String(
            Math.round(
                (
                    eventRange.volume ??
                    0.5
                ) * 100
            )
        );

    setSelectedDelaySeconds(
        "bgmDelay",
        eventRange.delay ?? 0
    );

}

// =========================================
// 효과음 설정 불러오기
// =========================================

async function loadSoundEventIntoEditor(
    eventRange
) {

    soundSourceInput.value = "";

    if (
        eventRange.sourceType ===
        "project-file"
    ) {

        await refreshSoundProjectFiles();

        soundProjectFileSelect.value =
            eventRange.source;

    } else {

        soundProjectFileSelect.value = "";

        soundSourceInput.value =
            eventRange.source;

    }

    soundVolumeInput.value =
        String(
            Math.round(
                (
                    eventRange.volume ??
                    0.7
                ) * 100
            )
        );

    setSelectedDelaySeconds(
        "soundDelay",
        eventRange.delay ?? 0
    );

}

// =========================================
// 선택한 배경 설정 변경 적용
// =========================================

async function applySelectedBackgroundChanges() {

    const eventRange =
        getSelectedEventRange();

    if (
        !eventRange ||
        eventRange.type !== "background"
    ) {
        alert(
            "변경할 배경 연출을 먼저 선택해주세요."
        );
        return;
    }

    const projectSource =
        backgroundProjectFileSelect.value;

    const urlSource =
        backgroundSourceInput
            ?.value
            ?.trim() ||
        "";

    if (
        urlSource &&
        !/^https?:\/\//i.test(
            urlSource
        )
    ) {
        alert(
            "올바른 http 또는 https 배경 이미지 URL을 입력해주세요."
        );
        return;
    }

    /*
        새 프로젝트 이미지 또는 URL을 선택했을 때만
        기존 배경 소스를 교체한다.
        선택하지 않으면 투명도·어두움·전환 시간만 수정한다.
    */
    if (projectSource) {

        eventRange.sourceType =
            "project-file";

        eventRange.source =
            projectSource;

    } else if (urlSource) {

        eventRange.sourceType =
            "url";

        eventRange.source =
            urlSource;

    }

    eventRange.imageOpacity =
        Number(
            backgroundOpacityInput.value
        ) / 100;

    eventRange.darkness =
        Number(
            backgroundDarknessInput.value
        ) / 100;

    eventRange.fadeDuration =
        Number(
            backgroundFadeInput.value
        );

    const chapter =
        getSelectedChapter();

    if (!chapter) {
        return;
    }

    if (
        !moveSelectedEventRangeIfNeeded(
            eventRange
        )
    ) {
        return;
    }

    normalizeOverlappingEventRanges(
        chapter,
        "background",
        eventRange.startMessageId,
        eventRange.endMessageId,
        eventRange.id
    );

    clearSelectedEventRange();
    updatePreviewBackground();

    setStorageStatus(
        "배경 설정 변경을 적용했습니다."
    );

}

// =========================================
// 선택한 BGM 설정 변경 적용
// =========================================

function applySelectedBgmChanges() {

    const eventRange =
        getSelectedEventRange();

    if (
        !eventRange ||
        eventRange.type !== "bgm"
    ) {
        alert(
            "변경할 BGM 연출을 먼저 선택해주세요."
        );
        return;
    }

    const projectSource =
        bgmProjectFileSelect.value;

    const urlSource =
        bgmSourceInput.value.trim();

    if (projectSource) {

        eventRange.sourceType =
            "project-file";

        eventRange.source =
            projectSource;

    } else if (urlSource) {

        if (isUnsupportedSoundCloudShortUrl(urlSource)) {
            alert(
                "on.soundcloud.com 단축 링크는 직접 재생할 수 없습니다.\n" +
                "브라우저에서 링크를 연 뒤 주소창의 최종 soundcloud.com/아티스트/트랙 주소를 입력해주세요."
            );
            return;
        }

        if (
            !isSupportedExternalMediaUrl(
                urlSource
            )
        ) {
            alert(
                "BGM 주소는 YouTube 또는 SoundCloud의 원본 트랙 링크만 사용할 수 있습니다."
            );
            return;
        }

        eventRange.sourceType =
            "url";

        eventRange.source =
            urlSource;

    }

    const volumeNumber =
        Number(bgmVolumeInput.value);

    eventRange.volume =
        Math.min(
            1,
            Math.max(
                0,
                Number.isFinite(volumeNumber)
                    ? volumeNumber / 100
                    : 0.5
            )
        );

    eventRange.delay =
        getSelectedDelaySeconds(
            "bgmDelay"
        );

    const chapter =
        getSelectedChapter();

    if (!chapter) {
        return;
    }

    if (
        !moveSelectedEventRangeIfNeeded(
            eventRange
        )
    ) {
        return;
    }

    normalizeOverlappingEventRanges(
        chapter,
        "bgm",
        eventRange.startMessageId,
        eventRange.endMessageId,
        eventRange.id
    );

    /*
        소스 교체 직후에는 기존 이벤트 ID가 페이드 종료까지 남아
        updatePreviewBgm()이 같은 이벤트로 오인할 수 있다.
        즉시 정지해 재생 상태를 완전히 초기화한 뒤 다시 판정한다.
    */
    stopPreviewBgmImmediately();
    clearSelectedEventRange();
    setStorageStatus(
        "BGM 설정 변경을 적용했습니다."
    );

}

// =========================================
// 선택한 효과음 설정 변경 적용
// =========================================

function applySelectedSoundChanges() {

    const eventRange =
        getSelectedEventRange();

    if (
        !eventRange ||
        eventRange.type !== "sound"
    ) {
        alert(
            "변경할 효과음 연출을 먼저 선택해주세요."
        );
        return;
    }

    if (
        !moveSelectedEventRangeIfNeeded(
            eventRange,
            { singleMessage: true }
        )
    ) {
        return;
    }

    const projectSource =
        soundProjectFileSelect.value;

    const urlSource =
        soundSourceInput.value.trim();

    if (projectSource) {

        eventRange.sourceType =
            "project-file";

        eventRange.source =
            projectSource;

    } else if (urlSource) {

        if (isUnsupportedSoundCloudShortUrl(urlSource)) {
            alert(
                "on.soundcloud.com 단축 링크는 직접 재생할 수 없습니다.\n" +
                "브라우저에서 링크를 연 뒤 주소창의 최종 soundcloud.com/아티스트/트랙 주소를 입력해주세요."
            );
            return;
        }

        if (
            !isSupportedExternalMediaUrl(
                urlSource
            )
        ) {
            alert(
                "효과음 주소는 YouTube 또는 SoundCloud의 원본 트랙 링크만 사용할 수 있습니다."
            );
            return;
        }

        eventRange.sourceType =
            "url";

        eventRange.source =
            urlSource;

    }

    const volumeNumber =
        Number(soundVolumeInput.value);

    eventRange.volume =
        Math.min(
            1,
            Math.max(
                0,
                Number.isFinite(volumeNumber)
                    ? volumeNumber / 100
                    : 0.7
            )
        );

    eventRange.delay =
        getSelectedDelaySeconds(
            "soundDelay"
        );

resetPreviewSoundState();
renderEventRanges();

setEventApplyButtonEnabled(
    soundApplyBtn,
    true
);

setNewEventButtonsEnabled(
    false
);
    setStorageStatus(
        "효과음 설정 변경을 적용했습니다."
    );

}

// =========================================
// 스크롤 배경 갱신 요청
// =========================================

function requestPreviewMediaUpdate() {

    if (eventScrollFrame !== null) {
        return;
    }

    eventScrollFrame =
        requestAnimationFrame(() => {

            eventScrollFrame = null;

            updatePreviewMedia();

        });

}

function updatePreviewMedia() {

    updatePreviewBackground();

    /*
        일반 Preview에서는 스크롤 위치에 따라 오디오를 자동 재생하지 않는다.
        BGM과 효과음은 연출 라벨을 직접 선택했을 때만 미리듣고,
        리플레이 모드에서는 메시지 진행에 맞춰 자동 재생한다.
    */
    if (
        typeof isFocusModeActive !== "undefined" &&
        isFocusModeActive
    ) {
        updatePreviewBgm();
        updatePreviewSound();
        return;
    }

    const selectedEvent =
        getSelectedEventRange();

    if (
        !selectedEvent ||
        selectedEvent.type !== "bgm"
    ) {
        stopPreviewBgmImmediately();
    }

    if (
        !selectedEvent ||
        selectedEvent.type !== "sound"
    ) {
        resetPreviewSoundState();
    }

}

// =========================================
// 현재 스크롤 위치의 배경 적용
// =========================================

async function updatePreviewBackground() {

    const chapter = getSelectedChapter();

    if (
        !chapter ||
        chapter.messages.length === 0
    ) {
        clearPreviewBackground();
        return;
    }

    const activeMessageId =
        getActivePreviewMessageId();

    if (!activeMessageId) {
        clearPreviewBackground();
        return;
    }

    const activeMessageIndex =
        findMessageIndex(
            chapter,
            activeMessageId
        );

    const rangeIndex =
        findBackgroundRangeIndexAtMessage(
            chapter,
            activeMessageIndex
        );

    if (rangeIndex === -1) {
        clearPreviewBackground();
        return;
    }

    const eventRange =
        chapter.events[rangeIndex];

    await applyPreviewBackground(
        eventRange
    );

}

// =========================================
// 현재 스크롤 위치의 BGM 적용
// =========================================

function updatePreviewBgm() {

    const chapter = getSelectedChapter();

    if (!chapter || chapter.messages.length === 0) {
        cancelPendingBgmPlayback();
        fadeOutPreviewBgm();
        return;
    }

    const activeMessageId =
        getActivePreviewMessageId();

    if (!activeMessageId) {
        cancelPendingBgmPlayback();
        fadeOutPreviewBgm();
        return;
    }

    const activeMessageIndex =
        findMessageIndex(chapter, activeMessageId);

    const rangeIndex =
        findEventRangeIndexAtMessage(
            chapter,
            activeMessageIndex,
            "bgm"
        );

    if (rangeIndex === -1) {
        cancelPendingBgmPlayback();
        fadeOutPreviewBgm();
        return;
    }

    const eventRange = chapter.events[rangeIndex];

    if (activeBgmEventId === eventRange.id) {
        return;
    }

    schedulePreviewBgm(eventRange);

}

function cancelPendingBgmPlayback() {

    if (pendingBgmTimer !== null) {
        clearTimeout(pendingBgmTimer);
    }

    pendingBgmTimer = null;
    pendingBgmEventId = null;

}

function schedulePreviewBgm(eventRange) {

    if (pendingBgmEventId === eventRange.id) {
        return;
    }

    cancelPendingBgmPlayback();

    const isChangingBgm =
        activeBgmEventId !== null &&
        activeBgmEventId !== eventRange.id;

    if (isChangingBgm) {
        fadeOutPreviewBgm();
    }

    const delaySeconds =
        Math.max(
            Math.max(0, Number(eventRange.delay) || 0),
            isChangingBgm ? 0.8 : 0
        );

    pendingBgmEventId = eventRange.id;

    const startPlayback = () => {

        pendingBgmTimer = null;
        pendingBgmEventId = null;

        const chapter = getSelectedChapter();
        const activeMessageId = getActivePreviewMessageId();

        if (!chapter || !activeMessageId) {
            return;
        }

        const activeIndex =
            findMessageIndex(chapter, activeMessageId);

        const currentRangeIndex =
            findEventRangeIndexAtMessage(
                chapter,
                activeIndex,
                "bgm"
            );

        if (
            currentRangeIndex === -1 ||
            chapter.events[currentRangeIndex]?.id !==
                eventRange.id
        ) {
            return;
        }

        playPreviewBgm(eventRange);

    };

    if (delaySeconds === 0) {
        startPlayback();
        return;
    }

    pendingBgmTimer =
        window.setTimeout(
            startPlayback,
            delaySeconds * 1000
        );

}

async function playPreviewBgm(eventRange) {

    cancelPendingBgmPlayback();
    bgmFadeToken += 1;
    isBgmFadingOut = false;

    const sourceKey =
        `${eventRange.sourceType || ""}:` +
        `${eventRange.source || ""}`;

    const isSameBgm =
        activeBgmEventId === eventRange.id &&
        activeBgmSourceKey === sourceKey;

    if (isSameBgm) {
        return;
    }

    stopPreviewBgmImmediately();

    activeBgmEventId = eventRange.id;
    activeBgmSourceKey = sourceKey;

    if (
        eventRange.sourceType === "url" &&
        isSupportedExternalMediaUrl(eventRange.source)
    ) {

        previewBgmPlayer.removeAttribute("src");

        const started =
            playExternalMedia(
                "bgm",
                eventRange.source,
                {
                    volume: eventRange.volume,
                    loop: eventRange.loop !== false
                }
            );

        if (!started) {
            activeBgmEventId = null;
            activeBgmSourceKey = "";
        }

        return;
    }

    stopExternalMedia("bgm");

    try {
        previewBgmPlayer.src =
            await resolveEventSource(eventRange);
    } catch (error) {
        console.error(
            "BGM 파일을 불러오지 못했습니다.",
            error
        );
        activeBgmEventId = null;
        activeBgmSourceKey = "";
        return;
    }

    previewBgmPlayer.volume =
        Math.min(
            1,
            Math.max(0, Number(eventRange.volume) || 0)
        );

    previewBgmPlayer.loop =
        eventRange.loop !== false;
    previewBgmPlayer.currentTime = 0;

    const playPromise = previewBgmPlayer.play();

    playPromise?.catch?.(error => {
        console.warn(
            "브라우저의 자동 재생 정책으로 BGM을 재생하지 못했습니다.",
            error
        );
    });

}

function fadeOutPreviewBgm(
    duration = 0.8
) {

    cancelPendingBgmPlayback();

    if (
        activeBgmEventId === null ||
        isBgmFadingOut
    ) {
        return;
    }

    isBgmFadingOut = true;

    const fadeToken = ++bgmFadeToken;

    if (
        typeof fadeOutExternalMedia ===
            "function" &&
        isExternalMediaActive?.(
            "bgm",
            externalMediaState?.bgm?.source || ""
        )
    ) {
        fadeOutExternalMedia(
            "bgm",
            duration,
            () => {
                if (fadeToken !== bgmFadeToken) {
                    return;
                }

                isBgmFadingOut = false;
                activeBgmEventId = null;
                activeBgmSourceKey = "";
            }
        );
        return;
    }

    const startVolume = previewBgmPlayer.volume;
    const startedAt = performance.now();

    const step = now => {

        if (fadeToken !== bgmFadeToken) {
            return;
        }

        const progress =
            Math.min(
                1,
                Math.max(
                    0,
                    (now - startedAt) /
                        (duration * 1000)
                )
            );

        previewBgmPlayer.volume =
            Math.min(
                1,
                Math.max(
                    0,
                    startVolume *
                        (1 - progress)
                )
            );

        if (progress < 1) {
            requestAnimationFrame(step);
            return;
        }

        stopPreviewBgmImmediately();

    };

    requestAnimationFrame(step);

}

function stopPreviewBgmImmediately() {

    cancelPendingBgmPlayback();
    isBgmFadingOut = false;

    stopExternalMedia("bgm");

    if (previewBgmPlayer) {
        previewBgmPlayer.pause();
        previewBgmPlayer.removeAttribute("src");
    }

    activeBgmEventId = null;
    activeBgmSourceKey = "";

}

function stopPreviewBgm() {
    fadeOutPreviewBgm();
}

// =========================================
// 현재 메시지의 효과음 확인
// =========================================

function updatePreviewSound() {

    const chapter = getSelectedChapter();

    if (!chapter || chapter.messages.length === 0) {
        resetPreviewSoundState();
        return;
    }

    const activeMessageId = getActivePreviewMessageId();

    if (!activeMessageId) {
        resetPreviewSoundState();
        return;
    }

    if (activeMessageId === lastActiveSoundMessageId) {
        return;
    }

    cancelPendingSoundPlayback();
    lastActiveSoundMessageId = activeMessageId;

    const soundEvent =
        chapter.events.find(
            eventRange =>
                eventRange.type === "sound" &&
                eventRange.startMessageId === activeMessageId
        );

    if (
        !soundEvent ||
        playedSoundEventIds.has(soundEvent.id)
    ) {
        return;
    }

    pendingSoundEventId = soundEvent.id;

    const delaySeconds =
        Math.max(0, Number(soundEvent.delay) || 0);

    const startPlayback = () => {

        pendingSoundTimer = null;
        pendingSoundEventId = null;

        if (
            getActivePreviewMessageId() !==
                soundEvent.startMessageId
        ) {
            return;
        }

        playedSoundEventIds.add(soundEvent.id);
        playPreviewSound(soundEvent);

    };

    if (delaySeconds === 0) {
        startPlayback();
        return;
    }

    pendingSoundTimer =
        window.setTimeout(
            startPlayback,
            delaySeconds * 1000
        );

}

function cancelPendingSoundPlayback() {

    if (pendingSoundTimer !== null) {
        clearTimeout(pendingSoundTimer);
    }

    pendingSoundTimer = null;
    pendingSoundEventId = null;

}

async function playPreviewSound(soundEvent) {

    if (!previewSoundPlayer) {
        return;
    }

    previewSoundPlayer.pause();

    if (
        soundEvent.sourceType === "url" &&
        isSupportedExternalMediaUrl(soundEvent.source)
    ) {

        previewSoundPlayer.removeAttribute("src");

        playExternalMedia(
            "sound",
            soundEvent.source,
            { volume: soundEvent.volume, loop: false }
        );

        return;
    }

    stopExternalMedia("sound");

    try {
        previewSoundPlayer.src =
            await resolveEventSource(soundEvent);
    } catch (error) {
        console.error(
            "효과음 파일을 불러오지 못했습니다.",
            error
        );
        return;
    }

    previewSoundPlayer.volume =
        Math.min(
            1,
            Math.max(0, Number(soundEvent.volume) || 0)
        );
    previewSoundPlayer.loop = false;
    previewSoundPlayer.currentTime = 0;

    const playPromise = previewSoundPlayer.play();
    playPromise?.catch?.(error => {
        console.warn(
            "효과음을 재생하지 못했습니다.",
            error
        );
    });

}

function resetPreviewSoundState() {

    cancelPendingSoundPlayback();
    lastActiveSoundMessageId = null;

    if (!previewSoundPlayer) {
        return;
    }

    stopExternalMedia("sound");
    previewSoundPlayer.pause();
    previewSoundPlayer.removeAttribute("src");

}

// =========================================
// 화면 중심의 메시지 검색
// =========================================

function getActivePreviewMessageId() {

    const messages =
        Array.from(
            eventPreviewArea.querySelectorAll(
                ".message"
            )
        );

    if (messages.length === 0) {
        return null;
    }

    const previewRect =
        eventPreviewArea.getBoundingClientRect();

    const previewCenter =
        previewRect.top +
        previewRect.height / 2;

    let closestElement = null;
    let closestDistance = Infinity;

    messages.forEach(element => {

        const rect =
            element.getBoundingClientRect();

        const elementCenter =
            rect.top +
            rect.height / 2;

        const distance =
            Math.abs(
                previewCenter -
                elementCenter
            );

        if (distance < closestDistance) {

            closestDistance = distance;
            closestElement = element;

        }

    });

    return (
        closestElement?.dataset.messageId ||
        null
    );

}

// =========================================
// 배경 레이어 적용
// =========================================

async function applyPreviewBackground(
    eventRange
) {

    if (
        !previewColorLayer ||
        !previewImageLayer ||
        !previewDarknessLayer
    ) {
        return;
    }

    /*
        같은 이미지인지 확인하기 위한 고유 키.

        같은 이벤트뿐 아니라 같은 파일을 사용하는
        다른 배경 이벤트도 같은 이미지로 판단한다.
    */
    const sourceKey =
        `${eventRange.sourceType || "url"}:` +
        `${eventRange.source || ""}`;

    const fadeDuration =
        Math.max(
            0,
            Number(
                eventRange.fadeDuration
            ) || 0
        );

    activeBackgroundFadeDuration = fadeDuration;

    const targetOpacity =
        Math.min(
            1,
            Math.max(
                0,
                Number(
                    eventRange.imageOpacity ??
                    1
                )
            )
        );

    const darkness =
        Math.min(
            1,
            Math.max(
                0,
                Number(
                    eventRange.darkness ??
                    0
                )
            )
        );

        applyChapterBackgroundColor();

        /*
        현재 표시 중인 이미지와 같으면
        이미지를 다시 읽거나 페이드하지 않는다.

        색상, 투명도, 어두움 값만 즉시 갱신한다.
    */
    if (
        activeBackgroundSourceKey ===
        sourceKey
    ) {

        /*
            진행 중이던 이전 비동기 전환이 있다면
            더 이상 적용되지 않도록 취소한다.
        */
        backgroundTransitionToken += 1;

        previewColorLayer.style
            .transitionDuration = "0s";

        previewImageLayer.style
            .transitionDuration = "0s";

        previewDarknessLayer.style
            .transitionDuration = "0s";

        applyChapterBackgroundColor();

        previewImageLayer.style.opacity =
            String(targetOpacity);

        previewDarknessLayer.style.opacity =
            String(darkness);

        activeBackgroundEventId =
            eventRange.id;

        return;

    }

    /*
        여기부터는 실제 이미지가 달라졌을 때만 실행된다.
    */
    const transitionToken =
        ++backgroundTransitionToken;

    let resolvedSource;

    try {

        /*
            새 파일을 먼저 준비한다.
            파일을 읽는 동안 기존 배경은 그대로 유지된다.
        */
        resolvedSource =
            await resolveEventSource(
                eventRange
            );

    } catch (error) {

        console.error(
            "배경 파일을 불러오지 못했습니다.",
            error
        );

        return;

    }

    if (
        transitionToken !==
        backgroundTransitionToken
    ) {
        return;
    }

    const hasCurrentImage =
        Boolean(
            previewImageLayer.style
                .backgroundImage
        );

    /*
        기존 이미지가 있으면 전체 전환 시간을
        페이드아웃과 페이드인에 절반씩 사용한다.

        첫 배경처럼 기존 이미지가 없으면
        설정한 전환 시간 전체를 페이드인에 사용한다.
    */
    const phaseDuration =
        hasCurrentImage
            ? fadeDuration / 2
            : fadeDuration;

    previewColorLayer.style
        .transitionDuration =
            `${phaseDuration}s`;

    previewImageLayer.style
        .transitionDuration =
            `${phaseDuration}s`;

    previewDarknessLayer.style
        .transitionDuration =
            `${phaseDuration}s`;

    /*
        기존 이미지가 있을 때만 페이드아웃한다.
    */
    if (
        hasCurrentImage &&
        phaseDuration > 0
    ) {

        previewImageLayer.style.opacity =
            "0";

        await waitForBackgroundTransition(
            phaseDuration
        );

    } else {

        previewImageLayer.style.opacity =
            "0";

    }

    if (
        transitionToken !==
        backgroundTransitionToken
    ) {
        return;
    }

    /*
        새 배경값으로 교체한다.
    */
    applyChapterBackgroundColor();

    previewImageLayer.style.backgroundImage =
        `url(${JSON.stringify(
            resolvedSource
        )})`;

    previewDarknessLayer.style.opacity =
        String(darkness);

    /*
        현재 이미지를 먼저 기록한다.
        이후 같은 이미지로 갱신되면
        다시 페이드하지 않는다.
    */
    activeBackgroundSourceKey =
        sourceKey;

    activeBackgroundEventId =
        eventRange.id;

    await new Promise(resolve => {

        requestAnimationFrame(() => {

            if (
                transitionToken ===
                backgroundTransitionToken
            ) {
                previewImageLayer.style.opacity =
                    String(targetOpacity);
            }

            resolve();

        });

    });

    if (
        phaseDuration > 0 &&
        transitionToken ===
            backgroundTransitionToken
    ) {
        await waitForBackgroundTransition(
            phaseDuration
        );
    }

}


// =========================================
// 배경 전환 대기
// =========================================

function waitForBackgroundTransition(
    seconds
) {

    return new Promise(resolve => {

        setTimeout(
            resolve,
            seconds * 1000
        );

    });

}


// =========================================
// 특정 메시지의 배경 전환 완료 대기
// =========================================

async function applyPreviewBackgroundForMessage(
    messageId
) {

    const chapter = getSelectedChapter();

    if (!chapter || !messageId) {
        return;
    }

    const messageIndex =
        findMessageIndex(
            chapter,
            messageId
        );

    if (messageIndex < 0) {
        return;
    }

    const rangeIndex =
        findBackgroundRangeIndexAtMessage(
            chapter,
            messageIndex
        );

    if (rangeIndex === -1) {
        clearPreviewBackground();
        return;
    }

    await applyPreviewBackground(
        chapter.events[rangeIndex]
    );

}


// =========================================
// 배경 해제
// =========================================

function clearPreviewBackground(
    { immediate = false } = {}
) {

    const transitionToken =
        ++backgroundTransitionToken;

    const fadeDuration =
        immediate
            ? 0
            : Math.max(
                0,
                Number(
                    activeBackgroundFadeDuration
                ) || 0
            );

    if (previewImageLayer) {
        previewImageLayer.style.transitionDuration =
            `${fadeDuration}s`;
        previewImageLayer.style.opacity = "0";
    }

    if (previewDarknessLayer) {
        previewDarknessLayer.style.transitionDuration =
            `${fadeDuration}s`;
        previewDarknessLayer.style.opacity = "0";
    }

    const finishClear = () => {

        if (
            transitionToken !==
            backgroundTransitionToken
        ) {
            return;
        }

        if (previewImageLayer) {
            previewImageLayer.style.backgroundImage = "";
        }

        applyChapterBackgroundColor();

        activeBackgroundEventId = null;
        activeBackgroundSourceKey = null;
        activeBackgroundFadeDuration = 0;

    };

    if (fadeDuration > 0) {
        window.setTimeout(
            finishClear,
            fadeDuration * 1000
        );
    } else {
        finishClear();
    }

}

// =========================================
// 모든 연출 상태 초기화
// =========================================

function resetAllPreviewMedia() {

    selectedEventRangeId = null;

    disableAllEventApplyButtons();


    clearPreviewBackground({ immediate: true });
    stopPreviewBgmImmediately();
    resetPreviewSoundState();
    clearProjectResourceUrlCache();

    activeBgmEventId = null;
    activeBgmSourceKey = "";
    lastActiveSoundMessageId = null;
    playedSoundEventIds.clear();

    renderEventRanges();

}


// =========================================
// 오디오 파일을 Data URL로 읽기
// =========================================

function readAudioFileAsDataUrl(file) {

    return new Promise(
        (resolve, reject) => {

            if (
                !file ||
                !file.type.startsWith("audio/")
            ) {
                reject(
                    new Error(
                        "올바른 오디오 파일을 선택해주세요."
                    )
                );

                return;
            }

            const reader =
                new FileReader();

            reader.addEventListener(
                "load",
                () => {
                    resolve(
                        String(reader.result)
                    );
                }
            );

            reader.addEventListener(
                "error",
                () => {
                    reject(
                        reader.error ||
                        new Error(
                            "오디오 파일을 읽지 못했습니다."
                        )
                    );
                }
            );

            reader.readAsDataURL(file);

        }
    );

}

// =========================================
// 프로젝트 리소스 Blob URL
// =========================================

async function resolveEventSource(
    eventRange
) {

    if (
        eventRange.sourceType !==
        "project-file"
    ) {
        return eventRange.source;
    }

    const path =
        eventRange.source;

    if (
        projectResourceUrlCache.has(path)
    ) {
        return projectResourceUrlCache.get(
            path
        );
    }

    const file =
        await getProjectResourceFile(path);

    const objectUrl =
        URL.createObjectURL(file);

    projectResourceUrlCache.set(
        path,
        objectUrl
    );

    return objectUrl;

}

// =========================================
// 프로젝트 리소스 URL 캐시 해제
// =========================================

function clearProjectResourceUrlCache() {

    projectResourceUrlCache.forEach(
        objectUrl => {
            URL.revokeObjectURL(
                objectUrl
            );
        }
    );

    projectResourceUrlCache.clear();

}