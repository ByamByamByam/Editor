// =========================================
// Speaker Manager
// =========================================

// ---------- DOM ----------

const speakerList = document.getElementById("speakerList");
const speakerSelect = document.getElementById("speakerSelect");
const bubbleTransparent = document.getElementById( "bubbleTransparent");

const addSpeakerBtn = document.getElementById("addSpeakerBtn");
const saveSpeakerBtn = document.getElementById("saveSpeakerBtn");
const deleteSpeakerBtn = document.getElementById("deleteSpeakerBtn");

const speakerName = document.getElementById("speakerName");

const speakerNameColor =
    document.getElementById(
        "speakerNameColor"
    );

const speakerProfile = document.getElementById("speakerProfile");

const speakerProfilePreview =
    document.getElementById(
        "speakerProfilePreview"
    );

const speakerProfilePlaceholder =
    document.getElementById(
        "speakerProfilePlaceholder"
    );

const speakerProfilePicker =
    document.getElementById(
        "speakerProfilePicker"
    );

const speakerProfileType =
    document.querySelectorAll(
        'input[name="speakerProfileType"]'
    );

const bubbleColor = document.getElementById("bubbleColor");
const textColor = document.getElementById("textColor");

const speakerAlign = document.querySelectorAll(
    'input[name="speakerAlign"]'
);

const speakerNotes =
    document.getElementById("speakerNotes");

// ---------- 선택 상태 ----------

let selectedSpeakerId = null;

let isCreatingSpeakerDraft =
    false;

// =========================================
// 초기화
// =========================================

function initializeSpeaker() {

    addSpeakerBtn.addEventListener(
        "click",
        startSpeakerDraft
    );
    saveSpeakerBtn.addEventListener("click", saveSpeaker);
    deleteSpeakerBtn.addEventListener("click", deleteSpeaker);

    speakerProfile
        ?.addEventListener(
            "change",
            handleSpeakerProfilePreviewChange
        );

        bubbleColor?.addEventListener(
    "input",
    updateSpeakerProfilePickerColor
);

    speakerProfileType
        .forEach(
            radio => {

                radio.addEventListener(
                    "change",
                    updateSpeakerProfilePickerShape
                );

            }
        );

    clearSpeakerEditor();
    renderSpeakerList();
    updateSpeakerSelect();

    console.log("Speaker Manager Ready");

}

// =========================================
// 새 화자 작성
// =========================================

function clearSpeakerEditor(
    preserveDraft = false
) {

    selectedSpeakerId = null;

    if (!preserveDraft) {
        isCreatingSpeakerDraft =
            false;
    }

    speakerName.value = "";
    speakerProfile.value = "";

    setSpeakerProfileEditorPreview(
        "",
        "circle"
    );

    speakerProfileType.forEach(
        radio => {
            radio.checked =
                radio.value === "circle";
        }
    );

    bubbleColor.value = "#ffffff";
    updateSpeakerProfilePickerColor();
    bubbleTransparent.checked = false;
    textColor.value = "#000000";

    if (speakerNameColor) {
        speakerNameColor.value =
            "#888888";
    }

    speakerAlign.forEach(radio => {
        radio.checked = radio.value === "left";
    });

    document
        .querySelectorAll(".speakerCard.selected")
        .forEach(card => card.classList.remove("selected"));

    speakerNotes.value = "";

    updateSpeakerDeleteButtonState();

}

// =========================================
// 새 등장인물 임시 카드
// =========================================

function startSpeakerDraft() {

    const chat =
        getSelectedChat();

    if (!chat) {
        return;
    }

    isCreatingSpeakerDraft =
        true;

    clearSpeakerEditor(
        true
    );

    renderSpeakerList();

    speakerName.focus();

}

function updateSpeakerDeleteButtonState() {

    if (!deleteSpeakerBtn) {
        return;
    }

    deleteSpeakerBtn.disabled =
        selectedSpeakerId === null;

}

// =========================================
// 화자 저장
// =========================================

