import { IBaseDecoratorType, MVValidator } from '../interfaces';
import { makeDecorator } from '../make-decorator';

export class MVBase implements IBaseDecoratorType {
    protected prebuiltValidators: Record<string, MVValidator> = {};
    lastValidator: string = null;
    validateWith: Array<string> = [];
    skipCondition: (i: any) => boolean = null;
    validatorConditions: Record<string, (i: any) => boolean> = {};
    converters: Array<(value: any) => any> = [];
    isTrigger: boolean = false;
    isNested: boolean = false;

    required(): MVBase {
        this.lastValidator = 'required';
        this.prebuiltValidators['required'] = (v: any): boolean => !v;
        return this;
    }

    if(condition: (i: any) => boolean): MVBase {
        if (!this.lastValidator) {
            console.warn('No last validator for "if" statement');
            return this;
        }
        this.validatorConditions[this.lastValidator] = condition;
        return this;
    }

    skip(condition: (i: any) => boolean): MVBase {
        this.skipCondition = condition;
        return this;
    }

    with(fields: Array<string>): MVBase {
        this.validateWith = fields;
        return this;
    }

    custom(name: string, validator: (value: number, instance: any) => boolean): MVBase {
        this.lastValidator = name;
        this.prebuiltValidators[name] = validator;
        return this;
    }

    get validators(): Record<string, MVValidator> {
        return this.prebuiltValidators;
    }

    make(): any {
        return makeDecorator(this);
    }
}