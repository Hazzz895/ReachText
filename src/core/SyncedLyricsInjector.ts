import { HtmlDefenetions, QueryConstants } from "../helpers/Constants";
import { Helpers } from "../helpers/Helpers";
import { InjectorBase } from "../helpers/InjectorBase";
import { TrackLyrics } from "./TrackLyrics";

/**
 * Логика работы текстов в контекстном меню.
 * @extends {InjectorBase}
 */
export class SyncedLyricsInjector extends InjectorBase {
    constructor() {
        super();
    }

    /**
     * Открыт ли синхронизированный текст (нажата ли кнопка открытия синхронизированного текста)
     * @type {boolean}
     */
    private syncLyricsOpened: boolean = false;

    /**
     * Таймаут для обновления синхронизированного текста
     * @type {number | null}
     */
    private timeout: number | null = null;

    /**
     * Таймаут для возращения обычного синхронизированного текста после прокрутки
     * @type {number | null}
     */
    private wheelTimeout: number | null = null;

    /**
 * Таймаут для показа прошедшего синхронизированного текста ри прокрутке
 * @type {number | null}
 */
    private hoverTimeout: number | null = null;

    /**
     * Y-координата у transform синхронизированного текста
     * @type {number}
     */
    private translate: number = 0;

    /**
     * @inheritdoc
     */
    inject(): void {
        document
            .querySelector('[data-test-id="FULLSCREEN_PLAYER_BUTTON"]')
            ?.addEventListener("click", () => {
                this.syncLyricsOpened = false;
            });

        this.tryInject();
    }

    /**
     * Попытка подписаться на события плеера.
     * Если плеер еще не инициализирован, то будут повторные попытки каждые 100 миллисекунд.
     * @returns {void}
     */
    private tryInject(): void {
        if (window.player == null) {
            setTimeout(this.tryInject, 100);
            return;
        }

        Helpers.playerState.event.onChange(async (event: string) => {
            if (!window.player) {
                return;
            }

            switch (event) {
                // Если трек поставлен на паузу
                case "audio-paused":
                case "audio-ended":
                case "audio-end":
                    this.audioPaused();
                    break;
                // Если трек был убран с паузы или была изменена позиция трека
                case "audio-resumed":
                case "audio-set-progress":
                case "audio-updating-progress":
                    await this.audioResumed();
                    break;
                // После того как трек загрузился
                case "audio-canplay":
                    await this.audioCanPlay();
                    break;
            }
        });
    }

    /**
     * Вызывается при включении трека
     * @see {@link SyncedLyricsInjector.inject}
     * @returns {Promise<void>}
     */
    private async audioResumed(): Promise<void> {
        if (
            this.addon.latestTrackLyrics?.trackName != Helpers.meta?.title &&
            !Helpers.meta?.lyricsInfo?.hasAvailableSyncLyrics
        ) {
            this.removeLyricsModal();
        } else if (
            document.querySelector(".FullscreenPlayerDesktopContent_root__tKNGK") &&
            !Helpers.meta?.lyricsInfo?.hasAvailableSyncLyrics &&
            this.addon.latestTrackLyrics?.syncedLyrics
        ) {
            document.querySelectorAll(".swiper-slide-next").forEach((line) => {
                line.classList.remove("swiper-slide-next");
            });

            document.querySelectorAll(".swiper-slide-prev").forEach((line) => {
                line.classList.remove("swiper-slide-prev");
            });

            document
                .querySelectorAll(
                    ".swiper-slide-active.SyncLyricsScroller_line_active__6lLvH"
                )
                .forEach((line) => {
                    line.classList.remove("swiper-slide-active");
                    line.classList.remove("SyncLyricsScroller_line_active__6lLvH");
                });

            document
                .querySelector(".SyncLyricsScroller_counter__B2E7K")
                ?.querySelectorAll(".SyncLyricsLoader_element___Luwv")
                .forEach((pointEl) =>
                    pointEl.classList.remove("SyncLyricsLoader_element_paused__LFpD0")
                );

            await this.getTrackLyrics();
            await this.updateFullScreenLyricsProgress();
        }
    }

