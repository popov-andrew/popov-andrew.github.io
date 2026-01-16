'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

const getPhotoMetadata = (filename: string) => {
    const nameWithoutExtension = filename.replace(/\.[^/.]+$/, "");
    const parts = nameWithoutExtension.split('_');

    // Fallback for old/non-compliant filenames
    if (parts.length < 2) {
        return { 
            title: nameWithoutExtension.replace(/_/g, " "), 
            date: null 
        };
    }

    // Parse parts
    const dateStr = parts[0];
    const title = parts[1]; // The name part
    // description would be parts.slice(2).join(' ') if needed

    return {
        title: title,
        date: formatDate(dateStr)
    };
}
//Repeated galleryUtils since this is client only :(

const formatDate = (dateStr: string) => {
    try {
        const parts = dateStr.split('-');
        if (parts.length !== 3) return null;

        const month = parseInt(parts[0], 10) - 1;
        const day = parseInt(parts[1], 10);
        const year = 2000 + parseInt(parts[2], 10);

        const date = new Date(year, month, day);
        const getOrdinal = (n: number) => {
            const s = ["th", "st", "nd", "rd"];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };
        const monthName = date.toLocaleString('default', { month: 'long' });
        return `${monthName} ${getOrdinal(day)}, ${year}`;
    } catch (e) {
        return null;
    }
};

export default function galleryModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const photoId = searchParams.get('photo');

  const [displayedImage, setDisplayedImage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Visibility Logic
  useEffect(() => {
    if (photoId) {
      setDisplayedImage(photoId);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setDisplayedImage(null);
      }, 300); 
      return () => clearTimeout(timer);
    }
  }, [photoId]);

  const closeModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('photo');
    router.push(`/gallery?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Scroll Lock
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Safety cleanup
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  // Keyboard Event
  useEffect(() => {
    if (!isVisible) return; 
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, closeModal]);

  if (!displayedImage) return null;

  const filename = decodeURIComponent(displayedImage);
  const { title, date } = getPhotoMetadata(filename);

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4 
        bg-black/95 backdrop-blur-sm
        transition-opacity duration-300 ease-in-out
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
      onClick={closeModal}
    >
      <div 
        className={`
          relative flex items-center justify-center
          transition-transform duration-300 ease-in-out
          ${isVisible ? 'scale-100' : 'scale-95'}
        `}
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* Close Button: Anchored top-right of the image */}
        <button 
          onClick={closeModal}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white/90 hover:bg-black/70 hover:text-white backdrop-blur-md transition-all hover:scale-105"
          aria-label="Close gallery"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <img
          src={`/gallery/${filename}`}
          alt={title}
          className="max-h-[85vh] max-w-[90vw] w-auto h-auto object-contain shadow-2xl rounded-sm"
        />

        {/* Footer: Anchored to the bottom of the image */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 px-6 py-2.5 rounded-full flex gap-4 items-center backdrop-blur-md text-neutral-200 border border-white/10 shadow-lg whitespace-nowrap max-w-[90%]">
            <span className="font-medium text-sm truncate -mx-2">{title}</span>
            {date && (
              <>
                <div className="w-px h-3 bg-white/30"></div>
                <span className="font-medium text-sm truncate -mx-2">{`${date}`}</span>
              </>
            )}

            <div className="w-px h-3 bg-white/30"></div>
            <Link 
              href={`/gallery/view/${encodeURIComponent(filename)}`}
              className="text-sm font-medium hover:text-white hover:underline transition-colors -mx-2"
            >
              View
            </Link>
        </div>

      </div>
    </div>
  );
}