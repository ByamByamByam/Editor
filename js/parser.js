// =========================================
// Roll20 Command Parser
// =========================================

function parseMessageCommand(
    rawHtml,
    plainText
) {

    const text =
        plainText.trim();

    const result = {
        type: "chat",
        speakerOverride: "",
        html: rawHtml,
        rawHtml: rawHtml
    };

    /*
        판정·주사위 전용 텍스트 문법.

        입력창의 텍스트 자체가 원본이며,
        저장할 때마다 같은 문법을 카드 HTML로 렌더링한다.
    */
    if (
        typeof parseRollCardSyntax ===
            "function"
    ) {

        const rollCard =
            parseRollCardSyntax(
                text
            );

        if (rollCard) {

            result.type =
                "rollcard";

            result.rawHtml =
                text;

            result.html =
                renderRollCardSyntax(
                    rollCard
                );

            return result;

        }

    }

    /*
        일반 메시지
    */
    if (!text.startsWith("/")) {

        result.html =
            parseRoll20StyledContent(
                result.html
            );

        return result;

    }

    /*
        /desc
    */
    const descMatch =
        text.match(
            /^\/desc(?:\s+|$)/i
        );

    if (descMatch) {

        result.type =
            "desc";

        result.html =
            removeLeadingTextFromHtml(
                rawHtml,
                descMatch[0].length
            );

        result.html =
            parseRoll20StyledContent(
                result.html
            );

        return result;

    }

    /*
        /em
    */
    const emMatch =
        text.match(
            /^\/em(?:\s+|$)/i
        );

    if (emMatch) {

        result.type =
            "em";

        result.html =
            removeLeadingTextFromHtml(
                rawHtml,
                emMatch[0].length
            );

        result.html =
            parseRoll20StyledContent(
                result.html
            );

        return result;

    }

    /*
        /emas "화자 이름" 내용
        /emas 화자 내용
    */
    const emasMatch =
        text.match(
            /^\/emas\s+(?:"([^"]+)"|(\S+))(?:\s+|$)/i
        );

    if (emasMatch) {

        result.type =
            "emas";

        result.speakerOverride =
            emasMatch[1] ||
            emasMatch[2] ||
            "";

        result.html =
            removeLeadingTextFromHtml(
                rawHtml,
                emasMatch[0].length
            );

        result.html =
            parseRoll20StyledContent(
                result.html
            );

        return result;

    }

        /*
        /roll, /r
    */
    const rollMatch =
        text.match(
            /^\/(?:roll|r)(?:\s+|$)/i
        );

    if (rollMatch) {

        result.type =
            "roll";

        result.html =
            removeLeadingTextFromHtml(
                rawHtml,
                rollMatch[0].length
            );

        result.html =
            parseRoll20StyledContent(
                result.html
            );

        return result;

    }

    /*
        /gm, /gmroll, /gr
    */
    const gmRollMatch =
        text.match(
            /^\/(?:gm|gmroll|gr)(?:\s+|$)/i
        );

    if (gmRollMatch) {

        result.type =
            "gmroll";

        result.html =
            removeLeadingTextFromHtml(
                rawHtml,
                gmRollMatch[0].length
            );

        result.html =
            parseRoll20StyledContent(
                result.html
            );

        return result;

    }

    /*
        /w "대상 이름" 내용
        /w 대상 내용
    */
    const whisperMatch =
        text.match(
            /^\/w\s+(?:"([^"]+)"|(\S+))(?:\s+|$)/i
        );

    if (whisperMatch) {

        const targetName =
            whisperMatch[1] ||
            whisperMatch[2] ||
            "";

        result.type =
            "whisper";

        result.html =
            removeLeadingTextFromHtml(
                rawHtml,
                whisperMatch[0].length
            );

        result.html =
            parseRoll20StyledContent(
                result.html
            );

        result.html =
            `<span class="messageCommandMeta">` +
            `(To ${escapeRoll20Html(targetName)})` +
            `</span>` +
            result.html;

        return result;

    }

    /*
        /as "화자 이름" 내용
        /as 화자 내용
    */
    const asMatch =
        text.match(
            /^\/as\s+(?:"([^"]+)"|(\S+))(?:\s+|$)/i
        );

    if (asMatch) {

        result.type =
            "as";

        result.speakerOverride =
            asMatch[1] ||
            asMatch[2] ||
            "";

        result.html =
            removeLeadingTextFromHtml(
                rawHtml,
                asMatch[0].length
            );

        result.html =
            parseRoll20StyledContent(
                result.html
            );

        return result;

    }

    /*
        알 수 없는 명령어는
        일반 메시지로 유지한다.
    */
    result.html =
        parseRoll20StyledContent(
            result.html
        );

    return result;

}