async function saveSpeaker() {

    const chat = getSelectedChat();

    if (!chat) {
        alert("먼저 채팅방을 선택해주세요.");
        return;
    }

    const name = speakerName.value.trim();

    if (name === "") {
        alert("등장인물 이름을 입력해주세요.");
        speakerName.focus();
        return;
    }

    const align = document.querySelector(
        'input[name="speakerAlign"]:checked'
    )?.value ?? "left";

    const profileType =
        document.querySelector(
            'input[name="speakerProfileType"]:checked'
        )?.value ?? "circle";

    const selectedFile =
        speakerProfile.files[0];

    let speaker = null;

    // 새 화자 생성
    if (selectedSpeakerId === null) {

        speaker = new Speaker();

        chat.speakers.push(speaker);

        selectedSpeakerId =
            speaker.id;

    } else {

        // 기존 화자 수정
        speaker = chat.speakers.find(
            item => item.id === selectedSpeakerId
        );

        if (!speaker) {
            alert("선택한 등장인물을 찾을 수 없습니다.");
            clearSpeakerEditor();
            return;
        }

    }

    // 새 화자와 기존 화자 공통 저장
    speaker.name = name;

    speaker.bubbleColor =
        bubbleColor.value;

    speaker.bubbleTransparent =
        bubbleTransparent.checked;

    speaker.textColor =
        textColor.value;

    speaker.nameColor =
        speakerNameColor?.value ||
        "#888888";

    speaker.profileType =
        (
            profileType === "square" ||
            profileType === "hidden"
        )
            ? profileType
            : "circle";

    speaker.align = align;

    speaker.notes =
        speakerNotes.value.trim();

    if (selectedFile) {
        speaker.profile =
            await fileToDataUrl(selectedFile);
    }

    isCreatingSpeakerDraft =
        false;

    renderSpeakerList();
    updateSpeakerSelect();
    selectSpeaker(selectedSpeakerId);
    renderPreview();

    console.log(
        "화자 저장 완료",
        chat.speakers
    );

}

// =========================================
// 화자 삭제
// =========================================

function deleteSpeaker() {

    const chat = getSelectedChat();

    if (!chat) {
        alert("먼저 채팅방을 선택해주세요.");
        return;
    }

    if (selectedSpeakerId === null) {
        alert("삭제할 등장인물을 선택해주세요.");
        return;
    }

    const speaker = chat.speakers.find(
        item => item.id === selectedSpeakerId
    );

    if (!speaker) {
        alert("선택한 등장인물을 찾을 수 없습니다.");
        clearSpeakerEditor();
        return;
    }

    const confirmed = confirm(
        `"${speaker.name}" 등장인물을 삭제하시겠습니까?`
    );

    if (!confirmed) {
        return;
    }

    chat.speakers = chat.speakers.filter(
        item => item.id !== selectedSpeakerId
    );

    clearSpeakerEditor();
    renderSpeakerList();
    updateSpeakerSelect();
    renderPreview();

}

// =========================================
// 화자 목록 출력
// =========================================

function renderSpeakerList() {

    speakerList.innerHTML = "";

    const chat = getSelectedChat();

    if (!chat) {

        /*
            채팅이 선택되지 않았을 때는
            빈 상태 문구와 추가 버튼을 모두 숨긴다.
        */
        return;

    }

    if (chat.speakers.length === 0) {

        /*
            등록된 등장인물이 없을 때는
            목록 문구와 점선 추가 버튼을 표시하지 않는다.
            첫 등장인물은 아래 편집 영역에서 저장할 수 있다.
        */
        return;

    }

    

    chat.speakers.forEach(speaker => {

        const card = document.createElement("button");

        card.type = "button";
        card.className = "speakerCard";
        card.dataset.speakerId = speaker.id;

        if (speaker.id === selectedSpeakerId) {
            card.classList.add("selected");
        }

        const color = document.createElement("span");

        color.className = "speakerColor";
        color.style.backgroundColor = speaker.bubbleColor;

        const name = document.createElement("span");

        name.className = "speakerName";
        name.textContent = speaker.name;

        card.append(color, name);

        card.addEventListener("click", () => {
            selectSpeaker(speaker.id);
        });

        speakerList.appendChild(card);

    });

    if (isCreatingSpeakerDraft) {

        const draftCard =
            document.createElement(
                "button"
            );

        draftCard.type =
            "button";

        draftCard.className =
            "speakerCard speakerDraftCard selected";

        draftCard.disabled =
            true;

        const color =
            document.createElement(
                "span"
            );

        color.className =
            "speakerColor";

        const name =
            document.createElement(
                "span"
            );

        name.className =
            "speakerName";

        name.textContent =
            "이름 없음";

        draftCard.append(
            color,
            name
        );

        speakerList.appendChild(
            draftCard
        );

    }
    
    speakerList.appendChild(
        addSpeakerBtn
    );

}

// =========================================
// 화자 선택
// =========================================

