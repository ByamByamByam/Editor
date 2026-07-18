// =========================================
// Static HTML Export
// =========================================

const exportHtmlBtn =
    document.getElementById("exportHtmlBtn");

function initializeHtmlExport() {

    exportHtmlBtn?.addEventListener(
        "click",
        handleHtmlExport
    );

    console.log("HTML Export Ready");

}

async function handleHtmlExport() {

    const chat =
        typeof getSelectedChat === "function"
            ? getSelectedChat()
            : null;

    if (!chat) {
        alert("먼저 채팅방을 선택해주세요.");
        return;
    }

    const selectedRange =
        document.querySelector(
            'input[name="htmlExportRange"]:checked'
        )?.value || "chapter";

    let chapters = [];

    if (selectedRange === "chat") {

        chapters = Array.isArray(chat.chapters)
            ? chat.chapters
            : [];

        if (chapters.length === 0) {
            alert("내보낼 챕터가 없습니다.");
            return;
        }

    } else {

        const chapter =
            typeof getSelectedChapter === "function"
                ? getSelectedChapter()
                : null;

        if (!chapter) {
            alert("먼저 챕터를 선택해주세요.");
            return;
        }

        chapters = [chapter];

    }

    exportHtmlBtn.disabled = true;

    try {

        const html =
            createStandaloneLogHtml(
                chat,
                chapters,
                selectedRange
            );

        const scopeName =
            selectedRange === "chat"
                ? chat.title || "채팅 로그"
                : chapters[0]?.title || "챕터 로그";

        downloadStandaloneHtml(
            html,
            `${scopeName}.html`
        );

        if (
            typeof setStorageStatus === "function"
        ) {
            setStorageStatus(
                `HTML 로그를 내보냈습니다: ${scopeName}`
            );
        }

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "HTML 로그를 만들지 못했습니다."
        );

    } finally {

        exportHtmlBtn.disabled = false;

    }

}

function createStandaloneLogHtml(
    chat,
    chapters,
    selectedRange
) {

    const settings =
        typeof getViewerSettings === "function"
            ? getViewerSettings()
            : project.viewerSettings || {};

    const chapterHtml = chapters
        .map(
            chapter =>
                createExportChapterHtml(
                    chat,
                    chapter,
                    settings,
                    selectedRange === "chat"
                )
        )
        .join("\n");

    const documentTitle =
        selectedRange === "chat"
            ? chat.title || "채팅 로그"
            : `${chat.title || "채팅 로그"} - ${chapters[0]?.title || "챕터"}`;

    const subtitleHtml = chat.subtitle
        ? `<p class="exportChatSubtitle">${escapeExportHtml(chat.subtitle)}</p>`
        : "";

    const descriptionHtml = chat.description
        ? `<p class="exportChatDescription">${escapeExportHtml(chat.description)}</p>`
        : "";

    const rootClasses =
        settings.performanceDividerVisible === false
            ? "performanceDividerHidden"
            : "";

    return `<!DOCTYPE html>
<html lang="ko" class="${rootClasses}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeExportHtml(documentTitle)}</title>
<style>
${createStandaloneExportCss(settings)}
</style>
</head>
<body>
<main class="exportDocument">
<header class="exportChatHeader">
<h1>${escapeExportHtml(chat.title || "채팅 로그")}</h1>
${subtitleHtml}
${descriptionHtml}
</header>
${chapterHtml}
</main>
</body>
</html>`;

}

function createExportChapterHtml(
    chat,
    chapter,
    settings,
    showChapterHeading
) {

    const messages =
        Array.isArray(chapter.messages)
            ? chapter.messages
            : [];

    const headingHtml = showChapterHeading
        ? `<header class="exportChapterHeader"><h2>${escapeExportHtml(chapter.title || "챕터")}</h2></header>`
        : "";

    const messageHtml = messages.length > 0
        ? createExportMessagesHtml(
            chat,
            messages,
            settings
        )
        : `<p class="exportEmpty">등록된 메시지가 없습니다.</p>`;

    const backgroundColor =
        normalizeExportColor(
            chapter.backgroundColor,
            "#eeeeee"
        );

    return `<section class="exportChapter" style="--chapter-background:${backgroundColor}">
${headingHtml}
<div class="exportMessageList">
${messageHtml}
</div>
</section>`;

}

