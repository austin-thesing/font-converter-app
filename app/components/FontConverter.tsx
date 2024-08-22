"use client";

import { useState } from "react";

export default function FontConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [result, setResult] = useState<{ woff: string; woff2: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setConverting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Conversion failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error converting font:", error);
      alert("Font conversion failed. Please try again.");
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Font Converter</h1>
      <input type="file" accept=".otf,.ttf" onChange={handleFileChange} className="mb-4" />
      <button onClick={handleConvert} disabled={!file || converting} className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300">
        {converting ? "Converting..." : "Convert"}
      </button>
      {result && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Converted Fonts:</h2>
          <div>
            <a href={`data:font/woff;base64,${result.woff}`} download="converted.woff" className="text-blue-500 underline block mb-2">
              Download WOFF
            </a>
            <a href={`data:font/woff2;base64,${result.woff2}`} download="converted.woff2" className="text-blue-500 underline block">
              Download WOFF2
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
