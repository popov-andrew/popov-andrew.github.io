'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

// Define the shape of a Project item
export interface ProjectItem {
    id: string;
    title: string;
    description: string;
    thumbnail: string; // Path to static image in /public
    link: string;      // Path to the hardcoded page (e.g., /projects/mandelbulb)
}

interface ProjectsListProps {
    projects: ProjectItem[];
}

const INIT_BATCH_SIZE = 8;
const BATCH_SIZE = 6;

export default function ProjectsList({ projects }: ProjectsListProps) {
    const [visibleCount, setVisibleCount] = useState(INIT_BATCH_SIZE);
    const loaderRef = useRef<HTMLDivElement>(null);

    // Styling constants
    const repeatedPhrase = Array(15).fill("creative works").join("\u00A0\u00A0\u00A0"); 
    const rows = Array(30).fill(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && visibleCount < projects.length) {
                    setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, projects.length));
                }
            },
            { rootMargin: '200px' }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) observer.unobserve(loaderRef.current);
        };
    }, [visibleCount, projects.length]);

    const visibleProjects = projects.slice(0, visibleCount);

    return (
        <div className="w-full max-w-full mx-auto pb-12 px-4 md:px-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                
                {/* ITEM 1: TITLE CARD (Styled exactly like Gallery) */}
                <div className="relative group flex items-center justify-center p-6 border-2 border-transparent rounded-lg h-64 lg:h-auto lg:aspect-4/3 overflow-hidden bg-bark-300/20 dark:bg-lavendar-700">
                    
                    {/* BACKGROUND PATTERN */}
                    <div className="absolute inset-0 flex flex-col group-hover:scale-125 transition-transform duration-500 justify-center select-none pointer-events-none opacity-10 dark:opacity-20">
                        {rows.map((_, i) => (
                            <div 
                                key={i} 
                                className={`
                                    whitespace-nowrap text-sm font-bold uppercase tracking-widest leading-relaxed
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
                        Projects
                    </h1>
                </div>

                {/* PROJECT ITEMS */}
                {visibleProjects.map((project) => (
                    <Link 
                        key={project.id} 
                        href={project.link}
                        className="group relative block w-full overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow border-bark-200/65 dark:border-lavendar-700/65 border-2"
                    >
                        <div className="group relative aspect-4/3 w-full bg-transparent overflow-hidden">
                            
                            {/* LAYER 1: Sharp Base Thumbnail */}
                            <Image
                                src={project.thumbnail}
                                alt={project.title}
                                fill
                                className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 will-change-transform"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                priority={false}
                            />

                            {/* LAYER 2: Blurred Clone Layer */}
                            <div 
                                className="absolute inset-0 z-10 opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100 pointer-events-none"
                                aria-hidden="true" 
                            >
                                <Image
                                    src={project.thumbnail}
                                    alt="" 
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover blur-xl transition-transform duration-700 ease-in-out group-hover:scale-105"
                                    style={{
                                        maskImage: 'linear-gradient(to top, black 0%, transparent 25%)',
                                        WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 25%)',
                                        transform: 'scale(1.02)' 
                                    }}
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                            </div>

                            {/* LAYER 3: Text Content */}
                            <div className="absolute inset-x-0 bottom-0 z-20 p-4 pointer-events-none opacity-0 transition-opacity duration-500 delay-75 group-hover:opacity-100">
                                <p className="text-white font-medium truncate capitalize drop-shadow-md">
                                    {project.title}
                                </p>
                                <p className="text-white/80 text-sm truncate font-light">
                                    {project.description}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div ref={loaderRef} className="mt-8 h-10 w-full flex items-center justify-center text-neutral-400">
                {visibleCount < projects.length && (
                    <span className="animate-pulse">Loading more...</span>
                )}
            </div> 
        </div>
    );
}