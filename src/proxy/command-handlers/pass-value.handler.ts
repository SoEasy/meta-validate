import { CQRS } from './../cqrs';
import { ChangeFieldCommand } from './../commands/change-field.command';
// import { ProxyRepository } from './../proxy.repository';

export class PassValueCommandHandler extends CQRS.BaseCommandHandler {
    static commandType: any = ChangeFieldCommand;

    handle(command: ChangeFieldCommand): void {
        command.target.passDataToDest(command.fieldName, command.newValue);
        // console.log(ProxyRepository.getOrCreateProxyConfig(command.target.constructor.prototype));
    }
}