function createExportMessagesHtml(
    chat,
    messages,
    settings
) {

    const elements = [];

    messages.forEach(message => {

        const speaker =
            chat.speakers?.find(
                item => item.id === message.speakerId
            ) ?? null;

        const sourceElement =
            typeof createMessageElement === "function"
                ? createMessageElement(message, speaker)
                : null;

        if (!sourceElement) {
            return;
        }

        const element =
            sourceElement.cloneNode(true);

        element.classList.remove(
            "selected",
            "captureRangeSelected",
            "focusMessageHidden",
            "focusMessageRevealing"
        );

        element.removeAttribute("data-message-id");

        elements.push({
            element,
            message
        });

    });

    if (settings.groupConsecutiveMessages) {
        applyExportConsecutiveGrouping(elements);
    }

    return elements
        .map(item => item.element.outerHTML)
        .join("\n");

}

function applyExportConsecutiveGrouping(items) {

    const isGroupable = item =>
        item &&
        item.message &&
        (
            item.message.type === "chat" ||
            item.message.type === "roll" ||
            item.message.type === "gmroll" ||
            item.message.type === "coccheck" ||
            item.message.type === "rollcard" ||
            item.message.type === "whisper"
        );

    const getKey = item =>
        `${item.message.type}::${item.message.speakerId || item.message.speakerOverride || ""}`;

    items.forEach((item, index) => {

        if (!isGroupable(item)) {
            return;
        }

        const previous = items[index - 1];
        const next = items[index + 1];
        const key = getKey(item);

        const samePrevious =
            isGroupable(previous) &&
            getKey(previous) === key;

        const sameNext =
            isGroupable(next) &&
            getKey(next) === key;

        if (!samePrevious && sameNext) {
            item.element.classList.add("messageGroupStart");
        } else if (samePrevious && sameNext) {
            item.element.classList.add("messageGroupMiddle");
        } else if (samePrevious && !sameNext) {
            item.element.classList.add("messageGroupEnd");
        }

    });

}

