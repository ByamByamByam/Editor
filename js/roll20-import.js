// =========================================
// Roll20 HTML Import
// =========================================

// ---------- DOM ----------

const importRoll20Btn =
    document.getElementById("importRoll20Btn");

const roll20FileInput =
    document.getElementById("roll20FileInput");

// =========================================
// 초기화
// =========================================

function initializeRoll20Import() {

    importRoll20Btn.addEventListener("click", () => {
        roll20FileInput.click();
    });

    roll20FileInput.addEventListener(
        "change",
        handleRoll20File
    );

    console.log("Roll20 Import Ready");

}

// =========================================
// 파일 선택
// =========================================

async function handleRoll20File(event) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    try {

        const html = await file.text();

        const roll20Messages =
            extractRoll20Messages(html);

        if (roll20Messages.length === 0) {
            throw new Error(
                "가져올 Roll20 메시지가 없습니다."
            );
        }

        const confirmed = confirm(
            `${roll20Messages.length}개의 메시지를 가져오시겠습니까?`
        );

        if (!confirmed) {
            return;
        }

        const chat =
            createChatFromRoll20(
                file.name,
                roll20Messages
            );

        project.chats.push(chat);

        renderChatList();
        selectChatRoom(chat.id);

        alert(
            `${roll20Messages.length}개의 메시지를 가져왔습니다.`
        );

        console.log(
            "Roll20 가져오기 완료",
            chat
        );

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Roll20 로그를 가져오지 못했습니다."
        );

    } finally {

        // 같은 파일을 다시 선택할 수 있도록 초기화
        roll20FileInput.value = "";

    }

}

// =========================================
// HTML에서 msgdata 추출
// =========================================

function extractRoll20Messages(html) {

    const match = html.match(
        /var\s+msgdata\s*=\s*"([^"]+)"/
    );

    if (!match) {
        throw new Error(
            "Roll20 메시지 데이터(msgdata)를 찾지 못했습니다."
        );
    }

    const base64Data = match[1];

    const jsonText =
        decodeBase64Utf8(base64Data);

    const decodedData =
        JSON.parse(jsonText);

    if (!Array.isArray(decodedData)) {
        throw new Error(
            "Roll20 메시지 데이터 형식이 올바르지 않습니다."
        );
    }

    const messages = [];

    decodedData.forEach(pageData => {

        if (
            !pageData ||
            typeof pageData !== "object"
        ) {
            return;
        }

        Object.entries(pageData).forEach(
            ([messageId, messageData]) => {

                messages.push({
                    id: messageId,
                    ...messageData
                });

            }
        );

    });

    messages.sort((a, b) => {

        const priorityA =
            Number(a[".priority"]) || 0;

        const priorityB =
            Number(b[".priority"]) || 0;

        return priorityA - priorityB;

    });

    return messages;

}

// =========================================
// Base64 UTF-8 해제
// =========================================

function decodeBase64Utf8(base64Data) {

    const binary = atob(base64Data);

    const bytes =
        Uint8Array.from(
            binary,
            character =>
                character.charCodeAt(0)
        );

    return new TextDecoder(
        "utf-8"
    ).decode(bytes);

}

// =========================================
// 새 채팅방 생성
// =========================================

function createChatFromRoll20(
    filename,
    roll20Messages
) {

    const chat = new ChatRoom();

    chat.title =
        removeHtmlExtension(filename);

    chat.description =
        "Roll20 채팅 로그에서 가져온 채팅방";

    chat.createdAt = new Date();

    const chapter = new Chapter();

    chapter.title = "가져온 로그";
    chapter.description =
        "Roll20 HTML에서 가져온 메시지";

    const speakerMap = new Map();

    roll20Messages.forEach(
        roll20Message => {

            const message =
                convertRoll20Message(
                    roll20Message,
                    chat,
                    speakerMap
                );

            if (message) {
                chapter.messages.push(message);
            }

        }
    );

    chat.chapters.push(chapter);

    return chat;

}

// =========================================
// 메시지 변환
// =========================================

