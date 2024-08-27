"use client";

import React, { useState } from "react";
import styles from "./FontUploader.module.css";

interface UploadResponse {
  message: string;
  folderKey: string;
}

interface DownloadResponse {
  url: string;
  filename: string;
}

export default function FontUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UploadResponse = await response.json();
      setUploadStatus(data.message);

      // Initiate the conversion process
      await handleConversion(data.folderKey);
    } catch (error) {
      setUploadStatus("Upload failed. Please try again.");
      console.error("Upload error:", error);
    }
  };

  const handleConversion = async (folderKey: string) => {
    try {
      const response = await fetch(`/api/upload?key=${encodeURIComponent(folderKey)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DownloadResponse = await response.json();
      setDownloadUrl(data.url);
      setDownloadFilename(data.filename);
      setUploadStatus("Conversion complete. You can now download the file.");
    } catch (error) {
      setUploadStatus("Conversion failed. Please try again.");
      console.error("Conversion error:", error);
    }
  };

  const handleDownload = () => {
    if (downloadUrl && downloadFilename) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={styles.container}>
      <input type="file" onChange={handleFileChange} accept=".otf,.ttf" className={styles.fileInput} />
      <button onClick={handleUpload} className={styles.button}>
        Upload and Convert
      </button>
      <p className={styles.status}>{uploadStatus}</p>
      {downloadUrl && (
        <button onClick={handleDownload} className={styles.button}>
          Download Converted Font
        </button>
      )}
    </div>
  );
}
