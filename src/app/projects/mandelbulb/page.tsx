'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { mandelbulbShader } from './mandelbulbShader';
import * as THREE from 'three';
import ShaderCanvas, { ShaderCanvasRef } from 'app/components/shaderCanvas';
import ColorPicker from '../components/colorPicker';
import { CodeModal, ScreenshotModal } from '../components/projectModal';

export default function MandelbulbPage() {
    // Default fractal colors
    const [colorA, setColorA] = useState("#FFFFFF"); // Deep Indigo
    const [colorB, setColorB] = useState("#000000"); // Cyan
    const [colorBG, setColorBG] = useState("#0C0C10"); // Soft Black
    const [mode, setMode] = useState(0); // Default Easing (Quadratic)
    const [isFullscreen, setIsFullScreen] = useState(false);
    const [pixelDensity, setPixelDensity] = useState(2); // Default to 2 for sharper rendering on high-DPR screens

    const canvasContainerRef = useRef<HTMLDivElement>(null);
    
    const [showCode, setShowCode] = useState(false); //Modals
    const [showScreenshot, setShowScreenshot] = useState<string | null>(null);
    const shaderRef = useRef<ShaderCanvasRef>(null);

    const title = "Three.js Mandelbulb";
    const description = "React-Three/Fiber Real-Time Raymarching";

    useEffect(() => {
        if(isFullscreen) {
            document.body.classList.add('fullscreen-mode');
            document.body.style.touchAction = 'none';
            document.body.style.overflow = 'hidden';
            const handleEsc = (e: KeyboardEvent) => {
                if(e.key === 'Escape') { setIsFullScreen(false); }
            }
        window.addEventListener('keydown', handleEsc);

        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
            document.body.classList.remove('fullscreen-mode');
            window.removeEventListener('keydown', handleEsc);
        };
    } else {
            document.body.style.overflow='';
        }
    }, [isFullscreen]);

    useEffect(() => {
        const container = canvasContainerRef.current;
        if (!container) return;
        const preventScroll = (e: TouchEvent) => {
            if (e.cancelable) e.preventDefault(); 
        };
        container.addEventListener('touchmove', preventScroll, { passive: false });
        container.addEventListener('touchstart', preventScroll, { passive: false });
        return () => {
            container.removeEventListener('touchmove', preventScroll);
            container.removeEventListener('touchstart', preventScroll);
        };
    }, []);

    const handleCapture = () => {
        // Now checking if the ref was populated via the prop
        if (shaderRef.current) {
            const dataUrl = shaderRef.current.capture();
            if (dataUrl) setShowScreenshot(dataUrl);
        } else {
            console.error("Shader reference is null. Ensure CaptureHandler is mounted.");
        }
    };

    const uniforms = useMemo(() => ({
        u_colorA: { value: new THREE.Color(colorA) },
        u_colorB: { value: new THREE.Color(colorB) },
        u_colorBG: { value: new THREE.Color(colorBG) },
        u_mode: { value: mode }
    }), [colorA, colorB, colorBG, mode]);

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[80vh]">
      
        <CodeModal 
                isOpen={showCode} 
                onCloseAction={() => setShowCode(false)} 
                code={mandelbulbShader} 
            />
            
            <ScreenshotModal 
                isOpen={!!showScreenshot} 
                onCloseAction={() => setShowScreenshot(null)} 
                image={showScreenshot} 
                title={title}
            />

        {/* WRAPPER DIV:
         Matches the gallery styling:
         1. 'w-fit': Shrinks to content width.
         2. 'items-start': Aligns content to left.
        */}
            <div className={`flex flex-col w-full max-w-5xl items-start mx-[8%] md:mx-8 ${isFullscreen ? 'w-full h-full' : 'w-full max-w-5xl mx-[8%] md:mx-8'}`}>

            {/* PROJECT CONTAINER 
            Matches the border/shadow style of the gallery viewer
            */}
                <div className={`transparent rounded-xl overflow-hidden shadow-sm border border-mocha-600 dark:border-lavendar-600
                    ${isFullscreen 
                        ? 'fixed inset-0 z-50 w-screen h-screen rounded-none border-0 flex flex-col' 
                        : 'relative w-full transparent rounded-xl shadow-sm border border-mocha-600 dark:border-lavendar-600'
                    }
                `}>
                    <button
                        onClick={() => setIsFullScreen(!isFullscreen)}
                        className="hidden md:block absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all duration-300 group"
                        title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen"}
                    >
                        {isFullscreen ? (
                            /* Collapse Icon */
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                            </svg>
                        ) : (
                            /* Expand Icon */
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                            </svg>
                        )}
                    </button>
          
                    {/* CANVAS */}
                    <div 
                        ref={canvasContainerRef}
                        className={`relative w-full bg-black transition-all duration-500 touch-none outline-none
                        ${isFullscreen ? 'flex-1' : 'h-[60vh] md:h-[75vh]'} 
                        `}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                        <ShaderCanvas 
                            captureRef={shaderRef}
                            pixelDensity={pixelDensity}
                            fragmentShader={mandelbulbShader} 
                            uniforms={uniforms}
                        />
                    </div>

                    {/* FOOTER*/}
                    <div className="p-6 border-t border-mocha-600 dark:border-lavendar-600 bg-beige-900 dark:bg-amethyst-50 backdrop-blur-sm">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                           <div>
                                <h1 className="text-2xl font-bold capitalize text-bark-300 dark:text-lavendar-900 -mt-1">
                                    {title}
                                </h1>
                                <p className="mt-2 text-md text-bark-100/80 dark:text-lavendar-900">
                                    {description}
                                </p>
                           </div>

                            {/* --- CONTROL PANEL --- */}
                            <div className="flex flex-wrap gap-6 items-center p-4 rounded-lg bg-bark-300/10 dark:bg-lavendar-900/10 border border-bark-300/40 dark:border-lavendar-600/40">
                                
                                {/* Share */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-70">Share</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowCode(true)}
                                            className="w-8 h-8 rounded-md flex items-center justify-center border transition bg-transparent border-bark-300/40 dark:border-lavendar-600/40 hover:bg-bark-300/20 text-bark-200 dark:text-lavendar-900 dark:hover:bg-lavendar-700/30"
                                            title="View Code"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="16 18 22 12 16 6"></polyline>
                                                <polyline points="8 6 2 12 8 18"></polyline>
                                            </svg>
                                        </button>
                                        <button
                                            onClick={handleCapture}
                                            className="w-8 h-8 rounded-md flex items-center justify-center border transition bg-transparent border-bark-300/40 dark:border-lavendar-600/40 hover:bg-bark-300/20 text-bark-200 dark:text-lavendar-900 dark:hover:bg-lavendar-700/30"
                                            title="Take Screenshot"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                                <circle cx="12" cy="13" r="4"></circle>
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Mode Selector */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-70">Interpolation</label>
                                    <div className="flex gap-1">
                                        {[0, 1, 2, 3, 4, 5].map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => setMode(m)}
                                                className={`w-8 h-8 rounded-md font-mono text-sm border transition-all
                                                    ${mode === m 
                                                        ? 'bg-bark-200 dark:bg-lavendar-900 border-transparent text-beige-900 dark:text-bark-200 scale-110 shadow-md' 
                                                        : 'bg-transparent border-bark-300/40 dark:border-lavendar-600/40 hover:bg-bark-300/20 text-bark-200 dark:text-lavendar-900 dark:hover:bg-lavendar-700/30'
                                                    }
                                                `}
                                                title={`Mode ${m}`}
                                            >
                                                {m+1}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Color Pickers */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-70">Colors</label>
                                        <div className="flex gap-3">
                                        <ColorPicker 
                                            label="Color A" 
                                            color={colorA} 
                                            onChange={setColorA}
                                            distance={"-left-35"} 
                                        />
                                        <ColorPicker 
                                            label="Color B" 
                                            color={colorB} 
                                            onChange={setColorB} 
                                            distance={"-left-35"}
                                        />
                                        <ColorPicker 
                                            label="BG" 
                                            color={colorBG} 
                                            onChange={setColorBG}
                                            distance={"-left-40"} 
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-70">DPR</label>
                                    <button
                                        onClick={() => setPixelDensity(pixelDensity === 2 ? 3 : 2)}
                                        className={`w-8 h-8 rounded-md flex items-center justify-center border transition-all
                                            ${pixelDensity === 3
                                                ? 'bg-bark-200 dark:bg-lavendar-900 border-transparent text-beige-900 dark:text-bark-200 scale-110 shadow-md dark:hover:bg-lavendar-700/90' 
                                                : 'bg-transparent border-bark-300/40 dark:border-lavendar-600/40 hover:bg-bark-300/20 text-bark-200 dark:text-lavendar-900 dark:hover:bg-lavendar-700/30'
                                            }
                                        `}
                                        title={pixelDensity === 3 ? "Ultra Quality (DPR 3)" : "High Quality (DPR 2)"}
                                    >
                                        {/* Boolean Checkmark Icon */}
                                        {pixelDensity === 3 && (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>    
            </div>
        </div>
    );
}