function createStandaloneExportCss(settings) {

    const messageGap =
        Number.isFinite(Number(settings.messageGap))
            ? Math.max(0, Number(settings.messageGap))
            : 18;

    const logFontImport =
        normalizeExportFontImport(
            settings.logFontImport
        );

    const logFontFamily =
        normalizeExportFontFamily(
            settings.logFontFamily
        );

    const descColor =
        normalizeExportColor(
            settings.descTextColor,
            "#555555"
        );

    const emColor =
        normalizeExportColor(
            settings.emTextColor,
            "#666666"
        );

    const emasColor =
        normalizeExportColor(
            settings.emasTextColor,
            "#666666"
        );

    return `
${logFontImport}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;font-family:${logFontFamily};color:#333;background:#f4f5f7}
body{padding:36px 18px}
.exportDocument{width:min(960px,100%);margin:0 auto}
.exportChatHeader{padding:0 8px 28px;text-align:center}
.exportChatHeader h1{margin:0;font-size:30px;line-height:1.25}
.exportChatSubtitle{margin:8px 0 0;color:#666;font-size:15px}
.exportChatDescription{max-width:700px;margin:12px auto 0;color:#777;font-size:13px;line-height:1.7;white-space:pre-wrap}
.exportChapter{margin:0 0 32px;border-radius:18px;overflow:hidden;background:var(--chapter-background,#eee);box-shadow:0 8px 30px rgb(0 0 0 / 8%)}
.exportChapterHeader{padding:20px 28px 0}
.exportChapterHeader h2{margin:0;padding-bottom:14px;border-bottom:1px solid rgb(0 0 0 / 10%);font-size:20px}
.exportMessageList{padding:60px 28px}
.exportEmpty{margin:0;color:#888;text-align:center}
.message{min-width:0;max-width:100%}
.messageChat{display:flex;align-items:flex-start;gap:10px;width:fit-content;max-width:78%;margin-top:0;margin-bottom:${messageGap}px;padding:4px;border:2px solid transparent;border-radius:14px}
.messageLeft{margin-right:auto}.messageRight{margin-left:auto;flex-direction:row-reverse}
.messageProfile{display:block;width:42px!important;height:42px!important;min-width:42px;min-height:42px;max-width:42px!important;max-height:42px;aspect-ratio:1/1;flex:0 0 42px;border-radius:50%;object-fit:cover;background:#fff}
.messageContent{min-width:0}.messageSpeaker{margin:0 6px 5px;color:#666;font-size:13px}.messageRight .messageSpeaker{text-align:right}
.messageBubble{padding:11px 14px;border:1px solid rgb(0 0 0 / 8%);border-radius:14px;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word}
.messageDesc,.messageEm,.messageSystem{width:100%;margin:${messageGap}px 0;padding:6px;border:2px solid transparent;border-radius:12px}
.messageDescContent,.messageEmContent{width:100%;max-width:min(760px,100%);margin:0 auto;padding:14px 18px;border-top:1px solid #d8d8d8;border-bottom:1px solid #d8d8d8;text-align:center;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word}
.messageDescContent{color:${descColor};line-height:1.7}.messageEmContent{color:${emColor};font-style:italic;line-height:1.65}.messageEmasContent{color:${emasColor}}
.messageEmContent::before,.messageEmasContent::before{content:none}
html.performanceDividerHidden .messageDescContent,html.performanceDividerHidden .messageEmContent{border-top-color:transparent;border-bottom-color:transparent}
.messageSystem{max-width:min(760px,100%);margin-left:auto;margin-right:auto}.messageSystemLabel{margin-bottom:5px;color:#888;font-size:11px;font-weight:700;letter-spacing:.08em}.messageSystemContent{padding:12px 14px;border:1px solid #d8d8d8;border-radius:10px;background:#f5f5f5;color:#555;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere}
.message img:not(.messageProfile){max-width:100%;height:auto}.message a{overflow-wrap:anywhere;word-break:break-all}
.messageChat.messageGroupStart{margin-bottom:0}.messageChat.messageGroupMiddle{margin-top:0;margin-bottom:0;padding-top:0}.messageChat.messageGroupEnd{margin-top:0;padding-top:0}
.messageChat.messageGroupMiddle .messageProfile,.messageChat.messageGroupEnd .messageProfile{visibility:hidden!important}.messageChat.messageGroupMiddle .messageSpeaker,.messageChat.messageGroupEnd .messageSpeaker{display:none!important;margin:0!important}
.messageCommandMeta{display:block;margin-bottom:5px;opacity:.65;font-size:11px;font-weight:700}

.messageRollCard .messageBubble{padding:0;overflow:hidden;border-color:rgba(91,140,255,.22)!important;background:transparent!important}
.rollArchiveCard{width:min(100%,430px);min-width:270px;overflow:hidden;border:1px solid rgba(91,140,255,.22);border-radius:12px;background:rgba(248,250,253,.97);color:#2f3440;box-shadow:0 8px 24px rgba(43,61,95,.1)}
.rollCardHeader{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;background:linear-gradient(135deg,rgba(91,140,255,.16),rgba(148,180,255,.06))}
.rollCardTitle{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:800}
.rollCardSource{flex:0 0 auto;color:#78849a;font-size:10px;font-weight:700;letter-spacing:.05em}
.rollCardSection{padding:12px 14px}.rollCardSection+.rollCardSection{border-top:1px solid rgba(40,54,80,.08)}
.rollCardSectionLabel{margin-bottom:8px;color:#7b8495;font-size:11px;font-weight:700}
.rollCardThresholds,.rollCardDiceValues{display:flex;flex-wrap:wrap;gap:7px}
.rollCardThreshold{min-width:58px;display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:5px 8px;border:1px solid rgba(91,140,255,.2);border-radius:999px;background:#fff;font-size:11px}
.rollCardThreshold small{color:#8992a3;font-size:9px}.rollCardThreshold strong{font-weight:800}
.rollCardDie{min-width:42px;height:38px;display:inline-flex;align-items:center;justify-content:center;padding:0 9px;border:1px solid rgba(65,82,112,.24);border-radius:8px;background:#fff;font-size:15px;font-weight:800;box-shadow:0 2px 0 rgba(42,56,82,.08)}
.rollCardResultRow,.rollCardTotalRow,.rollCardDamageRow,.rollCardMadnessMeta{display:flex;align-items:center;justify-content:space-between;gap:12px}
.rollCardResultRoll{color:#667085;font-size:11px}
.rollCardResultBadge{display:inline-flex;align-items:center;justify-content:center;padding:6px 10px;border-radius:999px;font-size:11px;font-weight:800}
.rollCardResultBadge.critical,.rollCardOutcomeRow.critical{background:#e7f7ef;color:#137a49}
.rollCardResultBadge.extreme,.rollCardOutcomeRow.extreme{background:#e8f2ff;color:#2566b1}
.rollCardResultBadge.hard,.rollCardOutcomeRow.hard{background:#edf0ff;color:#4e56a7}
.rollCardResultBadge.success,.rollCardOutcomeRow.success{background:#eef8e8;color:#4b7a25}
.rollCardResultBadge.failure,.rollCardOutcomeRow.failure{background:#fff6df;color:#91651a}
.rollCardResultBadge.fumble,.rollCardOutcomeRow.fumble{background:#fdecef;color:#b83d51}
.rollCardOutcomeRows{display:flex;flex-direction:column;gap:5px}
.rollCardOutcomeRow{display:grid;grid-template-columns:38px 52px minmax(0,1fr);align-items:center;gap:7px;min-height:32px;padding:5px 8px;border-radius:8px;font-size:11px}
.rollCardOutcomeModifier,.rollCardOutcomeResult{font-weight:800}
.rollCardOutcomeRoll{min-width:42px;padding:3px 7px;border-radius:6px;background:rgba(255,255,255,.72);text-align:center;font-weight:800}
.rollCardExpression{font-size:14px}.rollCardTotal{font-size:22px}.rollCardDamageValue{padding:5px 9px;border-radius:8px;background:#fff1f2;color:#b83d51;font-weight:800}
.rollCardMadnessHeader{justify-content:center;background:#182a36;color:#fff}.rollCardMadnessName{padding:10px 14px;border-bottom:1px solid rgba(40,54,80,.1);text-align:center;font-weight:800}
.rollCardMadnessText{padding:12px 14px;text-align:center;line-height:1.65;white-space:pre-wrap}
.rollCardMadnessMeta{font-size:11px}.rollCardEmpty{color:#8b93a3;font-size:11px}

.messageCocCheck .messageBubble{padding:0;overflow:hidden;border-color:rgba(91,140,255,.22)!important;background:transparent!important}.cocCheckCard{width:min(100%,420px);min-width:260px;overflow:hidden;border:1px solid rgba(91,140,255,.22);border-radius:12px;background:rgba(248,250,253,.96);color:#2f3440;box-shadow:0 8px 24px rgba(43,61,95,.1)}.cocCheckHeader{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;background:linear-gradient(135deg,rgba(91,140,255,.16),rgba(148,180,255,.06))}.cocCheckTitle{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:800}.cocCheckSource{flex:0 0 auto;color:#78849a;font-size:10px;font-weight:700;letter-spacing:.05em}.cocCheckSection{padding:12px 14px}.cocCheckSection+.cocCheckSection{border-top:1px solid rgba(40,54,80,.08)}.cocCheckSectionLabel{margin-bottom:8px;color:#7b8495;font-size:11px;font-weight:700}.cocThresholds,.cocRollValues{display:flex;flex-wrap:wrap;gap:7px}.cocThreshold{min-width:48px;display:inline-flex;align-items:center;justify-content:center;gap:4px;padding:5px 8px;border:1px solid rgba(91,140,255,.2);border-radius:999px;background:#fff;font-size:11px;font-weight:700}.cocThreshold small{color:#8992a3;font-size:9px;font-weight:600}.cocRollDie{min-width:42px;height:38px;display:inline-flex;align-items:center;justify-content:center;padding:0 9px;border:1px solid rgba(65,82,112,.24);border-radius:8px;background:#fff;font-size:15px;font-weight:800;box-shadow:0 2px 0 rgba(42,56,82,.08)}.cocResultSummary{display:flex;align-items:center;justify-content:space-between;gap:12px}.cocResultRoll{color:#667085;font-size:11px}.cocResultBadge{display:inline-flex;align-items:center;justify-content:center;padding:6px 10px;border-radius:999px;font-size:11px;font-weight:800}.cocOutcomeRows{display:flex;flex-direction:column;gap:5px}.cocOutcomeRow{display:grid;grid-template-columns:38px 52px minmax(0,1fr);align-items:center;gap:7px;min-height:32px;padding:5px 8px;border-radius:8px;font-size:11px}.cocOutcomeModifier,.cocOutcomeLabel{font-weight:800}.cocOutcomeRoll{min-width:42px;padding:3px 7px;border-radius:6px;background:rgba(255,255,255,.72);text-align:center;font-weight:800}.cocResultBadge.critical,.cocOutcomeRow.critical{background:#e7f7ef;color:#137a49}.cocResultBadge.extreme,.cocOutcomeRow.extreme{background:#e8f2ff;color:#2566b1}.cocResultBadge.hard,.cocOutcomeRow.hard{background:#edf0ff;color:#4e56a7}.cocResultBadge.success,.cocOutcomeRow.success{background:#eef8e8;color:#4b7a25}.cocResultBadge.failure,.cocOutcomeRow.failure{background:#fff6df;color:#91651a}.cocResultBadge.fumble,.cocOutcomeRow.fumble{background:#fdecef;color:#b83d51}
.rollResult{min-width:130px;display:flex;flex-direction:column;gap:7px}.rollLabel{opacity:.6;font-size:10px;font-weight:700;letter-spacing:.08em}.rollExpression{font-size:13px;font-weight:700}.rollDiceResults{display:flex;flex-wrap:wrap;gap:5px}.rollDieResult{min-width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;padding:0 7px;border:1px solid currentColor;border-radius:6px;background:rgb(255 255 255 / 35%);font-size:13px;font-weight:700;line-height:1}.rollRecordedResult{display:flex;align-items:baseline;justify-content:space-between;gap:14px;padding-top:5px;border-top:1px solid rgb(0 0 0 / 10%)}.rollRecordedResultLabel{opacity:.65;font-size:11px}.rollTotal{font-size:22px;font-weight:800;line-height:1}.rollFallback{font-size:12px;overflow-wrap:anywhere}.messageGmRoll .messageBubble{border-style:dashed}
.roll20StyledText{max-width:100%}.roll20InlineImage{display:block;max-width:100%;height:auto}.roll20DecorativeElement{pointer-events:none}
@media(max-width:700px){body{padding:14px 8px}.exportMessageList{padding:40px 12px}.messageChat{max-width:92%}.exportChatHeader h1{font-size:24px}}
@media print{body{padding:0;background:#fff}.exportDocument{width:100%}.exportChapter{box-shadow:none;break-inside:auto}.message{break-inside:avoid}.exportChapterHeader{break-after:avoid}}
`;

}

