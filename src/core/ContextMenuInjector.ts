
import { HtmlDefenetions, QueryConstants } from '../helpers/Constants';
import { Helpers } from '../helpers/Helpers';
import { InjectorBase } from '../helpers/InjectorBase';
/**
 * Логика работы текстов в контекстном меню.
 * @extends {InjectorBase}
 */
export class ContextMenuInjector extends InjectorBase {
    constructor() {
        super();
    }

    /**
     * @inheritdoc
     */
    public inject(): void {
        this.registeredButtons = new Set<Element>();

        const buttons = document.querySelectorAll?.(
            '[data-test-id="TRACK_CONTEXT_MENU_BUTTON"], [data-test-id="PLAYERBAR_DESKTOP_CONTEXT_MENU_BUTTON"]')
        if (
            buttons && buttons.length > 0
        ) {
            this.addContextMenuEventListeners(buttons);
        };

        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (
                    mutation.type === "childList"
                ) {
                    mutation.addedNodes.forEach((node) => {
                        if (!(node instanceof HTMLElement)) return;

                        const buttons = node.querySelectorAll?.(
                            '[data-test-id="TRACK_CONTEXT_MENU_BUTTON"], [data-test-id="PLAYERBAR_DESKTOP_CONTEXT_MENU_BUTTON"]')
                        if (
                            buttons && buttons.length > 0
                        ) {
                            this.addContextMenuEventListeners(buttons);
                        }
                    });
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    /**
     * Список кнопок контекстного меню которым был добавлена прослушка нажатий.
     * @private
     * @type {Set<Element>}
     */
    private registeredButtons: Set<Element> = new Set<Element>();

    /**
     * Добавляет прослушку нажатий на кнопки контекстного меню.
     * @param buttons - Кнопки контекстного меню.
     */
    private addContextMenuEventListeners(buttons: NodeListOf<Element>): void {
        buttons.forEach(button => {
            if (this.registeredButtons.has(button)) return;

            this.registeredButtons.add(button);
            button.addEventListener("mousedown", async (event) => {
                await this.updateContextMenu(event.currentTarget as HTMLElement);
            });
        });
    }

    /**
     * Получает текст трека и добавляет кнопку "Показать текст песни" в контекстное меню если текст найден
     * @param button - Кнопка контекстного меню.
     * @returns {Promise<void>}
     */
    private async updateContextMenu(button: HTMLElement): Promise<void> {
        // Ждем пока появится контекстное меню
        await Helpers.delay(1);

        var contextMenu = document.querySelector(
            QueryConstants.TRACK_CONTEXT_MENU
        ) as HTMLElement;

        if (!contextMenu) {
            return;
        }

        var contextLyricsButton = document.querySelector(
            QueryConstants.TRACK_CONTEXT_MENU_LYRICS_BUTTON
        );

        if (contextLyricsButton) {
            return;
        }

        let contextMenuButtonContainer = button.parentElement as HTMLElement;

        // Находим элемент который содержит метаданныее трека
        while (
            contextMenuButtonContainer &&
            !contextMenuButtonContainer.querySelector(QueryConstants.META_CONTAINER)) {
            contextMenuButtonContainer = contextMenuButtonContainer.parentElement as HTMLElement;
        }

        const trackName = contextMenuButtonContainer.querySelector(QueryConstants.TRACK_TITLE)?.textContent;
        const trackArtist = Array.from(contextMenuButtonContainer
            .querySelectorAll(QueryConstants.TRACK_ARTIST))
            ?.map(el => el.textContent )
            ?.join(', ');

        if (!trackName) {
            return;
        }

        const trackLyrics = await this.addon.getTrackLyrics(trackName, trackArtist);

        if (!trackLyrics?.plainLyrics) {
            return;
        }

        contextLyricsButton = HtmlDefenetions.TRACK_CONTEXT_MENU_LYRICS_BUTTON;

        // При нажатии на кнопку "Показать текст песни" создаем диалоговое окно с текстом песни.
        contextLyricsButton.addEventListener("click", async () => {
            await this.createLyricsDialog(
                this.addon.latestTrackLyrics!.trackName,
                this.addon.latestTrackLyrics!.artistName!,
                this.addon.latestTrackLyrics!.plainLyrics
            );

            // Скрываем контекстное меню
            contextMenu!.style.opacity = '0';
            await Helpers.delay(250);
            let uiPortal: HTMLElement | null = contextMenu;

            // Находим родителя контекстного меню и удаляем его
            Helpers.limitedWhile(() => uiPortal != null, async () => {
                if (uiPortal?.getAttribute("data-floating-ui-portal") != null) {
                    return;
                }
                uiPortal = uiPortal?.parentElement as HTMLElement;
            }, 10);

            if (!uiPortal) {
                uiPortal = contextMenu;
            }

            uiPortal?.remove();
        });

        if (contextMenu) {
            (contextMenu as HTMLElement).insertBefore(
                contextLyricsButton,
                document.querySelector(QueryConstants.TRACK_CONTEXT_MENU_SHARE_BUTTON)!.parentElement
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
    async createLyricsDialog(trackName: string, artistName: string, lyrics: string | null): Promise<void> {
        if (!lyrics) {
            return;
        }

        const mainContainer = document.querySelector(QueryConstants.CONTENT_MAIN);

        if (!mainContainer) {
            return;
        }


        const dialog = HtmlDefenetions.TRACK_LYRICS_DIALOG as HTMLDivElement;

        dialog!.querySelector(QueryConstants.TRACK_LYRICS_CLOSE_BUTTON)!.addEventListener("click", () => {
            this.onClosingDialog(modal, dialog);
        });

        dialog!.querySelector(QueryConstants.TRACK_LYRICS_MODAL_OVERLAY)!.addEventListener("click", () => {
            this.onClosingDialog(modal, dialog);
        });

        dialog.querySelector(QueryConstants.TRACK_LYRICS_TEXT)!.insertAdjacentText('afterbegin', lyrics);
        dialog.querySelector(QueryConstants.TRACK_LYRICS_TITLE)!.textContent = trackName;
        dialog.querySelector(QueryConstants.TRACK_LYRICS_AUTHORS)!.textContent = 'Авторы: ' + artistName;

        mainContainer.appendChild(dialog);

        const modal = dialog.querySelector(QueryConstants.TRACK_LYRICS_MODAL) as HTMLElement;

        await Helpers.delay(1);
        modal!.style.opacity = '1';
        modal!.style.transform = "translateX(0px)";
    }

    /**
 * Вызывается при закрытии диалога с текстом.
 * @param {HTMLElement} modal Элемент представляющий обертку TRACK_LYRICS_MODAL.
 * @param {HTMLElement} dialog Элемент представляющий диалог с текстом.
 */
    async onClosingDialog(modal: HTMLElement, dialog: HTMLElement) {
        modal.style.opacity = '0';
        modal.style.transform = "translateX(50px)";
        await Helpers.delay(300);
        dialog.remove();
    }
}