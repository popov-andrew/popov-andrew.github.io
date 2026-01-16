'use client';

import { useState, useEffect, useRef } from 'react';

interface ColorPickerProps {
    label: string;
    color: string;
    distance: string;
    onChange: (color: string) => void;
}

// --- Helpers ---
const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

export default function ColorPicker({ label, color, distance, onChange }: ColorPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [localColor, setLocalColor] = useState(color);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Sync external changes
    useEffect(() => {
        setLocalColor(color);
    }, [color]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleRgbChange = (channel: 'r' | 'g' | 'b', value: number) => {
        const rgb = hexToRgb(localColor);
        const newRgb = { ...rgb, [channel]: value };
        const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        setLocalColor(newHex);
        onChange(newHex);
    };

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalColor(val);
        // Only trigger update if valid hex
        if (/^#[0-9A-F]{6}$/i.test(val)) {
            onChange(val);
        }
    };

    const rgb = hexToRgb(localColor);

    return (
        <div className="relative group">
            {/* --- MOBILE: Native Input (< md) --- */}
            <div className="block md:hidden">
                <input 
                    type="color" 
                    value={localColor}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-10 h-10 rounded-lg overflow-hidden border border-white/20 p-0 bg-transparent"
                />
            </div>

            {/* --- DESKTOP: Custom Popover (>= md) --- */}
            <div className="hidden md:block relative">
                {/* Trigger Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-7 h-7 rounded-lg border border-white/30 shadow-sm transition-transform hover:scale-105 active:scale-95"
                    style={{ backgroundColor: localColor }}
                    title="Click to edit color"
                />

                {/* Popover */}
                {isOpen && (
                    <div 
                        ref={popoverRef}
                        className={`absolute bottom-15 ${distance} z-50 p-4 w-64 rounded-xl shadow-2xl backdrop-blur-sm m-5 
                                   bg-black/30 border border-white/10`}
                    >
                        {/* Hex Input */}
                        <div className="flex items-center gap-2 mb-4">
                            <div 
                                className="w-8 h-8 rounded border border-white/10 shadow-inner"
                                style={{ backgroundColor: localColor }}
                            />
                            <input
                                type="text"
                                value={localColor}
                                onChange={handleHexChange}
                                className="flex-1 border border-white/20 bg-black/30 rounded px-2 py-1 text-sm font-mono text-gray-200 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* RGB Sliders */}
                        <div className="space-y-3">
                            {/* Red */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold w-3 text-red-500">R</span>
                                <input
                                    type="range" min="0" max="255"
                                    value={rgb.r}
                                    onChange={(e) => handleRgbChange('r', parseInt(e.target.value))}
                                    className="flex-1 h-1.75 rounded-full appearance-none cursor-pointer bg-black/20 border border-white/20 accent-red-500"
                                />
                            </div>
                            {/* Green */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold w-3 text-green-500">G</span>
                                <input
                                    type="range" min="0" max="255"
                                    value={rgb.g}
                                    onChange={(e) => handleRgbChange('g', parseInt(e.target.value))}
                                    className="flex-1 h-1.75 rounded-full appearance-none cursor-pointer bg-black/20 border border-white/20 accent-green-500"
                                />
                            </div>
                            {/* Blue */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold w-3 text-blue-500">B</span>
                                <input
                                    type="range" min="0" max="255"
                                    value={rgb.b}
                                    onChange={(e) => handleRgbChange('b', parseInt(e.target.value))}
                                    className="flex-1 h-1.75 rounded-full appearance-none cursor-pointer bg-black/20 border border-white/20 accent-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}