function downloadStandaloneHtml(
    html,
    filename
) {

    const blob = new Blob(
        [html],
        {
            type: "text/html;charset=utf-8"
        }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = sanitizeExportFilename(filename);

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

}

function sanitizeExportFilename(value) {

    const text = String(value || "로그.html")
        .replace(/[\\/:*?"<>|]/g, "_")
        .trim();

    return /\.html?$/i.test(text)
        ? text
        : `${text}.html`;

}

function escapeExportHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

function normalizeExportColor(
    value,
    fallback
) {

    const color = String(value || "").trim();

    return /^#[0-9a-f]{6}$/i.test(color)
        ? color
        : fallback;

}

function normalizeExportFontImport(
    value
) {

    const match =
        String(value || "")
            .trim()
            .match(
                /^@import\s+url\(\s*(['"]?)(https:\/\/[^'")\s]+)\1\s*\)\s*;?$/i
            );

    if (!match) {
        return "";
    }

    try {

        const url =
            new URL(
                match[2]
            );

        if (
            url.protocol !== "https:" ||
            url.hostname !==
                "fonts.googleapis.com"
        ) {
            return "";
        }

        return (
            `@import url('${url.toString()}');`
        );

    } catch (error) {

        return "";

    }

}

function normalizeExportFontFamily(
    value
) {

    const fontFamily =
        String(value || "")
            .replace(/[{};<>]/g, "")
            .replace(/\s+/g, " ")
            .trim();

    return fontFamily ||
        '"Pretendard", "맑은 고딕", sans-serif';

}

window.addEventListener(
    "load",
    initializeHtmlExport
);
