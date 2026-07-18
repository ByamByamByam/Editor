// =========================================
// Roll / CoC Text Syntax Card Engine
// =========================================

/*
    카드의 원본은 숨은 객체가 아니라 아래와 같은 일반 텍스트다.

    /coc 관찰 | 기준=50 | 어려움=25 | 극단=10 | 굴림=94 | 결과=실패
    /dice 2d10 | 굴림=7,3 | 결과값=7,3 | 합계=10

    따라서 가져오기 실패 시에도 사용자가 직접 문법을 작성할 수 있고,
    메시지를 다시 저장해도 카드 출력 형태가 풀리지 않는다.
*/

const ROLL_CARD_COMMANDS =
    new Set([
        "coc",
        "san",
        "attack",
        "luck",
        "dice",
        "madness"
    ]);

function escapeRollCardHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

function unquoteRollCardValue(
    value
) {

    const text =
        String(
            value ?? ""
        ).trim();

    if (
        (
            text.startsWith('"') &&
            text.endsWith('"')
        ) ||
        (
            text.startsWith("'") &&
            text.endsWith("'")
        )
    ) {
        return text.slice(
            1,
            -1
        );
    }

    return text;

}

function quoteRollCardValue(
    value
) {

    const text =
        String(
            value ?? ""
        )
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"');

    return `"${text}"`;

}

function splitRollCardParts(
    text
) {

    return String(
        text ?? ""
    )
        .replace(/\r\n?/g, "\n")
        .split(/\s*\|\s*|\n+/)
        .map(
            part =>
                part.trim()
        )
        .filter(Boolean);

}

function parseRollCardSyntax(
    text
) {

    const source =
        String(
            text ?? ""
        ).trim();

    const commandMatch =
        source.match(
            /^\/([a-z]+)\b/i
        );

    if (!commandMatch) {
        return null;
    }

    const command =
        commandMatch[1]
            .toLowerCase();

    if (
        !ROLL_CARD_COMMANDS.has(
            command
        )
    ) {
        return null;
    }

    const parts =
        splitRollCardParts(
            source
        );

    if (
        parts.length === 0
    ) {
        return null;
    }

    const firstPart =
        parts.shift();

    const firstMatch =
        firstPart.match(
            /^\/[a-z]+\b\s*(.*)$/i
        );

    const heading =
        unquoteRollCardValue(
            firstMatch?.[1] ||
            ""
        );

    const fields = {};

    parts.forEach(
        part => {

            const match =
                part.match(
                    /^([^=]+?)\s*=\s*(.*)$/
                );

            if (!match) {
                return;
            }

            fields[
                match[1].trim()
            ] =
                unquoteRollCardValue(
                    match[2]
                );

        }
    );

    return {
        command,
        heading,
        fields,
        source
    };

}

function getRollCardField(
    card,
    ...names
) {

    for (const name of names) {

        if (
            Object.prototype
                .hasOwnProperty
                .call(
                    card.fields,
                    name
                )
        ) {
            return card.fields[name];
        }

    }

    return "";

}

function splitRollCardList(
    value
) {

    return String(
        value ?? ""
    )
        .split(/\s*,\s*/)
        .map(
            item =>
                item.trim()
        )
        .filter(Boolean);

}

