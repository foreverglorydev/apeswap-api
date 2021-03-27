import { HttpService, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Nfa, NfaDocument } from './schema/nfa.schema';

@Injectable()
export class NfasService {
  constructor(
    private httpService: HttpService,
    @InjectModel(Nfa.name)
    private nfaModel: Model<NfaDocument>,
  ) {}
  async fetchNafs(filter) {
    return this.nfaModel.find(filter);
  }
  async getNafs(filter) {
    return this.nfaModel.findOne(filter);
  }

  async getAllNfas(query): Promise<Nfa[]> {
    //await this.initData();
    const filter = this.mappingFilter(query);
    return await this.fetchNafs(filter);
  }
  async getNfasByAddress(address: string, query): Promise<Nfa[]> {
    const filter = this.mappingFilter(query);
    return await this.fetchNafs({ ...{ address: address }, ...filter });
  }
  async getNfasByIndex(index: number): Promise<Nfa> {
    return await this.getNafs({ index: index });
  }

  mappingFilter(query) {
    const filter = {
      sale: 1,
      public: 1,
    };
    if (query.sale) filter.sale = query.sale;
    if (isNaN(query.sale)) delete filter.sale;
    if (query.public) filter.public = query.public;
    if (isNaN(query.public)) delete filter.public;
    return filter;
  }

  async initData() {
    const url = 'https://apeswap-nfa-apis.herokuapp.com/nfas';
    const { data } = await this.httpService.get(url).toPromise();
    //console.log(data);
    await this.nfaModel.insertMany(data);
    return data;
  }
}
