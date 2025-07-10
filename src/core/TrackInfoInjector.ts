import { HtmlDefenetions } from "../helpers/Constants";
import { Helpers } from "../helpers/Helpers";
import { InjectorBase } from "../helpers/InjectorBase";

/**
 * Логика работы текстов в информации о треке.
 * @extends {InjectorBase}
 */
export class TrackInfoInjector extends InjectorBase {
  /**
   * Конструктор класса.
   */
  constructor() {
    super();
  }

  /**
   * @inheritdoc
   */
  inject(): void {
    const observer = new MutationObserver(async (mutationsList) => {
      const modal = document.querySelector?.(".TrackModal_modalContent__AzQPF");
      if (modal) {
        const ymText = mutationsList.find((el) => {
          if (!(el.target instanceof HTMLElement)) return false;

          if (el.target.classList.contains('BnN6sQIg6NahNBun6fkP') && !Helpers.isCustom(el.target)) {
            return true;
          }
        })?.target as (HTMLElement | null)

        await this.createLyricsModalInTrackInfo(modal as HTMLElement, ymText);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Удаляет все пользовательские элементы с текстами песен, созданные скриптом из предоставленного массива HTML-элементов.
   * @param lyricsRoots Массив элементов `HTMLElement`, представляющих корневые элементы текстов песен.
   */
  private clearCustomLyrics(lyricsRoots: HTMLElement[]): void {
    lyricsRoots.filter(Helpers.isCustom).forEach(el => el.remove());
  }

  /**
   * Обновляет модальное окно информации о треке добавляя в него текст трека
   * @param {HTMLElement} root Элемент TrackModal_modalContent__AzQPF
   */
  async createLyricsModalInTrackInfo(root: HTMLElement, ymText: HTMLElement | null) {
      let lyricsRoots = Array.from(
      root.querySelectorAll(".TrackModalLyrics_root__JABJp")
    ) as HTMLElement[];

    if (ymText) {
      this.clearCustomLyrics(lyricsRoots);
      return;
    }

    const header = root.querySelector(".PageHeaderBase_info__GRcah");
    if (!header) return;

    const trackName = header.querySelector('[data-test-id="ENTITY_TITLE"] span')?.textContent;
    if (trackName && this.addon.latestTrackLyrics?.trackName !== trackName) {
      const artist = header.querySelector('[data-test-id="SEPARATED_ARTIST_TITLE"] span')?.textContent ?? null;
      await this.addon.getTrackLyrics(trackName, artist);
    }

    // Обновляем список после возможной подгрузки текста
    lyricsRoots = Array.from(
      root.querySelectorAll(".TrackModalLyrics_root__JABJp")
    ) as HTMLElement[];

    const hasYMLyrics = lyricsRoots.some(el => !Helpers.isCustom(el));

    if (hasYMLyrics || !this.addon.latestTrackLyrics?.plainLyrics) {
      this.clearCustomLyrics(lyricsRoots);
      return;
    }

    let lyricsRoot = lyricsRoots.find(Helpers.isCustom);
    const created = !!lyricsRoot;

    if (!created && !hasYMLyrics) {
      lyricsRoot = HtmlDefenetions.TRACK_INFO_LYRICS_ROOT;
      Helpers.setCustom(lyricsRoot, true);
      const content = root.querySelector(".TrackModal_content__9qH7W");
      content?.insertBefore(lyricsRoot, content.firstChild?.nextSibling ?? null);
    }

    if (!lyricsRoot) return;

    const lyricsEl = lyricsRoot.querySelector(".TrackModalLyrics_lyrics__naoEF");
    if (lyricsEl) {
      lyricsEl.textContent = this.addon.latestTrackLyrics?.plainLyrics ?? "";
    }

    if (!created) {
      lyricsRoot
        .querySelector(".BnN6sQIg6NahNBun6fkP > button")
        ?.addEventListener("click", (ev: Event) => {
          this.expandOrUnexpandTextInLyricsModal(ev, lyricsRoot!);
        });
    }
  }

  /**
   * Обработка кнопки "Читать полностью" текста в окне информации о треке.
   * @param {MouseEvent} ev Событие клика.
   * @param {HTMLElement} modal TrackModalLyrics_root__JABJp
   * @return {void}
   */
  expandOrUnexpandTextInLyricsModal(ev: Event, modal: HTMLElement): void {
    const text = modal.querySelector(".TrackModalLyrics_lyrics__naoEF");

    if (!text) {
      return;
    }

    // Если текст свернут, то развернуть
    if (text.classList.contains("jMyoZB5J9iZbzJmWOrF0")) {
      text.classList.remove("jMyoZB5J9iZbzJmWOrF0");
      text.classList.remove("LezmJlldtbHWqU7l1950");
      text.parentElement!.classList.remove("MsLY_qiKofQrwKAr98EC");
      (ev.currentTarget! as HTMLElement).textContent = "Свернуть";

      const writers = HtmlDefenetions.LYRICS_WRITERS_TRACK_INFO;

      writers.querySelector(
        '[data-test-id="TRACK_LYRICS_AUTHORS"]'
      )!.textContent = "Авторы: " + this.addon.latestTrackLyrics?.artistName;

      writers.querySelector(
        '[data-test-id="TRACK_LYRICS_SOURCE"]'
      )!.textContent = "Источник: LRCLib";
      text.appendChild(writers);
    }
    // Если текст развернут, то свернуть (кстати в официальном ЯМ такой банальной, но полезной вещи нет)
    else {
      text.classList.add("jMyoZB5J9iZbzJmWOrF0");
      text.classList.add("LezmJlldtbHWqU7l1950");
      text.parentElement!.classList.add("MsLY_qiKofQrwKAr98EC");
      (ev.currentTarget as HTMLElement).textContent = "Читать полностью";
      text.querySelector(".Lyrics_writers__xvrNp")?.remove();
    }
  }
}
