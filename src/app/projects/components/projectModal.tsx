'use client';

import { useEffect, useState } from "react";

const handleUnifiedShare = async (dataUrl: string, title: string) => {
    try {
        // A. Convert Base64 DataURL to Blob
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        
        // Generate filename
        const filename = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
        // IMPORTANT: MIME type is strictly required for mobile sharing
        const file = new File([blob], filename, { type: 'image/png' });

        // B. Attempt Native Mobile Share
        if (
            typeof navigator !== 'undefined' && 
            navigator.share && 
            navigator.canShare && 
            navigator.canShare({ files: [file] })
        ) {
            try {
                await navigator.share({
                    files: [file],
                    title: title,
                });
                return; // Success!
            } catch (err) {
                // If user cancels (AbortError), do nothing.
                if ((err as Error).name === 'AbortError') return;
                // Otherwise fall through to download logic
                console.warn('Native share failed, attempting download fallback...', err);
            }
        }

        // C. Fallback: Programmatic Download (Desktop / Unsupported Mobile)
        if (typeof document !== 'undefined') {
            const link = document.createElement('a');
            // Create object URL (More reliable than base64 href)
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 100);
        }

    } catch (err) {
        console.error('Failed to process image for share/download', err);
    }
};

interface BaseModalProps {
    isOpen : boolean;
    onCloseAction : () => void;
    children: React.ReactNode;
    title?: string;
}

export const ProjectModal = ({ isOpen, onCloseAction, children, title }: BaseModalProps) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setVisible(true), 10);
            document.body.style.overflow = 'hidden';
        } else {
            setVisible(false);
            const timer = setTimeout(() => {
                document.body.style.overflow = '';
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen && !visible) return null;

    return (
        <div 
            className={`
                fixed inset-0 z-100 flex items-center justify-center p-4 
                bg-black/95 backdrop-blur-sm
                transition-opacity duration-300 ease-in-out
                ${visible ? 'opacity-100' : 'opacity-0'}
            `}
            onClick={onCloseAction}
        >
            <div 
                className={`
                    relative flex flex-col items-center justify-center max-h-[90vh] max-w-[90vw]
                    transition-transform duration-300 ease-in-out
                    ${visible ? 'scale-100' : 'scale-95'}
                `}
                onClick={(e) => e.stopPropagation()} 
            >
                {/* Close Button */}
                <button 
                    onClick={onCloseAction}
                    className="absolute -top-12 right-0 md:-right-12 z-50 p-2 rounded-full bg-black/50 text-white/90 hover:bg-black/70 hover:text-white backdrop-blur-md transition-all hover:scale-105 border border-white/10"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {children}
            </div>
        </div>
    );
};

// GLSL Syntax Highlighter (SLOP)
const CodeHighlighter = ({ code }: { code: string }) => {
    
    // Single-pass processing approach: separates comments first, then applies regex to the code portion.
    const processCode = (text: string) => {
        const lines = text.trim().split('\n');
        
        return lines.map((line, i) => {
            // 1. Isolate Comment
            const commentIndex = line.indexOf('//');
            let codePart = line;
            let commentPart = '';

            if (commentIndex !== -1) {
                codePart = line.slice(0, commentIndex);
                commentPart = line.slice(commentIndex);
            }

            // Regex Patterns
            const patterns = [
                /\b(uniform|varying|vec[234]|float|int|void|mat2)\b/g, // Types
                /\b(sin|cos|pow|length|abs|max|min|mix|normalize|dot|clamp|floor|fract)\b/g, // Functions
                /\b(gl_FragColor|gl_FragCoord)\b/g, // Built-ins
                /\b(\d+\.?\d*)\b/g // Numbers
            ];

            // Helper to determine style based on content
            const styleToken = (token: string) => {
                if (/^(uniform|varying|vec[234]|float|int|void|mat2)$/.test(token)) return `<span class="text-pink-400 font-bold">${token}</span>`;
                if (/^(sin|cos|pow|length|abs|max|min|mix|normalize|dot|clamp|floor|fract)$/.test(token)) return `<span class="text-blue-300">${token}</span>`;
                if (/^(gl_FragColor|gl_FragCoord)$/.test(token)) return `<span class="text-yellow-300">${token}</span>`;
                if (/^(\d+\.?\d*)$/.test(token)) return `<span class="text-purple-300">${token}</span>`;
                return token;
            };

            // Checks strict word boundaries
            let styledCode = codePart.replace(
                /\b(uniform|varying|vec[234]|float|int|void|mat2|sin|cos|pow|length|abs|max|min|mix|normalize|dot|clamp|floor|fract|gl_FragColor|gl_FragCoord)\b|\b(\d+\.?\d*)\b/g,
                (match) => styleToken(match)
            );

            // Reassemble
            const finalLine = styledCode + (commentPart ? `<span class="text-green-400/70 italic">${commentPart}</span>` : '');

            return (
                <div key={i} className="whitespace-pre font-mono text-xs md:text-sm leading-relaxed text-gray-300">
                    <span className="inline-block w-8 mr-4 text-right select-none text-gray-600 text-xs">{i + 1}</span>
                    <span dangerouslySetInnerHTML={{ __html: finalLine }} />
                </div>
            );
        });
    };

    return (
        <div className="bg-[#1e1e1e] p-4 rounded-lg overflow-auto border border-white/10 shadow-2xl w-full max-w-4xl max-h-[70vh] text-left">
            <code>{processCode(code)}</code>
        </div>
    );
};

// Code Modal (GLSL)
export const CodeModal = ({ isOpen, onCloseAction, code }: { isOpen: boolean, onCloseAction: () => void, code: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <ProjectModal isOpen={isOpen} onCloseAction={onCloseAction}>
            <div className="flex flex-col gap-4 w-full md:min-w-150 lg:min-w-200">
                <div className="flex justify-between items-center text-white px-2">
                    <h3 className="text-xl font-bold">Shader Source (GLSL)</h3>
                    <button 
                        onClick={handleCopy}
                        className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-sm border border-white/10 transition-colors text-neutral-100"
                    >
                        {copied ? 'Copied!' : 'Copy Code'}
                    </button>
                </div>
                <CodeHighlighter code={code} />
            </div>
        </ProjectModal>
    );
};

// Screenshot Modal (Preview + Actions)
export const ScreenshotModal = ({ isOpen, onCloseAction, image, title = 'Project Screenshot' }: { isOpen: boolean, onCloseAction: () => void, image: string | null, title?: string}) => {
    if (!image) return null;

    return (
        <ProjectModal isOpen={isOpen} onCloseAction={onCloseAction}>
            {/* Image Preview */}
            <img 
                src={image} 
                alt="Project Screenshot" 
                className="max-h-[75vh] max-w-full w-auto object-contain rounded-sm shadow-2xl border border-white/10"
            />

            {/* Actions Footer */}
            <div 
                onClick={onCloseAction}
                className="mt-4 bg-black/40 px-6 py-3 rounded-full flex gap-4 items-center backdrop-blur-md border border-white/10 shadow-lg">
                {/* 2. Unified Button */}
                <button 
                    onClick={() => handleUnifiedShare(image, title)}
                    className="px-6 py-2 text-sm font-medium rounded-full bg-bark-200 dark:bg-lavendar-800 hover:bg-bark-100 hover:dark:bg-lavendar-950 transition duration-300 text-white flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                        <polyline points="16 6 12 2 8 6"/>
                        <line x1="12" y1="2" x2="12" y2="15"/>
                    </svg>
                    Share / Save
                </button>
            </div>
        </ProjectModal>
    );
};