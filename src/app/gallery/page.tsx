import type { Metadata } from 'next';
import { getGalleryImages } from '../../../scripts/galleryUtils';
import GalleryModal from './components/galleryModal';
import GalleryList from './galleryList';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Andrew Popov - Gallery',
};

export default function GalleryPage() { 
    const allImages = getGalleryImages();

    return (
        <main className="min-h-screen p-8 py-16">
            <GalleryList allImages={allImages} />

            {/* Suspense is required for useSearchParams in static export */}
            <Suspense fallback={null}>
                <GalleryModal />
            </Suspense>
        </main>
    );
}
