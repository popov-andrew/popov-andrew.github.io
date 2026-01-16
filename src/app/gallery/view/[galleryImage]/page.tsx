import Image from 'next/image';
import Link from 'next/link';
// Import the new helper
import { getGalleryImages } from '../../../../../scripts/galleryUtils';
import PhotoActions from './photoActions';
import { Metadata } from 'next';
import BackButton from './backButton';
import { parseFilename } from '../../../../../scripts/galleryShared';

export function generateStaticParams() {
  const images = getGalleryImages();
  return images.map((image) => ({
    galleryImage: encodeURIComponent(image.filename),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ galleryImage: string }> }) : Promise<Metadata> {
  const { galleryImage } = await params;
  const decodedName = decodeURIComponent(galleryImage);
  const imageData = parseFilename(decodedName);
  
  return {
    title: `${imageData.title} - Andrew Popov`,
  };
}

export default async function PhotoViewPage({ params }: { params: Promise<{ galleryImage: string }> }) {
  const { galleryImage } = await params;
  const filename = decodeURIComponent(galleryImage);
  
  // Utilize the utility function here
  const { title, formattedDate, description } = parseFilename(filename);

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[80vh]">
      
{/* WRAPPER DIV:
         1. 'w-fit': CRITICAL FIX. Forces the div to shrink exactly to the content width (the image).
         2. 'items-start': Ensures the button stays on the left edge.
      */}
      <div className="flex flex-col w-fit max-w-5xl items-start mx-[8%] md:mx-8">

        {/* Back Button */}
        <div className="mb-4">
            <BackButton filename={filename} />
        </div>

        <div className="relative w-auto transparent rounded-xl overflow-hidden shadow-sm border border-mocha-600 dark:border-lavendar-600">
          
          <div className="relative flex justify-center">
              <img 
                  src={`/gallery/${filename}`} 
                  alt={title}
                  className="max-h-[75vh] w-auto object-contain"
              />
          </div>

          <div className="p-6 border-t border-mocha-600 dark:border-lavendar-600 flex flex-row justify-between items-center gap-4 bg-beige-900 dark:bg-amethyst-50 backdrop-blur-sm">
            <div>
              <h1 className="text-2xl font-bold capitalize text-bark-300 dark:text-lavendar-900 -mt-1">
                {title}
              </h1>
              <p className="flex-1 font-light text-sm text-bark-300/80 dark:text-lavendar-600">
                {formattedDate}
                {/*eventually replace filename with date taken or other metadata when available */}
              </p>
              {description && (
                <p className="mt-2 text-md text-bark-100/80 dark:text-lavendar-900 -mb-2">
                  {description}
                </p>
              )}
            </div>

            {/* Pass the formatted caption to PhotoActions */}
            <PhotoActions filename={filename} caption={title} />
            
          </div>
        </div>   
      </div>
    </div>
  );
}