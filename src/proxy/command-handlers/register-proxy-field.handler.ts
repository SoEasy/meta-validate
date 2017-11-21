import { CQRS } from './../cqrs';
import { DecorateFieldCommand } from './../commands/decorate-field.command';
import { ProxyRepository } from './../proxy.repository';

export class RegisterProxyFieldCommandHandler extends CQRS.BaseCommandHandler {
    static commandType: any = DecorateFieldCommand;

    handle(command: DecorateFieldCommand): void {
        console.log('REGISTER');
        const proxyConfig = ProxyRepository.getOrCreateProxyConfig(command.targetClass);
        proxyConfig.registerField(command.field, command.config);
    }
}
