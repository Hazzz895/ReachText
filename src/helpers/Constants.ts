import { Helpers } from "./Helpers";

/**
 * Статический класс для хранения упрощения запросов к DOM
 */
export abstract class QueryConstants {
    public static readonly TRACK_CONTEXT_MENU: string = '[data-test-id="TRACK_CONTEXT_MENU"]';
    public static readonly TRACK_CONTEXT_MENU_BUTTON: string = '[data-test-id="TRACK_CONTEXT_MENU_BUTTON"]';
    public static readonly TRACK_TITLE: string = '[data-test-id="TRACK_TITLE"] span';
    public static readonly TRACK_ARTIST: string = '[data-test-id="SEPARATED_ARTIST_TITLE"] span';
    public static readonly TRACK_CONTEXT_MENU_LYRICS_BUTTON: string = '[data-test-id="TRACK_CONTEXT_MENU_LYRICS_BUTTON"]';
    public static readonly TRACK_CONTEXT_MENU_SHARE_BUTTON: string = '[data-test-id="CONTEXT_MENU_SHARE_BUTTON"]';
    public static readonly TRACK_LYRICS_TEXT: string = '[data-test-id="TRACK_LYRICS_TEXT"]';
    public static readonly TRACK_LYRICS_TITLE: string = '[data-test-id="TRACK_LYRICS_TITLE"]';
    public static readonly TRACK_LYRICS_AUTHORS: string = '[data-test-id="TRACK_LYRICS_AUTHORS"]';
    public static readonly TRACK_LYRICS_MODAL: string = '[data-test-id="TRACK_LYRICS_MODAL"]';
    public static readonly TRACK_LYRICS_CLOSE_BUTTON: string = '[data-test-id="TRACK_LYRICS_CLOSE_BUTTON"]';
    public static readonly TRACK_LYRICS_MODAL_OVERLAY: string = '.TrackLyricsModal_overlay__0Ehwu';
    public static readonly META_CONTAINER: string = '.Meta_metaContainer__7i2dp';
    public static readonly CONTENT_MAIN: string = '.Content_main__8_wIa';
    public static readonly SYNC_LYRICS_FOOTER_WRITERS: string = '.SyncLyricsFooter_writers__c7zhj';
    public static readonly SYNC_LYRICS_LINE_CONTENT: string = '[data-test-id="SYNC_LYRICS_LINE"] span'
};

/**
 * HTML элементы, необходимые для работы аддона.
 * foreA.adoxid, вот для чего так необходима поддержка ассетов для аддонов, стоит задуматься.
 */
