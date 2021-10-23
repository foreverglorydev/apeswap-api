import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidateDate', async: false })
export class IsValidateDate implements ValidatorConstraintInterface {
  validate(date: number) {
    const now = new Date();
    if (isNaN(new Date(Number(date)).getTime())) return false;
    if (Number(date) * 1000 < now.getTime()) return false;

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `The ${args.property} is invalid. Check format and that it is greater than the current date.`;
  }
}
