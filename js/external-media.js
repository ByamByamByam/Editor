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


function isUnsupportedSoundCloudShortUrl(
    source
) {

    try {
        const url = new URL(
            normalizeExternalMediaSource(source)
        );

        const hostname = url.hostname
            .replace(/^www\./i, "")
            .toLowerCase();

        return hostname === "on.soundcloud.com";
    } catch (error) {
        return false;
    }

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
            hostname !== "on.soundcloud.com" &&
            (
                hostname === "soundcloud.com" ||
                hostname.endsWith(
                    ".soundcloud.com"
                )
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

function cancelExternalMediaFade(
    state
) {

    if (!state?.fadeFrame) {
        return;
    }

    cancelAnimationFrame(
        state.fadeFrame
    );

    state.fadeFrame = null;

}

function pauseExternalMediaState(
    state
) {

    if (!state || state.isPaused) {
        return;
    }

    state.isPaused = true;

    if (
        state.platform === "youtube" &&
        state.iframe?.contentWindow
    ) {

        state.iframe.contentWindow
            .postMessage(
                JSON.stringify({
                    event: "command",
                    func: "pauseVideo",
                    args: []
                }),
                "*"
            );

        return;
    }

    if (
        state.platform === "soundcloud" &&
        state.widget
    ) {
        state.widget.pause();
    }

}

function disposeExternalMediaState(
    kind,
    state
) {

    if (
        !state ||
        externalMediaState[kind] !== state
    ) {
        return;
    }

    cancelExternalMediaFade(
        state
    );

    pauseExternalMediaState(
        state
    );

    state.host?.replaceChildren();

    externalMediaState[kind] = null;

}

function stopExternalMedia(
    kind
) {

    const state =
        externalMediaState[kind];

    if (!state) {
        return;
    }

    disposeExternalMediaState(
        kind,
        state
    );

}

function setExternalMediaVolume(
    kind,
    volume
) {

    const state = externalMediaState[kind];

    if (!state) {
        return;
    }

    const normalized =
        Math.max(
            0,
            Math.min(
                1,
                Number(volume) || 0
            )
        );

    state.volume = normalized;

    const normalizedVolume =
        Math.round(
            normalized * 100
        );

    if (state.platform === "youtube") {
        state.iframe?.contentWindow?.postMessage(
            JSON.stringify({
                event: "command",
                func: "setVolume",
                args: [normalizedVolume]
            }),
            "*"
        );
        return;
    }

    state.widget?.setVolume(
        normalizedVolume
    );

}

function fadeOutExternalMedia(
    kind,
    duration = 0.8,
    onComplete = null
) {

    const state = externalMediaState[kind];

    if (!state) {
        onComplete?.();
        return;
    }

    cancelExternalMediaFade(
        state
    );

    const fadeDuration =
        Math.max(
            0,
            Number(duration) || 0
        );

    const startVolume =
        Math.max(
            0,
            Math.min(
                1,
                Number(state.volume) || 0
            )
        );

    if (
        fadeDuration === 0 ||
        startVolume === 0
    ) {
        setExternalMediaVolume(kind, 0);
        disposeExternalMediaState(kind, state);
        onComplete?.();
        return;
    }

    const startedAt = performance.now();

    const step = now => {

        if (
            externalMediaState[kind] !== state
        ) {
            return;
        }

        const progress =
            Math.min(
                1,
                Math.max(
                    0,
                    (now - startedAt) /
                        (fadeDuration * 1000)
                )
            );

        setExternalMediaVolume(
            kind,
            startVolume * (1 - progress)
        );

        if (progress < 1) {
            state.fadeFrame =
                requestAnimationFrame(step);
            return;
        }

        state.fadeFrame = null;
        disposeExternalMediaState(kind, state);
        onComplete?.();

    };

    state.fadeFrame =
        requestAnimationFrame(step);

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
            host,
            fadeFrame: null,
            isPaused: false,
            volume:
                Math.max(
                    0,
                    Math.min(
                        1,
                        Number(volume) || 0
                    )
                )
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
        "autoplay; encrypted-media";

    iframe.src =
        "https://w.soundcloud.com/player/?" +
        new URLSearchParams({
            url:
                normalizedSource,
            auto_play:
                "false",
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
            null,
        fadeFrame: null,
        isPaused: false,
        volume:
            Math.max(
                0,
                Math.min(
                    1,
                    Number(volume) || 0
                )
            )
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

                    if (
                        externalMediaState[kind] !==
                            state
                    ) {
                        return;
                    }

                    widget.setVolume(
                        Math.round(
                            state.volume * 100
                        )
                    );

                    state.isPaused = false;
                    widget.play();

                }
            );

            if (loop) {

                widget.bind(
                    window.SC.Widget.Events.FINISH,
                    () => {

                        if (
                            externalMediaState[kind] !==
                                state ||
                            state.isPaused
                        ) {
                            return;
                        }

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
