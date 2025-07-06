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
    const observer = new MutationObserver(async (_mutationsList) => {
      const modal = document.querySelector?.(".TrackModal_modalContent__AzQPF");
      if (modal) {
        await this.createLyricsModalInTrackInfo(modal as HTMLElement);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Обновляет модальное окно информации о треке добавляя в него текст трека
   * @param {HTMLElement} root Элемент TrackModal_modalContent__AzQPF
   */
  async createLyricsModalInTrackInfo(root: HTMLElement) {
    const header = root.querySelector(".PageHeaderBase_info__GRcah");

    if (!header) {
      return;
    }

    const trackName = header.querySelector(
      '[data-test-id="ENTITY_TITLE"] span'
    )?.textContent;

    var lyricsRoot = root.querySelector(
      ".TrackModalLyrics_root__JABJp"
    ) as HTMLElement;

    if (
      lyricsRoot &&
      Helpers.isCustom(lyricsRoot) &&
      trackName &&
      this.addon.latestTrackLyrics?.trackName == trackName
    ) {
      return;
    }

    if (trackName && this.addon.latestTrackLyrics?.trackName != trackName) {
      const artist = header.querySelector(
        '[data-test-id="SEPARATED_ARTIST_TITLE"] span'
      )!.textContent;

      await this.addon.getTrackLyrics(trackName, artist);
    }

    var lyricsRoots = Array.from(
      root.querySelectorAll(".TrackModalLyrics_root__JABJp")
    ) as HTMLElement[];

    lyricsRoot = lyricsRoots[lyricsRoots.length - 1];
    let created = lyricsRoot != null && lyricsRoot != undefined;
    if (
      !this.addon.latestTrackLyrics?.plainLyrics &&
      Helpers.isCustom(lyricsRoot)
    ) {
      lyricsRoot.remove();
      return;
    }
    if (lyricsRoot && !Helpers.isCustom(lyricsRoot)) {
      // Бывает такое что текст из ЯМ был получен позже чем текст скрипта, в таком случае происходит удаление текстов созданных скриптом
      lyricsRoots
        .filter((el) => Helpers.isCustom(el))
        .forEach((el) => el.remove());
      return;
    }

    if (!created) {
      lyricsRoot = HtmlDefenetions.TRACK_INFO_LYRICS_ROOT;
      const content = root.querySelector(".TrackModal_content__9qH7W");
      content?.insertBefore(lyricsRoot, content.firstChild!.nextSibling!);
    }

    const lyricsEl = lyricsRoot.querySelector(
      ".TrackModalLyrics_lyrics__naoEF"
    );
    if (lyricsEl)
      lyricsEl.textContent = this.addon.latestTrackLyrics?.plainLyrics ?? "";

    lyricsRoot
      .querySelector(".BnN6sQIg6NahNBun6fkP > button")
      ?.addEventListener("click", (ev: Event) => {
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
