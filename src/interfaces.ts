import { Validity } from './validity';
import { Subject } from 'rxjs';

export const VALIDATE_FIELDS_KEY = 'JsonNameValidateFields';

export interface IBaseDecoratorType {
    required: () => IBaseDecoratorType;
    with: (fields: Array<string>) => IBaseDecoratorType;
    if: (condition: (instance: any) => boolean) => IBaseDecoratorType;
    skip: (condition: (instance: any) => boolean) => IBaseDecoratorType;

    validators: Record<string, MVValidator>;
}

/**
 * @description Тип для описания валидности полей класса T.
 */
export interface MVValidity {
    [key: string]: MVFieldValidity | MVValidity;
}

export interface MVFieldValidity {
    [key: string]: boolean;
}

/**
 * @description Тип функции-валидатора
 */
export type MVValidator<ValueType = any, InstanceType = any> = (value: ValueType, instance?: InstanceType) => boolean;

/**
 * @description Интерфейс, который по хорошему должен реализовать класс, принимающий ошибки
 */
export interface ReceiveValidity {
    /**
     * @description Обсервер, в который будут валиться ошибки
     */
    validity: Subject<Validity>;
}