    /**
 * Вызывается при остановке трека трека
 * @see {@link SyncedLyricsInjector.inject}
 * @returns {Promise<void>}
 */
    private async audioPaused(): Promise<void> {
        if (!Helpers.meta?.lyricsInfo?.hasAvailableSyncLyrics) {
            // Остановка анимации таймера
            document
                .querySelector(".SyncLyricsScroller_counter__B2E7K")
                ?.querySelectorAll(".SyncLyricsLoader_element___Luwv")
                ?.forEach((pointEl) =>
                    pointEl.classList.add("SyncLyricsLoader_element_paused__LFpD0")
                );
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
        }
    }


    private async getTrackLyrics(): Promise<void> {
        var trackName = Helpers.meta?.title;
        var artistName = Helpers.meta?.artists
            ?.map((artist: any) => artist.name)
            .join(", ");
        var trackLength = Helpers.progress?.duration;
        var albumName = Helpers.meta?.album?.name;

        if (
            !trackName ||
            !artistName ||
            trackName == this.addon.latestTrackLyrics?.trackName
        )
            return;

        if (!Helpers.meta?.lyricsInfo?.hasAvailableSyncLyrics) {
            await this.addon.getTrackLyrics(
                trackName,
                artistName,
                trackLength,
                albumName
            );
            await this.removeLyricsModal();
        }
    }

    /**
 * Вызывается после загрузки трека
 * @see {@link SyncedLyricsInjector.inject}
 * @returns {Promise<void>}
 */
    private async audioCanPlay(): Promise<void> {
        clearTimeout(this.timeout!);

        // Удаляем кастомный текст если доступен оригинальный
        if (
            Helpers.isCustom(document.querySelector(".swiper-wrapper")!) &&
            Helpers.meta?.lyricsInfo?.hasAvailableSyncLyrics
        ) {
            await this.removeLyricsModal();
        }

        if (Helpers.meta?.lyricsInfo?.hasAvailableSyncLyrics) {
            return;
        }

        const availableButtonClass = "HbaqudSqu7Q3mv3zMPGr";
        var playerSyncLyricsButton = document.querySelector(
            '[data-test-id="PLAYERBAR_DESKTOP_SYNC_LYRICS_BUTTON"]'
        );

        await this.getTrackLyrics();

        if (this.addon.latestTrackLyrics?.syncedLyrics) {
            if (
                document.querySelector(".FullscreenPlayerDesktopContent_root__tKNGK") &&
                this.syncLyricsOpened
            ) {
                await this.createLyricsModal();
            }
            // Включаем кнопку
            playerSyncLyricsButton?.removeEventListener(
                "click",
                this.onLyricsButtonClick
            );
            playerSyncLyricsButton?.addEventListener(
                "click",
                this.onLyricsButtonClick
            );
            playerSyncLyricsButton?.classList.add(availableButtonClass);
            playerSyncLyricsButton?.removeAttribute("disabled");
        } else {
            // Выключаем кнопку
            playerSyncLyricsButton?.removeEventListener(
                "click",
                this.onLyricsButtonClick
            );
            playerSyncLyricsButton?.classList.remove(availableButtonClass);
            playerSyncLyricsButton?.setAttribute("disabled", "true");
        }
    }

    /**
     * Вызывается при нажатии на кнопку открытия синхронизированного текста
     * @returns {Promise<void>} Возращается при завершении работы.
     */
    async onLyricsButtonClick(): Promise<void> {
        const instance = SyncedLyricsInjector.get();
        instance.syncLyricsOpened = true;

        if (Helpers.meta?.lyricsInfo?.hasAvailableSyncLyrics) {
            return;
        }

        var fullScreenButton = document.querySelector(
            '[data-test-id="FULLSCREEN_PLAYER_BUTTON"]'
        ) as HTMLButtonElement;

        if (!fullScreenButton) return;

        fullScreenButton.click();
        await instance.createLyricsModal();
    }

    /**
     * Количество миллисекунд которое используется для включения цифрового отсчета если интро длится выше значения
     * @type {number}
     */
    private readonly digitTimerOffset: number = 5000;

