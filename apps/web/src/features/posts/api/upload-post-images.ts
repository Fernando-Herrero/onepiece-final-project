import { POST_MAX_IMAGES } from '@logpose/contracts/common/post.schemas';

type UploadPostImagesResponse = {
  imageUrls: string[];
};

export async function uploadPostImages(files: File[]): Promise<string[]> {
  if (files.length === 0) {
    return [];
  }

  const formData = new FormData();
  for (const file of files) {
    formData.append('images', file);
  }

  const response = await fetch('/api/upload/post-media', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const message =
      response.status === 503
        ? 'Cloudinary no está configurado en la API'
        : 'No se pudieron subir las imágenes';
    throw new Error(message);
  }

  const data = (await response.json()) as UploadPostImagesResponse;
  return data.imageUrls.slice(0, POST_MAX_IMAGES);
}