// =========================================
// HTML 앞부분의 텍스트 제거
// =========================================

function removeLeadingTextFromHtml(html, removeLength) {

    const container = document.createElement("div");

    container.innerHTML = html;

    let remaining = removeLength;

    const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT
    );

    const textNodes = [];

    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }

    for (const node of textNodes) {

        if (remaining <= 0) {
            break;
        }

        const length = node.nodeValue.length;

        if (length <= remaining) {

            remaining -= length;
            node.nodeValue = "";

        } else {

            node.nodeValue =
                node.nodeValue.slice(remaining);

            remaining = 0;

        }

    }

    return cleanParsedHtml(container.innerHTML);

}

// =========================================
// 파싱 결과 HTML 정리
// =========================================

function cleanParsedHtml(html) {

    return html
        .replace(/^(?:\s|&nbsp;|<br\s*\/?>)+/gi, "")
        .replace(/(?:\s|&nbsp;|<br\s*\/?>)+$/gi, "")
        .trim();

}

// =========================================
// Roll20 스타일 문법 변환
// =========================================

function parseRoll20StyledContent(
    sourceHtml
) {

    if (!sourceHtml) {
        return "";
    }

    /*
        contenteditable에서 생성된 HTML은 유지하되,
        텍스트 노드 안에 들어 있는 Roll20 문법만 변환한다.
    */
    const container =
        document.createElement(
            "div"
        );

    container.innerHTML =
        sourceHtml;

    const walker =
        document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT
        );

    const textNodes = [];

    while (walker.nextNode()) {

        textNodes.push(
            walker.currentNode
        );

    }

    textNodes.forEach(node => {

        const text =
            node.nodeValue;

        if (!text) {
            return;
        }

        const containsRoll20Markup =
            text.includes("[");

        const containsImageUrl =
            /https?:\/\/[^\s<>"']+\.(?:png|jpe?g|gif|webp|svg)(?:[?#][^\s<>"']*)?/i
                .test(text);

        if (
            !containsRoll20Markup &&
            !containsImageUrl
        ) {
            return;
        }

        let convertedHtml =
            convertRoll20MarkupText(
                text
            );

        if (convertedHtml === null) {

            convertedHtml =
                convertRoll20BareImageUrls(
                    text
                );

        }

        if (convertedHtml === null) {
            return;
        }

        const fragmentContainer =
            document.createElement(
                "span"
            );

        fragmentContainer.innerHTML =
            convertedHtml;

        node.replaceWith(
            ...fragmentContainer.childNodes
        );

    });

    applyInlineEmphasisMarkup(
        container
    );

    return container.innerHTML;

}


// =========================================
// 별표 강조 문법 변환
// =========================================

function applyInlineEmphasisMarkup(
    container
) {

    const walker =
        document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT
        );

    const textNodes = [];

    while (walker.nextNode()) {

        const node =
            walker.currentNode;

        const parentTag =
            node.parentElement
                ?.tagName
                ?.toLowerCase();

        if (
            parentTag === "strong" ||
            parentTag === "em" ||
            parentTag === "code" ||
            parentTag === "style" ||
            parentTag === "script"
        ) {
            continue;
        }

        textNodes.push(
            node
        );

    }

    textNodes.forEach(
        node => {

            replaceInlineEmphasisTextNode(
                node
            );

        }
    );

}