export abstract class HtmlDefenetions {
    public static get TRACK_CONTEXT_MENU_LYRICS_BUTTON(): HTMLElement {
        return Helpers.createElementFromHTML(
            `<button class="cpeagBA1_PblpJn8Xgtv UDMYhpDjiAFT3xUx268O dgV08FKVLZKFsucuiryn IlG7b1K0AD7E7AMx6F5p HbaqudSqu7Q3mv3zMPGr qU2apWBO1yyEK0lZ3lPO kc5CjvU5hT9KEj0iTt3C EiyUV4aCJzpfNzuihfMM" type="button" role="menuitem" data-test-id="TRACK_CONTEXT_MENU_LYRICS_BUTTON" tabindex="-1" aria-live="off" aria-busy="false"><span class="JjlbHZ4FaP9EAcR_1DxF"><svg class="J9wTKytjOWG73QMoN5WP elJfazUBui03YWZgHCbW vqAVPWFJlhAOleK_SLk4 l3tE1hAMmBj2aoPPwU08" focusable="false" aria-hidden="true"><use xlink:href="/icons/sprite.svg#lyrics_xxs"></use></svg>Показать текст песни</span></button>`
        )
    }
    public static get TRACK_LYRICS_DIALOG(): HTMLElement {
        return Helpers.createElementFromHTML(
            `<div data-floating-ui-portal=""><div class="l66GiFKS1Ux_BNd603Cu TrackLyricsModal_overlay__0Ehwu Gr0NtROEpipzr518Mwr6" data-floating-ui-inert="" aria-hidden="true" style="position: fixed; overflow: auto; inset: 0px;"></div><span data-type="inside" tabindex="0" aria-hidden="true" data-floating-ui-focus-guard="" data-floating-ui-inert="" style="border: 0px; clip: rect(0px, 0px, 0px, 0px); height: 1px; margin: -1px; overflow: hidden; padding: 0px; position: fixed; white-space: nowrap; width: 1px; top: 0px; left: 0px;"></span><div><div tabindex="-1" id=":r21g:" role="dialog" class="ifxS_8bgSnwBoCsyow0E t7tk8IYH3tGrhDZJpi3Z ptxrCeHwJ9gOgMXsd0w6 TrackLyricsModal_root__KsVRf" data-test-id="TRACK_LYRICS_MODAL" style="--header-height: 72px; opacity: 0; transform: translateX(50px); transition-property: opacity, transform; transition-duration: 300ms;"><header class="wEOFUiLOfluq86BrDUfg TrackLyricsModal_header__nWar3"><h3 class="_MWOVuZRvUQdXKTMcOPx _sd8Q9d_Ttn0Ufe4ISWS nSU6fV9y80WrZEfafvww xuw9gha2dQiGgdRcHNgU"><span data-test-id="TRACK_LYRICS_TITLE"></span></h3><button class="cpeagBA1_PblpJn8Xgtv iJVAJMgccD4vj4E4o068 uwk3hfWzB2VT7kE13SQk IlG7b1K0AD7E7AMx6F5p nHWc2sto1C6Gm0Dpw_l0 oR11LfCBVqMbUJiAgknd qU2apWBO1yyEK0lZ3lPO undefined YUY9QjXr1E4DQfQdMjGt" type="button" aria-label="Закрыть" data-test-id="TRACK_LYRICS_CLOSE_BUTTON" aria-live="off" aria-busy="false"><span class="JjlbHZ4FaP9EAcR_1DxF"><svg class="J9wTKytjOWG73QMoN5WP l3tE1hAMmBj2aoPPwU08" focusable="false" aria-hidden="true" style="padding: var(--ym-icon-padding, 6px);"><use xlink:href="#close"></use></svg></span></button></header><div class="fp0QgCrX1y48p3elvLVi ni3sfTj4hRfj63FbfQTG TrackLyricsModal_modalContent__uYdL2"><div class="TrackLyricsModal_content__Cstzi" data-test-id="TRACK_LYRICS_TEXT"><div class="Lyrics_writers__xvrNp"><div class="_MWOVuZRvUQdXKTMcOPx V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR" data-test-id="TRACK_LYRICS_AUTHORS"></div><div class="_MWOVuZRvUQdXKTMcOPx V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR" data-test-id="TRACK_LYRICS_SOURCE">Источник: LRCLib.net</div></div></div></div></div></div><span data-type="inside" tabindex="0" aria-hidden="true" data-floating-ui-focus-guard="" data-floating-ui-inert="" style="border: 0px; clip: rect(0px, 0px, 0px, 0px); height: 1px; margin: -1px; overflow: hidden; padding: 0px; position: fixed; white-space: nowrap; width: 1px; top: 0px; left: 0px;"></span></div>`
        )
    }
    public static get COUNTER_PARENT(): HTMLElement {
        return Helpers.createElementFromHTML(
            `<div class="swiper-slide swiper-slide-active SyncLyricsScroller_counter__B2E7K FullscreenPlayerDesktopContent_syncLyricsCounter__CnB_k" style="margin-bottom: 32px;"></div>`
        )
    }
    public static get COUNTER(): HTMLElement {
        return Helpers.createElementFromHTML(
          '<div class="SyncLyricsLoader_root__I2hTe"><div class="SyncLyricsLoader_element___Luwv SyncLyricsLoader_element_withDefaultElement__WmP80" style="animation-delay: 0.275s; animation-duration: 1.1s, 1.1s;"></div><div class="SyncLyricsLoader_element___Luwv SyncLyricsLoader_element_withDefaultElement__WmP80" style="animation-delay: 0.55s; animation-duration: 1.1s, 1.1s;"></div><div class="SyncLyricsLoader_element___Luwv SyncLyricsLoader_element_withDefaultElement__WmP80" style="animation-delay: 0.825s; animation-duration: 1.1s, 1.1s;"></div><div class="SyncLyricsLoader_element___Luwv SyncLyricsLoader_element_withDefaultElement__WmP80" style="animation-delay: 1.1s; animation-duration: 1.1s, 1.1s;"></div></div>'
        )
    }
    public static get ADDITIONAL_CONTENT(): HTMLElement {
        return Helpers.createElementFromHTML(
            `<div class="FullscreenPlayerDesktopContent_additionalContent__tuuy7"></div>`
        )
    }
    public static get LYRICS_CONTAINER(): HTMLElement {
        return Helpers.createElementFromHTML(
                    `<div     class="SyncLyrics_root__6KZg4 FullscreenPlayerDesktopContent_syncLyrics__6dTfH"   >     <div       class="SyncLyrics_content__lbkWP FullscreenPlayerDesktopContent_syncLyricsContent__H_enX"       data-test-id="SYNC_LYRICS_CONTENT"     >       <div         class="swiper swiper-initialized swiper-vertical swiper-free-mode SyncLyricsScroller_root__amiLm undefined FullscreenPlayerDesktopContent_syncLyricsScroller__JslVK"       >         <div           class="swiper-wrapper"           style="             transition-duration: 500ms;             transform: translate3d(0px, 0px, 0px);             transition-delay: 0ms;           "         >    <div             class="swiper-slide FullscreenPlayerDesktopContent_syncLyricsFooter__HS8JZ"             style="margin-bottom: 32px"           >             <footer class="SyncLyricsFooter_root__STCKQ">               <div                 class="_MWOVuZRvUQdXKTMcOPx V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR SyncLyricsFooter_writers__c7zhj"               > </div>               <div                 class="_MWOVuZRvUQdXKTMcOPx V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR SyncLyricsFooter_major__QMZmT"               >                 Источник: LRCLib              </div>             </footer>           </div>         </div>       </div>     </div>   </div> `
        )
    }
    public static get SYNCED_LYRICS_LINE(): HTMLElement {
        return Helpers.createElementFromHTML(
          `<div class="swiper-slide SyncLyricsScroller_line__Vh6WN" data-test-id="SYNC_LYRICS_LINE" style="margin-bottom: 32px;"><span class="SyncLyricsLine_root__r62BN"></span></div>`
        );
    }
    public static get LYRICS_WRITERS_TRACK_INFO(): HTMLElement {
        return Helpers.createElementFromHTML(
          '<div class="Lyrics_writers__xvrNp"><div class="_MWOVuZRvUQdXKTMcOPx V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR" data-test-id="TRACK_LYRICS_AUTHORS">Авторы: </div><div class="_MWOVuZRvUQdXKTMcOPx V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR" data-test-id="TRACK_LYRICS_SOURCE">Источник: </div></div>'
        );
    }
    public static get TRACK_INFO_LYRICS_ROOT(): HTMLElement {
        return Helpers.createElementFromHTML(
          '<div class="TrackModalLyrics_root__JABJp"><h2 title="Текст" class="_MWOVuZRvUQdXKTMcOPx LezmJlldtbHWqU7l1950 oyQL2RSmoNbNQf3Vc6YI Ctk8dbecq31Qh7isOJPQ nSU6fV9y80WrZEfafvww TrackModalLyrics_title__zjWl_" style="-webkit-line-clamp: 1;">Текст</h2><div class="BnN6sQIg6NahNBun6fkP"><div class="MM8MKXCw0gMkVvq7C1YS MsLY_qiKofQrwKAr98EC"><div class="_MWOVuZRvUQdXKTMcOPx LezmJlldtbHWqU7l1950 jMyoZB5J9iZbzJmWOrF0 V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR TrackModalLyrics_lyrics__naoEF bfmUuyonXAK7HKYtDzUK" style="-webkit-line-clamp: 4;"><div class="Lyrics_writers__xvrNp"><div class="_MWOVuZRvUQdXKTMcOPx V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR" data-test-id="TRACK_LYRICS_AUTHORS"></div><div class="_MWOVuZRvUQdXKTMcOPx V3WU123oO65AxsprotU9 _3_Mxw7Si7j2g4kWjlpR" data-test-id="TRACK_LYRICS_SOURCE"></div></div></div></div><button class="cpeagBA1_PblpJn8Xgtv qlPp6CSQQEMVZPqtqLiQ dgV08FKVLZKFsucuiryn IlG7b1K0AD7E7AMx6F5p IgYbZLnYjW0nMahgpkus qU2apWBO1yyEK0lZ3lPO Dp6n_Y0cfUyPQT1Z6uIm TrackModalLyrics_button__YqxIm" type="button" aria-live="off" aria-busy="false">Читать полностью</button></div></div>'
        );
    }
}