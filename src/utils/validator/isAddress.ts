import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { getWeb3 } from 'src/utils/lib/web3';

@ValidatorConstraint({ name: 'isAddress', async: false })
export class IsAddress implements ValidatorConstraintInterface {
  web3 = getWeb3();
  async validate(address: string) {
    return this.web3.utils.isAddress(address);
  }

  defaultMessage(args: ValidationArguments) {
    return `The ${args.property} format is invalid`;
  }
}
