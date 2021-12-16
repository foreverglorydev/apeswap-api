import { NfaSaleDto } from '../dto/nfaSale.dto';
import { NfaAttribute } from './nfaAttribute.interface';

export class Nfa {
  index: number;
  name: string;
  image: string;
  uri: string;
  public?: boolean;
  sale?: boolean;
  attributes?: NfaAttribute;
  address: string;
  history?: NfaSaleDto[];
}