function normalizeRollCardResultKey(
    value
) {

    const text =
        String(
            value ?? ""
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
        /어려운|하드/i.test(
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

function createRollCardDiceValuesHtml(
    values
) {

    if (
        values.length === 0
    ) {
        return (
            `<span class="rollCardEmpty">` +
                `기록 없음` +
            `</span>`
        );
    }

    return (
        `<div class="rollCardDiceValues">` +
            values
                .map(
                    value =>
                        `<span class="rollCardDie">` +
                            `${escapeRollCardHtml(value)}` +
                        `</span>`
                )
                .join("") +
        `</div>`
    );

}

function createRollCardThresholdHtml(
    label,
    value
) {

    if (
        String(
            value ?? ""
        ).trim() === ""
    ) {
        return "";
    }

    return (
        `<span class="rollCardThreshold">` +
            `<small>${escapeRollCardHtml(label)}</small>` +
            `<strong>${escapeRollCardHtml(value)}</strong>` +
        `</span>`
    );

}

function createRollCardOutcomeRowsHtml(
    card
) {

    const modifiers =
        ["+2", "+1", "0", "-1", "-2"];

    const rows =
        modifiers
            .map(
                modifier => {

                    const raw =
                        getRollCardField(
                            card,
                            modifier
                        );

                    if (!raw) {
                        return "";
                    }

                    const slashIndex =
                        raw.indexOf("/");

                    const roll =
                        slashIndex >= 0
                            ? raw.slice(
                                0,
                                slashIndex
                            ).trim()
                            : "";

                    const result =
                        slashIndex >= 0
                            ? raw.slice(
                                slashIndex + 1
                            ).trim()
                            : raw.trim();

                    const resultKey =
                        normalizeRollCardResultKey(
                            result
                        );

                    return (
                        `<div class="rollCardOutcomeRow ${resultKey}">` +
                            `<strong class="rollCardOutcomeModifier">` +
                                `${escapeRollCardHtml(modifier)}` +
                            `</strong>` +
                            `<span class="rollCardOutcomeRoll">` +
                                `${escapeRollCardHtml(roll || "—")}` +
                            `</span>` +
                            `<span class="rollCardOutcomeResult">` +
                                `${escapeRollCardHtml(result || "기록 없음")}` +
                            `</span>` +
                        `</div>`
                    );

                }
            )
            .join("");

    if (!rows) {
        return "";
    }

    return (
        `<section class="rollCardSection">` +
            `<div class="rollCardSectionLabel">` +
                `보너스 · 패널티 판정 결과` +
            `</div>` +
            `<div class="rollCardOutcomeRows">` +
                `${rows}` +
            `</div>` +
        `</section>`
    );

}

function renderCocRollCard(
    card
) {

    const name =
        getRollCardField(
            card,
            "이름"
        ) ||
        card.heading ||
        (
            card.command === "san"
                ? "이성"
                : "판정"
        );

    const success =
        getRollCardField(
            card,
            "기준",
            "성공"
        );

    const hard =
        getRollCardField(
            card,
            "어려움"
        );

    const extreme =
        getRollCardField(
            card,
            "극단"
        );

    const rolls =
        splitRollCardList(
            getRollCardField(
                card,
                "굴림"
            )
        );

    const selected =
        getRollCardField(
            card,
            "선택"
        );

    const result =
        getRollCardField(
            card,
            "결과"
        );

    const damage =
        getRollCardField(
            card,
            "피해"
        );

    const titleSuffix =
        card.command === "attack"
            ? "공격 판정"
            : (
                card.command === "san"
                    ? "이성 판정"
                    : "판정"
            );

    const resultKey =
        normalizeRollCardResultKey(
            result
        );

    const damageHtml =
        damage
            ? (
                `<section class="rollCardSection rollCardDamageRow">` +
                    `<span class="rollCardSectionLabel">피해</span>` +
                    `<strong class="rollCardDamageValue">` +
                        `${escapeRollCardHtml(damage)}` +
                    `</strong>` +
                `</section>`
            )
            : "";

    return (
        `<div class="rollArchiveCard rollArchiveCheckCard">` +
            `<header class="rollCardHeader">` +
                `<strong class="rollCardTitle">` +
                    `${escapeRollCardHtml(name)} ${titleSuffix}` +
                `</strong>` +
                `<span class="rollCardSource">ROLL20</span>` +
            `</header>` +

            `<section class="rollCardSection">` +
                `<div class="rollCardSectionLabel">기준치</div>` +
                `<div class="rollCardThresholds">` +
                    `${createRollCardThresholdHtml("보통", success)}` +
                    `${createRollCardThresholdHtml("어려움", hard)}` +
                    `${createRollCardThresholdHtml("극단", extreme)}` +
                `</div>` +
            `</section>` +

            `<section class="rollCardSection">` +
                `<div class="rollCardSectionLabel">굴림</div>` +
                `${createRollCardDiceValuesHtml(rolls)}` +
            `</section>` +

            (
                result || selected
                    ? (
                        `<section class="rollCardSection rollCardResultRow">` +
                            `<span class="rollCardResultRoll">` +
                                (
                                    selected
                                        ? `선택 ${escapeRollCardHtml(selected)}`
                                        : `최종 ${escapeRollCardHtml(rolls[0] || "—")}`
                                ) +
                            `</span>` +
                            (
                                result
                                    ? (
                                        `<strong class="rollCardResultBadge ${resultKey}">` +
                                            `${escapeRollCardHtml(result)}` +
                                        `</strong>`
                                    )
                                    : ""
                            ) +
                        `</section>`
                    )
                    : ""
            ) +

            `${damageHtml}` +
            `${createRollCardOutcomeRowsHtml(card)}` +
        `</div>`
    );

}

function renderDiceRollCard(
    card
) {

    const expression =
        getRollCardField(
            card,
            "식"
        ) ||
        card.heading;

    const dice =
        splitRollCardList(
            getRollCardField(
                card,
                "굴림",
                "굴림값"
            )
        );

    const results =
        splitRollCardList(
            getRollCardField(
                card,
                "결과값"
            )
        );

    const total =
        getRollCardField(
            card,
            "합계"
        );

    return (
        `<div class="rollArchiveCard rollArchiveDiceCard">` +
            `<header class="rollCardHeader">` +
                `<strong class="rollCardTitle">주사위 굴림</strong>` +
                `<span class="rollCardSource">ROLL20</span>` +
            `</header>` +

            (
                expression
                    ? (
                        `<section class="rollCardSection">` +
                            `<div class="rollCardSectionLabel">주사위 식</div>` +
                            `<strong class="rollCardExpression">` +
                                `${escapeRollCardHtml(expression)}` +
                            `</strong>` +
                        `</section>`
                    )
                    : ""
            ) +

            `<section class="rollCardSection">` +
                `<div class="rollCardSectionLabel">굴림값</div>` +
                `${createRollCardDiceValuesHtml(dice)}` +
            `</section>` +

            `<section class="rollCardSection">` +
                `<div class="rollCardSectionLabel">결과값</div>` +
                `${createRollCardDiceValuesHtml(results.length ? results : dice)}` +
            `</section>` +

            (
                total
                    ? (
                        `<section class="rollCardSection rollCardTotalRow">` +
                            `<span class="rollCardSectionLabel">합계</span>` +
                            `<strong class="rollCardTotal">` +
                                `${escapeRollCardHtml(total)}` +
                            `</strong>` +
                        `</section>`
                    )
                    : ""
            ) +
        `</div>`
    );

}

function renderLuckRollCard(
    card
) {

    const result =
        getRollCardField(
            card,
            "결과"
        );

    const roll =
        getRollCardField(
            card,
            "굴림"
        );

    return (
        `<div class="rollArchiveCard rollArchiveLuckCard">` +
            `<header class="rollCardHeader">` +
                `<strong class="rollCardTitle">운 회복 판정</strong>` +
                `<span class="rollCardSource">ROLL20</span>` +
            `</header>` +
            `<section class="rollCardSection rollCardResultRow">` +
                `<span class="rollCardResultRoll">` +
                    `굴림 ${escapeRollCardHtml(roll || "—")}` +
                `</span>` +
                `<strong class="rollCardResultBadge ${normalizeRollCardResultKey(result)}">` +
                    `${escapeRollCardHtml(result || "기록 없음")}` +
                `</strong>` +
            `</section>` +
        `</div>`
    );

}

function renderMadnessRollCard(
    card
) {

    const mode =
        getRollCardField(
            card,
            "종류"
        );

    const resultName =
        getRollCardField(
            card,
            "결과"
        ) ||
        card.heading ||
        "광기의 발작";

    const description =
        getRollCardField(
            card,
            "내용"
        );

    const duration =
        getRollCardField(
            card,
            "지속"
        );

    const tableRoll =
        getRollCardField(
            card,
            "표"
        );

    const heading =
        mode === "실시간"
            ? "광기의 발작 - 실시간"
            : "광기의 발작 - 요약";

    return (
        `<div class="rollArchiveCard rollArchiveMadnessCard">` +
            `<header class="rollCardHeader rollCardMadnessHeader">` +
                `<strong class="rollCardTitle">` +
                    `${escapeRollCardHtml(heading)}` +
                `</strong>` +
            `</header>` +

            `<section class="rollCardMadnessName">` +
                `${escapeRollCardHtml(resultName)}` +
            `</section>` +

            (
                description
                    ? (
                        `<section class="rollCardMadnessText">` +
                            `${escapeRollCardHtml(description)}` +
                        `</section>`
                    )
                    : ""
            ) +

            `<section class="rollCardSection rollCardMadnessMeta">` +
                (
                    tableRoll
                        ? (
                            `<span>결과표 ${escapeRollCardHtml(tableRoll)}</span>`
                        )
                        : `<span></span>`
                ) +
                (
                    duration
                        ? (
                            `<span>` +
                                `${mode === "실시간" ? "지속 라운드" : "잠재 광기 지속시간"}: ` +
                                `<strong>${escapeRollCardHtml(duration)}</strong>` +
                            `</span>`
                        )
                        : ""
                ) +
            `</section>` +
        `</div>`
    );

}

function renderRollCardSyntax(
    cardOrText
) {

    const card =
        typeof cardOrText === "string"
            ? parseRollCardSyntax(
                cardOrText
            )
            : cardOrText;

    if (!card) {
        return "";
    }

    if (
        card.command === "dice"
    ) {
        return renderDiceRollCard(
            card
        );
    }

    if (
        card.command === "luck"
    ) {
        return renderLuckRollCard(
            card
        );
    }

    if (
        card.command === "madness"
    ) {
        return renderMadnessRollCard(
            card
        );
    }

    return renderCocRollCard(
        card
    );

}

function evaluateImportedCocResult(
    roll,
    success,
    hard,
    extreme
) {

    const value =
        Number(roll);

    const normal =
        Number(success);

    const hardValue =
        Number(hard);

    const extremeValue =
        Number(extreme);

    if (
        !Number.isFinite(value)
    ) {
        return "판정 불가";
    }

    if (value === 1) {
        return "대성공";
    }

    const fumbleThreshold =
        normal < 50
            ? 96
            : 100;

    if (
        value >=
        fumbleThreshold
    ) {
        return "대실패";
    }

    if (
        Number.isFinite(extremeValue) &&
        value <= extremeValue
    ) {
        return "극단적 성공";
    }

    if (
        Number.isFinite(hardValue) &&
        value <= hardValue
    ) {
        return "어려운 성공";
    }

    if (
        Number.isFinite(normal) &&
        value <= normal
    ) {
        return "보통 성공";
    }

    return "실패";

}

function getRoll20InlineTotal(
    message,
    index
) {

    const value =
        message
            ?.inlinerolls
            ?.[index]
            ?.results
            ?.total;

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    return value;

}

function extractRoll20TemplateField(
    content,
    fieldName
) {

    const escapedName =
        String(fieldName)
            .replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

    const match =
        String(content || "")
            .match(
                new RegExp(
                    `\\{\\{\\s*${escapedName}\\s*=\\s*([^}]*)\\}\\}`,
                    "i"
                )
            );

    return String(
        match?.[1] ||
        ""
    ).trim();

}

function extractRoll20IndexedField(
    content,
    fieldName
) {

    const value =
        extractRoll20TemplateField(
            content,
            fieldName
        );

    const match =
        value.match(
            /^\$\[\[(\d+)\]\]$/
        );

    return match
        ? Number(
            match[1]
        )
        : null;

}

function extractRoll20DiceResultsFromData(
    node
) {

    const values = [];

    function walk(
        value
    ) {

        if (
            !value ||
            typeof value !== "object"
        ) {
            return;
        }

        if (
            Array.isArray(
                value.results
            ) &&
            value.results.every(
                item =>
                    item &&
                    typeof item === "object" &&
                    Object.prototype
                        .hasOwnProperty
                        .call(
                            item,
                            "v"
                        )
            )
        ) {

            value.results.forEach(
                item => {

                    if (
                        item.v !== null &&
                        item.v !== undefined
                    ) {
                        values.push(
                            item.v
                        );
                    }

                }
            );

        }

        Object.values(
            value
        ).forEach(
            child => {

                if (
                    child &&
                    typeof child === "object"
                ) {
                    walk(child);
                }

            }
        );

    }

    walk(node);

    return values;

}

const ROLL20_MADNESS_RESULTS = {
    1: {
        name: "기억상실",
        text:
            "탐사자는 낯선 곳에서 정신을 차리며, 자기가 누구인지도 기억하지 못합니다. 시간이 지나면 기억이 조금씩 돌아옵니다."
    },
    2: {
        name: "강탈",
        text:
            "탐사자는 정신을 차렸을 때 중요한 소지품을 잃었거나 누군가에게 강탈당한 상태입니다."
    },
    3: {
        name: "구타",
        text:
            "탐사자는 정신을 차렸을 때 상처를 입고 지쳐 있습니다. 그동안 무슨 일이 있었는지는 분명하지 않습니다."
    },
    4: {
        name: "폭력",
        text:
            "탐사자는 광기의 발작 동안 사람이나 사물에 폭력적으로 행동합니다."
    },
    5: {
        name: "신념과 사상",
        text:
            "탐사자는 자신의 신념이나 사상에 극단적으로 집착하며 그에 따른 행동을 합니다."
    },
    6: {
        name: "중요한 사람",
        text:
            "탐사자는 중요한 사람을 찾아가거나 그 사람과 관련된 행동에 집착합니다."
    },
    7: {
        name: "시설 수용",
        text:
            "탐사자는 병원, 경찰서 또는 보호 시설에서 정신을 차립니다."
    },
    8: {
        name: "공황 도주",
        text:
            "탐사자는 가능한 한 멀리 달아나며 안전하다고 느낄 때까지 도주합니다."
    },
    9: {
        name: "공포증",
        text:
            "탐사자는 새로운 공포증을 얻고, 관련 대상에서 필사적으로 벗어나려 합니다."
    },
    10: {
        name: "광기",
        text:
            "탐사자는 새로운 집착이나 광기를 얻고, 그것에 따라 반복적으로 행동합니다."
    }
};

function buildImportedCocSyntax(
    message,
    command
) {

    const content =
        String(
            message.content ||
            ""
        );

    const name =
        extractRoll20TemplateField(
            content,
            "name"
        ) ||
        (
            command === "san"
                ? "SAN Roll"
                : "판정"
        );

    const successIndex =
        extractRoll20IndexedField(
            content,
            "success"
        );

    const hardIndex =
        extractRoll20IndexedField(
            content,
            "hard"
        );

    const extremeIndex =
        extractRoll20IndexedField(
            content,
            "extreme"
        );

    const success =
        getRoll20InlineTotal(
            message,
            successIndex
        );

    const hard =
        getRoll20InlineTotal(
            message,
            hardIndex
        );

    const extreme =
        getRoll20InlineTotal(
            message,
            extremeIndex
        );

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
            );

    const rolls =
        rollIndexes
            .map(
                index =>
                    getRoll20InlineTotal(
                        message,
                        index
                    )
            )
            .filter(
                value =>
                    value !== null
            );

    if (
        success === null ||
        rolls.length === 0
    ) {
        return null;
    }

    const parts = [
        `/${command} ${name}`,
        `기준=${success}`,
        `어려움=${hard ?? ""}`,
        `극단=${extreme ?? ""}`,
        `굴림=${rolls.join(",")}`
    ];

    const primaryResult =
        evaluateImportedCocResult(
            rolls[0],
            success,
            hard,
            extreme
        );

    parts.push(
        `결과=${primaryResult}`
    );

    if (
        rolls.length >= 3
    ) {

        const outcomes = [
            [
                "+2",
                Math.min(
                    ...rolls.slice(
                        0,
                        3
                    )
                )
            ],
            [
                "+1",
                Math.min(
                    ...rolls.slice(
                        0,
                        2
                    )
                )
            ],
            [
                "0",
                rolls[0]
            ],
            [
                "-1",
                Math.max(
                    ...rolls.slice(
                        0,
                        2
                    )
                )
            ],
            [
                "-2",
                Math.max(
                    ...rolls.slice(
                        0,
                        3
                    )
                )
            ]
        ];

        outcomes.forEach(
            ([modifier, roll]) => {

                parts.push(
                    `${modifier}=${roll}/` +
                    evaluateImportedCocResult(
                        roll,
                        success,
                        hard,
                        extreme
                    )
                );

            }
        );

    }

    const damageIndex =
        extractRoll20IndexedField(
            content,
            "damage"
        );

    const damage =
        getRoll20InlineTotal(
            message,
            damageIndex
        );

    if (
        damage !== null
    ) {
        parts.push(
            `피해=${damage}`
        );
    }

    return parts.join(
        " | "
    );

}

function buildImportedLuckSyntax(
    message
) {

    const content =
        String(
            message.content ||
            ""
        );

    const result =
        extractRoll20TemplateField(
            content,
            "txt"
        ) ||
        "기록 없음";

    const rollIndex =
        extractRoll20IndexedField(
            content,
            "roll"
        );

    const roll =
        getRoll20InlineTotal(
            message,
            rollIndex
        );

    if (
        roll === null
    ) {
        return null;
    }

    return (
        `/luck | 결과=${result}` +
        ` | 굴림=${roll}`
    );

}

function buildImportedMadnessSyntax(
    message
) {

    const template =
        String(
            message.rolltemplate ||
            ""
        ).toLowerCase();

    const isRealtime =
        template.includes(
            "bomadness-rt"
        );

    const resultNumber =
        Number(
            getRoll20InlineTotal(
                message,
                0
            )
        );

    const duration =
        getRoll20InlineTotal(
            message,
            3
        ) ??
        getRoll20InlineTotal(
            message,
            1
        );

    const tableRoll =
        getRoll20InlineTotal(
            message,
            2
        );

    const result =
        ROLL20_MADNESS_RESULTS[
            resultNumber
        ] || {
            name:
                `광기 결과 ${resultNumber || "—"}`,
            text:
                "Roll20 광기 카드에서 가져온 기록입니다."
        };

    return (
        `/madness ${result.name}` +
        ` | 종류=${isRealtime ? "실시간" : "요약"}` +
        ` | 결과=${quoteRollCardValue(result.name)}` +
        ` | 내용=${quoteRollCardValue(result.text)}` +
        ` | 지속=${duration ?? ""}` +
        ` | 표=${tableRoll ?? ""}`
    );

}

function buildImportedDiceSyntax(
    message
) {

    const expression =
        String(
            message.origRoll ||
            ""
        ).trim();

    let data = null;

    try {
        data =
            JSON.parse(
                String(
                    message.content ||
                    ""
                )
            );
    } catch (error) {
        data = null;
    }

    if (!data) {
        return null;
    }

    const dice =
        extractRoll20DiceResultsFromData(
            data
        );

    const total =
        data.total ??
        data.results?.total ??
        "";

    return (
        `/dice ${expression}` +
        ` | 굴림=${dice.join(",")}` +
        ` | 결과값=${dice.join(",")}` +
        (
            total !== ""
                ? ` | 합계=${total}`
                : ""
        )
    );

}

function createRoll20CardSyntax(
    message
) {

    const template =
        String(
            message.rolltemplate ||
            ""
        ).toLowerCase();

    const type =
        String(
            message.type ||
            ""
        ).toLowerCase();

    const content =
        String(
            message.content ||
            ""
        );

    let syntax = null;

    if (
        template.includes(
            "bomadness"
        )
    ) {

        syntax =
            buildImportedMadnessSyntax(
                message
            );

    } else if (
        template.includes(
            "coc-init-stc"
        ) &&
        /luck recovery/i.test(
            content
        )
    ) {

        syntax =
            buildImportedLuckSyntax(
                message
            );

    } else if (
        template.includes(
            "attack"
        ) &&
        /\{\{\s*damage\s*=/i.test(
            content
        )
    ) {

        syntax =
            buildImportedCocSyntax(
                message,
                "attack"
            );

    } else if (
        /\{\{\s*success\s*=/i.test(
            content
        ) &&
        /\{\{\s*roll1\s*=/i.test(
            content
        )
    ) {

        const name =
            extractRoll20TemplateField(
                content,
                "name"
            );

        syntax =
            buildImportedCocSyntax(
                message,
                /san roll/i.test(name)
                    ? "san"
                    : "coc"
            );

    } else if (
        type === "rollresult" ||
        type === "newroll" ||
        type === "gmrollresult"
    ) {

        syntax =
            buildImportedDiceSyntax(
                message
            );

    }

    if (!syntax) {
        return null;
    }

    const card =
        parseRollCardSyntax(
            syntax
        );

    if (!card) {
        return null;
    }

    return {
        syntax,
        card,
        html:
            renderRollCardSyntax(
                card
            )
    };

}
