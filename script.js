/**
 * Работа скрипта перенесена в отдельный класс дабы не засорять глобальную область видимости.
 */
class ReachText {
  /**
   * Логика работы скрипта
   */
  main() {
    /**
     * @type {boolean} Включает подробное логгирование.
     */
    const traceEnabled = false;

    /**
     * Необходим для подробного логгирования.
     * @param {*} msg Сообщение.
     */
    function trace(msg) {
      if (traceEnabled) {
        console.log(`[ReachText] [TR]: ${msg}`);
      }
    }

    /**
     * Геттеры, упрощающие получение информации о текущем треке.
     */
    const info = {
      get progress() {
        return player?.state?.currentMediaPlayer?.value?.audioPlayerState
          ?.progress?.value;
      },
      get meta() {
        return player?.state?.queueState?.currentEntity?.value?.entity
          ?.entityData?.meta;
      },
      get playerState() {
        return window?.player?.state?.playerState;
      },
      get status() {
        return window?.player?.state?.currentMediaPlayer?.value
          ?.audioPlayerState?.status?.observableValue?.value;
      },
    };

    let syncLyricsOpened = false;

    /**
     * Содержит информацию о последнем проигрываемом треке.
     */
    let latestTrack = {
      trackName: null,
      plainLyrics: null,
      syncedLyrics: null,
    };

    /**
     * Решил выделить задержку в отдельную переменную, так как привык к синтаксису C# :3
     * @param {number} ms Задержка в миллисекундах.
     * @returns {Promise<any>} Promise для задержки.
     */
    const delay = async (ms) =>
      await new Promise((resolve) => setTimeout(resolve, ms));

    /**
     * Движение по оси Y для синхронизированного текста
     */
    let translate = 0;

    /**
     * Массив объектов представляющие элемент, время и содержанние всех строк синхронизированного текста
     */
    let lyricsLines;

    /**
     * timeout, который используется для синхронизированного текста
     */
    let timeout = null;

    /**
     * timeout, который используется для задержки после наведения курсора на синхронизированный текст
     */
    let hoverTimeout = null;

    /**
     * timeout, который используется для задержки после наведения прокрутки мышью синхронизированного текста
     */
    let wheelTimeout = null;

    /**
     * @type {WeakSet<HTMLElement>} Список кнопок, открывающих контекстное меню на которые была наложена отслежка нажатия
     */
    let registeredButtons = new WeakSet();

    ///////////////////////////////////////
    /* Логика синхронизированного текста */
    ///////////////////////////////////////

    document
      .querySelector('[data-test-id="FULLSCREEN_PLAYER_BUTTON"]')
      ?.addEventListener("click", () => {
        syncLyricsOpened = false;
      });

    // Подписка не эвенте плеера
    info.playerState.event.onChange(async (event) => {
      switch (event) {
        // Если трек поставлен на паузу
        case "audio-paused":
        case "audio-ended":
        case "audio-end":
          if (!info.meta?.lyricsInfo?.hasAvailableSyncLyrics) {
            // Остановка анимации таймера
            document
              .querySelector(".SyncLyricsScroller_counter__B2E7K")
              ?.querySelectorAll(".SyncLyricsLoader_element___Luwv")
              ?.forEach((pointEl) =>
                pointEl.classList.add("SyncLyricsLoader_element_paused__LFpD0")
              );
            clearTimeout(timeout);
          }
          break;
        // Если трек был убран с паузы или была изменена позиция трека
        case "audio-resumed":
        case "audio-set-progress":
        case "audio-updating-progress":
          if (
            latestTrack.trackName != info.meta?.title &&
            !info.meta?.lyricsInfo?.hasAvailableSyncLyrics
          ) {
            trace("Удаление синхронизированного текста");
            removeLyricsModal();
          } else if (
            document.querySelector(
              ".FullscreenPlayerDesktopContent_root__tKNGK"
            ) &&
            !info.meta?.lyricsInfo?.hasAvailableSyncLyrics &&
            latestTrack.syncedLyrics
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
                pointEl.classList.remove(
                  "SyncLyricsLoader_element_paused__LFpD0"
                )
              );

            await updateFullScreenLyricsProgress();
          }

          break;
        // После того как трек загрузился
        case "audio-canplay":
          setTimeout(() => handleAudioCanplay(), 0);
          break;
      }
    });

