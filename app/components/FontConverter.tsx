"use client";

import { useState, useEffect } from "react";
import styles from "./FontConverter.module.css";
import JSZip from "jszip";
import posthog from "../../lib/posthog";

export default function FontConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [convertedFonts, setConvertedFonts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    posthog.capture("font_converter_viewed");
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      posthog.capture("files_selected", { count: e.target.files.length });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length === 0) return;

    posthog.capture("conversion_started", { count: files.length });

    setIsLoading(true);
    setError(null);
    setConvertedFonts([]);

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

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
      posthog.capture("conversion_completed", { count: data.length });
    } catch (err) {
      posthog.capture("conversion_failed", { error: (err as Error).message });
      setError("An error occurred during conversion");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadZip = async () => {
    posthog.capture("zip_download_started", { count: convertedFonts.length });

    const zip = new JSZip();
    convertedFonts.forEach((font) => {
      zip.file(`${font.originalFileName}.woff`, font.woff, { base64: true });
      zip.file(`${font.originalFileName}.woff2`, font.woff2, { base64: true });
    });
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = "converted_fonts.zip";
    link.click();
    posthog.capture("zip_download_completed", { count: convertedFonts.length });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / 1048576).toFixed(2) + " MB";
  };

  return (
    <div className={styles.container}>
      <div className={styles.introText}>
        <h1>Webfont Converter</h1>
        <p>
          This tool is for personal use only. Please ensure you have the necessary rights or licenses to convert and use the fonts. Do not use this tool to violate any font licensing agreements or copyright laws. By using this converter, you
          acknowledge that you are responsible for complying with all applicable font usage restrictions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input type="file" onChange={handleFileChange} accept=".ttf,.otf" multiple className={styles.fileInput} disabled={isLoading} />
        <button type="submit" className={styles.button} disabled={isLoading || files.length === 0}>
          {isLoading ? "Converting..." : "Convert"}
        </button>
      </form>

      {files.length > 0 && (
        <div className={styles.fileList}>
          <h3>Selected Files:</h3>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                {file.name} - {formatFileSize(file.size)}
              </li>
            ))}
          </ul>
          <p className={styles.fileInfo}>
            Total files: {files.length}, Total size: {formatFileSize(files.reduce((acc, file) => acc + file.size, 0))}
          </p>
        </div>
      )}

      {isLoading && <p className={styles.loading}>Converting fonts, please wait...</p>}

      {error && <p className={styles.error}>{error}</p>}

      {convertedFonts.length > 0 && (
        <div className={styles.results}>
          <h2>Converted Fonts:</h2>
          <button onClick={handleDownloadZip} className={styles.downloadAllButton}>
            Download All as ZIP
          </button>
          <ul className={styles.downloadList}>
            {convertedFonts.map((font, index) => (
              <li key={index} className={styles.fontItem}>
                <p>{font.originalFileName}</p>
                <div className={styles.downloadButtons}>
                  <a href={`data:font/woff;base64,${font.woff}`} download={`${font.originalFileName}.woff`} className={styles.downloadButton}>
                    Download WOFF
                  </a>
                  <span className={styles.fileSize}>(New size: {formatFileSize(font.woffSize)})</span>
                </div>
                <div className={styles.downloadButtons}>
                  <a href={`data:font/woff2;base64,${font.woff2}`} download={`${font.originalFileName}.woff2`} className={styles.downloadButton}>
                    Download WOFF2
                  </a>
                  <span className={styles.fileSize}>(New size: {formatFileSize(font.woff2Size)})</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
