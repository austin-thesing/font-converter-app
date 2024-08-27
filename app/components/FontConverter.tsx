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
  const [recentConversions, setRecentConversions] = useState<{ name: string; date: string; url: string }[]>([]);

  useEffect(() => {
    posthog.capture("font_converter_viewed");
    // Load recent conversions from local storage
    const storedConversions = localStorage.getItem("recentConversions");
    if (storedConversions) {
      setRecentConversions(JSON.parse(storedConversions));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      posthog.capture("files_selected", { count: e.target.files.length });
      // New event: Capture file types
      const fileTypes = Array.from(e.target.files).map((file) => file.type);
      posthog.capture("file_types_selected", { types: fileTypes });
    }
  };

  const formatTimestamp = (date: Date) => {
    return date
      .toLocaleString("en-US", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      .replace(/[/:]/g, "")
      .replace(", ", "_") // Add underscore between date and time
      .replace(" ", "")
      .toLowerCase();
  };

  const handleConvert = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append(`file`, file);
      });

      // Generate a human-readable timestamp
      const timestamp = formatTimestamp(new Date());

      // Create a name for the conversion using the font names and timestamp
      const fontNames = files.map((f) => f.name.split(".")[0]).join(", ");
      const conversionName = `convertedfonts_${timestamp}`; // Updated format

      // Add the conversionName and timezone to the formData
      formData.append("conversionName", conversionName);
      formData.append("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);

      const startTime = Date.now();
      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Font conversion failed");
      }

      const result = await response.json();
      setConvertedFonts(result.convertedFonts);

      // Update recent conversions with the R2 public URL and new name format
      const newConversion = {
        name: `${fontNames} (${timestamp.replace("_", " ")})`, // Add space for display
        date: new Date().toISOString(),
        url: result.downloadUrl,
      };
      const updatedConversions = [newConversion, ...recentConversions].slice(0, 5);
      setRecentConversions(updatedConversions);
      localStorage.setItem("recentConversions", JSON.stringify(updatedConversions));

      posthog.capture("fonts_converted", {
        count: files.length,
        conversionTime: Date.now() - startTime, // Add conversion time
      });

      // New event: Capture conversion success rate
      posthog.capture("conversion_success_rate", {
        total: files.length,
        successful: result.convertedFonts.length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      // New event: Capture conversion failure
      posthog.capture("conversion_failed", { error: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setIsLoading(false);
    }
  };

  const generateZipFile = async (fonts: any[]) => {
    const zip = new JSZip();
    fonts.forEach((font) => {
      zip.file(`${font.originalFileName}.woff`, font.woff, { base64: true });
      zip.file(`${font.originalFileName}.woff2`, font.woff2, { base64: true });
    });
    return await zip.generateAsync({ type: "blob" });
  };

  const handleDownloadZip = async () => {
    if (convertedFonts.length > 0) {
      const zipBlob = await generateZipFile(convertedFonts);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = `convertedfonts_${formatTimestamp(new Date())}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      posthog.capture("zip_download_completed", {
        count: convertedFonts.length,
        totalSize: zipBlob.size, // Add total size of the ZIP file
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / 1048576).toFixed(2) + " MB";
  };

  const handleRecentDownload = (conversion: { name: string; url: string; date: string }) => {
    const link = document.createElement("a");
    link.href = conversion.url;
    const fileName = conversion.url.split("/").pop() || `convertedfonts_${formatTimestamp(new Date())}.zip`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // New event: Capture recent conversion download
    posthog.capture("recent_conversion_downloaded", { conversionName: conversion.name });
  };

  const handleClearRecentConversions = () => {
    setRecentConversions([]);
    localStorage.removeItem("recentConversions");
    posthog.capture("recent_conversions_cleared");
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

      <form onSubmit={handleConvert} className={styles.uploadSection}>
        <div className={styles.fileInputWrapper}>
          <label htmlFor="fileInput" className={styles.chooseFilesButton}>
            Choose Files
          </label>
          <input id="fileInput" type="file" onChange={handleFileChange} multiple accept=".otf,.ttf" className={styles.hiddenFileInput} />
          <span className={styles.fileInfo}>{files && files.length > 0 ? `${files.length} file(s) selected` : "No files chosen"}</span>
        </div>
        <button type="submit" disabled={!files || files.length === 0 || isLoading} className={styles.convertButton}>
          Convert
        </button>
      </form>

      {files && files.length > 0 && (
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

      {convertedFonts && convertedFonts.length > 0 && (
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
                  <a
                    href={`data:font/woff;base64,${font.woff}`}
                    download={`${font.originalFileName}.woff`}
                    className={styles.downloadButton}
                    onClick={() => posthog.capture("individual_font_downloaded", { format: "woff", fileName: font.originalFileName })}
                  >
                    Download WOFF
                  </a>
                  <span className={styles.fileSize}>(New size: {formatFileSize(font.woffSize)})</span>
                </div>
                <div className={styles.downloadButtons}>
                  <a
                    href={`data:font/woff2;base64,${font.woff2}`}
                    download={`${font.originalFileName}.woff2`}
                    className={styles.downloadButton}
                    onClick={() => posthog.capture("individual_font_downloaded", { format: "woff2", fileName: font.originalFileName })}
                  >
                    Download WOFF2
                  </a>
                  <span className={styles.fileSize}>(New size: {formatFileSize(font.woff2Size)})</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recentConversions.length > 0 && (
        <div className={styles.recentConversions}>
          <h3>Recent Conversions</h3>
          <ul>
            {recentConversions.map((conversion, index) => (
              <li key={index}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRecentDownload(conversion);
                  }}
                >
                  {conversion.name}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleClearRecentConversions();
            }}
            className={styles.clearRecentLink}
          >
            Clear List
          </a>
        </div>
      )}
    </div>
  );
}
