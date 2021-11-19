import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidateBoolean', async: false })
export class IsValidateBoolean implements ValidatorConstraintInterface {
    validate(data: string) {
        if (data === 'false' || data === 'true' || data === '1' || data === '0') return true

        return false;
    }

    defaultMessage(args: ValidationArguments) {
        return `The ${args.property} is invalid. It must be boolean.`;
    }
}
