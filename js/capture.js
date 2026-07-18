// =========================================
// Direct Preview Capture
// =========================================

const captureBtn =
    document.getElementById(
        "captureBtn"
    );

const directCapturePreviewViewport =
    document.getElementById(
        "previewViewport"
    );

function initializeCapture() {

    if (!captureBtn) {

        console.warn(
            "캡처 초기화 누락: captureBtn"
        );

        return;

    }

    captureBtn.addEventListener(
        "click",
        captureSelectedRange
    );

    updateDirectCaptureButtonState();

    console.log(
        "Direct Preview Capture Ready"
    );

}

function updateDirectCaptureButtonState() {

    if (!captureBtn) {
        return;
    }

    const selectedMessages =
        typeof getSelectedRangeMessages ===
            "function"
            ? getSelectedRangeMessages()
            : [];

    const canCapture =
        selectedMessages.length > 0;

    captureBtn.disabled =
        !canCapture;

    captureBtn.title =
        canCapture
            ? `${selectedMessages.length}개 메시지를 PNG로 저장합니다.`
            : "미리보기에서 메시지를 Shift+클릭하여 선택해주세요.";

}

async function captureSelectedRange() {

if (
        typeof html2canvas !==
        "function"
    ) {

        alert(
            "캡처 라이브러리를 불러오지 못했습니다."
        );

        return;

    }

    if (!directCapturePreviewViewport) {

        alert(
            "미리보기 영역을 찾지 못했습니다."
        );

        return;

    }

    const selectedMessages =
        typeof getSelectedRangeMessages ===
            "function"
            ? getSelectedRangeMessages()
            : [];

    if (selectedMessages.length === 0) {

        alert(
            "캡처할 메시지 또는 구간을 선택해주세요."
        );

        return;

    }

    const selectedMessageIds =
        new Set(
            selectedMessages.map(
                message => message.id
            )
        );

    captureBtn.disabled =
        true;

    captureBtn.textContent =
        "캡처 중...";

    let captureStage = null;

    try {

        /*
            현재 리플레이 미리보기 구조를 복제한다.

            실제 화면의 스크롤 위치나 메시지 구조는
            변경하지 않는다.
        */
        captureStage =
            directCapturePreviewViewport.cloneNode(
                true
            );

        captureStage.classList.add(
            "captureStage"
        );

        /*
            화면 밖에 배치하되,
            display:none은 사용하지 않는다.

            display:none이면 html2canvas가
            실제 크기를 계산할 수 없다.
        */
        captureStage.style.position =
            "fixed";

        captureStage.style.left =
            "-100000px";

        captureStage.style.top =
            "0";

        captureStage.style.width =
            `${directCapturePreviewViewport.clientWidth}px`;

        captureStage.style.height =
            "auto";

        captureStage.style.minHeight =
            "0";

        captureStage.style.overflow =
            "visible";

        captureStage.style.zIndex =
            "-9999";

        const clonedPreviewArea =
            captureStage.querySelector(
                "#previewArea"
            );

        if (!clonedPreviewArea) {

            throw new Error(
                "복제된 미리보기 영역을 찾지 못했습니다."
            );

        }

        clonedPreviewArea.style.height =
            "auto";

        clonedPreviewArea.style.minHeight =
            "0";

        clonedPreviewArea.style.overflow =
            "visible";

        /*
            선택 범위에 포함되지 않은 메시지는 제거한다.
        */
        clonedPreviewArea
            .querySelectorAll(
                ".message"
            )
            .forEach(element => {

                if (
                    !selectedMessageIds.has(
                        element.dataset.messageId
                    )
                ) {
                    element.remove();
                    return;
                }

                /*
                    캡처 결과에는 편집/선택 강조를
                    포함하지 않는다.
                */
                element.classList.remove(
                    "selected",
                    "messageRangeSelected",
                    "pendingBackgroundStart",
                    "pendingBgmStart",
                    "pendingSoundMessage",
                    "hasEventRailLabels",
                    "focusMessageSlide"
                );

                /*
                    복제본이 DOM에 삽입될 때 리플레이 등장 애니메이션이
                    처음부터 다시 시작되어 opacity:0 상태로 캡처되던 문제를 막는다.
                */
                element.style.animation =
                    "none";

                element.style.opacity =
                    "1";

                element.style.transform =
                    "none";

                element.style.outline =
                    "none";

            });

        /*
            편집 전용 표시 제거
        */
        captureStage
            .querySelectorAll(
                ".eventRailLabels, " +
                ".eventRangeRails"
            )
            .forEach(element => {
                element.remove();
            });

        document.body.appendChild(
            captureStage
        );

        /*
            프로필 이미지와 웹폰트가 준비될 때까지 기다린다.
        */
        await waitForCaptureImages(
            captureStage
        );

        if (document.fonts?.ready) {
            await document.fonts.ready;
        }

        /*
            선택 메시지 높이에 맞춰
            배경 레이어까지 함께 늘린다.
        */
        const captureHeight =
            Math.ceil(
                clonedPreviewArea.scrollHeight
            );

        captureStage.style.height =
            `${captureHeight}px`;

        const canvas =
            await html2canvas(
                captureStage,
                {
                    backgroundColor: null,
                    useCORS: true,
                    allowTaint: false,
                    logging: false,
                    imageTimeout: 3000,
                    scale: 2,

                    width:
                        captureStage.clientWidth,

                    height:
                        captureHeight,

                    windowWidth:
                        captureStage.clientWidth,

                    windowHeight:
                        captureHeight
                }
            );

        await downloadCaptureCanvas(
            canvas,
            selectedMessages.length
        );

        if (
            typeof clearSelectedMessageRange ===
                "function"
        ) {
            clearSelectedMessageRange();
        }

        setStorageStatus(
            `선택한 메시지 ${selectedMessages.length}개를 캡처했습니다.`
        );

    } catch (error) {

        console.error(
            "선택 구간 캡처 실패",
            error
        );

        alert(
            "선택 구간을 캡처하지 못했습니다."
        );

    } finally {

        captureStage?.remove();

        captureBtn.textContent =
            "선택 구간 캡처";

        updateDirectCaptureButtonState();

    }

}

