import { RegisterFieldEvent } from './../events';
import { EventBus } from './../event-bus';

export class MakeDecoratorService {
    private static instance: MakeDecoratorService;

    static register(): void {
        MakeDecoratorService.instance = new MakeDecoratorService();
    }

    constructor() {
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

    // private attachFieldMetaToProxyStore(event: RegisterFieldEvent): void {
    //     if (!(Reflect as any).hasMetadata('mvProxy', event.targetClass)) {
    //         (Reflect as any).defineMetadata('mvProxy', new ProxyConfig(), event.targetClass);
    //     }
    //     const proxyConfig: ProxyConfig = (Reflect as any).getMetadata('mvProxy', event.targetClass);
    //
    //     proxyConfig.registerField(propertyKey, config);
    // }
}
