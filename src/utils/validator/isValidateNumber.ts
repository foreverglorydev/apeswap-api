import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidateNumber', async: false })
export class IsValidateNumber implements ValidatorConstraintInterface {
    validate(data: string) {
        if(isNaN(Number(data)) || Number(data) < 0) return false
        
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return `The ${args.property} is invalid. It must be a positive number.`;
    }
}