function replaceInlineEmphasisTextNode(
    textNode
) {

    const text =
        String(
            textNode.nodeValue ||
            ""
        );

    if (!text.includes("*")) {
        return;
    }

    const pattern =
        /\*\*\*([^\n*]+?)\*\*\*|\*\*([^\n*]+?)\*\*|\*([^\n*]+?)\*/g;

    let match;
    let lastIndex = 0;
    let hasMatch = false;

    const fragment =
        document.createDocumentFragment();

    while (
        (
            match =
                pattern.exec(
                    text
                )
        ) !== null
    ) {

        hasMatch = true;

        if (
            match.index >
            lastIndex
        ) {

            fragment.appendChild(
                document.createTextNode(
                    text.slice(
                        lastIndex,
                        match.index
                    )
                )
            );

        }

        if (
            match[1] !==
                undefined
        ) {

            const strong =
                document.createElement(
                    "strong"
                );

            const emphasis =
                document.createElement(
                    "em"
                );

            emphasis.textContent =
                match[1];

            strong.appendChild(
                emphasis
            );

            fragment.appendChild(
                strong
            );

        } else if (
            match[2] !==
                undefined
        ) {

            const strong =
                document.createElement(
                    "strong"
                );

            strong.textContent =
                match[2];

            fragment.appendChild(
                strong
            );

        } else {

            const emphasis =
                document.createElement(
                    "em"
                );

            emphasis.textContent =
                match[3];

            fragment.appendChild(
                emphasis
            );

        }

        lastIndex =
            pattern.lastIndex;

    }

    if (!hasMatch) {
        return;
    }

    if (
        lastIndex <
        text.length
    ) {

        fragment.appendChild(
            document.createTextNode(
                text.slice(
                    lastIndex
                )
            )
        );

    }

    textNode.replaceWith(
        fragment
    );

}


// =========================================
// 텍스트 안의 Roll20 링크 문법 변환
// =========================================

function convertRoll20MarkupText(
    text
) {

    const roll20LinkPattern =
        /\[([^\]]*)\]\(([^)]*)\)/g;

    let hasMatch = false;
    let lastIndex = 0;

    const parts = [];

    let match;

    while (
        (
            match =
                roll20LinkPattern.exec(
                    text
                )
        ) !== null
    ) {

        hasMatch = true;

        const beforeText =
            text.slice(
                lastIndex,
                match.index
            );

        parts.push(
            escapeRoll20Html(
                beforeText
            )
        );

        const label =
            match[1];

        const destination =
            decodeRoll20Entities(
                match[2]
            );

        parts.push(
            convertRoll20Link(
                label,
                destination
            )
        );

        lastIndex =
            roll20LinkPattern.lastIndex;

    }

    if (!hasMatch) {
        return null;
    }

    parts.push(
        escapeRoll20Html(
            text.slice(lastIndex)
        )
    );

    return parts.join("");

}


// =========================================
// 텍스트 안의 이미지 주소 변환
// =========================================