// =========================================
// 캡처 내부 이미지 로딩 대기
// =========================================

async function waitForCaptureImages(
    rootElement
) {

    const images =
        Array.from(
            rootElement.querySelectorAll(
                "img"
            )
        );

    await Promise.all(
        images.map(image => {

            return new Promise(resolve => {

                let timeoutId = null;

                const finish = () => {

                    image.removeEventListener(
                        "load",
                        finish
                    );

                    image.removeEventListener(
                        "error",
                        finish
                    );

                    if (timeoutId !== null) {

                        clearTimeout(
                            timeoutId
                        );

                    }

                    /*
                        불러오지 못한 이미지는
                        캡처 복제본에서 제거한다.
                    */
                    if (
                        image.naturalWidth === 0
                    ) {
                        image.remove();
                    }

                    resolve();

                };

                /*
                    성공 여부와 관계없이
                    이미 로딩이 끝났다면 즉시 처리한다.
                */
                if (image.complete) {

                    finish();

                    return;

                }

                image.addEventListener(
                    "load",
                    finish,
                    {
                        once: true
                    }
                );

                image.addEventListener(
                    "error",
                    finish,
                    {
                        once: true
                    }
                );

                /*
                    서버가 응답하지 않아도
                    캡처가 무한 대기하지 않게 한다.
                */
                timeoutId =
                    setTimeout(
                        finish,
                        3000
                    );

            });

        })
    );

}

// =========================================
// PNG 다운로드
// =========================================

function downloadCaptureCanvas(
    canvas,
    messageCount
) {

    return new Promise(
        (resolve, reject) => {

            canvas.toBlob(
                blob => {

                    if (!blob) {

                        reject(
                            new Error(
                                "PNG 데이터를 만들지 못했습니다."
                            )
                        );

                        return;

                    }

                    const chapter =
                        typeof getSelectedChapter ===
                        "function"
                            ? getSelectedChapter()
                            : null;

                    const chapterTitle =
                        chapter?.title ||
                        "capture";

                    const safeTitle =
                        typeof sanitizeFilename ===
                            "function"
                            ? sanitizeFilename(
                                chapterTitle
                            )
                            : String(chapterTitle)
                                .replace(
                                    /[\\/:*?"<>|]/g,
                                    "_"
                                );

                    const timestamp =
                        createCaptureTimestamp();

                    const filename =
                        `${safeTitle}_${messageCount}messages_${timestamp}.png`;

                    const objectUrl =
                        URL.createObjectURL(
                            blob
                        );

                    const link =
                        document.createElement(
                            "a"
                        );

                    link.href =
                        objectUrl;

                    link.download =
                        filename;

                    document.body.appendChild(
                        link
                    );

                    link.click();
                    link.remove();

                    /*
                        브라우저가 다운로드용 Blob URL을
                        읽을 시간을 준 뒤 해제한다.
                    */
                    setTimeout(() => {

                        URL.revokeObjectURL(
                            objectUrl
                        );

                    }, 1000);

                    resolve();

                },
                "image/png"
            );

        }
    );

}

// =========================================
// 캡처 파일 시간 문자열
// =========================================

function createCaptureTimestamp() {

    const now =
        new Date();

    const pad =
        value =>
            String(value)
                .padStart(
                    2,
                    "0"
                );

    return (
        `${now.getFullYear()}` +
        `${pad(now.getMonth() + 1)}` +
        `${pad(now.getDate())}_` +
        `${pad(now.getHours())}` +
        `${pad(now.getMinutes())}` +
        `${pad(now.getSeconds())}`
    );

}