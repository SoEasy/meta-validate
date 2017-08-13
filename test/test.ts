import { expect } from 'chai';
import { ValidateRelationStore } from '../src/relation-store';

describe('ValidateRelationStore', () => {
    const store = new ValidateRelationStore();

    store.addValidators('fieldOne', {
        length: (value): boolean => value.length !== 3
    });

    it('should return errors', () => {
        expect(store.getErrors()).have.property('errors');
    });

    it('should validate invalid simple field', () => {
        store.validateField('fieldOne', 'fo', {});
        expect(store.getErrors().errors).have.property('fieldOne');
        expect(store.getErrors().errors.fieldOne).have.property('length');
        expect(store.getErrors().errors.fieldOne.length).equal(true);
    });

    it('should validate valid simple field', () => {
        store.validateField('fieldOne', 'foo', {});
        expect(store.getErrors().errors).have.property('fieldOne');
        expect(store.getErrors().errors.fieldOne).have.property('length');
        expect(store.getErrors().errors.fieldOne.length).equal(false);
    });
});
