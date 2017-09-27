import { expect } from 'chai';
import { MetaValidate, Validity } from './../src/index';
import { Subject } from 'rxjs';
import 'reflect-metadata';

class NestedClassValidator {
    validity$: Subject<Validity> = new Subject<Validity>();

    @MetaValidate.Base().required().make()
    field: string;
}

class NestedValidator {
    validity$: Subject<Validity> = new Subject<Validity>();

    @MetaValidate.Nested().make()
    nestedField: NestedClassValidator = new NestedClassValidator();
}

class CustomNestedValidator {
    validity$: Subject<Validity> = new Subject<Validity>();

    @MetaValidate.Nested('F').make()
    nestedField: NestedClassValidator = new NestedClassValidator();
}

describe('Base validation', () => {
    it('must validate nested field', done => {
        const i = new NestedValidator();
        i.validity$.subscribe(v => {
                expect(v.errors).to.be.eql({
                    nestedField: {
                        field: { required: true }
                    } });
                done();
            }
        );
    });

    it('must validate nested field with custom name', done => {
        const i = new CustomNestedValidator();
        i.validity$.subscribe(
            v => {
                expect(v.errors).to.be.eql({
                    F: {
                        field: { required: true }
                    } });
                done();
            }
        );
    });
});
