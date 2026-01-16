import Image from "next/image";
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <div className="flex min-h-screen items-center justify-center">
        <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start">
          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
            <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight">
              Things
            </h1>
            <p className="max-w-md text-lg leading-8">
              I have done many of them...
            </p>
          </div>
          {/* a (link) */}
          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
            <Link
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background md:w-47"
              href="./test"
              rel="noopener noreferrer"
            >
              
              The things i've done
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}

export function ThemeToggle() {
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  return <button onClick={toggleTheme}>Switch Theme</button>;
}