import {
  POST_IMAGE_MAX_BYTES,
  POST_MAX_IMAGES,
} from '@logpose/contracts/common/post.schemas';
import { v2 as cloudinary } from 'cloudinary';
import multer, { type FileFilterCallback } from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import type { ServerEnv } from '../env/server.js';

export function isCloudinaryConfigured(
  env: Pick<
    ServerEnv,
    'CLOUDINARY_CLOUD_NAME' | 'CLOUDINARY_API_KEY' | 'CLOUDINARY_API_SECRET'
  >,
) {
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET,
  );
}

export function configureCloudinary(
  env: Pick<
    ServerEnv,
    'CLOUDINARY_CLOUD_NAME' | 'CLOUDINARY_API_KEY' | 'CLOUDINARY_API_SECRET'
  >,
) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

export function createPostImageMulterOptions(): multer.Options {
  return {
    storage: new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'onepiece/posts',
      } as { folder: string },
    }),
    fileFilter: (
      _req: Express.Request,
      file: Express.Multer.File,
      callback: FileFilterCallback,
    ) => {
      if (file.mimetype.startsWith('image/')) {
        callback(null, true);
        return;
      }

      callback(new Error('Solo se permiten archivos de imagen'));
    },
    limits: {
      fileSize: POST_IMAGE_MAX_BYTES,
      files: POST_MAX_IMAGES,
    },
  };
}
