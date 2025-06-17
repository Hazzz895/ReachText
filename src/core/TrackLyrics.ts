/**
 * Класс для хранения информации о тексте песни.
 */
export class TrackLyrics {

    public constructor(public id: number | null, public trackName: string, public artistName: string | null, public albumName: string | null, public duration: number | null, public instrumental: boolean | null, public plainLyrics: string | null, public plainSyncedLyrics: string | null) {
        this.syncedLyrics = plainSyncedLyrics ? TrackLyrics.parseSyncedLyrics(plainSyncedLyrics) : null;
    }

    /**
     * Превращает {@link plainSyncedLyrics} в массив объектов {@link SyncedLyricsLine}
     * @param plainSyncedLyrics - Текст с синхронизированным текстом
     * @returns {SyncedLyricsLine[]}
     */
    public static parseSyncedLyrics(plainSyncedLyrics: string): SyncedLyricsLine[] {
        const result = plainSyncedLyrics.split("\n").map((line) => {
            const match = line.match(/\[(\d{2}):(\d{2}).(\d{2})\] (.*)/);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const milliseconds = parseInt(match[3]);
                const totalMilliseconds =
                    ((60 * minutes + seconds) * 100 + milliseconds) * 10;
                return new SyncedLyricsLine(totalMilliseconds, match[4]);
            }
        });

        return (result.filter(
            (line) => line != undefined
        )) as SyncedLyricsLine[];
    }

    public static fromJson(json: any): TrackLyrics {
        return new TrackLyrics(json.id, json.trackName, json.artistName, json.albumName, json.duration, json.instrumental, json.plainLyrics, json.syncedLyrics);
    }

    public syncedLyrics: SyncedLyricsLine[] | null;
}

/**
 * Линия синхронизированного текста
 */
class SyncedLyricsLine {
    /**
     * Конструктор линии синхронизированного текста 
     * @param timestamp Позиция в миллисекундах линии
     * @param text Текст
     */
    public constructor(public timestamp: number, public text: string) { }

    /**
     * Элемент, который предоставляет линию синхронизированного текста
     * @type {HTMLElement | null}
     */
    public element: HTMLElement | null = null;
}