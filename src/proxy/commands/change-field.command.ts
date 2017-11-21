import { CQRS } from './../cqrs';

export class ChangeFieldCommand extends CQRS.BaseCommand {
    target: any;
    fieldName: string;
    newValue: any;
}
