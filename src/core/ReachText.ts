import { Helpers } from "../helpers/Helpers";
import { SingletonBase } from "../helpers/SingletonBase";
import { ContextMenuInjector } from "./ContextMenuInjector";
import { SyncedLyricsInjector } from "./SyncedLyricsInjector";
import { TrackInfoInjector } from "./TrackInfoInjector";
import { TrackLyrics } from "./TrackLyrics";

/**
 * Представляет объект который содержит логику работы аддона ReachText.
 * Объект является синглтоном, что гарантирует наличие только одного экземпляра класса ReachText.
 * @class
 * @extends {SingletonBase}
 */
export class ReachText extends SingletonBase {
  /**
   * Флаг, который указывает, был ли вызван метод main().
   * @type {boolean}
   * @default false
   * @public
   */
  public injected: boolean = false;

  /**
   * Конструктор класса ReachText.
   * @inheritdoc
   * @public
   */
  public constructor() {
    super();
    this.main();
  }

  /**
   * @see {@link ContextMenuInjector}
   * @public
   * @type {ContextMenuInjector}
   */
  public contextMenuInjector: ContextMenuInjector = ContextMenuInjector.get();

  /**
   * @see {@link SyncedLyricsInjector}
   * @public
   * @type {SyncedLyricsInjector}
   */
  public syncedLyricsInjector: SyncedLyricsInjector =
    SyncedLyricsInjector.get();

  /**
   * @see {@link TrackInfoInjector}
   * @public
   * @type {TrackInfoInjector}
   */
  public trackInfoInjector: TrackInfoInjector = TrackInfoInjector.get();

  /**
   * Метод для начала работы аддона. Вызывается при создании объекта класса ReachText.
   * @private
   */
  private main() {
    if (!this.injected) {
      this.injected = true;
      this.contextMenuInjector.inject();
      this.syncedLyricsInjector.inject();
      this.trackInfoInjector.inject();
    }
  }

  /**
   * Последний найденный текст.
   * @public
   * @type {TrackLyrics | null}
   */
  public latestTrackLyrics: TrackLyrics | null = null;

  /**
   * Кешированные текста. Кеширование позволяет ускорить поиск текста.
   * @public
   * @type {TrackLyrics[]}
   */
  private cachedTrackLyrics: TrackLyrics[] = [];

  /**
   * Текущая песня, которая обрабатывается.
   * @public
   * @type {string | null}
   */
  private _processingTrackTitle: string | null = null;

  /**
   * Метод для получения текста трека.
   * @param {string} trackName - Название трека.
   * @param {string | null} artistName - Имя исполнителя.
   * @param {number | null} trackDuration - Длительность песни. (синхронизированный текст)
   * @param {string | null} albumName - Название альбома. (синхронизированный текст)
   * @returns {Promise<TrackLyrics | null>} - Возвращает объект TrackLyrics или null, если текст не найден.
   * @public
   */
  public async getTrackLyrics(
    trackName: string,
    artistName: string | null,
    trackDuration: number | null = null,
    albumName: string | null = null
  ): Promise<TrackLyrics | null> {
    if (!trackName) {
      return null;
    }

    // Поиск текста по кэшу
    const cachedTrackLyrics = this.cachedTrackLyrics.find(
      (track) =>
        track.trackName === trackName && track.artistName === artistName
    );

    // Если текст найден в кеше, то возвращаем его
    if (cachedTrackLyrics) {
      this.latestTrackLyrics = cachedTrackLyrics;
      return cachedTrackLyrics;
    }

    if (this._processingTrackTitle === trackName) {
      while (this._processingTrackTitle === trackName) {
        await Helpers.delay(100);
      }
      return await this.getTrackLyrics(
        trackName,
        artistName,
        trackDuration,
        albumName
      );
    }

    // Устанавливаем то какой трек сейчас обрабатывается
    this._processingTrackTitle = trackName;

    var results = await fetch(
      `https://lrclib.net/api/search?track_name=${encodeURIComponent(
        trackName
      )}&artist_name=${encodeURIComponent(artistName!)}`
    );

    let json = await results.json();

    if (!json || !Array.isArray(json) || json.length === 0) {
      this.stopProcessingTrack(trackName, artistName, null);
      return null;
    }

    json = json.filter((result: any) => result.instrumental == false);

    if (json.length === 0) {
      this.stopProcessingTrack(trackName, artistName, null);
      return null;
    }

    var result = json[0];

    if (trackDuration && trackDuration > 0) {
      // Если указана длина трека, то исключем из результата те треки, длина которых не соответсвует действительной. Полезно для синхронизированного текста
      const resultsWithRequestedDuration = json.filter(
        (result: any) => result.duration == trackDuration
      );

      if (resultsWithRequestedDuration.length > 0) {
        // В приоритете те песни, у которых есть синхронизированный текст, ...
        const preResult = json.find(
          (result: any) =>
            result.syncedLyrics != null && result.syncedLyrics != undefined
        );

        // ... если таковые не найдены, то берем первый результат с запрашиваемой длиной
        if (!preResult) {
          result = resultsWithRequestedDuration[0];
        } else {
          result = preResult;
        }
      }
    }

    const lyrics = TrackLyrics.fromJson(result);
    if (lyrics) console.log("[ReachText] Текст успешно получен: ", lyrics);

    this.stopProcessingTrack(trackName, artistName, lyrics);

    return lyrics;
  }

  /**
   * Метод который должен быть вызван после того как получен результат с LRCLib
   * @param {string} trackName - Название трека.
   * @param {string | null} artistName - Имя исполнителя.
   * @param {TrackLyrics | null} lyrics - Текст трека.
   */
  private stopProcessingTrack(
    trackName: string,
    artistName: string | null,
    lyrics: TrackLyrics | null
  ) {
    if (!lyrics) {
      lyrics = new TrackLyrics(
        null,
        trackName,
        artistName,
        null,
        null,
        false,
        null,
        null
      );
    }

    lyrics.trackName = trackName;

    if (
      !this.cachedTrackLyrics.find(
        (track) =>
          track.trackName === trackName && track.artistName === artistName
      )
    ) {
      this.cachedTrackLyrics.push(lyrics);

      if (!lyrics.id) console.log("[ReachText] Текст трека не найден");
    }

    if (this._processingTrackTitle === trackName) {
      this.latestTrackLyrics = lyrics;
    }

    this._processingTrackTitle = null;
  }
}
