/**
 * @type {boolean} Включает подробное логгирование
 */
const traceEnabled = false;

/**
 * Необходим для подробного логгирования
 * @param {*} msg Сообщение
 */
function trace(msg) {
  if (traceEnabled) {
    console.log(`[ReachText] [TR]: ${msg}`);
  }
}

setInterval(() => {
  addContextMenuEventListeners();
}, 20);

/**
 * Геттеры, урпощающие получение информации о текущем треке
 */
const info = {
  get progress() {
    return player?.state?.currentMediaPlayer?.value?.audioPlayerState?.progress
      ?.value;
  },
  get meta() {
    return player?.state?.queueState?.currentEntity?.value?.entity?.entityData
      ?.meta;
  },
  get playerState() {
    return window?.player?.state?.playerState;
  },
  get status() {
    return window?.player?.state?.currentMediaPlayer?.value?.audioPlayerState
      ?.status?.observableValue?.value;
  },
};

/**
 * Содержит информацию о последнем проигрываемом треке.
 */
let latestTrack = { trackName: null, plainLyrics: null, syncedLyrics: null };

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

// Создание синхронизированного текста при нажатии на открытие полноэкранного режима
document
  .querySelector('[data-test-id="FULLSCREEN_PLAYER_BUTTON"]')
  .addEventListener("mouseup", createLyricsModal);

