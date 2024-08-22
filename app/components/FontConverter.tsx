"use client";

import { useState } from "react";
import styles from "./FontConverter.module.css";

export default function FontConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [convertedFonts, setConvertedFonts] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setConvertedFonts(null);

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
      setConvertedFonts(data);
    } catch (err) {
      setError("An error occurred during conversion");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / 1048576).toFixed(2) + " MB";
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input type="file" onChange={handleFileChange} accept=".ttf,.otf" className={styles.fileInput} disabled={isLoading} />
        <button type="submit" className={styles.button} disabled={isLoading || !file}>
          {isLoading ? "Converting..." : "Convert"}
        </button>
      </form>

      {file && <p className={styles.fileInfo}>Original file size: {formatFileSize(file.size)}</p>}

      {isLoading && <p className={styles.loading}>Converting font, please wait...</p>}

      {error && <p className={styles.error}>{error}</p>}

      {convertedFonts && (
        <div className={styles.results}>
          <h2>Converted Fonts:</h2>
          <ul className={styles.downloadList}>
            <li>
              <a href={`data:font/woff;base64,${convertedFonts.woff}`} download={`${convertedFonts.originalFileName}.woff`} className={styles.downloadLink}>
                Download WOFF
              </a>{" "}
              <span className={styles.fileSize}>(New size: {formatFileSize(convertedFonts.woffSize)})</span>
            </li>
            <li>
              <a href={`data:font/woff2;base64,${convertedFonts.woff2}`} download={`${convertedFonts.originalFileName}.woff2`} className={styles.downloadLink}>
                Download WOFF2
              </a>{" "}
              <span className={styles.fileSize}>(New size: {formatFileSize(convertedFonts.woff2Size)})</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