    /**
 * Обновление синхронизированного текста
 * @returns {Promise<void>}
 */
    private async updateFullScreenLyricsProgress(): Promise<void> {
        var position: number = Helpers.progress?.position;
        var swiper = document.querySelector(".swiper-wrapper") as HTMLElement;
        var counter = document.querySelector(".SyncLyricsScroller_counter__B2E7K");

        // Если нужно обновить синхронизированный текст, но нечего обновлять - создаем текст
        if (
            !swiper
        ) {
            if (!Helpers.meta?.lyricsInfo?.hasAvailableSyncLyrics &&
                this.syncLyricsOpened) {
                await this.createLyricsModal();
                return this.updateFullScreenLyricsProgress();
            } else {
                return;
            }
        }

        const syncedLyrics = this.addon.latestTrackLyrics?.syncedLyrics;

        if (!syncedLyrics) {
            return;
        }

        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }

        swiper.classList.remove(
            "SyncLyricsScroller_root_withVisibleScrolledLyrics__lowGE"
        );

        var player = document.querySelector(
            ".FullscreenPlayerDesktopContent_fullscreenContent__Nvety"
        );

        // Ждем загрузки плеера
        if (!player) {
            await Helpers.delay(10);
            return this.updateFullScreenLyricsProgress();
        }

        // Применение анимации
        player.classList.add(
            "FullscreenPlayerDesktopContent_fullscreenContent_enter__xMN2Y"
        );

        // Если интро длится больше 5 сек (5000 миллисекунд), то включаем цифровой таймер
        let enableDigitTimer: boolean =
            syncedLyrics[0].timestamp > this.digitTimerOffset;

        let nextLineIndex: number = 0;

        var ms: number | undefined;

        if (position > syncedLyrics[0].timestamp / 1000) {
            swiper.parentElement?.classList.remove(
                "SyncLyricsScroller_root_intro__13gls"
            );
            swiper.parentElement?.classList.remove(
                "SyncLyricsScroller_root_withVisibleUpperLyrics__d7noO"
            );

            nextLineIndex = syncedLyrics.findIndex(
                (line) => line.timestamp / 1000 > position
            );

            // Если следующая строчка не найдена, устанавливаем индекс больше последнего индекса (т.к оно является индексом следующей строчки, которой не существует в текущей позиции)
            if (nextLineIndex < 0) {
                if (
                    position >=
                    syncedLyrics[syncedLyrics.length - 1].timestamp / 1000
                ) {
                    nextLineIndex = syncedLyrics.length;
                } else {
                    console.error("[ReachText] Ошибка при попытке обновить текст");
                    return;
                }
            }
        } else {
            swiper.parentElement?.classList.add(
                "SyncLyricsScroller_root_intro__13gls"
            );
            swiper.parentElement?.classList.add(
                "SyncLyricsScroller_root_withVisibleUpperLyrics__d7noO"
            );

            // Время до окончания интро
            ms = syncedLyrics[0].timestamp - position * 1000;
            if (!counter) {
                counter = this.createCounter(ms, enableDigitTimer);
                swiper.insertBefore(counter!, swiper.firstChild);
            } else {
                counter.replaceWith(this.createCounter(ms, enableDigitTimer));
            }
        }

        const nextLyricsLine = syncedLyrics[nextLineIndex];
        this.translate = -syncedLyrics
            .slice(
                0,
                nextLineIndex == syncedLyrics.length
                    ? nextLineIndex
                    : nextLineIndex > 0
                        ? nextLineIndex - 1
                        : 0
            )
            .reduce((sum, line) => {
                const height = line.element?.offsetHeight || 0;
                return sum + height + 32;
            }, 0);

        if (nextLineIndex - 2 >= 0) {
            var prevLyricsLine = syncedLyrics[nextLineIndex - 2];
            prevLyricsLine.element?.classList.add("swiper-slide-prev");
            prevLyricsLine.element?.classList.remove("swiper-slide-active");
            prevLyricsLine.element?.classList.remove(
                "SyncLyricsScroller_line_active__6lLvH"
            );
        }

