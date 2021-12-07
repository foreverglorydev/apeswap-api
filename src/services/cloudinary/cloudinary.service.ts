import { Inject, Injectable } from '@nestjs/common';
import { Cloudinary } from './cloudinary.provider';
import * as streamifier from 'streamifier';

interface UploadFile {
  url: string;
}
@Injectable()
export class CloudinaryService {
  private v2: any;
  constructor(
    @Inject(Cloudinary)
    private cloudinary,
  ) {
    this.cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    this.v2 = cloudinary.v2;
  }
  async upload(file: any) {
    return await this.v2.uploader.upload(file);
  }

  async uploadBuffer(file: any): Promise<UploadFile> {
    return await this.streamUpload(file);
  }

  streamUpload = (file): Promise<UploadFile> => {
    return new Promise((resolve, reject) => {
      const stream = this.v2.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      });

      streamifier.createReadStream(file).pipe(stream);
    });
  };
}