    /**
     * Добавляет обработчик нажатий на все кнопки, открывающее контекстное меню
     */
    function addContextMenuEventListeners(root = document) {
      root
        .querySelectorAll(
          '[data-test-id="TRACK_CONTEXT_MENU_BUTTON"], [data-test-id="PLAYERBAR_DESKTOP_CONTEXT_MENU_BUTTON"]'
        )
        .forEach((button) => {
          if (!registeredButtons.has(button)) {
            button.addEventListener("mousedown", (ev) =>
              updateContextMenuLyrics(ev.currentTarget)
            );
            registeredButtons.add(button);
          }
        });
    }

    /**
     * При эвентах audio-canplay обновляет синхронизированный текст. Вынесено в отдельную функцию для предотвращения блокировки потока.
     * @returns {void} Возращается при прекращении работы.
     */
    async function handleAudioCanplay() {
      clearTimeout(timeout);

      if (
        document.querySelector(".swiper-wrapper")?.isCustom &&
        info.meta?.lyricsInfo?.hasAvailableSyncLyrics
      ) {
        await removeLyricsModal();
      }

      if (info.meta?.lyricsInfo?.hasAvailableSyncLyrics) {
        clearTrackLyrics();
        latestTrack.trackName = null;
        return;
      }

      const availableButtonClass = "HbaqudSqu7Q3mv3zMPGr";
      var playerSyncLyricsButton = document.querySelector(
        '[data-test-id="PLAYERBAR_DESKTOP_SYNC_LYRICS_BUTTON"]'
      );

      var trackName = info.meta?.title;
      var artistName = info.meta?.artists
        ?.map((artist) => artist.name)
        .join(", ");
      var trackLength = info.progress?.duration;

      if (!trackName || !artistName || trackName == latestTrack.trackName)
        return;

      if (!info.meta?.lyricsInfo?.hasAvailableSyncLyrics) {
        latestTrack.trackName = trackName;
        await getTrackLyrics(trackName, artistName, trackLength);
        await removeLyricsModal();
      }

      const lyricsButton = document.querySelector(
        '[data-test-id="PLAYERBAR_DESKTOP_SYNC_LYRICS_BUTTON"]'
      );

      if (latestTrack.syncedLyrics) {
        if (
          document.querySelector(
            ".FullscreenPlayerDesktopContent_root__tKNGK"
          ) &&
          syncLyricsOpened
        ) {
          await createLyricsModal();
        }
        // Включаем кнопку
        lyricsButton?.removeEventListener("click", onLyricsButtonClick);
        lyricsButton?.addEventListener("click", onLyricsButtonClick);
        playerSyncLyricsButton.classList.add(availableButtonClass);
        playerSyncLyricsButton.removeAttribute("disabled");
      } else {
        // Выключаем кнопку
        lyricsButton?.removeEventListener("click", onLyricsButtonClick);
        playerSyncLyricsButton.classList.remove(availableButtonClass);
        playerSyncLyricsButton.setAttribute("disabled", "true");
      }
    }

    // Сначала установим обработчики для уже существующих кнопок
    addContextMenuEventListeners();

    // Настроим наблюдатель
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (!(node instanceof HTMLElement)) return;

            // Если узел — сама кнопка, — обработать
            if (
              node.matches?.(
                '[data-test-id="TRACK_CONTEXT_MENU_BUTTON"], [data-test-id="PLAYERBAR_DESKTOP_CONTEXT_MENU_BUTTON"]'
              )
            ) {
              addContextMenuEventListeners(node.parentNode);
            }

