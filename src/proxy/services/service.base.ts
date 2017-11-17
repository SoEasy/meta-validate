export class BaseService {
    static instance: BaseService;

    static make(...args: Array<any>): void {
        this.instance = new this(...args);
        this.instance.onInit();
    }

    protected onInit(): void {}
}
