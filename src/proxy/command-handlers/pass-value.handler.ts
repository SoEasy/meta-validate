import { CQRS } from './../cqrs';
import { ChangeFieldCommand } from './../commands/change-field.command';

export class PassValueCommandHandler extends CQRS.BaseCommandHandler {
    static commandType: any = ChangeFieldCommand;

    handle(command: ChangeFieldCommand): void {
        command.target.dest[command.fieldName] = command.newValue;
    }
}
