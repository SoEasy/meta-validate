import { RegisterFieldEvent } from './../events';
import { EventBus } from './../event-bus';
import { ProxyConfig } from './../models/proxy-config';
import { BaseService } from './service.base';

export class ProxyClassConfigService extends BaseService{
    protected onInit(): void {
        EventBus.on(RegisterFieldEvent, this.handle.bind(this));
    }

    private handle(event: RegisterFieldEvent): void {
        console.log('REGISTER');
        if (!(Reflect as any).hasMetadata('mvProxy', event.targetClass)) {
            (Reflect as any).defineMetadata('mvProxy', new ProxyConfig(), event.targetClass);
        }
        const proxyConfig: ProxyConfig = (Reflect as any).getMetadata('mvProxy', event.targetClass);

        proxyConfig.registerField(event.field, event.config);
    }
}
