import { Validity } from './validity';
import { Subject } from 'rxjs';

/**
 * @description Тип для описания валидности полей класса T.
 */
export interface MVValidity {
    [key: string]: IMVFieldValidity | MVValidity;
}

/**
 * @description Интерфейс для описания набора ошибок поля
 */
export interface IMVFieldValidity {
    [key: string]: boolean;
}

/**
 * @description Тип функции-валидатора
 */
export type MVValidator<T> = (value: T, context: any) => boolean;

/**
 * @description Набор валидаторов поля для key-критериев
 */
export interface IMVValidators<T> {
    [key: string]: MVValidator<T>;
}

/**
 * @description Интерфейс, который по хорошему должен реализовать класс, принимающий ошибки
 */
export interface ReceiveValidity {
    /**
     * @description Обсервер, в который будут валиться ошибки
     */
    validity: Subject<Validity>;
}
