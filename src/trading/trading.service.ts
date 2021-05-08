import { HttpService, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trading, TradingDocument } from './schema/trading.schema';

@Injectable()
export class TradingService {
    constructor(
        private httpService: HttpService,
        @InjectModel(Trading.name)
        private tradingModel: Model<TradingDocument>,
    ){}
}


