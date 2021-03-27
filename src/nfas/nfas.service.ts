import { Injectable } from '@nestjs/common';
import { Nfa } from './schema/nfa.schema';

@Injectable()
export class NfasService {
  async getAllNfas(): Promise<Nfa[]> {
    const n: Nfa = {
      index: 0,
      name: 'string',
      image: 'string',
      uri: 'string',
      rarityScore: '',
      public: true,
      sale: false,
      address: '',
    };
    const b = [n];
    return b;
  }
  async getNfasByAddress(address: string): Promise<Nfa[]> {
    const n: Nfa = {
      index: 0,
      name: 'string',
      image: 'string',
      uri: 'string',
      rarityScore: '',
      public: true,
      sale: false,
      address: '',
    };
    const b = [n];
    return b;
  }
  async getNfasByIndex(index: number): Promise<Nfa> {
    const n: Nfa = {
      index: 0,
      name: 'string',
      image: 'string',
      uri: 'string',
      rarityScore: '',
      public: true,
      sale: false,
      address: '',
    };
    return n;
  }
}
