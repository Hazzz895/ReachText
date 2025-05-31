/**
 * Представляет базовый класс для применения синглотона.
 * Синглтон гарантирует, что класс будет иметь только один экземпляр.
 */
export class SingletonBase {
    private static _instances = new Map<Function, any>();

    protected constructor() {
        const ctor = this.constructor;
        if (SingletonBase._instances.has(ctor)) {
            return SingletonBase._instances.get(ctor);
        }
        SingletonBase._instances.set(ctor, this);
    }

    /**
     * Получить экземпляр синглтона для текущего класса.
     */
    public static get<T extends SingletonBase>(this: new () => T): T {
        if (!SingletonBase._instances.has(this)) {
            SingletonBase._instances.set(this, new this());
        }
        return SingletonBase._instances.get(this) as T;
    }
}