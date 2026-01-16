'use client';
import { useEffect, useState } from "react";

const THEME_COLORS = {
  light: { bg: '#E5D9C3', fg: '#26201E' },
  dark: { bg: '#08080E', fg: '#bbc8f2' }
};

export default function ThemeButton({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.add('theme-transition');

    // Calculate New State
    const isDarkNow = document.documentElement.classList.contains('dark');
    const newMode = isDarkNow ? 'light' : 'dark';

    // Update DOM Classes
    document.documentElement.classList.remove(isDarkNow ? 'dark' : 'light');
    document.documentElement.classList.add(newMode);

    // (This overrides the blocking script from layout.tsx)
    const root = document.documentElement;
    root.style.setProperty('--background', THEME_COLORS[newMode].bg);
    root.style.setProperty('--foreground', THEME_COLORS[newMode].fg);
    root.style.colorScheme = newMode;

    // Save & State
    localStorage.setItem('theme', newMode);
    setIsDark(newMode === 'dark');

    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 600);
  };

  if (!mounted) {
    return <div className={`w-32 h-10 ${className}`} />; // Placeholder w/ same dimensions
  }
    
    return (
        <button
          onClick={toggleTheme}
          className="rounded-full font-medium px-3 md:px-4 py-2 hover:scale-110 md:hover:scale-100
        hover:text-white transition-all duration-200md:duration-150 text-neutral-50
        bg-black/10 hover:bg-black/15 md:bg-black/40 md:hover:bg-black/15
        md:dark:hover:bg-lavendar-600/25 md:dark:bg-black/15 backdrop-blur-md border md:border-b-7 md:border-2
        md:hover:border-2 border-white/10 md:border-bark-100/40 md:border-t-bark-200/50 md:border-l-bark-200/50
        md:border-r-bark-200/50 md:dark:border-lavendar-700/50 md:dark:border-t-lavendar-950/50 md:dark:border-l-lavendar-950/50"
        >
          {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
    );
}

