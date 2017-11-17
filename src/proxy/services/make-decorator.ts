import { RegisterFieldEvent } from './../events';
import { EventBus } from './../event-bus';
import { BaseService } from './service.base';

export class MakeDecoratorService extends BaseService {
    protected onInit(): void {
        EventBus.on(RegisterFieldEvent, this.handle.bind(this));
    }

    private handle(event: RegisterFieldEvent): void {
        const descriptor = Object.getOwnPropertyDescriptor(event.targetClass, event.field) || {
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
                console.log('SETTER WORK!', newVal);
            }
        };
        Object.defineProperty(event.targetClass, event.field, descriptor);
    }
}
