import { POST_MAX_IMAGES } from '@logpose/contracts/common/post.schemas';
import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { createPostImageMulterOptions } from '../../integrations/cloudinary/cloudinary.config.js';
import { UploadService } from './upload.service.js';

const postImageMulterOptions = createPostImageMulterOptions();

@Controller('api/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('post-media')
  @UseInterceptors(
    FilesInterceptor('images', POST_MAX_IMAGES, {
      storage: postImageMulterOptions.storage,
      fileFilter: postImageMulterOptions.fileFilter,
      limits: postImageMulterOptions.limits,
      // Nest multer typings differ slightly from multer@2 FileFilterCallback overloads.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- multer/nest callback signature mismatch
    } as any),
  )
  uploadPostMedia(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadService.mapUploadedImageUrls(files);
  }
}
