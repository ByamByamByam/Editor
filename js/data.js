
// =========================================
// 채팅방별 로그 표시 설정
// =========================================

function createDefaultViewerSettings(
    source = {}
) {

    return {
        messageGap:
            Number.isFinite(
                Number(
                    source.messageGap
                )
            )
                ? Number(
                    source.messageGap
                )
                : 18,

        groupConsecutiveMessages:
            Boolean(
                source
                    .groupConsecutiveMessages
            ),

        clickActionEnabled:
            Boolean(
                source
                    .clickActionEnabled
            ),

        longMessageClickEnabled:
            Boolean(
                source
                    .longMessageClickEnabled
            ),

        clickAnimation:
            source.clickAnimation ===
                "slide"
                ? "slide"
                : "instant",

        performanceDividerVisible:
            source
                .performanceDividerVisible !==
                false,

        descTextColor:
            /^#[0-9a-f]{6}$/i.test(
                String(
                    source.descTextColor ||
                    ""
                )
            )
                ? source.descTextColor
                : "#555555",

        emTextColor:
            /^#[0-9a-f]{6}$/i.test(
                String(
                    source.emTextColor ||
                    ""
                )
            )
                ? source.emTextColor
                : "#666666",

        emasTextColor:
            /^#[0-9a-f]{6}$/i.test(
                String(
                    source.emasTextColor ||
                    ""
                )
            )
                ? source.emasTextColor
                : "#666666",

        asBubbleColor:
            /^#[0-9a-f]{6}$/i.test(
                String(
                    source.asBubbleColor ||
                    ""
                )
            )
                ? source.asBubbleColor
                : "#ffffff",

        asTextColor:
            /^#[0-9a-f]{6}$/i.test(
                String(
                    source.asTextColor ||
                    ""
                )
            )
                ? source.asTextColor
                : "#000000",

        logFontImport:
            String(
                source.logFontImport ||
                ""
            ),

        logFontFamily:
            String(
                source.logFontFamily ||
                '"Pretendard", "맑은 고딕", sans-serif'
            )
    };

}

// =========================================
// Project Data
// =========================================

let project = {

    version: "0.2",

    title: "새 프로젝트",

    createdAt: new Date(),

    viewerSettings: {

        messageGap: 18,

        groupConsecutiveMessages: false,

        clickActionEnabled: false,

        longMessageClickEnabled: false,

        clickAnimation:
            "instant",

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

// =========================================
// Speaker
// =========================================

class Speaker {

    constructor() {

        this.id = crypto.randomUUID();

        this.name = "";

        this.profile = "";

        this.profileType =
            "circle";

        this.bubbleColor = "#ffffff";

        this.bubbleTransparent = false;

        this.textColor = "#000000";

        this.nameColor = "#888888";

        this.align = "left";

        this.notes = "";

    }

}

// =========================================
// Chat Room
// =========================================

class ChatRoom {

    constructor() {

        this.id = crypto.randomUUID();

        this.title = "";

        this.subtitle = "";

        this.description = "";

        this.thumbnail = "";

        this.createdAt = new Date();

        /*
            폰트와 desc/em/emas/as 등 로그 표시 설정은
            채팅방마다 독립적으로 보관한다.
        */
        this.viewerSettings =
            createDefaultViewerSettings();

        this.speakers = [];

        this.chapters = [];

    }

}

// =========================================
// Chapter
// =========================================

class Chapter {

    constructor() {

        this.id = crypto.randomUUID();

        this.title = "새 챕터";

        this.description = "";

        this.createdAt = new Date();

        this.messages = [];

        this.backgroundColor =
        "#eeeeee";

        this.events = [];

    }

}

// =========================================
// Message
// =========================================

class Message {

    constructor() {

        this.id = crypto.randomUUID();

        this.speakerId = "";

        this.speakerOverride = "";

        this.type = "chat";

        this.rawHtml = "";

        this.html = "";

        this.roll20Type = "";

        this.roll20MessageId = "";

        /*
            Roll20에서 가져온 실제 주사위 결과 원본.

            편집창에는 노출하지 않고
            프로젝트 내부에서만 보관한다.
        */
        this.roll20RollData = "";

        /*
            결과가 생성될 당시의 원래 굴림식.
            CSS 문법만 수정했는지,
            굴림식 자체를 변경했는지 판단할 때 사용한다.
        */
        this.roll20RollExpression = "";

        /*
            Roll20 / 코코포리아 CoC 판정 카드 데이터.
        */
        this.cocCheckData = null;

        this.createdAt = new Date();

    }

}

// =========================================
// Event Range
// =========================================

class EventRange {

    constructor() {

        this.id = crypto.randomUUID();

        this.type = "";

        this.startMessageId = "";

        this.endMessageId = "";

        this.source = "";

        this.volume = 0.5;

        this.loop = true;

        this.fadeIn = 0;

        this.fadeOut = 0;

        this.delay = 0;

        this.sourceType = "url";
        

    }

}