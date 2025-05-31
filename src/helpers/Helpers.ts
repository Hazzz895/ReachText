declare global {
    interface Window {
        player: any;
    }
    interface HTMLElement {
        __reachText_custom__: boolean | undefined;
    }
}

/**
 * Статический класс для различных методов и свойств
 */
export abstract class Helpers {
    /**
        * Создает node элемент из HTML строки.
        * src: https://stackoverflow.com/a/494348/25080935
        * @param {String} htmlString HTML строка представляющая node элемент.
        * @returns {HTMLElement} Элемент созданный из HTML строки.
        */
    public static createElementFromHTML(htmlString: string): HTMLElement {
        var div = document.createElement("div");
        div.innerHTML = htmlString.trim();

        return div.firstChild as HTMLElement;
    }

    /**
 * Решил выделить задержку в отдельную переменную, так как привык к синтаксису C# :3
 * @param {number} ms Задержка в миллисекундах.
 * @returns {Promise<any>} Promise для задержки.
 */
    public static async delay(ms: number): Promise<any> {
        await new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Выполняет цикл while с  ограничением по количеству итераций.
     * @param condition Условие для продолжения цикла.
     * @param action Действие, которое будет выполняться в цикле.
     * @param limit Максимальное количество итераций цикла.
     * @returns {Promise<void>}
     */
    public static async limitedWhile(condition: () => boolean, action: () => Promise<any>, limit: number): Promise<void> {
        let i = 0;
        while (condition() && i < limit) {
            await action();
            i++;
        }
    }

    public static get progress(): { duration: number, position: number } {
        return window?.player?.state?.currentMediaPlayer?.value?.audioPlayerState
            ?.progress?.value;
    }
    public static get meta(): any {
        return window?.player?.state?.queueState?.currentEntity?.value?.entity
            ?.entityData?.meta;
    }
    public static get playerState(): { status: { value: string }, event: any } {
        return window?.player?.state?.playerState;
    }
    public static get status(): string {
        return window?.player?.state?.currentMediaPlayer?.value
            ?.audioPlayerState?.status?.observableValue?.value;
    }

    public static isCustom(el: HTMLElement): boolean {
        return el?.__reachText_custom__ || false;
    }

    public static setCustom(el: HTMLElement, value: boolean): void {
        if (!el) {
            return;
        }

        el.__reachText_custom__ = value;
    }
}