// app/page.tsx
"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const PianoRollStudio = dynamic(() => import("./components/PianoRollStudio"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900">
      <Suspense fallback={<div>Loading...</div>}>
        <PianoRollStudio />
      </Suspense>
    </main>
  );
}
