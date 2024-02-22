import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
  getImageFormat(imageData: Buffer): string | undefined {
    if (imageData.length >= 2) {
      if (imageData[0] === 0xff && imageData[1] === 0xd8) {
        return 'image/jpeg';
      } else if (imageData[0] === 0x89 && imageData[1] === 0x50) {
        return 'image/png';
      }
    }
    return undefined;
  }
}