function convertRoll20Message(
    roll20Message,
    chat,
    speakerMap
) {

    const roll20Type =
        String(
            roll20Message.type ||
            "general"
        );

    const who =
        String(
            roll20Message.who ||
            ""
        ).trim();

    const avatar =
        normalizeRoll20Avatar(
            roll20Message.avatar ||
            ""
        );

    const content =
        String(
            roll20Message.content ||
            ""
        );

    if (
        roll20Type === "error" ||
        roll20Type === "hidden"
    ) {
        return null;
    }

    const message =
        new Message();

    message.rawHtml =
        content;

    message.html =
        typeof parseRoll20StyledContent ===
            "function"
            ? parseRoll20StyledContent(
                content
            )
            : content;

    message.roll20Type =
        roll20Type;

    message.roll20MessageId =
        roll20Message.id ||
        "";

    message.createdAt =
        createRoll20MessageDate(
            roll20Message
        );

    /*
        Roll20 판정·주사위 카드는 먼저 표준 텍스트 문법으로 변환한다.

        - 일반 / 보너스 / 패널티 기능치
        - 이성 판정
        - 공격 및 피해
        - 운 회복
        - 광기의 발작
        - 일반 주사위

        이 문법이 메시지 입력창의 실제 원본이 된다.
    */
    const rollCard =
        typeof createRoll20CardSyntax ===
            "function"
            ? createRoll20CardSyntax(
                roll20Message
            )
            : null;

    if (rollCard) {

        const speaker =
            getOrCreateImportedSpeaker(
                chat,
                speakerMap,
                who,
                avatar
            );

        message.type =
            "rollcard";

        message.speakerId =
            speaker?.id ||
            "";

        message.rawHtml =
            rollCard.syntax;

        message.html =
            rollCard.html;

        message.roll20RollData =
            "";

        message.roll20RollExpression =
            "";

        message.cocCheckData =
            null;

        return message;

    }

    /*
        이전 프로젝트 호환용 CoC 판정 템플릿
    */
    const cocCheckData =
        parseRoll20CocCheck(
            roll20Message
        );

    if (cocCheckData) {

        const speaker =
            getOrCreateImportedSpeaker(
                chat,
                speakerMap,
                who,
                avatar
            );

        message.type =
            "coccheck";

        message.speakerId =
            speaker?.id ||
            "";

        message.cocCheckData =
            cocCheckData;

        message.rawHtml =
            content;

        message.html =
            createCocCheckCardHtml(
                cocCheckData
            );

        return message;

    }

    /*
        장면 설명
    */
    if (roll20Type === "desc") {

        message.type =
            "desc";

        message.speakerId =
            "";

        message.speakerOverride =
            "";

        return message;

    }

    /*
        시스템
    */
    if (
        roll20Type === "system" ||
        roll20Type === "news"
    ) {

        message.type =
            "system";

        message.speakerId =
            "";

        return message;

    }

    /*
        감정 표현

        일반 /em은 프로필이 있고,
        /emas는 프로필 없이 이름만 지정되는
        Roll20 로그 구조를 기준으로 구분한다.
    */
    if (roll20Type === "emote") {

        if (avatar && who) {

            const speaker =
                getOrCreateImportedSpeaker(
                    chat,
                    speakerMap,
                    who,
                    avatar
                );

            message.type =
                "em";

            message.speakerId =
                speaker?.id ||
                "";

        } else {

            message.type =
                "emas";

            message.speakerOverride =
                who;

            message.speakerId =
                "";

        }

        return message;

    }

    /*
        공개 주사위
    */
    if (
        roll20Type === "rollresult" ||
        roll20Type === "newroll"
    ) {

        const speaker =
            getOrCreateImportedSpeaker(
                chat,
                speakerMap,
                who,
                avatar
            );

                message.type =
            "roll";

        message.speakerId =
            speaker?.id ||
            "";

        message.roll20RollData =
            content;

        message.roll20RollExpression =
            String(
                roll20Message.origRoll ||
                ""
            ).trim();

        /*
            편집창에는 JSON이 아니라
            사람이 읽을 수 있는 명령어를 표시한다.
        */
        message.rawHtml =
            `/r ${message.roll20RollExpression}`
                .trim();

        message.html =
            createImportedRollResultHtml(
                roll20Message,
                false
            );

        return message;

    }

    /*
        GM 전용 주사위
    */
    if (
        roll20Type === "gmrollresult"
    ) {

        const speaker =
            getOrCreateImportedSpeaker(
                chat,
                speakerMap,
                who,
                avatar
            );

                message.type =
            "gmroll";

        message.speakerId =
            speaker?.id ||
            "";

        message.roll20RollData =
            content;

        message.roll20RollExpression =
            String(
                roll20Message.origRoll ||
                ""
            ).trim();

        /*
            GM 주사위도 JSON 대신
            사람이 읽을 수 있는 명령어를 표시한다.
        */
        message.rawHtml =
            `/gmroll ${message.roll20RollExpression}`
                .trim();

        message.html =
            createImportedRollResultHtml(
                roll20Message,
                true
            );

        return message;

    }

    /*
        귓속말
    */
    if (
        roll20Type === "whisper" ||
        roll20Type === "whispersent" ||
        roll20Type === "whisperreceived"
    ) {

        const speaker =
            getOrCreateImportedSpeaker(
                chat,
                speakerMap,
                who,
                avatar
            );

        const targetName =
            String(
                roll20Message.target_name ||
                roll20Message.targetName ||
                roll20Message.target ||
                ""
            ).trim();

        message.type =
            "whisper";

        message.speakerId =
            speaker?.id ||
            "";

        const whisperLabel =
            targetName
                ? `(To ${targetName})`
                : "(Whisper)";

        message.html =
            `<span class="messageCommandMeta">` +
            `${escapeRoll20ImportText(whisperLabel)}` +
            `</span>` +
            (
                typeof parseRoll20StyledContent ===
                    "function"
                    ? parseRoll20StyledContent(
                        content
                    )
                    : content
            );

        return message;

    }

    /*
        일반 대화
    */
    if (
        roll20Type === "general" ||
        roll20Type === "direct"
    ) {

        if (who) {

            const speaker =
                getOrCreateImportedSpeaker(
                    chat,
                    speakerMap,
                    who,
                    avatar
                );

            message.type =
                "chat";

            message.speakerId =
                speaker?.id ||
                "";

        } else {

            message.type =
                "system";

            message.speakerId =
                "";

        }

        return message;

    }

    message.type =
        "system";

    message.speakerOverride =
        who;

    return message;

}

