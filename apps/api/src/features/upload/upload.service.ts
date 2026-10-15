import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  configureCloudinary,
  isCloudinaryConfigured,
} from '../../integrations/cloudinary/cloudinary.config.js';
import type { ServerEnv } from '../../integrations/env/server.js';

@Injectable()
export class UploadService {
  private configured = false;

  constructor(private readonly config: ConfigService<ServerEnv, true>) {
    const env = {
      CLOUDINARY_CLOUD_NAME: config.get('CLOUDINARY_CLOUD_NAME', {
        infer: true,
      }),
      CLOUDINARY_API_KEY: config.get('CLOUDINARY_API_KEY', { infer: true }),
      CLOUDINARY_API_SECRET: config.get('CLOUDINARY_API_SECRET', {
        infer: true,
      }),
    };

    if (isCloudinaryConfigured(env)) {
      configureCloudinary(env);
      this.configured = true;
    }
  }

  assertCloudinaryReady() {
    if (!this.configured) {
      throw new ServiceUnavailableException(
        'Cloudinary is not configured. Add CLOUDINARY_* to apps/api/.env',
      );
    }
  }

  mapUploadedImageUrls(files: Express.Multer.File[] | undefined) {
    this.assertCloudinaryReady();

    if (!files?.length) {
      throw new BadRequestException('At least one image is required');
    }

    const imageUrls = files
      .map(file => file.path)
      .filter(
        (url): url is string => typeof url === 'string' && url.length > 0,
      );

    if (imageUrls.length === 0) {
      throw new BadRequestException('Could not process the images');
    }

    return { imageUrls };
  }
}
