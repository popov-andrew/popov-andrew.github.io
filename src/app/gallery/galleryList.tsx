'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import type { GalleryImage } from '../../../scripts/galleryShared';

interface GalleryListProps {
    allImages: GalleryImage[];
}

const INIT_BATCH_SIZE=8;
const BATCH_SIZE = 6;

export default function GalleryList({ allImages }: GalleryListProps) {
    const [visibleCount, setVisibleCount] = useState(INIT_BATCH_SIZE);
    const loaderRef = useRef<HTMLDivElement>(null);

    //for style
    const repeatedPhrase = Array(15).fill("my favorite photos").join("\u00A0\u00A0\u00A0"); // \u00A0 is a non-breaking space
    const rows = Array(30).fill(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && visibleCount < allImages.length) {
                    setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, allImages.length));                }
            },
            {
                rootMargin: '200px',
            }
        );

        if(loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if(loaderRef.current) observer.unobserve(loaderRef.current);
        };
    }, [visibleCount, allImages.length]);

    const visibleImages = allImages.slice(0, visibleCount);

    return (
        <div className="w-full max-w-full mx-auto pb-12 px-4 md:px-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                
                {/* ITEM 1: TITLE CARD
                   - Added 'relative' and 'overflow-hidden' to clip the background text
                   - Added 'items-center justify-center' to center the main "Gallery" title
                */}
                <div className="relative group flex items-center justify-center p-6 border-2 border-transparent rounded-lg h-64 lg:h-auto lg:aspect-4/3 overflow-hidden bg-bark-300/20 dark:bg-lavendar-700">
                    
                    {/* BACKGROUND PATTERN LAYER */}
                    <div className="absolute inset-0 flex flex-col group-hover:scale-125 transition-transform duration-500 justify-center select-none pointer-events-none opacity-10 dark:opacity-20">
                        {rows.map((_, i) => (
                            <div 
                                key={i} 
                                className={`
                                    whitespace-nowrap text-sm font-bold uppercase tracking-widest leading-relaxed
                                    /* Offset every other row to create the pattern */
                                    ${i % 2 === 0 ? 'ml-0' : '-ml-12'}
                                `}
                            >
                                <p className="text-bark-200 dark:text-lavendar-950">
                                    {repeatedPhrase}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* FOREGROUND TITLE */}
                    <h1 className="relative z-10 font-bold text-bark-200 group-hover:scale-110 dark:text-amethyst-150 transition-all duration-500 text-7xl md:text-8xl lg:text-8xl xl:text-8xl">
                        Gallery
                    </h1>
                </div>

                {visibleImages.map((image) => (
                    <Link 
                        key={image.filename} 
                        href={`/gallery?photo=${encodeURIComponent(image.filename)}`} 
                        scroll={false} 
                        className="group relative block w-full overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="group relative aspect-4/3 w-full bg-gray-100 overflow-hidden">
                            
                            {/* LAYER 1: The Sharp Base Image 
                                // CHANGED: Increased duration to 700ms for a smoother, high-end feel
                                // ADDED: 'priority={false}' explicit default
                            */}
                            <Image
                                src={`/gallery/${image.filename}`}
                                alt={image.title}
                                fill
                                className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 will-change-transform"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                priority={false}
                            />

                            {/* LAYER 2: The "Stacked Clone" Blur Layer
                                // CHANGED: Replaced the old div containing backdrop-filter.
                                // ADDED: A second <Image> component that is permanently blurred but hidden by default.
                                // ADDED: 'opacity-0' -> 'opacity-100' transition on the wrapper.
                                // ADDED: 'scale' transition that matches Layer 1 exactly (duration-700, scale-105).
                            */}
                            <div 
                                className="absolute inset-0 z-10 opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100 pointer-events-none"
                                aria-hidden="true" 
                            >
                                <Image
                                    src={`/gallery/${image.filename}`}
                                    alt="" // Empty alt as this is decorative
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    // ADDED: 'blur-xl' and matching scale animation
                                    className="object-cover blur-xl transition-transform duration-700 ease-in-out group-hover:scale-105"
                                    style={{
                                        // ADDED: Mask to create the fade-from-bottom effect
                                        maskImage: 'linear-gradient(to top, black 0%, transparent 25%)',
                                        WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 25%)',
                                        // ADDED: Slight scale up to prevent blurred edges from bleeding white/transparent pixels
                                        transform: 'scale(1.02)' 
                                    }}
                                />
                                
                                {/* // ADDED: Optional dark gradient overlay for better text readability 
                                    This sits inside the opacity wrapper, so it fades in with the blur.
                                */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                            </div>

                            {/* LAYER 3: The Text Content 
                                // CHANGED: Z-index increased to 20 to sit above the blur layer.
                                // CHANGED: Added separate opacity transition for the text itself.
                            */}
                            <div className="absolute inset-x-0 bottom-0 z-20 p-4 pointer-events-none opacity-0 transition-opacity duration-500 delay-75 group-hover:opacity-100">
                                <p className="text-white font-medium truncate capitalize drop-shadow-md">
                                    {image.title} {image.formattedDate && <> &ndash;  {image.formattedDate}</>}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div ref={loaderRef} className="mt-8 h-10 w-full flex items-center justify-center text-neutral-400">
                {visibleCount < allImages.length && (
                    <span className="animate-pulse">Loading more...</span>
                )}
            </div> 
        </div>
    );
}