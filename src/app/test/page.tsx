import React from "react";
import Link from "next/link";

export default function Page() {
    return (
        <main style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial', padding: 24, maxWidth: 980, margin: "0 auto" }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <h1 style={{ margin: 0 }}>This page is deprecated</h1>
                <nav>
                    <Link href="/">Home</Link>
                </nav>
            </header>

            <section style={{ marginBottom: 24 }}>
                <h2>Getting started</h2>
                <p>This is a minimal Next.js (app directory) page template using TypeScript and React.</p>
            </section>

            <section>
                <h3>Example</h3>
                <p>Replace this file at /src/app/test/page.tsx with your content.</p>
                <pre style={{padding: 12, borderRadius: 6 }}>
                    {`export default function Page() { return <div>Hello world</div> }`}
                </pre>
            </section>
        </main>
    );
}