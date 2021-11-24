import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

@Injectable()
export class AuthStrapiMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const URL_STRAPI = process.env.APESWAP_STRAPI_URL;
    try {
      const user = await axios({
        method: 'get',
        url: `${URL_STRAPI}/users/me`,
        headers: {
          Authorization: `Bearer ${req.headers.auth}`,
        },
      });

      const roles = user.data?.roles.find((r) => r.id === 1)
      if(!roles) throw new HttpException('unauthorized', HttpStatus.UNAUTHORIZED);
      next();
    } catch (error) {
      throw new HttpException('unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
