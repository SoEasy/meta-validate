import { expect } from 'chai';
import { MetaValidate, Validity } from './../src/index';
import { BehaviorSubject } from 'rxjs';
import 'reflect-metadata';

class ValidateCustom {
    validity$: BehaviorSubject<Validity> = new BehaviorSubject<Validity>(new Validity());

    @MetaValidate.Base().custom('foo', () => true).make()
    field: string;
}

class SkipValidation {
    validity$: BehaviorSubject<Validity> = new BehaviorSubject<Validity>(new Validity());

    @MetaValidate.Base()
    .skip((instance): boolean => instance.skip)
    .custom('foo', () => true).make()
    field: string;

    skip: boolean = true;
}

class SkipSingleValidator {
    validity$: BehaviorSubject<Validity> = new BehaviorSubject<Validity>(new Validity());

    @MetaValidate.Base()
    .required()
    .skipIf((instance): boolean => instance.skip)
    .custom('foo', () => true).make()
    field: string;

    skip: boolean = true;
}

class WithValidator {
    validity$: BehaviorSubject<Validity> = new BehaviorSubject<Validity>(new Validity());

    @MetaValidate.Base()
    .with(['trigger'])
    .required()
    .custom('len', (value, instance): boolean => !value || value.length !== instance.trigger).make()
    field: string = 'hello';

    @MetaValidate.Trigger().make()
    trigger: number = 5;
}

describe('Base validation', () => {
    it('must validate custom', done => {
        const i = new ValidateCustom();
        i.field = 'a';
        setTimeout(() => {
        i.validity$.subscribe(
            v => {
                expect(v.errors).to.be.eql({ field: { foo: true } });
                done();
            }
        );
        });
    });

    it('must skip all', done => {
        const i = new SkipValidation();
        i.field = 'a';
        i.field = null;
        setTimeout(() => {
            i.validity$.subscribe(
                v => {
                    expect(v.errors).to.be.eql({ field: { foo: false } });
                    done();
                }
            );
        });
    });

    it('dont skip all', done => {
        const i = new SkipValidation();
        i.skip = false;
        i.field = 'a';
        i.field = null;
        setTimeout(() => {
        i.validity$.subscribe(
            v => {
                expect(v.errors).to.be.eql({ field: { foo: true } });
                done();
            }
        );
        });
    });

    it('must skip validator', done => {
        const i = new SkipSingleValidator();
        i.field = null;
        i.field = 'hello';
        i.field = null;
        setTimeout(() => {
        i.validity$.subscribe(
            v => {
                expect(v.errors).to.be.deep.equal({ field: { required: false, foo: true } });
                done();
            }
        );
        });
    });

    it('dont skip validator', done => {
        const i = new SkipSingleValidator();
        i.skip = false;
        i.field = null;
        setTimeout(() => {
        i.validity$.subscribe(
            v => {
                expect(v.errors).to.be.deep.equal({ field: { required: true, foo: true } });
                done();
            }
        );
        });
    });

    it('validate required', done => {
        const i = new SkipSingleValidator();
        i.skip = false;
        i.field = 'hello';
        setTimeout(() => {
        i.validity$.subscribe(
            v => {
                expect(v.errors).to.be.deep.equal({ field: { required: false, foo: true } });
                done();
            }
        );
        });
    });

    it('must validate after trigger', done => {
        const i = new WithValidator();
        i.trigger = 6;
        setTimeout(() => {
        i.validity$.subscribe(
            v => {
                expect(v.errors).to.be.deep.equal({ field: { required: false, len: true } });
                done();
            }
        );
        });
    });

    it('dont validate when no change', done => {
        const i = new WithValidator();
        i.trigger = 5;
        i.field = 'hello';
        setTimeout(() => {
        i.validity$.subscribe(
            v => {
                expect(v.errors).to.be.deep.equal({ field: { required: false, len: false } });
                done();
            }
        );
        });
    });
});
