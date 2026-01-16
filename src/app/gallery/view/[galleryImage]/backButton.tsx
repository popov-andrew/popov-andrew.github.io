'use client'

import { useRouter } from 'next/navigation';

export default function BackButton({filename}: {filename: string}) {
    const router = useRouter();

    const handleBack = () => {
        if(typeof window !== 'undefined' && document.referrer.includes('/gallery') && window.history.length > 1) {
            window.history.back(); 
            return;
        } 
        
        // 2. Fallback: Explicit Navigation
        console.log('History/Referrer unavailable. Using fallback.');
        router.push(`/gallery?photo=${encodeURIComponent(filename)}`);
    }

    return (
        <button 
            onClick={handleBack}
            className="flex items-center gap-2 hover:underline text-md transition-colors whitespace-nowrap bg-beige-850 dark:bg-amethyst-100 text-bark-200 hover:text-mocha-600 dark:text-lavendar-950 dark:hover:text-lavendar-700 px-3 py-1 rounded-full"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Gallery
        </button>
    );
}