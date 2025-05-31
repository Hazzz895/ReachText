import {ReachText} from '../core/ReachText'
import { SingletonBase } from './SingletonBase';

/**
 * Представляет базовый класс для различных инжекторов..
 * Инжекторы используются для внедрения функциональности в ReachText.
 * @abstract
 */
export abstract class InjectorBase extends SingletonBase {
    protected get addon(): ReachText {
        return ReachText.get();
    }

    /**
     * Внедряет функциональность в ReachText.
     */
    abstract inject(): void;
}