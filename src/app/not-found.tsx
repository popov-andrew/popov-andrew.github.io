import Link from "next/link";
import { notFound } from "next/navigation";


const Custom404 = () => {
    return(
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h2 className="text-2xl font-bold text-center">404 - Page Not Found</h2>
            <p className="text-center mt-4">The page you are looking for does not exist.</p>
            <div className="flex justify-center mt-6">
                <Link href="/" className="text-2xl font-light uppercase px-4 py-2 rounded-md hover:underline hover:text-(--headerHover) hover:font-semibold">
                    Home
                </Link>
            </div>
        </div>
    );
;}

export default Custom404;