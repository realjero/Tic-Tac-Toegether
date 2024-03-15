import { Injectable } from '@nestjs/common';

/**
 * `UtilsService` provides utility functions that can be used across the application. Currently,
 * it includes a method for determining the format of an image based on its binary data. This service
 * can be expanded to include more utility functions as needed.
 *
 * @Injectable Decorator that marks this class as a provider within the NestJS dependency injection system,
 * allowing it to be injected into other classes as needed.
 */
@Injectable()
export class UtilsService {
    /**
     * Determines the MIME type of image based on the initial bytes of its binary data. This method currently
     * supports JPEG and PNG image formats. If the image data matches the signature of known formats, the corresponding
     * MIME type is returned. Otherwise, the method returns `undefined`.
     *
     * @param {Buffer} imageData - The binary data of the image for which the format is to be determined.
     * @returns {string | undefined} The MIME type of the image (`'image/jpeg'` for JPEGs, `'image/png'` for PNGs),
     * or `undefined` if the format is not recognized.
     */
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
