setInterval(() => {
  addContextMenuEventListeners();
  //await updateFullScreenLyrics();
}, 20);

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
          await updateContextMenuLyrics(ev.currentTarget)
        });;
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

  let trackContainer =
    el.parentElement.parentElement.parentElement;

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
    await getTrackLyrics(trackName, artistName)
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
    trace("Отправляется запрос на получение текста");
    let results = await (
      await fetch(
        `https://lrclib.net/api/search?track_name=${trackName}&artist_name=${artistName}`
      )
    )?.json();
    if (!results || !Array.isArray(results)) {
      trace("Неудачная попытка получения текста");
      clearTrackLyrics();
      return;
    }

    if (trackDuration && trackDuration > 0) {
      results = results.filter((result) => result.duration == trackDuration);
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

/**
 * (В РАЗРАБОТКЕ) Поведение приложения в полноэкранном режиме.
 * @returns {void} Возращается при прекращении работы.
 */
async function updateFullScreenLyrics() {
  // Прекращение работы если текст уже доступен
  if (
    document.querySelector(
      `[data-test-id="PLAYERBAR_DESKTOP_SYNC_LYRICS_BUTTON"].HbaqudSqu7Q3mv3zMPGr`
    )
  )
    return;

  const trackName = getNameAndFormat(
    ".FullscreenPlayerDesktopContent_meta__3jDTy * .Meta_title__GGBnH"
  );
  const artistName = getNameAndFormat(
    ".FullscreenPlayerDesktopContent_meta__3jDTy * .Meta_artistCaption__JESZi"
  );
  if (!trackName || !artistName || latestTrack.trackName == trackName) return;

  latestTrack.trackName = trackName;
  const trackLength = document.querySelector(
    'section.PlayerBar_root__cXUnU * [data-test-id="TIMECODE_SLIDER"]'
  )?.max;
  await getTrackLyrics(trackName, artistName, trackLength);

  // Функционал в разработке ...
}

/**
 * Необходим для подробного логгирования
 * @param {*} msg Сообщение
 */
function trace(msg) {
  if (traceEnabled) {
    console.log(`[ReachText] [TR]: ${msg}`);
  }
}

/**
 * @type {boolean} Включает подробное логгирование
 */
const traceEnabled = false;

trace("Начало работы");
