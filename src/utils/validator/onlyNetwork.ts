import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'onlyNetwork', async: false })
export class OnlyNetwork implements ValidatorConstraintInterface {
  validate(chainId: number) {
    return [56, 137].includes(+chainId);
  }

  defaultMessage(args: ValidationArguments) {
    return `The chain id ${args.property} not supported`;
  }
}
