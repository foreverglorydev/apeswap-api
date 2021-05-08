import {
    Controller,
    Get,
    Param,
    Query,
    Logger,
    Body
} from '@nestjs/common'
import { Trading } from './interfaces/trading.interface'

@Controller('trading')
export class TradingController {
    private readonly logger = new Logger(TradingController.name)
}