function selectSpeaker(speakerId) {

    const chat = getSelectedChat();

    if (!chat) {
        return;
    }

    const speaker = chat.speakers.find(
        item => item.id === speakerId
    );

    if (!speaker) {
        return;
    }

    isCreatingSpeakerDraft =
        false;

    selectedSpeakerId = speaker.id;

    updateSpeakerDeleteButtonState();

    speakerName.value = speaker.name;
    speakerProfile.value = "";

    const selectedProfileType =
        (
            speaker.profileType === "square" ||
            speaker.profileType === "hidden"
        )
            ? speaker.profileType
            : "circle";

    speakerProfileType.forEach(
        radio => {
            radio.checked =
                radio.value ===
                selectedProfileType;
        }
    );

    setSpeakerProfileEditorPreview(
        speaker.profile || "",
        selectedProfileType
    );

    bubbleColor.value = speaker.bubbleColor || "#ffffff";
    updateSpeakerProfilePickerColor();
    bubbleTransparent.checked = Boolean(speaker.bubbleTransparent);
    textColor.value = speaker.textColor || "#000000";

    if (speakerNameColor) {
        speakerNameColor.value =
            speaker.nameColor ||
            "#888888";
    }

    speakerNotes.value =
    speaker.notes || "";

    document.querySelector(
        `input[name="speakerAlign"][value="${speaker.align}"]`
    ).checked = true;

    renderSpeakerList();

    speakerAlign.forEach(radio => {
        radio.checked = radio.value === speaker.align;
    });

    document.querySelectorAll(".speakerCard").forEach(card => {

        card.classList.toggle(
            "selected",
            card.dataset.speakerId === speaker.id
        );

    });

    if (
    typeof showInspectorSection ===
    "function"
) {
    showInspectorSection("speaker");
}

}

// =========================================
// 메시지 입력창의 화자 목록 갱신
// =========================================

function updateSpeakerSelect() {

    speakerSelect.innerHTML = "";

    const chat = getSelectedChat();

    if (!chat) {

        const option = document.createElement("option");

        option.value = "";
        option.textContent = "채팅방을 먼저 선택하세요.";

        speakerSelect.appendChild(option);
        speakerSelect.disabled = true;

        return;

    }

    if (chat.speakers.length === 0) {

        const option = document.createElement("option");

        option.value = "";
        option.textContent = "등장인물을 먼저 등록하세요.";

        speakerSelect.appendChild(option);
        speakerSelect.disabled = true;

        return;

    }

    speakerSelect.disabled = false;

    chat.speakers.forEach(speaker => {

        const option = document.createElement("option");

        option.value = speaker.id;
        option.textContent = speaker.name;

        speakerSelect.appendChild(option);

    });

}

// =========================================
// 프로필 편집 미리보기
// =========================================

function handleSpeakerProfilePreviewChange() {

    const file =
        speakerProfile?.files?.[0];

    if (!file) {
        return;
    }

    const reader =
        new FileReader();

    reader.addEventListener(
        "load",
        () => {

            const selectedType =
                document.querySelector(
                    'input[name="speakerProfileType"]:checked'
                )?.value ??
                "circle";

            setSpeakerProfileEditorPreview(
                String(
                    reader.result ||
                    ""
                ),
                selectedType
            );

        }
    );

    reader.readAsDataURL(
        file
    );

}

function updateSpeakerProfilePickerColor() {

    if (!speakerProfilePicker) {
        return;
    }

    speakerProfilePicker.style.backgroundColor =
        bubbleColor?.value ||
        "#f8faff";

}

function updateSpeakerProfilePickerShape() {

    const selectedType =
        document.querySelector(
            'input[name="speakerProfileType"]:checked'
        )?.value ??
        "circle";

    setSpeakerProfileEditorPreview(
        speakerProfilePreview?.src || "",
        selectedType
    );

}

function setSpeakerProfileEditorPreview(
    source,
    profileType
) {

    const normalizedType =
        (
            profileType === "square" ||
            profileType === "hidden"
        )
            ? profileType
            : "circle";

    if (speakerProfilePicker) {

        speakerProfilePicker
            .classList.toggle(
                "profileSquare",
                normalizedType === "square"
            );

        speakerProfilePicker
            .classList.toggle(
                "profileHidden",
                normalizedType === "hidden"
            );

    }

    const hasSource =
        Boolean(
            String(source || "")
        );

    if (speakerProfilePreview) {

        speakerProfilePreview.hidden =
            !hasSource;

        if (hasSource) {

            speakerProfilePreview.src =
                source;

        } else {

            speakerProfilePreview
                .removeAttribute(
                    "src"
                );

        }

    }

    if (speakerProfilePlaceholder) {

        speakerProfilePlaceholder.hidden =
            hasSource;

    }

}

// =========================================
// 이미지 파일을 문자열로 변환
// =========================================

function fileToDataUrl(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.addEventListener("load", () => {
            resolve(reader.result);
        });

        reader.addEventListener("error", () => {
            reject(new Error("프로필 이미지를 읽을 수 없습니다."));
        });

        reader.readAsDataURL(file);

    });

}