// =========================================
// Roll20 CoC 판정 파싱
// =========================================

function parseRoll20CocCheck(
    roll20Message
) {

    const content =
        String(
            roll20Message.content ||
            ""
        );

    const rollTemplate =
        String(
            roll20Message.rolltemplate ||
            ""
        ).toLowerCase();

    if (
        !/\{\{\s*success\s*=\s*\$\[\[0\]\]\s*\}\}/i
            .test(
                content
            ) ||
        !(
            rollTemplate.includes(
                "coc"
            ) ||
            /\{\{\s*extreme\s*=/i.test(
                content
            )
        )
    ) {
        return null;
    }

    const inlineRolls =
        Array.isArray(
            roll20Message.inlinerolls
        )
            ? roll20Message.inlinerolls
            : [];

    const getInlineTotal =
        index => {

            const value =
                inlineRolls[index]
                    ?.results
                    ?.total;

            return Number.isFinite(
                Number(value)
            )
                ? Number(value)
                : null;

        };

    const nameMatch =
        content.match(
            /\{\{\s*name\s*=\s*([^}]*)\}\}/i
        );

    const name =
        String(
            nameMatch?.[1] ||
            "판정"
        ).trim() ||
        "판정";

    const success =
        getInlineTotal(
            0
        );

    const hard =
        getInlineTotal(
            1
        );

    const extreme =
        getInlineTotal(
            2
        );

    const damageMatch =
        content.match(
            /\{\{\s*damage\s*=\s*\$\[\[(\d+)\]\]\s*\}\}/i
        );

    const damage =
        damageMatch
            ? getInlineTotal(
                Number(
                    damageMatch[1]
                )
            )
            : null;

    if (
        success === null
    ) {
        return null;
    }

    const rollIndexes =
        Array.from(
            content.matchAll(
                /\{\{\s*roll\d+\s*=\s*\$\[\[(\d+)\]\]\s*\}\}/gi
            )
        )
            .map(
                match =>
                    Number(
                        match[1]
                    )
            )
            .filter(
                Number.isFinite
            );

    const rolls =
        rollIndexes
            .map(
                getInlineTotal
            )
            .filter(
                value =>
                    value !== null
            );

    if (
        rolls.length === 0
    ) {
        return null;
    }

    return buildCocCheckData({
        source:
            "Roll20",

        name,

        success,

        hard:
            hard ??
            Math.floor(
                success / 2
            ),

        extreme:
            extreme ??
            Math.floor(
                success / 5
            ),

        rolls,
        damage
    });

}

function buildCocCheckData({
    source,
    name,
    success,
    hard,
    extreme,
    rolls,
    modifier = null,
    resultText = "",
    damage = null
}) {

    const normalizedRolls =
        rolls
            .map(Number)
            .filter(
                Number.isFinite
            );

    const mainRoll =
        normalizedRolls[0];

    const outcomes =
        normalizedRolls.length >= 3
            ? [
                {
                    modifier: "+2",
                    roll: Math.min(
                        ...normalizedRolls.slice(
                            0,
                            3
                        )
                    )
                },
                {
                    modifier: "+1",
                    roll: Math.min(
                        ...normalizedRolls.slice(
                            0,
                            2
                        )
                    )
                },
                {
                    modifier: "0",
                    roll: normalizedRolls[0]
                },
                {
                    modifier: "-1",
                    roll: Math.max(
                        ...normalizedRolls.slice(
                            0,
                            2
                        )
                    )
                },
                {
                    modifier: "-2",
                    roll: Math.max(
                        ...normalizedRolls.slice(
                            0,
                            3
                        )
                    )
                }
            ]
            : (
                modifier !== null &&
                mainRoll !== undefined
                    ? [
                        {
                            modifier:
                                String(
                                    modifier
                                ),
                            roll:
                                mainRoll
                        }
                    ]
                    : []
            );

    outcomes.forEach(
        outcome => {

            const result =
                evaluateCocCheck(
                    outcome.roll,
                    success,
                    hard,
                    extreme
                );

            outcome.resultKey =
                result.key;

            outcome.resultLabel =
                result.label;

        }
    );

    const evaluated =
        evaluateCocCheck(
            mainRoll,
            success,
            hard,
            extreme
        );

    return {
        source,
        name,
        success,
        hard,
        extreme,
        rolls:
            normalizedRolls,
        mainRoll,
        resultKey:
            resultText
                ? normalizeCocResultKey(
                    resultText
                )
                : evaluated.key,
        resultLabel:
            resultText ||
            evaluated.label,
        outcomes,
        damage:
            damage !== null &&
            damage !== undefined &&
            damage !== ""
                ? Number(damage)
                : null
    };

}

function evaluateCocCheck(
    roll,
    success,
    hard,
    extreme
) {

    const value =
        Number(roll);

    if (!Number.isFinite(value)) {
        return {
            key: "failure",
            label: "판정 불가"
        };
    }

    if (value === 1) {
        return {
            key: "critical",
            label: "대성공"
        };
    }

    const fumbleThreshold =
        Number(success) < 50
            ? 96
            : 100;

    if (
        value >=
        fumbleThreshold
    ) {
        return {
            key: "fumble",
            label: "대실패"
        };
    }

    if (
        value <=
        Number(extreme)
    ) {
        return {
            key: "extreme",
            label: "극단적 성공"
        };
    }

    if (
        value <=
        Number(hard)
    ) {
        return {
            key: "hard",
            label: "어려운 성공"
        };
    }

    if (
        value <=
        Number(success)
    ) {
        return {
            key: "success",
            label: "보통 성공"
        };
    }

    return {
        key: "failure",
        label: "실패"
    };

}

function normalizeCocResultKey(
    resultText
) {

    const text =
        String(
            resultText ||
            ""
        );

    if (
        /대실패|펌블/i.test(
            text
        )
    ) {
        return "fumble";
    }

    if (
        /대성공|크리티컬/i.test(
            text
        )
    ) {
        return "critical";
    }

    if (
        /극단/i.test(
            text
        )
    ) {
        return "extreme";
    }

    if (
        /어려운/i.test(
            text
        )
    ) {
        return "hard";
    }

    if (
        /성공/i.test(
            text
        )
    ) {
        return "success";
    }

    return "failure";

}

function createCocCheckCardHtml(
    data
) {

    const escape =
        typeof escapeRoll20ImportText ===
            "function"
            ? escapeRoll20ImportText
            : value =>
                String(value || "")
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");

    const thresholds = [
        ["보통", data.success],
        ["어려움", data.hard],
        ["극단", data.extreme]
    ]
        .map(
            ([label, value]) =>
                `<span class="cocThreshold">` +
                    `<small>${escape(label)}</small>` +
                    `${escape(value)}` +
                `</span>`
        )
        .join("");

    const dice =
        data.rolls
            .map(
                value =>
                    `<span class="cocRollDie">` +
                        `${escape(value)}` +
                    `</span>`
            )
            .join("");

    const damageHtml =
        data.damage !== null &&
        data.damage !== undefined
            ? (
                `<div class="cocCheckSection cocDamageRow">` +
                    `<span class="cocCheckSectionLabel">피해</span>` +
                    `<strong class="cocDamageValue">` +
                        `${escape(data.damage)}` +
                    `</strong>` +
                `</div>`
            )
            : "";

    const outcomeRows =
        Array.isArray(
            data.outcomes
        ) &&
        data.outcomes.length > 0
            ? (
                `<div class="cocCheckSection">` +
                    `<div class="cocCheckSectionLabel">` +
                        `보너스 · 패널티 결과` +
                    `</div>` +
                    `<div class="cocOutcomeRows">` +
                        data.outcomes
                            .map(
                                outcome =>
                                    `<div class="cocOutcomeRow ${escape(outcome.resultKey)}">` +
                                        `<span class="cocOutcomeModifier">${escape(outcome.modifier)}</span>` +
                                        `<span class="cocOutcomeRoll">${escape(outcome.roll)}</span>` +
                                        `<span class="cocOutcomeLabel">${escape(outcome.resultLabel)}</span>` +
                                    `</div>`
                            )
                            .join("") +
                    `</div>` +
                `</div>`
            )
            : "";

    return (
        `<div class="cocCheckCard">` +
            `<div class="cocCheckHeader">` +
                `<strong class="cocCheckTitle">` +
                    `${escape(data.name)} 판정` +
                `</strong>` +
                `<span class="cocCheckSource">` +
                    `${escape(data.source)}` +
                `</span>` +
            `</div>` +
            `<div class="cocCheckSection">` +
                `<div class="cocCheckSectionLabel">기준치</div>` +
                `<div class="cocThresholds">${thresholds}</div>` +
            `</div>` +
            `<div class="cocCheckSection">` +
                `<div class="cocCheckSectionLabel">굴림</div>` +
                `<div class="cocRollValues">${dice}</div>` +
            `</div>` +
            `<div class="cocCheckSection cocResultSummary">` +
                `<span class="cocResultRoll">` +
                    `최종 ${escape(data.mainRoll)}` +
                `</span>` +
                `<span class="cocResultBadge ${escape(data.resultKey)}">` +
                    `${escape(data.resultLabel)}` +
                `</span>` +
            `</div>` +
            `${damageHtml}` +
            `${outcomeRows}` +
        `</div>`
    );

}

// =========================================
// Roll20 주사위 결과 HTML
// =========================================

function createImportedRollResultHtml(
    roll20Message,
    isGmRoll,
    customExpressionHtml = ""
) {

    const expression =
        String(
            roll20Message.origRoll ||
            ""
        ).trim();

    const rawContent =
        String(
            roll20Message.content ||
            ""
        );

    let rollData = null;

    try {
        rollData =
            JSON.parse(
                rawContent
            );
    } catch (error) {
        rollData = null;
    }

    const label =
        isGmRoll
            ? "GM ROLL"
            : "ROLL";

    const expressionContent =
        customExpressionHtml ||
        (
            expression
                ? escapeRoll20ImportText(
                    expression
                )
                : ""
        );

    const diceResults =
        Array.isArray(
            rollData?.editableDice
        )
            ? rollData.editableDice
            : extractImportedDiceResults(
                rollData
            );

    const resultValues =
        Array.isArray(
            rollData?.editableResults
        )
            ? rollData.editableResults
            : diceResults;

    const total =
        rollData?.editableTotal ??
        rollData?.total ??
        null;

    const valuesHtml =
        values =>
            values.length > 0
                ? (
                    `<div class="rollResultValues">` +
                        values.map(
                            value =>
                                `<span class="rollResultValue">` +
                                    `${escapeRoll20ImportText(value)}` +
                                `</span>`
                        ).join("") +
                    `</div>`
                )
                : `<span class="rollFallback">없음</span>`;

    const expressionHtml =
        expressionContent
            ? (
                `<div class="rollResultSection">` +
                    `<div class="rollResultSectionTitle">주사위 굴림</div>` +
                    `<div class="rollExpression">` +
                        `${expressionContent}` +
                    `</div>` +
                `</div>`
            )
            : "";

    const diceHtml =
        `<div class="rollResultSection">` +
            `<div class="rollResultSectionTitle">굴림값</div>` +
            `${valuesHtml(diceResults)}` +
        `</div>`;

    const resultsHtml =
        `<div class="rollResultSection">` +
            `<div class="rollResultSectionTitle">결과값</div>` +
            `${valuesHtml(resultValues)}` +
        `</div>`;

    const totalHtml =
        total !== null &&
        total !== undefined &&
        total !== ""
            ? (
                `<div class="rollResultSection rollTotalRow">` +
                    `<span class="rollResultSectionTitle">합계</span>` +
                    `<strong class="rollTotal">` +
                        `${escapeRoll20ImportText(total)}` +
                    `</strong>` +
                `</div>`
            )
            : "";

    return (
        `<div class="rollResult">` +
            `<div class="rollLabel">${label}</div>` +
            `${expressionHtml}` +
            `${diceHtml}` +
            `${resultsHtml}` +
            `${totalHtml}` +
        `</div>`
    );

}

function extractImportedDiceResults(
    rollData
) {

    if (
        !rollData ||
        !Array.isArray(
            rollData.rolls
        )
    ) {
        return [];
    }

    const values = [];

    rollData.rolls.forEach(
        rollPart => {

            /*
                R은 실제 주사위 묶음이다.

                예:
                {
                    type: "R",
                    dice: 2,
                    sides: 10,
                    results: [
                        { v: 7 },
                        { v: 3 }
                    ]
                }
            */
            if (
                !rollPart ||
                rollPart.type !== "R" ||
                !Array.isArray(
                    rollPart.results
                )
            ) {
                return;
            }

            rollPart.results.forEach(
                result => {

                    if (
                        !result ||
                        result.v === undefined ||
                        result.v === null
                    ) {
                        return;
                    }

                    values.push(
                        String(result.v)
                    );

                }
            );

        }
    );

    return values;

}


function escapeRoll20ImportText(
    value
) {

    const element =
        document.createElement(
            "div"
        );

    element.textContent =
        String(value);

    return element.innerHTML;

}



// =========================================
// 가져온 화자 생성
// =========================================

function getOrCreateImportedSpeaker(
    chat,
    speakerMap,
    name,
    avatar
) {

    if (!name) {
        return null;
    }

    const key =
        `${name}::${avatar}`;

    if (speakerMap.has(key)) {
        return speakerMap.get(key);
    }

    const speaker = new Speaker();

    speaker.name = name;
    speaker.profile = avatar;

    speaker.bubbleColor = "#ffffff";
    speaker.textColor = "#000000";
    speaker.align = "left";

    chat.speakers.push(speaker);
    speakerMap.set(key, speaker);

    return speaker;

}

// =========================================
// Roll20 프로필 주소 정리
// =========================================

function normalizeRoll20Avatar(value) {

    const avatar = String(value).trim();

    if (!avatar) {
        return "";
    }

    /*
    Roll20 내부 사용자 프로필은
    외부 사이트에서 CORS/403으로 차단된다.

    깨진 주소를 저장하지 않고
    프로필 없는 등장인물로 가져온다.
    */
    if (
        /^\/users\/avatar\//i.test(
            avatar
        )
    ) {
        return "";
    }

    if (
        avatar.startsWith("http://") ||
        avatar.startsWith("https://") ||
        avatar.startsWith("data:")
    ) {
        return avatar;
    }

    if (avatar.startsWith("/")) {
        return `https://app.roll20.net${avatar}`;
    }

    return avatar;

}

// =========================================
// 메시지 시간
// =========================================

function createRoll20MessageDate(
    roll20Message
) {

    const priority =
        Number(
            roll20Message[".priority"]
        );

    if (!Number.isFinite(priority)) {
        return new Date();
    }

    /*
        일부 로그는 밀리초 타임스탬프를,
        일부 오래된 로그는 정렬값을 사용한다.
    */

    if (priority > 1000000000000) {
        return new Date(priority);
    }

    return new Date();

}

// =========================================
// 파일명 정리
// =========================================

function removeHtmlExtension(filename) {

    return filename.replace(
        /\.html?$/i,
        ""
    );

}