// Подписка не эвенте плеера
info.playerState.event.onChange(async (event) => {
  switch (event) {
    // Если трек поставлен на паузу
    case "audio-paused":
    case "audio-ended":
    case "audio-end":
      clearTimeout(timeout);
      break;
    // Если трек был убран с паузы или была изменена позиция трека
    case "audio-resumed":
    case "audio-set-progress":
    case "audio-updating-progress":
      // По какой-то причине не срабатывает при смене трека
      if (latestTrack.trackName != info?.meta?.title) {
        trace("Удаление синхронизированного текста");
        removeLyricsModal();
      } else {
        if (
          document.querySelector(".FullscreenPlayerDesktopContent_root__tKNGK")
        ) {
          await updateFullScreenLyricsProgress();
        }
      }
      break;
    // После того как трек загрузился
    case "audio-canplay":
      if (
        info.meta?.lyricsInfo.hasAvailableSyncLyrics ||
        latestTrack.trackName == info.meta?.title
      ) {
        break;
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

      if (!trackName || !artistName) break;

      if (trackName != latestTrack.trackName) {
        latestTrack.trackName = trackName;
        await getTrackLyrics(trackName, artistName, trackLength);
      }

      if (latestTrack.syncedLyrics) {
        // Включаем кнопку
        playerSyncLyricsButton.classList.add(availableButtonClass);
        playerSyncLyricsButton.removeAttribute("disabled");
        playerSyncLyricsButton.setAttribute("aria-hidden", "false");
      } else {
        // Выключаем кнопку
        playerSyncLyricsButton.classList.remove(availableButtonClass);
        playerSyncLyricsButton.setAttribute("disabled", "true");
        playerSyncLyricsButton.setAttribute("aria-hidden", "false");
      }
      break;
  }
});

/**
 * Удаление синхронизированного текта
 */
function removeLyricsModal() {
  if (timeout) {
    clearTimeout(timeout);
  }

  timeout = null;
  document
    .querySelector(".FullscreenPlayerDesktopContent_syncLyrics__6dTfH")
    ?.remove();
  document
    .querySelector(".FullscreenPlayerDesktopContent_fullscreenContent__Nvety")
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

  if (!swiper && !info.meta?.lyricsInfo.hasAvailableSyncLyrics) {
    return await createLyricsModal();
  }

  if (!lyricsLines) return;

  if (timeout) {
    clearTimeout(timeout);
  }

  let index = lyricsLines.findIndex((line) => line.timestamp / 1000 > position);

  if (index < 0) {
    console.error("[ReachText] Ошибка при попытке обновить текст");
    return;
  } else {
    translate = -lyricsLines
      .slice(0, index > 0 ? index - 1 : 0)
      .reduce((sum, line) => {
        const height = line.node?.offsetHeight || 0;
        return sum + height + 32;
      }, 0);
  }

  swiper.style.transform = `translate3d(0px, ${translate}px, 0px)`;

  let timeoutDelay = (lyricsLines[index].timestamp / 1000 - position) * 1000;
  timeout = setTimeout(updateFullScreenLyricsProgress, timeoutDelay);
}

/**
 * Cоздает и добавляет элемент в полноэкранном режиме с синхронизируемым текстом песни.
 * @returns {void} Возращается при прекращении работы.
 */
async function createLyricsModal() {
  if (
    info.meta?.lyricsInfo.hasAvailableSyncLyrics ||
    !latestTrack?.syncedLyrics
  ) {
    return;
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

  var player = root.querySelector(
    ".FullscreenPlayerDesktopContent_fullscreenContent__Nvety"
  );

  //Применение анимации
  player.classList.add(
    "FullscreenPlayerDesktopContent_fullscreenContent_enter__xMN2Y"
  );

  lyricsContainer = createElementFromHTML(
    `<div     class="SyncLyrics_root__6KZg4 FullscreenPlayerDesktopContent_syncLyrics__6dTfH"   >     <div       class="SyncLyrics_content__lbkWP FullscreenPlayerDesktopContent_syncLyricsContent__H_enX"       data-test-id="SYNC_LYRICS_CONTENT"     >       <div         class="swiper swiper-initialized swiper-vertical swiper-free-mode SyncLyricsScroller_root__amiLm undefined FullscreenPlayerDesktopContent_syncLyricsScroller__JslVK"       >         <div           class="swiper-wrapper"           style="             transition-duration: 500ms;             transform: translate3d(0px, 0px, 0px);             transition-delay: 0ms;           "         >           <div             class="swiper-slide SyncLyricsScroller_counter__B2E7K FullscreenPlayerDesktopContent_syncLyricsCounter__CnB_k"             style="margin-bottom: 32px"           ></div>           <div             class="swiper-slide FullscreenPlayerDesktopContent_syncLyricsFooter__HS8JZ"             style="margin-bottom: 32px"           >             <footer class="SyncLyricsFooter_root__STCKQ">               <div                 class="_MWOVuZRvUQdXKTMcOPx V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR SyncLyricsFooter_writers__c7zhj"               >                 Авторы: ${latestTrack.artistName}            </div>               <div                 class="_MWOVuZRvUQdXKTMcOPx V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR SyncLyricsFooter_major__QMZmT"               >                 Источник: LRCLib              </div>             </footer>           </div>         </div>       </div>     </div>   </div> `
  );

  const scoller = lyricsContainer.querySelector(
    ".FullscreenPlayerDesktopContent_syncLyricsScroller__JslVK"
  );
  lyricsContainer.addEventListener("hover", (e) => {
    scoller.classList.add(
      "SyncLyricsScroller_root_withVisibleUpperLyrics__d7noO"
    );
  });

  additionalContent.appendChild(lyricsContainer);

  // Закрытие полноэкранного режима
  document
    .querySelector('[data-test-id="FULLSCREEN_PLAYER_CLOSE_BUTTON"]')
    .addEventListener("mouseup", removeLyricsModal);

  const swiper = lyricsContainer.querySelector(".swiper-wrapper");
  const swiiperFirstChild = swiper.firstChild;

  var jsonLyricsLines = syncedLyricsToObj(syncedLyrics);

  lyricsLines = jsonLyricsLines.map((line) => {
    const nodeLine = createElementFromHTML(
      `<div class="swiper-slide SyncLyricsScroller_line__Vh6WN SyncLyricsScroller_line_active__6lLvH swiper-slide-active" data-test-id="SYNC_LYRICS_LINE" style="margin-bottom: 32px;"><span class="SyncLyricsLine_root__r62BN">${line.text}</span></div>`
    );
    swiper.insertBefore(nodeLine, swiiperFirstChild);
    return { node: nodeLine, timestamp: line.timestamp, text: line.text };
  });

  if (!Array.isArray(lyricsLines) || lyricsLines.length < 2) return;

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

  return result.filter((line) => line !== undefined && line.text != undefined);
}

/**
 * Добавляет обработчик нажатий на все кнопки, открывающее контекстное меню
 */
function addContextMenuEventListeners() {
  document
    .querySelectorAll(
      '[data-test-id="TRACK_CONTEXT_MENU_BUTTON"], [data-test-id="PLAYERBAR_DESKTOP_CONTEXT_MENU_BUTTON"]'
    )
    .forEach((button) => {
      if (!button.hasClickEventListener) {
        button.addEventListener("mousedown", async (ev) => {
          await updateContextMenuLyrics(ev.currentTarget);
        });
        button.hasClickEventListener = true;
      }
    });
}

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

  if (!contextMenu) return;

  var contextLyricsButton = document.querySelector(
    '[data-test-id="TRACK_CONTEXT_MENU_LYRICS_BUTTON"]'
  );

  // Если кнопка есть, но текста нет - кнопка удаляется
  if (contextLyricsButton && !latestTrack.plainLyrics) {
    contextLyricsButton.remove();
    return;
  }

  if (contextLyricsButton) return;

  let trackContainer = el.parentElement.parentElement.parentElement;

  // Ищем родителя с метаданными
  do {
    trackContainer = trackContainer.parentElement;
  } while (trackContainer.querySelector(".Meta_title__GGBnH") == null);

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
    contextMenu.remove();
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
        trackDuration ? "(" + trackDuration + "s)" : "(длина песни не указана)"
      }`
    );
    let plainResults = await fetch(
      `https://lrclib.net/api/search?track_name=${trackName}&artist_name=${artistName}`
    );
    let results = await plainResults.json();
    if (!results || !Array.isArray(results)) {
      trace("Неудачная попытка получения текста");
      clearTrackLyrics();
      return;
    }

    if (trackDuration && trackDuration > 0) {
      // Если указана длина трека, то исключем из результата те треки, разница в длине которых больше 2 секунд по сравнению с действительностью
      results = results.filter(
        (result) => Math.abs(result.duration - trackDuration) < 2
      );
    }

    if (results.length == 0) {
      trace("Результатов не найдено");
      clearTrackLyrics();
      return;
    }

    latestTrack.plainLyrics = results[0].plainLyrics;
    latestTrack.syncedLyrics = results[0].syncedLyrics;
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
  latestTrack.syncLyrics = null;
}

trace("Начало работы");
