import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Download, RefreshCw } from "lucide-react";

interface ImagePreviewProps {
  originalImage?: string;
  processedImage?: string;
  isProcessing?: boolean;
  onDownload?: () => void;
  onReset?: () => void;
}

const ImagePreview = ({
  originalImage = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
  processedImage,
  isProcessing = false,
  onDownload = () => {},
  onReset = () => {},
}: ImagePreviewProps) => {
  const [activeTab, setActiveTab] = useState("processed");
  const [displayImage, setDisplayImage] = useState<string | undefined>(
    processedImage || originalImage
  );

  useEffect(() => {
    if (activeTab === "original") {
      setDisplayImage(originalImage);
    } else {
      setDisplayImage(processedImage || originalImage);
    }
  }, [activeTab, originalImage, processedImage]);

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden bg-white">
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold">Image Preview</h2>
        <div className="lg:flex hidden gap-2">
          <Button variant="outline" size="sm" onClick={onReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={onDownload}
            disabled={!processedImage || isProcessing}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="processed"
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="processed">Processed</TabsTrigger>
            <TabsTrigger value="original">Original</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          <div className="relative w-full h-full flex items-center justify-center bg-gray-100 rounded-md overflow-hidden">
            {isProcessing ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : null}

            {displayImage ? (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={displayImage}
                  alt={
                    activeTab === "original"
                      ? "Original image"
                      : "Processed image"
                  }
                  className="max-w-full max-h-full object-contain"
                  style={{ maxHeight: "calc(100% - 20px)" }}
                />
              </div>
            ) : (
              <div className="text-gray-400 text-center">
                <p>No image to display</p>
                <p className="text-sm">Upload an image to see the preview</p>
              </div>
            )}
          </div>
        </div>
      </Tabs>

      <div className="p-4 border-t">
        <div className="flex justify-between items-center text-sm text-gray-500">
          {processedImage && (
            <span>
              Use the tabs above to compare the original and processed images
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ImagePreview;
