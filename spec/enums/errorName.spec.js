import errorName from '../../enums/errorName';

describe('errorName enum', () => {
    const { validationError } = errorName;

    it('should have validationError value', () => {
        expect(validationError).toEqual('ValidationError');
    });
});
