'use client';

import { useEffect, useState } from 'react';
import { parseFilename } from '../../../../../scripts/galleryShared';

// Added 'caption' to the props interface
interface PhotoActionsProps {
    filename: string;
    caption: string;
}

export default function PhotoActions({ filename, caption }: PhotoActionsProps) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Prevents scroll-lock
  useEffect(() => {
    document.body.style.overflow = '';
  }, []);

  const handleShare = async () => {
    if (isSharing) return;

    const pageUrl = window.location.href;
    const imageUrl = `/gallery/${filename}`;

    // 2. Check for Native Sharing Support (Mobile/Safari/Edge)
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
      try {
        setIsSharing(true);

        // Fetch the blob
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // 3. Use parseFilename for consistent titling
        const { title } = parseFilename(filename);
        const extension = filename.split('.').pop() || 'jpg';
        // Create a safe filename for the share sheet
        const cleanName = `${title.replace(/[^a-z0-9\s-]/gi, '').trim()}.${extension}`;
        
        const file = new File([blob], cleanName, { type: blob.type });
        // 4. Strictly share ONLY the file
        const shareData = {
          files: [file],
        };

        // 5. Validate and Share
        if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
        } else {
            console.warn('System does not support sharing this file type.');
        }

        // CRITICAL FIX: Return here to ensure we NEVER fall through to clipboard logic on mobile
        return;

      } catch (err) {
        // Handle user cancellation or fetch errors
        if ((err as Error).name !== 'AbortError') {
            console.log('Share cancelled or failed', err);
        }
        // CRITICAL FIX: Return here as well. Do not attempt clipboard fallback on share error.
        return;
      } finally {
        setIsSharing(false);
      }
    }

    // 6. Desktop Fallback: Copy URL to clipboard
    // This block ONLY runs if navigator.share is completely undefined (e.g., Desktop Chrome/Firefox)
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(pageUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      } else {
         // Gracefully handle older browsers without throwing a visible error
         console.warn('Clipboard API unavailable');
      }
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-3">
      {/* Share Button */}
      <button 
        onClick={handleShare}
        disabled={isSharing}
        className="px-3 md:px-4 py-1 md:py-2 text-sm font-medium rounded-full bg-bark-200 dark:bg-lavendar-800 hover:bg-bark-100 hover:dark:bg-lavendar-950 min-w-20 transition duration-300"
      >
        {copied ? 'Copied!' : 'Share'}
      </button>

      {/* Download Button */}
      <a 
        href={`/gallery/${filename}`} 
        download
        className="px-3 md:px-4 py-1 md:py-2 text-sm font-medium rounded-full border border-beige-700 dark:border-lavendar-600/40 hover:bg-beige-800 hover:dark:bg-lavendar-600/25 transition duration-300"
      >
        Download
      </a>
    </div>
  );
}