import { HttpService, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NfaSaleDto } from './dto/nfaSale.dto';
import { NfaIdInvalidHttpException } from './exceptions';
import { Nfa, NfaDocument } from './schema/nfa.schema';

@Injectable()
export class NfasService {
  constructor(
    private httpService: HttpService,
    @InjectModel(Nfa.name)
    private nfaModel: Model<NfaDocument>,
  ) {}
  async fetchNfas(filter) {
    return this.nfaModel.find(filter);
  }
  async getNfa(filter) {
    return this.nfaModel.findOne(filter);
  }
  async getNfaById(id) {
    return this.nfaModel.findById(id);
  }
  async getAllNfas(query): Promise<Nfa[]> {
    const filter = this.mappingFilter(query);
    return await this.fetchNfas(filter);
  }
  async getNfasByAddress(address: string, query): Promise<Nfa[]> {
    const filter = this.mappingFilter(query);
    return await this.fetchNfas({ ...{ address: address }, ...filter });
  }
  async getNfasByIndex(index: number): Promise<Nfa> {
    return await this.getNfa({ index: index });
  }
  async nfaSale(nfaSale: NfaSaleDto): Promise<any> {
    const nfa = await this.getNfaById(nfaSale.id);
    if (!nfa) throw new NfaIdInvalidHttpException();
    const dataUpdate = {
      address: nfaSale.to,
      $push: {
        history: { ...{ date: Date.now().toString() }, ...nfaSale },
      },
    };
    if (!nfaSale.to || nfaSale.to == '') delete dataUpdate.address;

    await nfa.updateOne(dataUpdate);
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
    const allData = await this.fetchNfas({});
    if (allData.length > 0)
      return {
        info:
          'Ya hay información en la BD, limpia la BD para ingresar la nueva información',
      };

    const url = 'https://apeswap-nfa-apis.herokuapp.com/nfas';
    const { data } = await this.httpService.get(url).toPromise();
    await this.nfaModel.insertMany(data);
    return data;
  }
}
