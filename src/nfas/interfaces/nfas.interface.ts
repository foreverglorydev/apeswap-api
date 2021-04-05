import { NfaAttribute } from './nfaAttribute.interface';

export interface Nfa {
  index: number;
  name: string;
  image: string;
  uri: string;
  address?: string;
  attributes?: NfaAttribute;
}
