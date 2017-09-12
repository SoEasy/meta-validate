import { IBaseDecoratorType, MVValidator } from '../interfaces';
import { makeDecorator } from '../make-decorator';

export class MVBase implements IBaseDecoratorType {
    protected attachedValidators: Record<string, MVValidator> = {};
    protected lastValidator: string = null;
    validateWith: Array<string> = [];
    skipCondition: (i: any) => boolean = null;
    validatorConditions: Record<string, (i: any) => boolean> = {};
    protected converters: Array<(value: any) => any> = [];
    isTrigger: boolean = false;
    isNested: boolean = false;

    constructor(public customErrorKey?: string) {}

    attachValidator(name: string, validator: (v: any, i?: any) => boolean): void {
        this.lastValidator = name;
        this.attachedValidators[name] = validator;
    }

    required(): IBaseDecoratorType {
        this.attachValidator('required', (v: any): boolean => !v);
        return this;
    }

    skipIf(condition: (i: any) => boolean): IBaseDecoratorType {
        if (!this.lastValidator) {
            console.warn('No last validator for "if" statement');
            return this;
        }
        this.validatorConditions[this.lastValidator] = condition;
        return this;
    }

    skip(condition: (i: any) => boolean): IBaseDecoratorType {
        this.skipCondition = condition;
        return this;
    }

    with(fields: Array<string> | string, ...anotherFields: Array<string>): IBaseDecoratorType {
        if (Array.isArray(fields)) {
            this.validateWith = fields;
        } else {
            this.validateWith = [fields, ...anotherFields];
        }
        return this;
    }

    custom(name: string, validator: (value: any, instance: any) => boolean): IBaseDecoratorType {
        this.attachValidator(name, validator);
        return this;
    }

    get validators(): Record<string, MVValidator> {
        return this.attachedValidators;
    }

    make(): any {
        return makeDecorator(this);
    }
}