        if (nextLineIndex - 1 >= 0) {
            var currentLyricsLine = syncedLyrics[nextLineIndex - 1];
            currentLyricsLine.element?.classList.remove("swiper-slide-next");
            currentLyricsLine.element?.classList.add("swiper-slide-active");
            currentLyricsLine.element?.classList.add(
                "SyncLyricsScroller_line_active__6lLvH"
            );
        }

        if (counter) {
            if (nextLineIndex == 1) {
                swiper.classList.remove("SyncLyricsScroller_root_intro__13gl");
                counter.classList.add("swiper-slide-prev");
                counter.classList.remove("swiper-slide-active");
                counter.classList.remove("SyncLyricsScroller_line_active__6lLvH");
                counter.remove();
            } else if (nextLineIndex > 1) {
                counter.remove();
                counter = null;
            }
        }

        nextLyricsLine?.element?.classList.add("swiper-slide-next");

        swiper.style.transform = `translate3d(0px, ${this.translate}px, 0px)`;

        if (nextLyricsLine) {
            let timeoutDelay =
                (nextLyricsLine?.timestamp - position * 1000) /
                (window?.player?.state?.currentMediaPlayer?.value?.audioPlayerState
                    ?.speed?.value ?? 1);

            if (
                enableDigitTimer &&
                ms &&
                position < syncedLyrics[0].timestamp / 1000
            ) {
                timeoutDelay = ms > 3000 ? timeoutDelay - 3000 : ms % 1000;
            }

            this.timeout = setTimeout(
                this.updateFullScreenLyricsProgress.bind(this),
                timeoutDelay
            );
        }
    }

    /**
     * Создает таймер синхронизированного текста.
     * @param {number} ms Время до окончания интро.
     * @param {boolean} enableDigitTimer Использовать ли цифровой таймер.
     * @returns {HTMLElement} Таймер синхронизированного текста.
     */
    private createCounter(ms: number, enableDigitTimer: boolean): HTMLElement {
        var counterParent = HtmlDefenetions.COUNTER_PARENT;

        if (ms > 3000 || !enableDigitTimer) {
            var counter = HtmlDefenetions.COUNTER;

            if (Helpers.playerState?.status?.value == "paused") {
                counter
                    .querySelectorAll(".SyncLyricsLoader_element___Luwv")
                    .forEach((pointEl) =>
                        pointEl.classList.add("SyncLyricsLoader_element_paused__LFpD0")
                    );
            }
        } else {
            var counter = Helpers.createElementFromHTML(
                '<span class="SyncLyricsLine_root__r62BN SyncLyricsScroller_counterLine__NpBT4"></span>'
            );
            counter.textContent = (Math.floor(ms / 1000) + 1).toString();
        }
        counterParent.appendChild(counter);
        return counterParent;
    }

    /**
     * Cоздает и добавляет элемент в полноэкранном режиме с синхронизируемым текстом песни.
     * @returns {Promise<void>}
     */
    async createLyricsModal(): Promise<void> {
        if (
            Helpers.meta?.lyricsInfo?.hasAvailableSyncLyrics ||
            !this.addon.latestTrackLyrics?.syncedLyrics
        ) {
            return;
        }

        var latestTrack: TrackLyrics | null = this.addon.latestTrackLyrics;

        if (this.addon.latestTrackLyrics?.trackName !== Helpers.meta?.title) {
            const trackName = Helpers.meta?.title;
            const artistName = Helpers.meta?.artists
                ?.map((a: any) => a.name)
                .join(", ");
            const trackLength = Helpers.progress?.duration;
            latestTrack = await this.addon.getTrackLyrics(
                trackName,
                artistName,
                trackLength
            );
        }

        if (!latestTrack) return;

        await Helpers.delay(1);

        const root = document.querySelector(
            ".FullscreenPlayerDesktopContent_root__tKNGK"
        );

        if (!root) return;

        var lyricsContainer = root.querySelector(
            ".FullscreenPlayerDesktopContent_syncLyrics__6dTfH"
        );

        if (lyricsContainer) return;

        var additionalContent = root.querySelector(
            ".FullscreenPlayerDesktopContent_additionalContent__tuuy7"
        ) as HTMLElement;

        if (!additionalContent) {
            additionalContent = HtmlDefenetions.ADDITIONAL_CONTENT;
            Helpers.setCustom(additionalContent, true);
            root.appendChild(additionalContent);
        } else {
            if (!Helpers.isCustom(additionalContent)) {
                additionalContent.replaceChildren();
            }
        }

        lyricsContainer = HtmlDefenetions.LYRICS_CONTAINER;

        lyricsContainer.querySelector(QueryConstants.SYNC_LYRICS_FOOTER_WRITERS)!.textContent = 'Авторы: ' + this.addon.latestTrackLyrics?.artistName;

        additionalContent.appendChild(lyricsContainer);

        // Закрытие полноэкранного режима
        document
            .querySelector('[data-test-id="FULLSCREEN_PLAYER_CLOSE_BUTTON"]')
            ?.addEventListener("click", this.removeLyricsModal.bind(this));

        const swiper = lyricsContainer.querySelector(
            ".swiper-wrapper"
        ) as HTMLElement;

        const swiiperFirstChild = swiper.firstChild;

        let i = 0;
        this.addon.latestTrackLyrics?.syncedLyrics.forEach((line) => {
            line.element = HtmlDefenetions.SYNCED_LYRICS_LINE;
            line.element.querySelector(
                QueryConstants.SYNC_LYRICS_LINE_CONTENT
            )!.textContent = line.text;

            line.element.addEventListener("click", () => {
                if (
                    !swiper.classList.contains(
                        "SyncLyricsScroller_root_withVisibleScrolledLyrics__lowGE"
                    )
                )
                    return;

                clearTimeout(this.wheelTimeout!);
                window.player.setProgress(line.timestamp / 1000);
            });
            swiper.insertBefore(line.element, swiiperFirstChild);

            if (i == 0) {
                line.element.classList.add("swiper-slide-next");
            }

            i++;
        });

        swiper.addEventListener("mouseenter", () => {
            swiper.classList.add(
                "SyncLyricsScroller_root_withVisibleUpperLyrics__d7noO"
            );
            clearTimeout(this.hoverTimeout!);
        });

        swiper.addEventListener("mouseleave", () => {
            this.hoverTimeout = setTimeout(() => {
                swiper.classList.remove(
                    "SyncLyricsScroller_root_withVisibleUpperLyrics__d7noO"
                );
            }, 3000);
        });

        Helpers.setCustom(swiper, true);

        swiper.addEventListener("wheel", (event: Event) => {
            const ev = event as WheelEvent;

            ev.preventDefault();
            clearTimeout(this.timeout!);
            clearTimeout(this.wheelTimeout!);

            this.translate -= ev.deltaY;

            if (this.translate > 0) {
                this.translate = 0;
            }
            if (this.translate < -swiper.clientHeight) {
                this.translate = -swiper.clientHeight;
            }

            swiper.style.transform = `translate3d(0px, ${this.translate}px, 0px)`;
            swiper.classList.add(
                "SyncLyricsScroller_root_withVisibleScrolledLyrics__lowGE"
            );

            swiper
                .querySelector(".SyncLyricsScroller_line_active__6lLvH")
                ?.classList.remove("SyncLyricsScroller_line_active__6lLvH");

            this.wheelTimeout = setTimeout(() => {
                this.updateFullScreenLyricsProgress();
            }, 3000);
        });

        this.updateFullScreenLyricsProgress();
    }

    /**
     * Удаление синхронизированного текта
     */
    private removeLyricsModal(): void {
        if (this.timeout) clearTimeout(this.timeout);
        if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
        if (this.wheelTimeout) clearTimeout(this.wheelTimeout);

        this.timeout = this.hoverTimeout = this.wheelTimeout = null;

        document
            .querySelector(".FullscreenPlayerDesktopContent_syncLyrics__6dTfH")
            ?.remove();
        document
            .querySelector(".FullscreenPlayerDesktopContent_fullscreenContent__Nvety")
            ?.classList.remove(
                "FullscreenPlayerDesktopContent_fullscreenContent_enter__xMN2Y"
            );
    }
}