            // Или если внутри есть нужные кнопки — обработать всё
            if (node.querySelectorAll) {
              addContextMenuEventListeners(node);
            }
          });
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    /**
     * Удаление синхронизированного текта
     */
    function removeLyricsModal() {
      if (timeout) clearTimeout(timeout);
      if (hoverTimeout) clearTimeout(hoverTimeout);
      if (wheelTimeout) clearTimeout(wheelTimeout);

      timeout = hoverTimeout = wheelTimeout = null;

      document
        .querySelector(".FullscreenPlayerDesktopContent_syncLyrics__6dTfH")
        ?.remove();
      document
        .querySelector(
          ".FullscreenPlayerDesktopContent_fullscreenContent__Nvety"
        )
        ?.classList.remove(
          "FullscreenPlayerDesktopContent_fullscreenContent_enter__xMN2Y"
        );
    }

    /**
     * Обновление синхронизированного текста
     * @returns {void} Возращается при прекращении работы.
     */
    async function updateFullScreenLyricsProgress() {
      var position = info.progress?.position;
      var swiper = document.querySelector(".swiper-wrapper");
      var counter = document.querySelector(
        ".SyncLyricsScroller_counter__B2E7K"
      );

      if (
        !swiper &&
        !info.meta?.lyricsInfo?.hasAvailableSyncLyrics &&
        syncLyricsOpened
      ) {
        await createLyricsModal();
        return updateFullScreenLyricsProgress();
      }

      if (!lyricsLines) return;

      if (timeout) {
        clearTimeout(timeout);
      }

      swiper.classList.remove(
        "SyncLyricsScroller_root_withVisibleScrolledLyrics__lowGE"
      );

      var player = document.querySelector(
        ".FullscreenPlayerDesktopContent_fullscreenContent__Nvety"
      );

      // Применение анимации
      player.classList.add(
        "FullscreenPlayerDesktopContent_fullscreenContent_enter__xMN2Y"
      );

      // Если интро длится больше 5 сек (5000 миллисекунд), то включаем цифровой таймер
      let enableDigitTimer = lyricsLines[0].timestamp > 5000;

      let nextLineIndex = 0;

      if (position > lyricsLines[0].timestamp / 1000) {
        swiper.parentElement.classList.remove(
          "SyncLyricsScroller_root_intro__13gls"
        );
        swiper.parentElement.classList.remove(
          "SyncLyricsScroller_root_withVisibleUpperLyrics__d7noO"
        );

        nextLineIndex = lyricsLines.findIndex(
          (line) => line.timestamp / 1000 > position
        );

        // Если следующая строчка не найдена, устанавливаем индекс больше последнего индекса (т.к оно является индексом следующей строчки, которой не существует в текущей позиции)
        if (nextLineIndex < 0) {
          if (
            position >=
            lyricsLines[lyricsLines.length - 1].timestamp / 1000
          ) {
            nextLineIndex = lyricsLines.length;
          } else {
            console.error("[ReachText] Ошибка при попытке обновить текст");
            return;
          }
        }
      } else {
        swiper.parentElement.classList.add(
          "SyncLyricsScroller_root_intro__13gls"
        );
        swiper.parentElement.classList.add(
          "SyncLyricsScroller_root_withVisibleUpperLyrics__d7noO"
        );

        // Время до окончания интро
        var ms = lyricsLines[0].timestamp - position * 1000;
        if (!counter) {
          counter = createCounter(ms, enableDigitTimer);
          swiper.insertBefore(counter, swiper.firstChild);
        } else {
          counter.replaceWith(createCounter(ms, enableDigitTimer));
        }
      }

      const nextLyricsLine = lyricsLines[nextLineIndex];
      translate = -lyricsLines
        .slice(
          0,
          nextLineIndex == lyricsLines.length
            ? nextLineIndex
            : nextLineIndex > 0
            ? nextLineIndex - 1
            : 0
        )
        .reduce((sum, line) => {
          const height = line.node?.offsetHeight || 0;
          return sum + height + 32;
        }, 0);

      if (nextLineIndex - 2 >= 0) {
        var prevLyricsLine = lyricsLines[nextLineIndex - 2];
        prevLyricsLine.node.classList.add("swiper-slide-prev");
        prevLyricsLine.node.classList.remove("swiper-slide-active");
        prevLyricsLine.node.classList.remove(
          "SyncLyricsScroller_line_active__6lLvH"
        );
      }

      if (nextLineIndex - 1 >= 0) {
        var currentLyricsLine = lyricsLines[nextLineIndex - 1];
        currentLyricsLine.node.classList.remove("swiper-slide-next");
        currentLyricsLine.node.classList.add("swiper-slide-active");
        currentLyricsLine.node.classList.add(
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

      nextLyricsLine?.node.classList.add("swiper-slide-next");

      swiper.style.transform = `translate3d(0px, ${translate}px, 0px)`;

      if (nextLyricsLine) {
        let timeoutDelay =
          (nextLyricsLine?.timestamp - position * 1000) /
          (player?.state?.currentMediaPlayer?.value?.audioPlayerState?.speed
            ?.value ?? 1);

        if (enableDigitTimer && position < lyricsLines[0].timestamp / 1000) {
          timeoutDelay = ms > 3000 ? timeoutDelay - 3000 : ms % 1000;
        }

        timeout = setTimeout(updateFullScreenLyricsProgress, timeoutDelay);
      }
    }

    /**
     * Вызывается при нажатии на кнопку открытия синхронизированного текста
     * @returns {Promise<void>} Возращается при завершении работы.
     */
    async function onLyricsButtonClick() {
      syncLyricsOpened = true;

      if (info.meta?.lyricsInfo?.hasAvailableSyncLyrics) {
        return;
      }

      var fullScreenButton = document.querySelector(
        '[data-test-id="FULLSCREEN_PLAYER_BUTTON"]'
      );
      fullScreenButton.click();
      await createLyricsModal();
    }

    /**
     * Создает таймер синхронизированного текста.
     * @param {number} ms Время до окончания интро.
     * @param {boolean} enableDigitTimer Использовать ли цифровой таймер.
     * @returns {Node} Таймер синхронизированного текста.
     */
    function createCounter(ms, enableDigitTimer) {
      var counterParent = createElementFromHTML(
        '<div class="swiper-slide swiper-slide-active SyncLyricsScroller_counter__B2E7K FullscreenPlayerDesktopContent_syncLyricsCounter__CnB_k" style="margin-bottom: 32px;"></div>'
      );
      if (ms > 3000 || !enableDigitTimer) {
        var counter = createElementFromHTML(
          '<div class="SyncLyricsLoader_root__I2hTe"><div class="SyncLyricsLoader_element___Luwv SyncLyricsLoader_element_withDefaultElement__WmP80" style="animation-delay: 0.275s; animation-duration: 1.1s, 1.1s;"></div><div class="SyncLyricsLoader_element___Luwv SyncLyricsLoader_element_withDefaultElement__WmP80" style="animation-delay: 0.55s; animation-duration: 1.1s, 1.1s;"></div><div class="SyncLyricsLoader_element___Luwv SyncLyricsLoader_element_withDefaultElement__WmP80" style="animation-delay: 0.825s; animation-duration: 1.1s, 1.1s;"></div><div class="SyncLyricsLoader_element___Luwv SyncLyricsLoader_element_withDefaultElement__WmP80" style="animation-delay: 1.1s; animation-duration: 1.1s, 1.1s;"></div></div>'
        );

        if (info.playerState?.status?.value == "paused") {
          counter
            .querySelectorAll(".SyncLyricsLoader_element___Luwv")
            .forEach((pointEl) =>
              pointEl.classList.add("SyncLyricsLoader_element_paused__LFpD0")
            );
        }
      } else {
        var counter = createElementFromHTML(
          '<span class="SyncLyricsLine_root__r62BN SyncLyricsScroller_counterLine__NpBT4"></span>'
        );
        counter.textContent = (Math.floor(ms / 1000) + 1).toString();
      }
      counterParent.appendChild(counter);
      return counterParent;
    }

    /**
     * Cоздает и добавляет элемент в полноэкранном режиме с синхронизируемым текстом песни.
     * @returns {void} Возращается при прекращении работы.
     */
    async function createLyricsModal() {
      if (
        info.meta?.lyricsInfo?.hasAvailableSyncLyrics ||
        !latestTrack?.syncedLyrics
      ) {
        trace(
          `Отмена создания синхронизированного текста потому что:\n1) синхронизированный текст уже предоставлен YM (${
            info.meta?.lyricsInfo?.hasAvailableSyncLyrics
          })\n2) кастомный синхронизированный текст отсутствует (${!latestTrack?.syncedLyrics})`
        );
        return;
      }

      if (latestTrack?.trackName !== info.meta?.title) {
        const trackName = info.meta?.title;
        const artistName = info.meta?.artists?.map((a) => a.name).join(", ");
        const trackLength = info.progress?.duration;
        latestTrack.trackName = trackName;
        await getTrackLyrics(trackName, artistName, trackLength);
      }

      const syncedLyrics = latestTrack.syncedLyrics;

      await delay(10);

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
      );

      if (!additionalContent) {
        additionalContent = createElementFromHTML(
          '<div class="FullscreenPlayerDesktopContent_additionalContent__tuuy7"></div>'
        );
        root.appendChild(additionalContent);
      }

      lyricsContainer = createElementFromHTML(
        `<div     class="SyncLyrics_root__6KZg4 FullscreenPlayerDesktopContent_syncLyrics__6dTfH"   >     <div       class="SyncLyrics_content__lbkWP FullscreenPlayerDesktopContent_syncLyricsContent__H_enX"       data-test-id="SYNC_LYRICS_CONTENT"     >       <div         class="swiper swiper-initialized swiper-vertical swiper-free-mode SyncLyricsScroller_root__amiLm undefined FullscreenPlayerDesktopContent_syncLyricsScroller__JslVK"       >         <div           class="swiper-wrapper"           style="             transition-duration: 500ms;             transform: translate3d(0px, 0px, 0px);             transition-delay: 0ms;           "         >    <div             class="swiper-slide FullscreenPlayerDesktopContent_syncLyricsFooter__HS8JZ"             style="margin-bottom: 32px"           >             <footer class="SyncLyricsFooter_root__STCKQ">               <div                 class="_MWOVuZRvUQdXKTMcOPx V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR SyncLyricsFooter_writers__c7zhj"               >                 Авторы: ${latestTrack.artistName}            </div>               <div                 class="_MWOVuZRvUQdXKTMcOPx V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR SyncLyricsFooter_major__QMZmT"               >                 Источник: LRCLib              </div>             </footer>           </div>         </div>       </div>     </div>   </div> `
      );

      additionalContent.appendChild(lyricsContainer);

      // Закрытие полноэкранного режима
      document
        .querySelector('[data-test-id="FULLSCREEN_PLAYER_CLOSE_BUTTON"]')
        ?.addEventListener("click", removeLyricsModal);

      const swiper = lyricsContainer.querySelector(".swiper-wrapper");
      const swiiperFirstChild = swiper.firstChild;

      var jsonLyricsLines = syncedLyricsToObj(syncedLyrics);

      let i = 0;
      lyricsLines = jsonLyricsLines.map((line) => {
        const nodeLine = createElementFromHTML(
          `<div class="swiper-slide SyncLyricsScroller_line__Vh6WN" data-test-id="SYNC_LYRICS_LINE" style="margin-bottom: 32px;"><span class="SyncLyricsLine_root__r62BN">${line.text}</span></div>`
        );

        nodeLine.addEventListener("click", () => {
          if (
            !swiper.classList.contains(
              "SyncLyricsScroller_root_withVisibleScrolledLyrics__lowGE"
            )
          )
            return;

          clearTimeout(wheelTimeout);
          window.player.setProgress(line.timestamp / 1000);
        });
        swiper.insertBefore(nodeLine, swiiperFirstChild);

        if (i == 0) {
          nodeLine.classList.add("swiper-slide-next");
        }

        i++;
        return { node: nodeLine, timestamp: line.timestamp, text: line.text };
      });

      swiper.addEventListener("mouseenter", () => {
        swiper.classList.add(
          "SyncLyricsScroller_root_withVisibleUpperLyrics__d7noO"
        );
        clearTimeout(hoverTimeout);
      });

      swiper.addEventListener("mouseleave", () => {
        hoverTimeout = setTimeout(() => {
          swiper.classList.remove(
            "SyncLyricsScroller_root_withVisibleUpperLyrics__d7noO"
          );
        }, 3000);
      });

      swiper.isCustom = true;

      swiper.addEventListener("wheel", (ev) => {
        ev.preventDefault(); // keep the page fixed
        clearTimeout(timeout);
        clearTimeout(wheelTimeout);

        translate -= ev.deltaY;

        if (translate > 0) {
          translate = 0;
        }
        if (translate < -swiper.clientHeight) {
          translate = -swiper.clientHeight;
        }

        swiper.style.transform = `translate3d(0px, ${translate}px, 0px)`;
        swiper.classList.add(
          "SyncLyricsScroller_root_withVisibleScrolledLyrics__lowGE"
        );
        swiper
          .querySelector(".SyncLyricsScroller_line_active__6lLvH")
          ?.classList.remove("SyncLyricsScroller_line_active__6lLvH");

        wheelTimeout = setTimeout(() => {
          updateFullScreenLyricsProgress();
        }, 3000);
      });

      updateFullScreenLyricsProgress();
    }

    /**
     * Форматирует синхронизируемый текст песни в объект.
     * @param {String} syncedLyrics Синхронизируемый текст песни.
     * @return {Array<any>} Отформатируенный объект
     */
    function syncedLyricsToObj(syncedLyrics) {
      const result = syncedLyrics.split("\n").map((line) => {
        const match = line.match(/\[(\d{2}):(\d{2}).(\d{2})\] (.+)/);
        if (match) {
          const minutes = parseInt(match[1]);
          const seconds = parseInt(match[2]);
          const milliseconds = parseInt(match[3]);
          const totalMilliseconds =
            ((60 * minutes + seconds) * 100 + milliseconds) * 10;
          return {
            timestamp: totalMilliseconds,
            text: match[4],
          };
        }
      });

      return result.filter(
        (line) => line !== undefined && line.text != undefined
      );
    }

    ////////////////////////////////////////////
    /* Логика работы текста контекстного меню */
    ////////////////////////////////////////////

    /**
     * Обработчик нажатия кнопки открытия контекстного меню.
     * @param {Node} el Элемент кнопки контекстного меню.
     * @returns {void} Возращается при прекращении работы.
     */
    async function updateContextMenuLyrics(el) {
      await delay(10);
      var contextMenu = document.querySelector(
        '[data-test-id="TRACK_CONTEXT_MENU"]'
      );

      if (!contextMenu) {
        return;
      }

      var contextLyricsButton = document.querySelector(
        '[data-test-id="TRACK_CONTEXT_MENU_LYRICS_BUTTON"]'
      );

      if (contextLyricsButton) return;

      let trackContainer = el.parentElement.parentElement.parentElement;

      // Ищем родителя с метаданными
      do {
        trackContainer = trackContainer.parentElement;
      } while (
        trackContainer &&
        !trackContainer.querySelector(".Meta_title__GGBnH")
      );

      var trackName = getNameAndFormat(".Meta_title__GGBnH", trackContainer);

      var artistName = getNameAndFormat(
        ".Meta_artistCaption__JESZi",
        trackContainer
      );

      if (
        !trackName ||
        !artistName ||
        (latestTrack.trackName == trackName && !latestTrack.plainLyrics)
      )
        return;

      if (trackName && artistName && latestTrack.trackName != trackName) {
        latestTrack.trackName = trackName;
        await getTrackLyrics(trackName, artistName);
      }

      if (!latestTrack.plainLyrics) {
        return;
      }

      contextLyricsButton = createContextButton();

      contextLyricsButton.addEventListener("click", async () => {
        await createLyricsDialog(
          latestTrack.trackName,
          latestTrack.artistName,
          latestTrack.plainLyrics
        );

        contextMenu.style.opacity = 0;
        await delay(250);
        let uiPortal = contextMenu;

        do {
          if (uiPortal.getAttribute("data-floating-ui-portal") != null) {
            console.log('atttt', uiPortal);
            break;
          }
          uiPortal = uiPortal.parentElement;
        } while (uiPortal);

        if (!uiPortal) {
          uiPortal = contextMenu;
        }

        uiPortal.remove();
      });

      contextMenu.insertBefore(
        contextLyricsButton,
        document.querySelector('[data-test-id="CONTEXT_MENU_SHARE_BUTTON"]')
          .parentElement
      );
    }

    /**
     * Создает и добавляет всплывающее окно с текстом песни.
     * @param {String} trackName Название трека.
     * @param {String} artistName Имена авторов.
     * @param {String} plainLyrics Текст песни.
     */
    async function createLyricsDialog(trackName, artistName, plainLyrics) {
      if (!plainLyrics) {
        return;
      }

      const dialog = createElementFromHTML(
        `<div id=":r1hk:" data-floating-ui-portal="">   <div     class="l66GiFKS1Ux_BNd603Cu TrackLyricsModal_overlay__0Ehwu Gr0NtROEpipzr518Mwr6"     data-floating-ui-inert=""     aria-hidden="true"     style="position: fixed; overflow: auto; inset: 0px"   ></div>   <span     data-type="inside"     tabindex="0"     aria-hidden="true"     data-floating-ui-focus-guard=""     data-floating-ui-inert=""     style="       border: 0px;       clip: rect(0px, 0px, 0px, 0px);       height: 1px;       margin: -1px;       overflow: hidden;       padding: 0px;       position: fixed;       white-space: nowrap;       width: 1px;       top: 0px;       left: 0px;     "   ></span>   <div>     <div       tabindex="-1"       id=":r3v:"       role="dialog"       class="ifxS_8bgSnwBoCsyow0E t7tk8IYH3tGrhDZJpi3Z ptxrCeHwJ9gOgMXsd0w6 TrackLyricsModal_root__KsVRf"       data-test-id="TRACK_LYRICS_MODAL"       style="         --header-height: 72px;         transition-property: opacity, transform;         opacity: 0;         transform: translateX(50px);         transition-duration: 300ms;       "     >       <header class="wEOFUiLOfluq86BrDUfg TrackLyricsModal_header__nWar3">         <h3           class="_MWOVuZRvUQdXKTMcOPx _sd8Q9d_Ttn0Ufe4ISWS nSU6fV9y80WrZEfafvww xuw9gha2dQiGgdRcHNgU"         >           <span data-test-id="TRACK_LYRICS_TITLE">${trackName}</span>         </h3>         <button           class="cpeagBA1_PblpJn8Xgtv iJVAJMgccD4vj4E4o068 uwk3hfWzB2VT7kE13SQk IlG7b1K0AD7E7AMx6F5p nHWc2sto1C6Gm0Dpw_l0 oR11LfCBVqMbUJiAgknd qU2apWBO1yyEK0lZ3lPO undefined YUY9QjXr1E4DQfQdMjGt"           type="button"           aria-label="Закрыть"           data-test-id="TRACK_LYRICS_CLOSE_BUTTON"           aria-live="off"           aria-busy="false"         >           <span class="JjlbHZ4FaP9EAcR_1DxF"             ><svg               class="J9wTKytjOWG73QMoN5WP l3tE1hAMmBj2aoPPwU08"               focusable="false"               aria-hidden="true"               style="padding: var(--ym-icon-padding, 6px)"             >               <use xlink:href="#close"></use></svg></span>         </button>       </header>       <div         class="fp0QgCrX1y48p3elvLVi ni3sfTj4hRfj63FbfQTG TrackLyricsModal_modalContent__uYdL2"       >         <div           class="TrackLyricsModal_content__Cstzi"           data-test-id="TRACK_LYRICS_TEXT"         >${plainLyrics}<div class="Lyrics_writers__xvrNp">             <div               class="_MWOVuZRvUQdXKTMcOPx V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR"               data-test-id="TRACK_LYRICS_AUTHORS"             >Авторы: ${artistName}</div>             <div               class="_MWOVuZRvUQdXKTMcOPx V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR"               data-test-id="TRACK_LYRICS_SOURCE"             >Источник: LRCLib</div>           </div>         </div>       </div>     </div>   </div>   <span     data-type="inside"     tabindex="0"     aria-hidden="true"     data-floating-ui-focus-guard=""     data-floating-ui-inert=""     style="       border: 0px;       clip: rect(0px, 0px, 0px, 0px);       height: 1px;       margin: -1px;       overflow: hidden;       padding: 0px;       position: fixed;       white-space: nowrap;       width: 1px;       top: 0px;       left: 0px;     "   ></span> </div>`
      );
      const mainContainer = document.querySelector(".Content_main__8_wIa");
      const modal = dialog.querySelector('[data-test-id="TRACK_LYRICS_MODAL"]');

      dialog
        .querySelector('[data-test-id="TRACK_LYRICS_CLOSE_BUTTON"]')
        .addEventListener("click", () => {
          onClosingDialog(modal, dialog);
        });

      mainContainer.appendChild(dialog);

      dialog
        .querySelector(".TrackLyricsModal_overlay__0Ehwu")
        .addEventListener("click", () => {
          onClosingDialog(modal, dialog);
        });

      await delay(10);
      modal.style.opacity = 1;
      modal.style.transform = "translateX(0px)";
    }

    /**
     * Вызывается при закрытии диалога с текстом.
     * @param {Node} modal Элемент представляющий TRACK_LYRICS_MODAL.
     * @param {Node} dialog Элемент представляющий диалог с текстом.
     */
    async function onClosingDialog(modal, dialog) {
      modal.style.opacity = 0;
      modal.style.transform = "translateX(50px)";
      await delay(300);
      dialog.remove();
    }

    /**
     * Создает кнопку для контекстного меню.
     * @returns {Node} Элемент представляющий кнопку для контекстного меню.
     */
    function createContextButton() {
      var button = document.createElement("button");
      button.className =
        "cpeagBA1_PblpJn8Xgtv UDMYhpDjiAFT3xUx268O dgV08FKVLZKFsucuiryn IlG7b1K0AD7E7AMx6F5p HbaqudSqu7Q3mv3zMPGr qU2apWBO1yyEK0lZ3lPO kc5CjvU5hT9KEj0iTt3C EiyUV4aCJzpfNzuihfMM";
      button.type = "button";
      button.role = "menuitem";
      button.setAttribute("data-test-id", "TRACK_CONTEXT_MENU_LYRICS_BUTTON");
      button.tabIndex = -1;
      button.setAttribute("aria-live", "off");
      button.setAttribute("aria-busy", "false");

      var span = document.createElement("span");
      span.innerHTML =
        '<span class="JjlbHZ4FaP9EAcR_1DxF"><svg class="J9wTKytjOWG73QMoN5WP elJfazUBui03YWZgHCbW vqAVPWFJlhAOleK_SLk4 l3tE1hAMmBj2aoPPwU08" focusable="false" aria-hidden="true" style="padding: var(--ym-icon-padding, 3px 2px);"><use xlink:href="#lyrics"></use></svg>Показать текст песни</span>';

      button.appendChild(span);
      return button;
    }

    /**
     * Создает node элемент из HTML строки.
     * src: https://stackoverflow.com/a/494348/25080935
     * @param {String} htmlString HTML строка представляющая node элемент.
     * @returns {Node} Элемент созданный из HTML строки.
     */
    function createElementFromHTML(htmlString) {
      var div = document.createElement("div");
      div.innerHTML = htmlString.trim();

      return div.firstChild;
    }

    /**
     * Вспомогательный метод, извлекающий текстовое содержимое элемента.
     * @param {String} querySelector Селектор для querySelector.
     * @param {Node | null} doc (Необязательно.) Родитель искомого элемента
     * @returns {Node} Текстовое содержимое элемента.
     */
    function getNameAndFormat(querySelector, doc) {
      if (!doc) {
        doc = document;
      }
      return doc.querySelector(querySelector)?.textContent.trim();
    }

    /**
     * Получает и устанавливает текст песни в latestTrack.
     * @param {String} trackName Название трека.
     * @param {String} artistName Имя исполнителя.
     * @param {Number | null} trackDuration (Необязательно.) Длина трека в секундах. Используется для дополнительной выборки результатов.
     * @returns {void} Возращается при прекращении работы.
     */
    async function getTrackLyrics(trackName, artistName, trackDuration) {
      try {
        trace(
          `Отправляется запрос на получение текста: ${trackName} - ${artistName} ${
            trackDuration
              ? "(" + trackDuration + "s)"
              : "(длина песни не указана)"
          }`
        );
        let plainResults = await fetch(
          `https://lrclib.net/api/search?track_name=${encodeURIComponent(
            trackName
          )}&artist_name=${encodeURIComponent(artistName)}`
        );
        if (!plainResults.ok) {
          throw new Error(
            `[ReachText] Ошибка сети: Не удалось подключится в LRCLib API. Status: ${plainResults.status}`
          );
        }
        let results = await plainResults.json();
        if (!results || !Array.isArray(results)) {
          trace("Неудачная попытка получения текста");
          clearTrackLyrics();
          return;
        }

        var syncedResults = [];
        if (trackDuration && trackDuration > 0) {
          // Если указана длина трека, то исключем из результата те треки, длина которых не соответсвует действительной. Полезно для синхронизированного текста
          syncedResults = results.filter(
            (result) => result.duration == trackDuration
          );
        }

        if (results.length == 0) {
          trace("Результатов не найдено");
          clearTrackLyrics();
          return;
        }

        latestTrack.plainLyrics = results[0].plainLyrics;
        latestTrack.syncedLyrics =
          syncedResults.length > 0
            ? syncedResults[0].syncedLyrics
            : results[0].syncedLyrics;
        latestTrack.artistName = results[0].artistName;
        console.log(`[ReachText] Получен текст с LRCLib:`, results[0]);
      } catch (e) {
        console.error(`[ReachText] Ошибка получения текста с LRCLib:`, e);
      }
    }

    /**
     * Очищает текст песни в latestTrack
     */
    async function clearTrackLyrics() {
      latestTrack.plainLyrics = null;
      latestTrack.syncedLyrics = null;
    }

    trace("Начало работы");
  }
}

new ReachText().main();
