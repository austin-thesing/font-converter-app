
import React from 'react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">Font Converter</h1>
      <p className="text-xl mb-8">Convert your fonts to WOFF and WOFF2 formats for better web performance.</p>
      
      <div className="w-full max-w-md p-6 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
        <p className="mb-4 text-gray-500">Drag and drop your font file here, or click to browse</p>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Select Font File
        </button>
      </div>
    </main>
  );
}
