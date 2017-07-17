// Generated by dts-bundle v0.7.2

export function ValidationTrigger<T>(): any;
export function Validate<T>(validators: IMVValidators<T>, validateWith?: Array<string>): any;
export function isFullValid(validity: MVValidity): boolean;

/**
    * @description Тип для описания валидности полей класса T.
    */
export interface MVValidity {
        [key: string]: IMVFieldValidity;
}
/**
    * @description Интерфейс для описания набора валидностей поля
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
        receiveValidity(validity: MVValidity): void;
}

