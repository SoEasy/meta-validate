import { expect } from 'chai';
import { MetaValidate, Validity } from './../src/index';
import { Subject } from 'rxjs';
import 'reflect-metadata';

class ValidateCustom {
    validity$: Subject<Validity> = new Subject<Validity>();

    @MetaValidate.Base().custom('foo', () => true).make()
    field: string;
}

class SkipValidation {
    validity$: Subject<Validity> = new Subject<Validity>();

    @MetaValidate.Base()
    .skip((instance): boolean => instance.skip)
    .custom('foo', () => true).make()
    field: string;

    skip: boolean = true;
}

class SkipSingleValidator {
    validity$: Subject<Validity> = new Subject<Validity>();

    @MetaValidate.Base()
    .required()
    .skipIf((instance): boolean => instance.skip)
    .custom('foo', () => true).make()
    field: string;

    skip: boolean = true;
}

class WithValidator {
    validity$: Subject<Validity> = new Subject<Validity>();

    @MetaValidate.Base()
    .with(['trigger'])
    .required()
    .custom('len', (value, instance): boolean => !value || value.length !== instance.trigger).make()
    field: string = 'hello';

    @MetaValidate.Trigger().make()
    trigger: number = 5;
}

class NestedValidator {
    validity$: Subject<Validity> = new Subject<Validity>();

    @MetaValidate.Nested().make()
    nestedField: WithValidator = new WithValidator();
}

class CustomNestedValidator {
    validity$: Subject<Validity> = new Subject<Validity>();

    @MetaValidate.Nested('F').make()
    nestedField: WithValidator = new WithValidator();
}

describe('Base validation', () => {
    it('must validate custom', () => {
        const i = new ValidateCustom();
        i.validity$.subscribe(
            v => {
                expect(v.errors).to.be.deep.equal({ field: { foo: true } });
            }
        );
        i.field = 'a';
    });

    it('must skip all', () => {
        const i = new SkipValidation();
        i.validity$.subscribe(
            v => {
                expect(v.errors).to.be.deep.equal({ field: { foo: false } });
            }
        );
        i.field = 'a';
        i.field = null;
    });

    it('dont skip all', () => {
        const i = new SkipValidation();
        i.validity$.subscribe(
            v => {
                expect(v.errors).to.be.deep.equal({ field: { foo: true } });
            }
        );
        i.skip = false;
        i.field = 'a';
        i.field = null;
    });

    it('must skip validator', () => {
        const i = new SkipSingleValidator();
        i.validity$.subscribe(
            v => {
                expect(v.errors).to.be.deep.equal({ field: { required: false, foo: true } });
            }
        );
        i.field = null;
        i.field = 'hello';
        i.field = null;
    });

    it('dont skip validator', () => {
        const i = new SkipSingleValidator();
        i.validity$.subscribe(
            v => {
                expect(v.errors).to.be.deep.equal({ field: { required: true, foo: true } });
            }
        );
        i.skip = false;
        i.field = null;
    });

    it('validate required', () => {
        const i = new SkipSingleValidator();
        i.validity$.subscribe(
            v => {
                expect(v.errors).to.be.deep.equal({ field: { required: false, foo: true } });
            }
        );
        i.skip = false;
        i.field = 'hello';
    });

    it('must validate after trigger', () => {
        const i = new WithValidator();
        i.validity$.subscribe(
            v => {
                expect(v.errors).to.be.deep.equal({ field: { required: false, len: true } });
            }
        );
        i.trigger = 6;
    });

    it('dont validate when no change', () => {
        const i = new WithValidator();
        i.validity$.subscribe(
            v => {
                expect(v.errors).to.be.deep.equal({ field: { required: false, len: false } });
            }
        );
        i.trigger = 5;
        i.field = 'hello';
    });

    it('must validate nested field', () => {
        const i = new NestedValidator();
        i.validity$.subscribe(
            v => {
                expect(v.errors).to.be.deep.equal({
                    nestedField: {
                        field: { required: false, len: true }
                    } });
            }
        );
        i.nestedField.trigger = 6;
    });

    it('must validate nested field with custom name', () => {
        const i = new CustomNestedValidator();
        i.validity$.subscribe(
            v => {
                expect(v.errors).to.be.deep.equal({
                    F: {
                        field: { required: false, len: true }
                    } });
            }
        );
        i.nestedField.trigger = 6;
    });
});
