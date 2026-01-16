import { Metadata } from "next";
import ProjectsList, { ProjectItem } from "./components/projectList";

export const metadata : Metadata = {
    title: 'Andrew Popov - Projects',
};

// HARDCODED PROJECT DATA
// Once you create your Mandelbulb screenshot, place it in /public/projects/mandelbulb-thumb.jpg
const projectsData: ProjectItem[] = [
    {
        id: 'mandelbulb',
        title: 'Three.js Mandelbulb',
        description: 'A React-Three/Fiber raymarching implementation of the Mandelbulb fractal.',
        thumbnail: '/images/mandelbulb-thumbnail.png', // Placeholder path
        link: '/projects/mandelbulb',
    },
    {
        id: 'meatball',
        title: 'Fractal Explorer',
        description: 'An extension of the Mandelbulb project implementing navigation',
        thumbnail: '/images/meatball-thumbnail.png', // Placeholder path
        link: '/projects/meatball',
    },
    // Add more projects here in the future
];

export default function ProjectsPage() { 
    return (
        <main className="min-h-screen p-8 py-16">
            <ProjectsList projects={projectsData} />
        </main>
    );
}