import React, { useState, useRef, useCallback } from "react";
import { Upload, Image as ImageIcon, FileWarning } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface UploadAreaProps {
  onImageUpload?: (file: File) => void;
  acceptedFormats?: string[];
  maxSizeMB?: number;
}

const UploadArea = ({
  onImageUpload = () => {},
  acceptedFormats = ["image/jpeg", "image/png", "image/webp"],
  maxSizeMB = 5,
}: UploadAreaProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = useCallback(
    (file: File): boolean => {
      // Check file type
      if (!acceptedFormats.includes(file.type)) {
        setError(
          `Invalid file format. Please upload ${acceptedFormats.map((format) => format.split("/")[1]).join(", ")} files only.`,
        );
        return false;
      }

      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File size exceeds ${maxSizeMB}MB limit.`);
        return false;
      }

      setError(null);
      return true;
    },
    [acceptedFormats, maxSizeMB],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
          onImageUpload(file);
        }
      }
    },
    [onImageUpload, validateFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
          onImageUpload(file);
        }
      }
    },
    [onImageUpload, validateFile],
  );

  const handleButtonClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return (
    <Card className="w-full h-full bg-white p-6 flex flex-col items-center justify-center">
      <div
        className={`w-full h-full min-h-[250px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={acceptedFormats.join(",")}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            {error ? (
              <FileWarning className="h-8 w-8 text-destructive" />
            ) : (
              <Upload className="h-8 w-8 text-primary" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Upload your image</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop your image here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supported formats:{" "}
              {acceptedFormats
                .map((format) => format.split("/")[1].toUpperCase())
                .join(", ")}
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum size: {maxSizeMB}MB
            </p>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              {error}
            </div>
          )}

          <Button
            onClick={handleButtonClick}
            className="mt-4"
            variant="outline"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Select Image
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UploadArea;
