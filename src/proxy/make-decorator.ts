import { ProxyFieldConfig } from './proxy-field-config';
import { ProxyConfig } from './proxy-config';

export function makeDecorator(config: ProxyFieldConfig): any {
    return (target: any, propertyKey: string): PropertyDescriptor => {
        if (!(Reflect as any).hasMetadata('mvProxy', target)) {
            (Reflect as any).defineMetadata('mvProxy', new ProxyConfig(), target);
        }
        const proxyConfig: ProxyConfig = (Reflect as any).getMetadata('mvProxy', target);

        proxyConfig.registerField(propertyKey, config);

        const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {
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
                this.passDataToDest(propertyKey, newVal);
            }
        };
        Object.defineProperty(target, propertyKey, descriptor);
        return descriptor;
    };
}
