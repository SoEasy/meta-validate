import { CQRS } from './../cqrs';
import { DecorateFieldCommand } from './../commands/decorate-field.command';
import { ChangeFieldCommand } from './../commands/change-field.command';

export class MakeDecoratorCommandHandler extends CQRS.BaseCommandHandler {
    static commandType: any = DecorateFieldCommand;

    handle(command: DecorateFieldCommand): void {
        const descriptor = Object.getOwnPropertyDescriptor(command.targetClass, command.field) || {
            configurable: true,
            enumerable: true
        };

        const valueStore = new WeakMap<any, any>();

        const originalGet = descriptor.get || function(): any | undefined {
            return valueStore.get(this as any);
        };
        const originalSet = descriptor.set || function(val: any): void {
            valueStore.set(this, val);
        };

        descriptor.get = originalGet;
        descriptor.set = function(newVal: any): void {
            const currentVal = originalGet.call(this);
            originalSet.call(this, newVal);

            if (newVal !== currentVal) {
                const changeFieldCommand = new ChangeFieldCommand();
                changeFieldCommand.target = this;
                changeFieldCommand.newValue = newVal;
                changeFieldCommand.fieldName = command.field;
                changeFieldCommand.do();
            }
        };
        Object.defineProperty(command.targetClass, command.field, descriptor);
    }
}
