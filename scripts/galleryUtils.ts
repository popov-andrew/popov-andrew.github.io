import fs from 'node:fs';
import path from 'node:path';
import { GalleryImage, parseFilename } from './galleryShared';

export function getGalleryImages(): GalleryImage[] {
  // Define the path to the folder inside 'public'
  const galleryDirectory = path.join(process.cwd(), 'public', 'gallery');

  try {
    const filenames = fs.readdirSync(galleryDirectory);
    const images = filenames.filter((file) =>
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
    );

    // Parse all images
    const parsedImages = images.map(parseFilename);
    return parsedImages.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime()); // Newest first

  } catch (error) {
    console.error('Error reading gallery folder:', error);
    return [];
  }
}