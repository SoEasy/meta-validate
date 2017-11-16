import { RegisterFieldEvent } from './../events';
import { EventBus } from './../event-bus';
import { ProxyConfig } from './../models/proxy-config';

export class ProxyClassConfigSerivce {
    private static instance: ProxyClassConfigSerivce;

    static register(): void {
        ProxyClassConfigSerivce.instance = new ProxyClassConfigSerivce();
    }

    constructor() {
        EventBus.on(RegisterFieldEvent, this.handle.bind(this));
    }

    private handle(event: RegisterFieldEvent): void {
        if (!(Reflect as any).hasMetadata('mvProxy', event.targetClass)) {
            (Reflect as any).defineMetadata('mvProxy', new ProxyConfig(), event.targetClass);
        }
        const proxyConfig: ProxyConfig = (Reflect as any).getMetadata('mvProxy', event.targetClass);

        proxyConfig.registerField(event.field, event.config);
    }
}