function convertRoll20BareImageUrls(
    text
) {

    const imageUrlPattern =
        /https?:\/\/[^\s<>"']+\.(?:png|jpe?g|gif|webp|svg)(?:[?#][^\s<>"']*)?/gi;

    let hasMatch = false;
    let lastIndex = 0;

    const parts = [];

    let match;

    while (
        (
            match =
                imageUrlPattern.exec(text)
        ) !== null
    ) {

        hasMatch = true;

        parts.push(
            escapeRoll20Html(
                text.slice(
                    lastIndex,
                    match.index
                )
            )
        );

        const imageUrl =
    normalizeRoll20ImageUrl(
        match[0]
    );

    if (imageUrl) {

        parts.push(
            `<img ` +
            `class="roll20InlineImage" ` +
            `src="${escapeRoll20Attribute(imageUrl)}" ` +
            `alt="" ` +
            `referrerpolicy="no-referrer">`
        );

    } else {

        parts.push(
            escapeRoll20Html(
                match[0]
            )
        );

    }

        lastIndex =
            imageUrlPattern.lastIndex;

    }

    if (!hasMatch) {
        return null;
    }

    parts.push(
        escapeRoll20Html(
            text.slice(lastIndex)
        )
    );

    return parts.join("");

}


// =========================================
// Roll20 링크 하나 변환
// =========================================

function convertRoll20Link(
    label,
    destination
) {

    const normalizedDestination =
        String(destination)
            .trim();

    if (
        isRoll20StyledDestination(
            normalizedDestination
        )
    ) {

        return createRoll20StyledElement(
            label,
            normalizedDestination
        );

    }

    // =========================================
    // Roll20 스타일 목적지 판별
    // =========================================

    function isRoll20StyledDestination(
        destination
    ) {

        const value =
            String(destination)
                .trim();

        /*
            지원 형식:

            (#" style="...")
            (#"style="...")
            (" style="...")
            ("style="...")
        */
        return (
            /^(?:#)?\s*"\s*style\s*=/i
                .test(value) ||
            /^(?:#)?\s*"style\s*=/i
                .test(value)
        );

    }

    const safeUrl =
        sanitizeRoll20Url(
            normalizedDestination
        );

    if (!safeUrl) {

        return escapeRoll20Html(
            label
        );

    }

    /*
        이미지 링크
    */
    if (
    isRoll20ImageUrl(
        safeUrl
    )
) {

    const imageUrl =
        normalizeRoll20ImageUrl(
            safeUrl
        );

    if (!imageUrl) {

        return escapeRoll20Html(
            label
        );

    }

    return (
        `<img ` +
        `class="roll20InlineImage" ` +
        `src="${escapeRoll20Attribute(imageUrl)}" ` +
        `alt="${escapeRoll20Attribute(label)}" ` +
        `referrerpolicy="no-referrer">`
    );

}

    /*
        일반 외부 링크
    */
    return (
        `<a ` +
        `class="roll20ExternalLink" ` +
        `href="${escapeRoll20Attribute(safeUrl)}" ` +
        `target="_blank" ` +
        `rel="noopener noreferrer">` +
        `${escapeRoll20Html(label)}` +
        `</a>`
    );

}


// =========================================
// Roll20 스타일 요소 생성
// =========================================

function createRoll20StyledElement(
    label,
    destination
) {

    const styleText =
        extractRoll20StyleText(
            destination
        );

    const safeStyle =
        sanitizeRoll20InlineStyle(
            styleText
        );

    const isDecorative =
        label.trim() === "" &&
        /position\s*:\s*absolute/i.test(
            safeStyle
        );

    const className =
        isDecorative
            ? "roll20DecorativeElement"
            : "roll20StyledText";

    const content =
        isDecorative
            ? ""
            : escapeRoll20Html(label);

    const ariaHidden =
        isDecorative
            ? ` aria-hidden="true"`
            : "";

    const styleAttribute =
        safeStyle
            ? ` style="${escapeRoll20Attribute(safeStyle)}"`
            : "";

    return (
        `<span ` +
        `class="${className}"` +
        `${ariaHidden}` +
        `${styleAttribute}>` +
        `${content}` +
        `</span>`
    );

}


// =========================================
// style 속성 내용 추출
// =========================================

function extractRoll20StyleText(
    destination
) {

    const match =
        String(destination)
            .match(
                /style\s*=\s*"([\s\S]*)$/i
            );

    if (!match) {
        return "";
    }

    return match[1]
        .replace(/"\s*$/g, "")
        .trim();

}


// =========================================
// Roll20 CSS 허용 목록
// =========================================

const allowedRoll20StyleProperties =
    new Set([
        "color",

        "background",
        "background-color",
        "background-image",

        "border",
        "border-color",
        "border-width",
        "border-style",
        "border-radius",

        "border-top",
        "border-right",
        "border-bottom",
        "border-left",

        "border-top-color",
        "border-right-color",
        "border-bottom-color",
        "border-left-color",

        "padding",
        "padding-top",
        "padding-right",
        "padding-bottom",
        "padding-left",

        "margin",
        "margin-top",
        "margin-right",
        "margin-bottom",
        "margin-left",

        "display",
        "position",

        "top",
        "right",
        "bottom",
        "left",

        "text-align",
        "text-decoration",
        "text-shadow",

        "font-family",
        "font-size",
        "font-style",
        "font-weight",
        "font-variant",

        "line-height",
        "letter-spacing",

        "box-shadow",
        "user-select"
    ]);


// =========================================
// Roll20 인라인 CSS 정리
// =========================================

function sanitizeRoll20InlineStyle(
    styleText
) {

    const decodedStyle =
        decodeRoll20Entities(
            styleText
        );

    const declarations =
        splitRoll20StyleDeclarations(
            decodedStyle
        );

    const safeDeclarations = [];

    declarations.forEach(
        declaration => {

            const separatorIndex =
                declaration.indexOf(":");

            if (separatorIndex === -1) {
                return;
            }

            let property =
                declaration
                    .slice(
                        0,
                        separatorIndex
                    )
                    .trim()
                    .toLowerCase();

                    /*
                        실제 Roll20 매크로에서 발견되는
                        흔한 속성명 오타를 보정한다.
                    */
                    const propertyAliases = {
                        "text-text-align":
                            "text-align"
                    };

                    property =
                        propertyAliases[property] ||
                        property;

            let value =
                declaration
                    .slice(
                        separatorIndex + 1
                    )
                    .trim();

            if (
                !allowedRoll20StyleProperties
                    .has(property)
            ) {
                return;
            }

            value =
                sanitizeRoll20StyleValue(
                    property,
                    value
                );

            if (!value) {
                return;
            }

            safeDeclarations.push(
                `${property}: ${value}`
            );

        }
    );

    return safeDeclarations.join("; ");

}


// =========================================
// 세미콜론 기준 CSS 분리
// =========================================

function splitRoll20StyleDeclarations(
    styleText
) {

    const declarations = [];

    let current = "";
    let parenthesisDepth = 0;
    let quote = "";

    for (
        let index = 0;
        index < styleText.length;
        index += 1
    ) {

        const character =
            styleText[index];

        if (quote) {

            current += character;

            if (
                character === quote &&
                styleText[index - 1] !== "\\"
            ) {
                quote = "";
            }

            continue;

        }

        if (
            character === `"` ||
            character === `'`
        ) {

            quote = character;
            current += character;

            continue;

        }

        if (character === "(") {

            parenthesisDepth += 1;
            current += character;

            continue;

        }

        if (character === ")") {

            parenthesisDepth =
                Math.max(
                    0,
                    parenthesisDepth - 1
                );

            current += character;

            continue;

        }

        if (
            character === ";" &&
            parenthesisDepth === 0
        ) {

            if (current.trim()) {

                declarations.push(
                    current.trim()
                );

            }

            current = "";

            continue;

        }

        current += character;

    }

    if (current.trim()) {

        declarations.push(
            current.trim()
        );

    }

    return declarations;

}


// =========================================
// CSS 값 검사
// =========================================

function sanitizeRoll20StyleValue(
    property,
    value
) {

    const normalizedValue =
        String(value)
            .trim();

    if (!normalizedValue) {
        return "";
    }

    const unsafePattern =
        /(?:javascript\s*:|expression\s*\(|behavior\s*:|@import|<|>)/i;

    if (
        unsafePattern.test(
            normalizedValue
        )
    ) {
        return "";
    }

    /*
        외부 URL을 CSS 안에서 불러오는 것은 차단한다.
        linear-gradient 등은 허용한다.
    */
    if (
        /url\s*\(/i.test(
            normalizedValue
        )
    ) {
        return "";
    }

    /*
        화면 전체를 덮는 요소 방지
    */
    if (
        property === "position"
    ) {

        const positionValue =
            normalizedValue
                .toLowerCase();

        if (
            positionValue !== "relative" &&
            positionValue !== "absolute" &&
            positionValue !== "static"
        ) {
            return "";
        }

    }

    /*
        표시 방식 제한
    */
    if (
        property === "display"
    ) {

        const displayValue =
            normalizedValue
                .toLowerCase();

        if (
            displayValue !== "inline" &&
            displayValue !== "inline-block" &&
            displayValue !== "block" &&
            displayValue !== "none"
        ) {
            return "";
        }

    }

    return normalizedValue;

}


// =========================================
// HTML 엔티티 해제
// =========================================

function decodeRoll20Entities(
    value
) {

    const textarea =
        document.createElement(
            "textarea"
        );

    textarea.innerHTML =
        String(value);

    return textarea.value;

}


// =========================================
// Roll20 URL 검사
// =========================================

function sanitizeRoll20Url(
    value
) {

    const url =
        decodeRoll20Entities(
            value
        ).trim();

    if (!url) {
        return "";
    }

    if (
        url.startsWith("https://") ||
        url.startsWith("http://")
    ) {
        return url;
    }

    return "";

}


// =========================================
// 이미지 URL 판별
// =========================================

function isRoll20ImageUrl(
    url
) {

    return (
        /\.(?:png|jpe?g|gif|webp|svg)(?:[?#].*)?$/i
            .test(url) ||
        /(?:i\.)?imgur\.com\//i
            .test(url)
    );

}

// =========================================
// Roll20 이미지 주소 정규화
// =========================================

function normalizeRoll20ImageUrl(
    value
) {

    const url =
        sanitizeRoll20Url(
            value
        );

    if (!url) {
        return "";
    }

    /*
        Imgur 일반 주소를
        직접 이미지 주소로 변경한다.
    */
    return url.replace(
        /^https?:\/\/(?:www\.)?imgur\.com\//i,
        "https://i.imgur.com/"
    );

}


// =========================================
// HTML 텍스트 이스케이프
// =========================================

function escapeRoll20Html(
    value
) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}


// =========================================
// HTML 속성 이스케이프
// =========================================

function escapeRoll20Attribute(
    value
) {

    return escapeRoll20Html(
        value
    )
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

}