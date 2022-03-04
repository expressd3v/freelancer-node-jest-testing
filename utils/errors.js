import errorName from '../enums/errorName';

export class ValidationError extends Error {
    constructor(errors) {
        super('Validation error');

        this.name = errorName.validationError;
        this.validationErrors = errors;
    }
}
