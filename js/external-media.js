// =========================================
// YouTube / SoundCloud External Media
// =========================================

const externalMediaState = {
    bgm: null,
    sound: null
};

function normalizeExternalMediaSource(
    source
) {

    return String(
        source ||
        ""
    ).trim();

}

function getSupportedMediaPlatform(
    source
) {

    try {

        const url =
            new URL(
                normalizeExternalMediaSource(
                    source
                )
            );

        const hostname =
            url.hostname
                .replace(
                    /^www\./i,
                    ""
                )
                .toLowerCase();

        if (
            hostname === "youtu.be" ||
            hostname === "youtube.com" ||
            hostname.endsWith(
                ".youtube.com"
            )
        ) {
            return "youtube";
        }

        if (
            hostname === "soundcloud.com" ||
            hostname.endsWith(
                ".soundcloud.com"
            )
        ) {
            return "soundcloud";
        }

    } catch (error) {
        return null;
    }

    return null;

}

function isSupportedExternalMediaUrl(
    source
) {

    return Boolean(
        getSupportedMediaPlatform(
            source
        )
    );

}

function isExternalMediaActive(
    kind,
    source
) {

    const state =
        externalMediaState[kind];

    if (!state) {
        return false;
    }

    return (
        state.source ===
            normalizeExternalMediaSource(
                source
            ) &&
        Boolean(
            state.host?.firstChild
        )
    );

}

function extractYouTubeVideoId(
    source
) {

    try {

        const url =
            new URL(source);

        const hostname =
            url.hostname
                .replace(
                    /^www\./i,
                    ""
                );

        if (
            hostname === "youtu.be"
        ) {
            return url.pathname
                .split("/")
                .filter(Boolean)[0] ||
                "";
        }

        if (
            url.pathname === "/watch"
        ) {
            return url.searchParams.get(
                "v"
            ) || "";
        }

        const match =
            url.pathname.match(
                /\/(?:embed|shorts|live)\/([^/?#]+)/i
            );

        return match?.[1] || "";

    } catch (error) {
        return "";
    }

}

function stopExternalMedia(
    kind
) {

    const state =
        externalMediaState[kind];

    if (!state) {
        return;
    }

    if (
        state.platform === "youtube" &&
        state.iframe?.contentWindow
    ) {

        state.iframe.contentWindow
            .postMessage(
                JSON.stringify({
                    event:
                        "command",
                    func:
                        "stopVideo",
                    args:
                        []
                }),
                "*"
            );

    }

    if (
        state.platform === "soundcloud" &&
        state.widget
    ) {
        state.widget.pause();
    }

    state.host?.replaceChildren();

    externalMediaState[kind] =
        null;

}

function playExternalMedia(
    kind,
    source,
    {
        volume = 1,
        loop = false
    } = {}
) {

    const normalizedSource =
        normalizeExternalMediaSource(
            source
        );

    if (
        isExternalMediaActive(
            kind,
            normalizedSource
        )
    ) {

        /*
            같은 URL이 이미 재생 중이면 iframe을
            다시 만들지 않는다. 스크롤로 인한
            재시작을 막는 핵심 조건이다.
        */
        return true;

    }

    stopExternalMedia(
        kind
    );

    const platform =
        getSupportedMediaPlatform(
            normalizedSource
        );

    const host =
        document.getElementById(
            kind === "bgm"
                ? "externalBgmHost"
                : "externalSoundHost"
        );

    if (
        !platform ||
        !host
    ) {
        return false;
    }

    if (
        platform === "youtube"
    ) {

        const videoId =
            extractYouTubeVideoId(
                normalizedSource
            );

        if (!videoId) {
            return false;
        }

        const iframe =
            document.createElement(
                "iframe"
            );

        iframe.allow =
            "autoplay; encrypted-media";

        iframe.src =
            `https://www.youtube.com/embed/${encodeURIComponent(videoId)}` +
            `?autoplay=1&controls=0&enablejsapi=1` +
            `&loop=${loop ? 1 : 0}` +
            (
                loop
                    ? `&playlist=${encodeURIComponent(videoId)}`
                    : ""
            );

        host.replaceChildren(
            iframe
        );

        externalMediaState[kind] = {
            platform,
            source:
                normalizedSource,
            iframe,
            host
        };

        iframe.addEventListener(
            "load",
            () => {

                iframe.contentWindow
                    ?.postMessage(
                        JSON.stringify({
                            event:
                                "command",
                            func:
                                "setVolume",
                            args: [
                                Math.round(
                                    Math.max(
                                        0,
                                        Math.min(
                                            1,
                                            Number(volume) || 0
                                        )
                                    ) * 100
                                )
                            ]
                        }),
                        "*"
                    );

            }
        );

        return true;

    }

    const iframe =
        document.createElement(
            "iframe"
        );

    iframe.allow =
        "autoplay";

    iframe.src =
        "https://w.soundcloud.com/player/?" +
        new URLSearchParams({
            url:
                normalizedSource,
            auto_play:
                "true",
            hide_related:
                "true",
            show_comments:
                "false",
            show_user:
                "false",
            show_reposts:
                "false",
            visual:
                "false"
        }).toString();

    host.replaceChildren(
        iframe
    );

    const state = {
        platform,
        source:
            normalizedSource,
        iframe,
        host,
        widget:
            null
    };

    externalMediaState[kind] =
        state;

    const initializeWidget =
        () => {

            if (
                externalMediaState[kind] !==
                    state
            ) {
                return;
            }

            if (
                !window.SC?.Widget
            ) {
                window.setTimeout(
                    initializeWidget,
                    100
                );
                return;
            }

            const widget =
                window.SC.Widget(
                    iframe
                );

            state.widget =
                widget;

            widget.bind(
                window.SC.Widget.Events.READY,
                () => {

                    widget.setVolume(
                        Math.round(
                            Math.max(
                                0,
                                Math.min(
                                    1,
                                    Number(volume) || 0
                                )
                            ) * 100
                        )
                    );

                    widget.play();

                }
            );

            if (loop) {

                widget.bind(
                    window.SC.Widget.Events.FINISH,
                    () => {

                        widget.seekTo(0);
                        widget.play();

                    }
                );

            }

        };

    if (!window.SC?.Widget) {

        const existing =
            document.querySelector(
                "script[data-soundcloud-widget-api]"
            );

        if (!existing) {

            const script =
                document.createElement(
                    "script"
                );

            script.src =
                "https://w.soundcloud.com/player/api.js";

            script.dataset
                .soundcloudWidgetApi =
                    "true";

            document.head.appendChild(
                script
            );

        }

    }

    initializeWidget();

    return true;

}
