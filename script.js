"use strict";
(() => {
  // src/helpers/Helpers.ts
  var Helpers = class {
    /**
        * Создает node элемент из HTML строки.
        * src: https://stackoverflow.com/a/494348/25080935
        * @param {String} htmlString HTML строка представляющая node элемент.
        * @returns {HTMLElement} Элемент созданный из HTML строки.
        */
    static createElementFromHTML(htmlString) {
      var div = document.createElement("div");
      div.innerHTML = htmlString.trim();
      return div.firstChild;
    }
    /**
    * Решил выделить задержку в отдельную переменную, так как привык к синтаксису C# :3
    * @param {number} ms Задержка в миллисекундах.
    * @returns {Promise<any>} Promise для задержки.
    */
    static async delay(ms) {
      await new Promise((resolve) => setTimeout(resolve, ms));
    }
    /**
     * Выполняет цикл while с  ограничением по количеству итераций.
     * @param condition Условие для продолжения цикла.
     * @param action Действие, которое будет выполняться в цикле.
     * @param limit Максимальное количество итераций цикла.
     * @returns {Promise<void>}
     */
    static async limitedWhile(condition, action, limit) {
      let i = 0;
      while (condition() && i < limit) {
        await action();
        i++;
      }
    }
    static get progress() {
      return window?.player?.state?.currentMediaPlayer?.value?.audioPlayerState?.progress?.value;
    }
    static get meta() {
      return window?.player?.state?.queueState?.currentEntity?.value?.entity?.entityData?.meta;
    }
    static get playerState() {
      return window?.player?.state?.playerState;
    }
    static get status() {
      return window?.player?.state?.currentMediaPlayer?.value?.audioPlayerState?.status?.observableValue?.value;
    }
    static isCustom(el) {
      return el?.__reachText_custom__ || false;
    }
    static setCustom(el, value) {
      if (!el) {
        return;
      }
      el.__reachText_custom__ = value;
    }
  };

  // src/helpers/SingletonBase.ts
  var SingletonBase = class _SingletonBase {
    static {
      this._instances = /* @__PURE__ */ new Map();
    }
    constructor() {
      const ctor = this.constructor;
      if (_SingletonBase._instances.has(ctor)) {
        return _SingletonBase._instances.get(ctor);
      }
      _SingletonBase._instances.set(ctor, this);
    }
    /**
     * Получить экземпляр синглтона для текущего класса.
     */
    static get() {
      if (!_SingletonBase._instances.has(this)) {
        _SingletonBase._instances.set(this, new this());
      }
      return _SingletonBase._instances.get(this);
    }
  };

  // src/helpers/Constants.ts
  var QueryConstants = class {
    static {
      this.TRACK_CONTEXT_MENU = '[data-test-id="TRACK_CONTEXT_MENU"]';
    }
    static {
      this.TRACK_CONTEXT_MENU_BUTTON = '[data-test-id="TRACK_CONTEXT_MENU_BUTTON"]';
    }
    static {
      this.TRACK_TITLE = '[data-test-id="TRACK_TITLE"] span';
    }
    static {
      this.TRACK_ARTIST = '[data-test-id="SEPARATED_ARTIST_TITLE"] span';
    }
    static {
      this.TRACK_CONTEXT_MENU_LYRICS_BUTTON = '[data-test-id="TRACK_CONTEXT_MENU_LYRICS_BUTTON"]';
    }
    static {
      this.TRACK_CONTEXT_MENU_SHARE_BUTTON = '[data-test-id="CONTEXT_MENU_SHARE_BUTTON"]';
    }
    static {
      this.TRACK_LYRICS_TEXT = '[data-test-id="TRACK_LYRICS_TEXT"]';
    }
    static {
      this.TRACK_LYRICS_TITLE = '[data-test-id="TRACK_LYRICS_TITLE"]';
    }
    static {
      this.TRACK_LYRICS_AUTHORS = '[data-test-id="TRACK_LYRICS_AUTHORS"]';
    }
    static {
      this.TRACK_LYRICS_MODAL = '[data-test-id="TRACK_LYRICS_MODAL"]';
    }
    static {
      this.TRACK_LYRICS_CLOSE_BUTTON = '[data-test-id="TRACK_LYRICS_CLOSE_BUTTON"]';
    }
    static {
      this.TRACK_LYRICS_MODAL_OVERLAY = ".TrackLyricsModal_overlay__0Ehwu";
    }
    static {
      this.META_CONTAINER = ".Meta_metaContainer__7i2dp";
    }
    static {
      this.CONTENT_MAIN = ".Content_main__8_wIa";
    }
    static {
      this.SYNC_LYRICS_FOOTER_WRITERS = ".SyncLyricsFooter_writers__c7zhj";
    }
    static {
      this.SYNC_LYRICS_LINE_CONTENT = '[data-test-id="SYNC_LYRICS_LINE"] span';
    }
  };
  var HtmlDefenetions = class {
    static get TRACK_CONTEXT_MENU_LYRICS_BUTTON() {
      return Helpers.createElementFromHTML(
        `<button class="cpeagBA1_PblpJn8Xgtv UDMYhpDjiAFT3xUx268O dgV08FKVLZKFsucuiryn IlG7b1K0AD7E7AMx6F5p HbaqudSqu7Q3mv3zMPGr qU2apWBO1yyEK0lZ3lPO kc5CjvU5hT9KEj0iTt3C EiyUV4aCJzpfNzuihfMM" type="button" role="menuitem" data-test-id="TRACK_CONTEXT_MENU_LYRICS_BUTTON" tabindex="-1" aria-live="off" aria-busy="false"><span class="JjlbHZ4FaP9EAcR_1DxF"><svg class="J9wTKytjOWG73QMoN5WP elJfazUBui03YWZgHCbW vqAVPWFJlhAOleK_SLk4 l3tE1hAMmBj2aoPPwU08" focusable="false" aria-hidden="true" style="padding: var(--ym-icon-padding, 3px 2px);"><use xlink:href="#lyrics"></use></svg>\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0442\u0435\u043A\u0441\u0442 \u043F\u0435\u0441\u043D\u0438</span></button>`
      );
    }
    static get TRACK_LYRICS_DIALOG() {
      return Helpers.createElementFromHTML(
        `<div data-floating-ui-portal=""><div class="l66GiFKS1Ux_BNd603Cu TrackLyricsModal_overlay__0Ehwu Gr0NtROEpipzr518Mwr6" data-floating-ui-inert="" aria-hidden="true" style="position: fixed; overflow: auto; inset: 0px;"></div><span data-type="inside" tabindex="0" aria-hidden="true" data-floating-ui-focus-guard="" data-floating-ui-inert="" style="border: 0px; clip: rect(0px, 0px, 0px, 0px); height: 1px; margin: -1px; overflow: hidden; padding: 0px; position: fixed; white-space: nowrap; width: 1px; top: 0px; left: 0px;"></span><div><div tabindex="-1" id=":r21g:" role="dialog" class="ifxS_8bgSnwBoCsyow0E t7tk8IYH3tGrhDZJpi3Z ptxrCeHwJ9gOgMXsd0w6 TrackLyricsModal_root__KsVRf" data-test-id="TRACK_LYRICS_MODAL" style="--header-height: 72px; opacity: 0; transform: translateX(50px); transition-property: opacity, transform; transition-duration: 300ms;"><header class="wEOFUiLOfluq86BrDUfg TrackLyricsModal_header__nWar3"><h3 class="_MWOVuZRvUQdXKTMcOPx _sd8Q9d_Ttn0Ufe4ISWS nSU6fV9y80WrZEfafvww xuw9gha2dQiGgdRcHNgU"><span data-test-id="TRACK_LYRICS_TITLE"></span></h3><button class="cpeagBA1_PblpJn8Xgtv iJVAJMgccD4vj4E4o068 uwk3hfWzB2VT7kE13SQk IlG7b1K0AD7E7AMx6F5p nHWc2sto1C6Gm0Dpw_l0 oR11LfCBVqMbUJiAgknd qU2apWBO1yyEK0lZ3lPO undefined YUY9QjXr1E4DQfQdMjGt" type="button" aria-label="\u0417\u0430\u043A\u0440\u044B\u0442\u044C" data-test-id="TRACK_LYRICS_CLOSE_BUTTON" aria-live="off" aria-busy="false"><span class="JjlbHZ4FaP9EAcR_1DxF"><svg class="J9wTKytjOWG73QMoN5WP l3tE1hAMmBj2aoPPwU08" focusable="false" aria-hidden="true" style="padding: var(--ym-icon-padding, 6px);"><use xlink:href="#close"></use></svg></span></button></header><div class="fp0QgCrX1y48p3elvLVi ni3sfTj4hRfj63FbfQTG TrackLyricsModal_modalContent__uYdL2"><div class="TrackLyricsModal_content__Cstzi" data-test-id="TRACK_LYRICS_TEXT"><div class="Lyrics_writers__xvrNp"><div class="_MWOVuZRvUQdXKTMcOPx V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR" data-test-id="TRACK_LYRICS_AUTHORS"></div><div class="_MWOVuZRvUQdXKTMcOPx V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR" data-test-id="TRACK_LYRICS_SOURCE">\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A: LRCLib.net</div></div></div></div></div></div><span data-type="inside" tabindex="0" aria-hidden="true" data-floating-ui-focus-guard="" data-floating-ui-inert="" style="border: 0px; clip: rect(0px, 0px, 0px, 0px); height: 1px; margin: -1px; overflow: hidden; padding: 0px; position: fixed; white-space: nowrap; width: 1px; top: 0px; left: 0px;"></span></div>`
      );
    }
    static get COUNTER_PARENT() {
      return Helpers.createElementFromHTML(
        `<div class="swiper-slide swiper-slide-active SyncLyricsScroller_counter__B2E7K FullscreenPlayerDesktopContent_syncLyricsCounter__CnB_k" style="margin-bottom: 32px;"></div>`
      );
    }
    static get COUNTER() {
      return Helpers.createElementFromHTML(
        '<div class="SyncLyricsLoader_root__I2hTe"><div class="SyncLyricsLoader_element___Luwv SyncLyricsLoader_element_withDefaultElement__WmP80" style="animation-delay: 0.275s; animation-duration: 1.1s, 1.1s;"></div><div class="SyncLyricsLoader_element___Luwv SyncLyricsLoader_element_withDefaultElement__WmP80" style="animation-delay: 0.55s; animation-duration: 1.1s, 1.1s;"></div><div class="SyncLyricsLoader_element___Luwv SyncLyricsLoader_element_withDefaultElement__WmP80" style="animation-delay: 0.825s; animation-duration: 1.1s, 1.1s;"></div><div class="SyncLyricsLoader_element___Luwv SyncLyricsLoader_element_withDefaultElement__WmP80" style="animation-delay: 1.1s; animation-duration: 1.1s, 1.1s;"></div></div>'
      );
    }
    static get ADDITIONAL_CONTENT() {
      return Helpers.createElementFromHTML(
        `<div class="FullscreenPlayerDesktopContent_additionalContent__tuuy7"></div>`
      );
    }
    static get LYRICS_CONTAINER() {
      return Helpers.createElementFromHTML(
        `<div     class="SyncLyrics_root__6KZg4 FullscreenPlayerDesktopContent_syncLyrics__6dTfH"   >     <div       class="SyncLyrics_content__lbkWP FullscreenPlayerDesktopContent_syncLyricsContent__H_enX"       data-test-id="SYNC_LYRICS_CONTENT"     >       <div         class="swiper swiper-initialized swiper-vertical swiper-free-mode SyncLyricsScroller_root__amiLm undefined FullscreenPlayerDesktopContent_syncLyricsScroller__JslVK"       >         <div           class="swiper-wrapper"           style="             transition-duration: 500ms;             transform: translate3d(0px, 0px, 0px);             transition-delay: 0ms;           "         >    <div             class="swiper-slide FullscreenPlayerDesktopContent_syncLyricsFooter__HS8JZ"             style="margin-bottom: 32px"           >             <footer class="SyncLyricsFooter_root__STCKQ">               <div                 class="_MWOVuZRvUQdXKTMcOPx V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR SyncLyricsFooter_writers__c7zhj"               > </div>               <div                 class="_MWOVuZRvUQdXKTMcOPx V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR SyncLyricsFooter_major__QMZmT"               >                 \u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A: LRCLib              </div>             </footer>           </div>         </div>       </div>     </div>   </div> `
      );
    }
    static get SYNCED_LYRICS_LINE() {
      return Helpers.createElementFromHTML(
        `<div class="swiper-slide SyncLyricsScroller_line__Vh6WN" data-test-id="SYNC_LYRICS_LINE" style="margin-bottom: 32px;"><span class="SyncLyricsLine_root__r62BN"></span></div>`
      );
    }
    static get LYRICS_WRITERS_TRACK_INFO() {
      return Helpers.createElementFromHTML(
        '<div class="Lyrics_writers__xvrNp"><div class="_MWOVuZRvUQdXKTMcOPx V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR" data-test-id="TRACK_LYRICS_AUTHORS">\u0410\u0432\u0442\u043E\u0440\u044B: </div><div class="_MWOVuZRvUQdXKTMcOPx V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR" data-test-id="TRACK_LYRICS_SOURCE">\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A: </div></div>'
      );
    }
    static get TRACK_INFO_LYRICS_ROOT() {
      return Helpers.createElementFromHTML(
        '<div class="TrackModalLyrics_root__JABJp"><h2 title="\u0422\u0435\u043A\u0441\u0442" class="_MWOVuZRvUQdXKTMcOPx LezmJlldtbHWqU7l1950 oyQL2RSmoNbNQf3Vc6YI Ctk8dbecq31Qh7isOJPQ nSU6fV9y80WrZEfafvww TrackModalLyrics_title__zjWl_" style="-webkit-line-clamp: 1;">\u0422\u0435\u043A\u0441\u0442</h2><div class="BnN6sQIg6NahNBun6fkP"><div class="MM8MKXCw0gMkVvq7C1YS MsLY_qiKofQrwKAr98EC"><div class="_MWOVuZRvUQdXKTMcOPx LezmJlldtbHWqU7l1950 jMyoZB5J9iZbzJmWOrF0 V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR TrackModalLyrics_lyrics__naoEF bfmUuyonXAK7HKYtDzUK" style="-webkit-line-clamp: 4;"><div class="Lyrics_writers__xvrNp"><div class="_MWOVuZRvUQdXKTMcOPx V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR" data-test-id="TRACK_LYRICS_AUTHORS"></div><div class="_MWOVuZRvUQdXKTMcOPx V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR" data-test-id="TRACK_LYRICS_SOURCE"></div></div></div></div><button class="cpeagBA1_PblpJn8Xgtv qlPp6CSQQEMVZPqtqLiQ dgV08FKVLZKFsucuiryn IlG7b1K0AD7E7AMx6F5p IgYbZLnYjW0nMahgpkus qU2apWBO1yyEK0lZ3lPO Dp6n_Y0cfUyPQT1Z6uIm TrackModalLyrics_button__YqxIm" type="button" aria-live="off" aria-busy="false">\u0427\u0438\u0442\u0430\u0442\u044C \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E</button></div></div>'
      );
    }
  };

  // src/helpers/InjectorBase.ts
  var InjectorBase = class extends SingletonBase {
    get addon() {
      return ReachText.get();
    }
  };

  // src/core/ContextMenuInjector.ts
  var ContextMenuInjector = class extends InjectorBase {
    constructor() {
      super();
      /**
       * Список кнопок контекстного меню которым был добавлена прослушка нажатий.
       * @private
       * @type {Set<Element>}
       */
      this.registeredButtons = /* @__PURE__ */ new Set();
    }
    /**
     * @inheritdoc
     */
    inject() {
      this.registeredButtons = /* @__PURE__ */ new Set();
      const buttons = document.querySelectorAll?.(
        '[data-test-id="TRACK_CONTEXT_MENU_BUTTON"], [data-test-id="PLAYERBAR_DESKTOP_CONTEXT_MENU_BUTTON"]'
      );
      if (buttons && buttons.length > 0) {
        this.addContextMenuEventListeners(buttons);
      }
      ;
      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
              if (!(node instanceof HTMLElement)) return;
              const buttons2 = node.querySelectorAll?.(
                '[data-test-id="TRACK_CONTEXT_MENU_BUTTON"], [data-test-id="PLAYERBAR_DESKTOP_CONTEXT_MENU_BUTTON"]'
              );
              if (buttons2 && buttons2.length > 0) {
                this.addContextMenuEventListeners(buttons2);
              }
            });
          }
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
    /**
     * Добавляет прослушку нажатий на кнопки контекстного меню.
     * @param buttons - Кнопки контекстного меню.
     */
    addContextMenuEventListeners(buttons) {
      buttons.forEach((button) => {
        if (this.registeredButtons.has(button)) return;
        this.registeredButtons.add(button);
        button.addEventListener("mousedown", async (event) => {
          await this.updateContextMenu(event.currentTarget);
        });
      });
    }
    /**
     * Получает текст трека и добавляет кнопку "Показать текст песни" в контекстное меню если текст найден
     * @param button - Кнопка контекстного меню.
     * @returns {Promise<void>}
     */
    async updateContextMenu(button) {
      await Helpers.delay(1);
      var contextMenu = document.querySelector(
        QueryConstants.TRACK_CONTEXT_MENU
      );
      if (!contextMenu) {
        return;
      }
      var contextLyricsButton = document.querySelector(
        QueryConstants.TRACK_CONTEXT_MENU_LYRICS_BUTTON
      );
      if (contextLyricsButton) {
        return;
      }
      let contextMenuButtonContainer = button.parentElement;
      while (contextMenuButtonContainer && !contextMenuButtonContainer.querySelector(QueryConstants.META_CONTAINER)) {
        contextMenuButtonContainer = contextMenuButtonContainer.parentElement;
      }
      const trackName = contextMenuButtonContainer.querySelector(QueryConstants.TRACK_TITLE)?.textContent;
      const trackArtist = Array.from(contextMenuButtonContainer.querySelectorAll(QueryConstants.TRACK_ARTIST))?.map((el) => el.textContent)?.join(", ");
      if (!trackName) {
        return;
      }
      const trackLyrics = await this.addon.getTrackLyrics(trackName, trackArtist);
      if (!trackLyrics?.plainLyrics) {
        return;
      }
      contextLyricsButton = HtmlDefenetions.TRACK_CONTEXT_MENU_LYRICS_BUTTON;
      contextLyricsButton.addEventListener("click", async () => {
        await this.createLyricsDialog(
          this.addon.latestTrackLyrics.trackName,
          this.addon.latestTrackLyrics.artistName,
          this.addon.latestTrackLyrics.plainLyrics
        );
        contextMenu.style.opacity = "0";
        await Helpers.delay(250);
        let uiPortal = contextMenu;
        Helpers.limitedWhile(() => uiPortal != null, async () => {
          if (uiPortal?.getAttribute("data-floating-ui-portal") != null) {
            return;
          }
          uiPortal = uiPortal?.parentElement;
        }, 10);
        if (!uiPortal) {
          uiPortal = contextMenu;
        }
        uiPortal?.remove();
      });
      if (contextMenu) {
        contextMenu.insertBefore(
          contextLyricsButton,
          document.querySelector(QueryConstants.TRACK_CONTEXT_MENU_SHARE_BUTTON).parentElement
        );
      }
    }
    /**
     * Создает всплывающее окно с текстом песни
     * @param trackName - Название трека
     * @param artistName - Имя исполнителя
     * @param lyrics - Текст песни
     * @returns {Promise<void>}
     */
    async createLyricsDialog(trackName, artistName, lyrics) {
      if (!lyrics) {
        return;
      }
      const mainContainer = document.querySelector(QueryConstants.CONTENT_MAIN);
      if (!mainContainer) {
        return;
      }
      const dialog = HtmlDefenetions.TRACK_LYRICS_DIALOG;
      dialog.querySelector(QueryConstants.TRACK_LYRICS_CLOSE_BUTTON).addEventListener("click", () => {
        this.onClosingDialog(modal, dialog);
      });
      dialog.querySelector(QueryConstants.TRACK_LYRICS_MODAL_OVERLAY).addEventListener("click", () => {
        this.onClosingDialog(modal, dialog);
      });
      dialog.querySelector(QueryConstants.TRACK_LYRICS_TEXT).insertAdjacentText("afterbegin", lyrics);
      dialog.querySelector(QueryConstants.TRACK_LYRICS_TITLE).textContent = trackName;
      dialog.querySelector(QueryConstants.TRACK_LYRICS_AUTHORS).textContent = "\u0410\u0432\u0442\u043E\u0440\u044B: " + artistName;
      mainContainer.appendChild(dialog);
      const modal = dialog.querySelector(QueryConstants.TRACK_LYRICS_MODAL);
      await Helpers.delay(1);
      modal.style.opacity = "1";
      modal.style.transform = "translateX(0px)";
    }
    /**
    * Вызывается при закрытии диалога с текстом.
    * @param {HTMLElement} modal Элемент представляющий обертку TRACK_LYRICS_MODAL.
    * @param {HTMLElement} dialog Элемент представляющий диалог с текстом.
    */
    async onClosingDialog(modal, dialog) {
      modal.style.opacity = "0";
      modal.style.transform = "translateX(50px)";
      await Helpers.delay(300);
      dialog.remove();
    }
  };

  // src/core/SyncedLyricsInjector.ts
  var SyncedLyricsInjector = class _SyncedLyricsInjector extends InjectorBase {
    constructor() {
      super();
      /**
       * Открыт ли синхронизированный текст (нажата ли кнопка открытия синхронизированного текста)
       * @type {boolean}
       */
      this.syncLyricsOpened = false;
      /**
       * Таймаут для обновления синхронизированного текста
       * @type {number | null}
       */
      this.timeout = null;
      /**
       * Таймаут для возращения обычного синхронизированного текста после прокрутки
       * @type {number | null}
       */
      this.wheelTimeout = null;
      /**
      * Таймаут для показа прошедшего синхронизированного текста ри прокрутке
      * @type {number | null}
      */
      this.hoverTimeout = null;
      /**
       * Y-координата у transform синхронизированного текста
       * @type {number}
       */
      this.translate = 0;
      /**
       * Количество миллисекунд которое используется для включения цифрового отсчета если интро длится выше значения
       * @type {number}
       */
      this.digitTimerOffset = 5e3;
    }
    /**
     * @inheritdoc
     */
    inject() {
      document.querySelector('[data-test-id="FULLSCREEN_PLAYER_BUTTON"]')?.addEventListener("click", () => {
        this.syncLyricsOpened = false;
      });
      this.tryInject();
    }
    /**
     * Попытка подписаться на события плеера.
     * Если плеер еще не инициализирован, то будут повторные попытки каждые 100 миллисекунд.
     * @returns {void}
     */
    tryInject() {
      if (window.player == null) {
        setTimeout(this.tryInject, 100);
        return;
      }
      Helpers.playerState.event.onChange(async (event) => {
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
    async audioResumed() {
      if (this.addon.latestTrackLyrics?.trackName != Helpers.meta?.title && !Helpers.meta?.lyricsInfo?.hasAvailableSyncLyrics) {
        this.removeLyricsModal();
      } else if (document.querySelector(".FullscreenPlayerDesktopContent_root__tKNGK") && !Helpers.meta?.lyricsInfo?.hasAvailableSyncLyrics && this.addon.latestTrackLyrics?.syncedLyrics) {
        document.querySelectorAll(".swiper-slide-next").forEach((line) => {
          line.classList.remove("swiper-slide-next");
        });
        document.querySelectorAll(".swiper-slide-prev").forEach((line) => {
          line.classList.remove("swiper-slide-prev");
        });
        document.querySelectorAll(
          ".swiper-slide-active.SyncLyricsScroller_line_active__6lLvH"
        ).forEach((line) => {
          line.classList.remove("swiper-slide-active");
          line.classList.remove("SyncLyricsScroller_line_active__6lLvH");
        });
        document.querySelector(".SyncLyricsScroller_counter__B2E7K")?.querySelectorAll(".SyncLyricsLoader_element___Luwv").forEach(
          (pointEl) => pointEl.classList.remove("SyncLyricsLoader_element_paused__LFpD0")
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
    async audioPaused() {
      if (!Helpers.meta?.lyricsInfo?.hasAvailableSyncLyrics) {
        document.querySelector(".SyncLyricsScroller_counter__B2E7K")?.querySelectorAll(".SyncLyricsLoader_element___Luwv")?.forEach(
          (pointEl) => pointEl.classList.add("SyncLyricsLoader_element_paused__LFpD0")
        );
        if (this.timeout) {
          clearTimeout(this.timeout);
          this.timeout = null;
        }
      }
    }
    async getTrackLyrics() {
      var trackName = Helpers.meta?.title;
      var artistName = Helpers.meta?.artists?.map((artist) => artist.name).join(", ");
      var trackLength = Helpers.progress?.duration;
      var albumName = Helpers.meta?.album?.name;
      if (!trackName || !artistName || trackName == this.addon.latestTrackLyrics?.trackName)
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
    async audioCanPlay() {
      clearTimeout(this.timeout);
      if (Helpers.isCustom(document.querySelector(".swiper-wrapper")) && Helpers.meta?.lyricsInfo?.hasAvailableSyncLyrics) {
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
        if (document.querySelector(".FullscreenPlayerDesktopContent_root__tKNGK") && this.syncLyricsOpened) {
          await this.createLyricsModal();
        }
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
    async onLyricsButtonClick() {
      const instance = _SyncedLyricsInjector.get();
      instance.syncLyricsOpened = true;
      if (Helpers.meta?.lyricsInfo?.hasAvailableSyncLyrics) {
        return;
      }
      var fullScreenButton = document.querySelector(
        '[data-test-id="FULLSCREEN_PLAYER_BUTTON"]'
      );
      if (!fullScreenButton) return;
      fullScreenButton.click();
      await instance.createLyricsModal();
    }
    /**
    * Обновление синхронизированного текста
    * @returns {Promise<void>}
    */
    async updateFullScreenLyricsProgress() {
      var position = Helpers.progress?.position;
      var swiper = document.querySelector(".swiper-wrapper");
      var counter = document.querySelector(".SyncLyricsScroller_counter__B2E7K");
      if (!swiper) {
        if (!Helpers.meta?.lyricsInfo?.hasAvailableSyncLyrics && this.syncLyricsOpened) {
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
      if (!player) {
        await Helpers.delay(10);
        return this.updateFullScreenLyricsProgress();
      }
      player.classList.add(
        "FullscreenPlayerDesktopContent_fullscreenContent_enter__xMN2Y"
      );
      let enableDigitTimer = syncedLyrics[0].timestamp > this.digitTimerOffset;
      let nextLineIndex = 0;
      var ms;
      if (position > syncedLyrics[0].timestamp / 1e3) {
        swiper.parentElement?.classList.remove(
          "SyncLyricsScroller_root_intro__13gls"
        );
        swiper.parentElement?.classList.remove(
          "SyncLyricsScroller_root_withVisibleUpperLyrics__d7noO"
        );
        nextLineIndex = syncedLyrics.findIndex(
          (line) => line.timestamp / 1e3 > position
        );
        if (nextLineIndex < 0) {
          if (position >= syncedLyrics[syncedLyrics.length - 1].timestamp / 1e3) {
            nextLineIndex = syncedLyrics.length;
          } else {
            console.error("[ReachText] \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043F\u043E\u043F\u044B\u0442\u043A\u0435 \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u0442\u0435\u043A\u0441\u0442");
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
        ms = syncedLyrics[0].timestamp - position * 1e3;
        if (!counter) {
          counter = this.createCounter(ms, enableDigitTimer);
          swiper.insertBefore(counter, swiper.firstChild);
        } else {
          counter.replaceWith(this.createCounter(ms, enableDigitTimer));
        }
      }
      const nextLyricsLine = syncedLyrics[nextLineIndex];
      this.translate = -syncedLyrics.slice(
        0,
        nextLineIndex == syncedLyrics.length ? nextLineIndex : nextLineIndex > 0 ? nextLineIndex - 1 : 0
      ).reduce((sum, line) => {
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
        let timeoutDelay = (nextLyricsLine?.timestamp - position * 1e3) / (window?.player?.state?.currentMediaPlayer?.value?.audioPlayerState?.speed?.value ?? 1);
        if (enableDigitTimer && ms && position < syncedLyrics[0].timestamp / 1e3) {
          timeoutDelay = ms > 3e3 ? timeoutDelay - 3e3 : ms % 1e3;
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
    createCounter(ms, enableDigitTimer) {
      var counterParent = HtmlDefenetions.COUNTER_PARENT;
      if (ms > 3e3 || !enableDigitTimer) {
        var counter = HtmlDefenetions.COUNTER;
        if (Helpers.playerState?.status?.value == "paused") {
          counter.querySelectorAll(".SyncLyricsLoader_element___Luwv").forEach(
            (pointEl) => pointEl.classList.add("SyncLyricsLoader_element_paused__LFpD0")
          );
        }
      } else {
        var counter = Helpers.createElementFromHTML(
          '<span class="SyncLyricsLine_root__r62BN SyncLyricsScroller_counterLine__NpBT4"></span>'
        );
        counter.textContent = (Math.floor(ms / 1e3) + 1).toString();
      }
      counterParent.appendChild(counter);
      return counterParent;
    }
    /**
     * Cоздает и добавляет элемент в полноэкранном режиме с синхронизируемым текстом песни.
     * @returns {Promise<void>}
     */
    async createLyricsModal() {
      if (Helpers.meta?.lyricsInfo?.hasAvailableSyncLyrics || !this.addon.latestTrackLyrics?.syncedLyrics) {
        return;
      }
      var latestTrack = this.addon.latestTrackLyrics;
      if (this.addon.latestTrackLyrics?.trackName !== Helpers.meta?.title) {
        const trackName = Helpers.meta?.title;
        const artistName = Helpers.meta?.artists?.map((a) => a.name).join(", ");
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
      );
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
      lyricsContainer.querySelector(QueryConstants.SYNC_LYRICS_FOOTER_WRITERS).textContent = "\u0410\u0432\u0442\u043E\u0440\u044B: " + this.addon.latestTrackLyrics?.artistName;
      additionalContent.appendChild(lyricsContainer);
      document.querySelector('[data-test-id="FULLSCREEN_PLAYER_CLOSE_BUTTON"]')?.addEventListener("click", this.removeLyricsModal.bind(this));
      const swiper = lyricsContainer.querySelector(
        ".swiper-wrapper"
      );
      const swiiperFirstChild = swiper.firstChild;
      let i = 0;
      this.addon.latestTrackLyrics?.syncedLyrics.forEach((line) => {
        line.element = HtmlDefenetions.SYNCED_LYRICS_LINE;
        line.element.querySelector(
          QueryConstants.SYNC_LYRICS_LINE_CONTENT
        ).textContent = line.text;
        line.element.addEventListener("click", () => {
          if (!swiper.classList.contains(
            "SyncLyricsScroller_root_withVisibleScrolledLyrics__lowGE"
          ))
            return;
          clearTimeout(this.wheelTimeout);
          window.player.setProgress(line.timestamp / 1e3);
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
        clearTimeout(this.hoverTimeout);
      });
      swiper.addEventListener("mouseleave", () => {
        this.hoverTimeout = setTimeout(() => {
          swiper.classList.remove(
            "SyncLyricsScroller_root_withVisibleUpperLyrics__d7noO"
          );
        }, 3e3);
      });
      Helpers.setCustom(swiper, true);
      swiper.addEventListener("wheel", (event) => {
        const ev = event;
        ev.preventDefault();
        clearTimeout(this.timeout);
        clearTimeout(this.wheelTimeout);
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
        swiper.querySelector(".SyncLyricsScroller_line_active__6lLvH")?.classList.remove("SyncLyricsScroller_line_active__6lLvH");
        this.wheelTimeout = setTimeout(() => {
          this.updateFullScreenLyricsProgress();
        }, 3e3);
      });
      this.updateFullScreenLyricsProgress();
    }
    /**
     * Удаление синхронизированного текта
     */
    removeLyricsModal() {
      if (this.timeout) clearTimeout(this.timeout);
      if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
      if (this.wheelTimeout) clearTimeout(this.wheelTimeout);
      this.timeout = this.hoverTimeout = this.wheelTimeout = null;
      document.querySelector(".FullscreenPlayerDesktopContent_syncLyrics__6dTfH")?.remove();
      document.querySelector(".FullscreenPlayerDesktopContent_fullscreenContent__Nvety")?.classList.remove(
        "FullscreenPlayerDesktopContent_fullscreenContent_enter__xMN2Y"
      );
    }
  };

  // src/core/TrackInfoInjector.ts
  var TrackInfoInjector = class extends InjectorBase {
    /**
     * Конструктор класса.
     */
    constructor() {
      super();
    }
    /**
     * @inheritdoc
     */
    inject() {
      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === "childList" || mutation.type === "characterData") {
            mutation.addedNodes.forEach(async (node) => {
              if (!(node instanceof HTMLElement)) return;
              if (node.matches?.('[data-test-id="ENTITY_HEADER"]')) {
                await this.createLyricsModalInTrackInfo(
                  node.parentElement.parentElement
                );
              } else {
                const modal = node.querySelector?.(
                  ".TrackModal_modalContent__AzQPF"
                );
                if (modal) {
                  await this.createLyricsModalInTrackInfo(modal);
                }
              }
            });
          }
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
    /**
     * Обновляет модальное окно информации о треке добавляя в него текст трека
     * @param {HTMLElement} root Элемент TrackModal_content__9qH7W
     */
    async createLyricsModalInTrackInfo(root) {
      const header = root.querySelector(".PageHeaderBase_info__GRcah");
      if (!header) {
        return;
      }
      const trackName = header.querySelector(
        '[data-test-id="ENTITY_TITLE"] span'
      )?.textContent;
      var lyricsRoot = root.querySelector(".TrackModalLyrics_root__JABJp");
      if (lyricsRoot && Helpers.isCustom(lyricsRoot)) {
        return;
      }
      if (trackName && this.addon.latestTrackLyrics?.trackName != trackName) {
        const artist = header.querySelector(
          '[data-test-id="SEPARATED_ARTIST_TITLE"] span'
        ).textContent;
        await this.addon.getTrackLyrics(trackName, artist);
      }
      var lyricsRoots = Array.from(
        root.querySelectorAll(".TrackModalLyrics_root__JABJp")
      );
      lyricsRoot = lyricsRoots[lyricsRoots.length - 1];
      let created = lyricsRoot != null && lyricsRoot != void 0;
      if (!this.addon.latestTrackLyrics?.plainLyrics && Helpers.isCustom(lyricsRoot)) {
        lyricsRoot.remove();
        return;
      }
      if (lyricsRoot && !Helpers.isCustom(lyricsRoot)) {
        lyricsRoots.filter((el) => Helpers.isCustom(el)).forEach((el) => el.remove());
        return;
      }
      if (!created) {
        lyricsRoot = HtmlDefenetions.TRACK_INFO_LYRICS_ROOT;
        const content = root.querySelector(".TrackModal_content__9qH7W");
        content?.insertBefore(lyricsRoot, content.firstChild.nextSibling);
      }
      const lyricsEl = lyricsRoot.querySelector(".TrackModalLyrics_lyrics__naoEF");
      if (lyricsEl) lyricsEl.textContent = this.addon.latestTrackLyrics?.plainLyrics ?? "";
      lyricsRoot.querySelector(".BnN6sQIg6NahNBun6fkP > button")?.addEventListener("click", (ev) => {
        this.expandOrUnexpandTextInLyricsModal(ev, lyricsRoot);
      });
      Helpers.setCustom(lyricsRoot, true);
    }
    /**
     * Обработка кнопки "Читать полностью" текста в окне информации о треке.
     * @param {MouseEvent} ev Событие клика.
     * @param {HTMLElement} modal TrackModalLyrics_root__JABJp
     * @return {void}
     */
    expandOrUnexpandTextInLyricsModal(ev, modal) {
      const text = modal.querySelector(".TrackModalLyrics_lyrics__naoEF");
      if (!text) {
        return;
      }
      if (text.classList.contains("jMyoZB5J9iZbzJmWOrF0")) {
        text.classList.remove("jMyoZB5J9iZbzJmWOrF0");
        text.classList.remove("LezmJlldtbHWqU7l1950");
        text.parentElement.classList.remove("MsLY_qiKofQrwKAr98EC");
        ev.currentTarget.textContent = "\u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C";
        const writers = HtmlDefenetions.LYRICS_WRITERS_TRACK_INFO;
        writers.querySelector(
          '[data-test-id="TRACK_LYRICS_AUTHORS"]'
        ).textContent = "\u0410\u0432\u0442\u043E\u0440\u044B: " + this.addon.latestTrackLyrics?.artistName;
        writers.querySelector(
          '[data-test-id="TRACK_LYRICS_SOURCE"]'
        ).textContent = "\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A: LRCLib";
        text.appendChild(writers);
      } else {
        text.classList.add("jMyoZB5J9iZbzJmWOrF0");
        text.classList.add("LezmJlldtbHWqU7l1950");
        text.parentElement.classList.add("MsLY_qiKofQrwKAr98EC");
        ev.currentTarget.textContent = "\u0427\u0438\u0442\u0430\u0442\u044C \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E";
        text.querySelector(".Lyrics_writers__xvrNp")?.remove();
      }
    }
  };

  // src/core/TrackLyrics.ts
  var TrackLyrics = class _TrackLyrics {
    constructor(id, trackName, artistName, albumName, duration, instrumental, plainLyrics, plainSyncedLyrics) {
      this.id = id;
      this.trackName = trackName;
      this.artistName = artistName;
      this.albumName = albumName;
      this.duration = duration;
      this.instrumental = instrumental;
      this.plainLyrics = plainLyrics;
      this.plainSyncedLyrics = plainSyncedLyrics;
      this.syncedLyrics = plainSyncedLyrics ? _TrackLyrics.parseSyncedLyrics(plainSyncedLyrics) : null;
    }
    /**
     * Превращает {@link plainSyncedLyrics} в массив объектов {@link SyncedLyricsLine}
     * @param plainSyncedLyrics - Текст с синхронизированным текстом
     * @returns {SyncedLyricsLine[]}
     */
    static parseSyncedLyrics(plainSyncedLyrics) {
      const result = plainSyncedLyrics.split("\n").map((line) => {
        const match = line.match(/\[(\d{2}):(\d{2}).(\d{2})\] (.*)/);
        if (match) {
          const minutes = parseInt(match[1]);
          const seconds = parseInt(match[2]);
          const milliseconds = parseInt(match[3]);
          const totalMilliseconds = ((60 * minutes + seconds) * 100 + milliseconds) * 10;
          return new SyncedLyricsLine(totalMilliseconds, match[4]);
        }
      });
      return result.filter(
        (line) => line != void 0
      );
    }
    static fromJson(json) {
      return new _TrackLyrics(json.id, json.trackName, json.artistName, json.albumName, json.duration, json.instrumental, json.plainLyrics, json.syncedLyrics);
    }
  };
  var SyncedLyricsLine = class {
    /**
     * Конструктор линии синхронизированного текста 
     * @param timestamp Позиция в миллисекундах линии
     * @param text Текст
     */
    constructor(timestamp, text) {
      this.timestamp = timestamp;
      this.text = text;
      /**
       * Элемент, который предоставляет линию синхронизированного текста
       * @type {HTMLElement | null}
       */
      this.element = null;
    }
  };

  // src/core/ReachText.ts
  var ReachText = class extends SingletonBase {
    /**
     * Конструктор класса ReachText.
     * @inheritdoc
     * @public
     */
    constructor() {
      super();
      /**
       * Флаг, который указывает, был ли вызван метод main().
       * @type {boolean}
       * @default false
       * @public
       */
      this.injected = false;
      /**
       * @see {@link ContextMenuInjector}
       * @public
       * @type {ContextMenuInjector}
       */
      this.contextMenuInjector = ContextMenuInjector.get();
      /**
       * @see {@link SyncedLyricsInjector}
       * @public
       * @type {SyncedLyricsInjector}
       */
      this.syncedLyricsInjector = SyncedLyricsInjector.get();
      /**
       * @see {@link TrackInfoInjector}
       * @public
       * @type {TrackInfoInjector}
       */
      this.trackInfoInjector = TrackInfoInjector.get();
      /**
       * Последний найденный текст.
       * @public
       * @type {TrackLyrics | null}
       */
      this.latestTrackLyrics = null;
      /**
       * Кешированные текста. Кеширование позволяет ускорить поиск текста.
       * @public
       * @type {TrackLyrics[]}
       */
      this.cachedTrackLyrics = [];
      /**
       * Текущая песня, которая обрабатывается.
       * @public
       * @type {string | null}
       */
      this._processingTrackTitle = null;
      this.main();
    }
    /**
     * Метод для начала работы аддона. Вызывается при создании объекта класса ReachText.
     * @private
     */
    main() {
      if (!this.injected) {
        this.injected = true;
        this.contextMenuInjector.inject();
        this.syncedLyricsInjector.inject();
        this.trackInfoInjector.inject();
      }
    }
    /**
     * Метод для получения текста трека.
     * @param {string} trackName - Название трека.
     * @param {string | null} artistName - Имя исполнителя.
     * @param {number | null} trackDuration - Длительность песни. (синхронизированный текст)
     * @param {string | null} albumName - Название альбома. (синхронизированный текст)
     * @returns {Promise<TrackLyrics | null>} - Возвращает объект TrackLyrics или null, если текст не найден.
     * @public
     */
    async getTrackLyrics(trackName, artistName, trackDuration = null, albumName = null) {
      if (!trackName) {
        return null;
      }
      const cachedTrackLyrics = this.cachedTrackLyrics.find(
        (track) => track.trackName === trackName && track.artistName === artistName
      );
      if (cachedTrackLyrics) {
        this.latestTrackLyrics = cachedTrackLyrics;
        return cachedTrackLyrics;
      }
      if (this._processingTrackTitle === trackName) {
        while (this._processingTrackTitle === trackName) {
          await Helpers.delay(100);
        }
        return await this.getTrackLyrics(trackName, artistName, trackDuration, albumName);
      }
      this._processingTrackTitle = trackName;
      if (false) {
        var results = await fetch(
          `https://lrclib.net/api/get?artist_name=${encodeURIComponent(
            artistName
          )}&track_name=${encodeURIComponent(trackName)}&duration=${trackDuration}&album_name=${encodeURIComponent(albumName)}`
        );
        const json = await results.json();
        var result = json;
      } else {
        var results = await fetch(
          `https://lrclib.net/api/search?track_name=${encodeURIComponent(
            trackName
          )}&artist_name=${encodeURIComponent(artistName)}`
        );
        let json = await results.json();
        if (!json || !Array.isArray(json) || json.length === 0) {
          this.stopProcessingTrack(trackName, artistName, null);
          return null;
        }
        json = json.filter((result2) => result2.instrumental == false);
        if (json.length === 0) {
          this.stopProcessingTrack(trackName, artistName, null);
          return null;
        }
        var result = json[0];
        if (trackDuration && trackDuration > 0) {
          const resultsWithRequestedDuration = json.filter(
            (result2) => result2.duration == trackDuration
          );
          if (resultsWithRequestedDuration.length > 0) {
            const preResult = json.find(
              (result2) => result2.syncedLyrics != null && result2.syncedLyrics != void 0
            );
            if (!preResult) {
              result = resultsWithRequestedDuration[0];
            } else {
              result = preResult;
            }
          }
        }
      }
      const lyrics = TrackLyrics.fromJson(result);
      console.log("[ReachText] \u0422\u0435\u043A\u0441\u0442 \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043F\u043E\u043B\u0443\u0447\u0435\u043D: ", lyrics);
      this.stopProcessingTrack(trackName, artistName, lyrics);
      return lyrics;
    }
    /**
     * Метод который должен быть вызван после того как получен результат с LRCLib
     * @param {string} trackName - Название трека.
     * @param {string | null} artistName - Имя исполнителя.
     * @param {TrackLyrics | null} lyrics - Текст трека.
     */
    stopProcessingTrack(trackName, artistName, lyrics) {
      if (!lyrics) {
        lyrics = new TrackLyrics(null, trackName, artistName, null, null, false, null, null);
      }
      lyrics.trackName = trackName;
      if (!this.cachedTrackLyrics.find((track) => track.trackName === trackName && track.artistName === artistName)) {
        this.cachedTrackLyrics.push(lyrics);
      }
      if (this._processingTrackTitle === trackName) {
        this.latestTrackLyrics = lyrics;
      }
      this._processingTrackTitle = null;
    }
  };

  // src/index.ts
  ReachText.get();
})();
