declare global {
  interface Window {
    player: any;
    sonataState: any;
    VERSION: string;
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
  public static async limitedWhile(
    condition: () => boolean,
    action: () => Promise<any>,
    limit: number
  ): Promise<void> {
    let i = 0;
    while (condition() && i < limit) {
      await action();
      i++;
    }
  }

  /**
   * Определяет, является ли текущая версия приложения больше или равной 5.58.0.
   *
   * Геттер парсит глобальную строку `window.VERSION` (ожидается формат "x.y.z"),
   * объединяет её числовые части и сравнивает полученное число с `5580`.
   *
   * @returns `true`, если текущая версия не ниже 5.58.0, иначе `false`.
   */
  public static get IS_NEW_VERSION(): boolean {
    const splitedVersion = window.VERSION.split(".");
    var version: string = "";
    splitedVersion.forEach((element) => {
      version += element;
    });

    return parseInt(version) >= 5_58_0;
  }

  /**
   * Получает экземпляр плеера в зависимости от актуальности версии приложения.
   * @returns {any} Экземпляр плеера
   */
  public static get player(): any {
    if (Helpers.IS_NEW_VERSION) return window.sonataState;
    else return window.player;
  }

  public static get progress(): {
    duration: number;
    position: number;
    loaded: number;
  } {
    if (!Helpers.IS_NEW_VERSION) {
      return Helpers.player?.state?.currentMediaPlayer?.value?.audioPlayerState
        ?.progress?.value;
    } else {
      return Helpers.player?.state?.currentMediaPlayer?.value?.state?.progress
        ?.value;
    }
  }

  public static get meta(): any {
    return Helpers.player?.state?.queueState?.currentEntity?.value?.entity
      ?.entityData?.meta;
  }

  public static get speed(): number | null {
    return Helpers.player?.state?.currentMediaPlayer?.value?.audioPlayerState
      ?.speed?.value;
  }

  public static get playerState(): { status: { value: string }; event: any } {
    return Helpers.player?.state?.playerState;
  }

  public static get status(): string {
    return Helpers.player?.state?.currentMediaPlayer?.value?.audioPlayerState
      ?.status?.observableValue?.value;
  }

  /**
   * Определяет, помечен ли данный HTML-элемент как кастомный с помощью свойства `__reachText_custom__`.
   * @param el HTML-элемент для проверки.
   * @returns `true`, если у элемента установлено свойство `__reachText_custom__` в истинное значение; иначе `false`.
   */
  public static isCustom(el: HTMLElement): boolean {
    return el?.__reachText_custom__ || false;
  }

  /**
   * Устанавливает значение свойства `__reachText_custom__` для указанного HTML-элемента.
   * @param el Элемент.
   * @param value Значение свойства.
   */
  public static setCustom(el: HTMLElement, value: boolean = true): void {
    if (!el) {
      return;
    }

    el.__reachText_custom__ = value;
  }
}
