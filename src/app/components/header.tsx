'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import ThemeButton from './themeButton';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  //Close menu
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  //Open menu
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'; //lock scroll when menu is open
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="px-4 md:py-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-4xl font-bold z-20 relative">
            <Link href="/">Andrew Popov</Link>
        </h1>

        {/* Desktop Nav */}
        <nav className="hidden md:block">
          <ul className="flex text-xl">
            <li><Link className="header-link" href="/gallery" >Gallery</Link></li>
            <li><Link className="header-link" href="/projects">Projects</Link></li>
            <li><Link className="header-link" href="/contact">Contact</Link></li>
            <li><Link className="header-link" href="/">Home</Link></li>
          </ul>
        </nav>

        {/* Mobile Nav Toggle */}
        <button 
          className="md:hidden p-2 text-inherit"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open Menu"
        >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/35 backdrop-blur-sm animate-in fade-in duration-200 h-dvh w-screen"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {/* Close Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen(false);
              }}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/10 text-neutral-50/90 hover:bg-black/70 hover:text-white backdrop-blur-md transition-all hover:scale-105"
              aria-label="Close menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* NAVIGATION LINKS CONTAINER */}
            <div 
              className="relative bg-transparent border border-white/20 backdrop-blur-md shadow-2xl rounded-3xl p-8 flex flex-col items-center text-neutral-50"
              onClick={(e) => e.stopPropagation()}
            >
                <nav className="flex flex-col items-center gap-4 text-lg font-medium">
                    <Link href="/gallery" onClick={handleLinkClick} className="hover:text-white hover:scale-110 transition-all duration-200 bg-black/10 hover:bg-black/15 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10">
                        Gallery
                    </Link>
                    <Link href="/projects" onClick={handleLinkClick} className="hover:text-white hover:scale-110 transition-all duration-200 bg-black/10 hover:bg-black/15 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10">
                        Projects
                    </Link>
                    <Link href="/contact" onClick={handleLinkClick} className="hover:text-white hover:scale-110 transition-all duration-200 bg-black/10 hover:bg-black/15 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10">
                        Contact
                    </Link>
                    <Link href="/" onClick={handleLinkClick} className="hover:text-white hover:scale-110 transition-all duration-200 bg-black/10 hover:bg-black/15 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10">
                        Home
                    </Link>
                    <hr className="w-full h-px opacity-35"/>
                    <ThemeButton/>
                </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}