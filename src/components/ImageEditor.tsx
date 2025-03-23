import React, { useState, useEffect, useRef } from "react";
import UploadArea from "./UploadArea";
import ImagePreview from "./ImagePreview";
import AdjustmentPanel from "./AdjustmentPanel";
import ActionButtons from "./ActionButtons";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useToast } from "./ui/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

// Define the AdjustmentValues interface here instead of importing it
interface AdjustmentValues {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  sharpen: number;
  hue: number;
  selectedFilter: string;
  flipHorizontal: boolean;
  flipVertical: boolean;
}

interface ImageEditorProps {
  onImageProcessed?: (originalImage: string, processedImage: string) => void;
}

const ImageEditor = ({ onImageProcessed = () => {} }: ImageEditorProps) => {
  const [originalImage, setOriginalImage] = useState<string | undefined>();
  const [processedImage, setProcessedImage] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [currentAdjustments, setCurrentAdjustments] =
    useState<AdjustmentValues>({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      sharpen: 0,
      hue: 0,
      selectedFilter: "normal",
      flipHorizontal: false,
      flipVertical: false,
    });
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const cvReady = useRef(false);
  const { toast } = useToast();

  // Initialize OpenCV.js
  useEffect(() => {
    // Check if OpenCV is already loaded
    if (window.cv) {
      cvReady.current = true;
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src="https://docs.opencv.org/4.5.5/opencv.js"]',
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        cvReady.current = true;
        console.log("OpenCV.js loaded successfully from existing script");
      });
      return;
    }

    // Create a script element to load OpenCV.js
    const script = document.createElement("script");
    script.src = "https://docs.opencv.org/4.5.5/opencv.js";
    script.async = true;
    script.id = "opencv-script";
    script.onload = () => {
      // OpenCV.js is loaded and ready to use
      cvReady.current = true;
      console.log("OpenCV.js loaded successfully");
    };
    script.onerror = () => {
      setError(
        "Failed to load OpenCV.js. Please refresh the page and try again.",
      );
    };

    document.body.appendChild(script);

    return () => {
      // Don't remove the script on unmount to prevent reloading issues
      // Only remove if we're sure no other components need it
      // This prevents the double registration error
    };
  }, []);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const imageDataUrl = e.target.result as string;
        setOriginalImage(imageDataUrl);
        setProcessedImage(imageDataUrl); // Initially, processed image is the same as original
        setIsImageLoaded(true);
        setActiveTab("edit"); // Switch to edit tab after upload

        toast({
          title: "Image uploaded successfully",
          description: "You can now start editing your image",
        });
      }
    };
    reader.onerror = () => {
      setError("Error reading the image file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const processImage = (adjustments: AdjustmentValues) => {
    if (!originalImage || !window.cv) {
      console.error("OpenCV not loaded or no image available");
      return;
    }

    setIsProcessing(true);
    setCurrentAdjustments(adjustments);

    // Create a temporary image element to load the original image
    const img = new Image();
    img.onload = () => {
      try {
        // Create canvas to draw the image
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Could not get canvas context");
        }

        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Apply flip transformations if needed
        ctx.save();
        if (adjustments.flipHorizontal || adjustments.flipVertical) {
          ctx.translate(
            adjustments.flipHorizontal ? canvas.width : 0,
            adjustments.flipVertical ? canvas.height : 0,
          );
          ctx.scale(
            adjustments.flipHorizontal ? -1 : 1,
            adjustments.flipVertical ? -1 : 1,
          );
        }

        // Draw the original image
        ctx.drawImage(img, 0, 0);
        ctx.restore();

        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Create OpenCV matrices
        const src = cv.matFromImageData(imageData);
        const dst = new cv.Mat();

        // Apply adjustments using OpenCV
        // Convert to different color space for easier manipulation
        let tmp = new cv.Mat();
        cv.cvtColor(src, tmp, cv.COLOR_RGBA2RGB);

        // Apply brightness and contrast
        const alpha = adjustments.contrast / 100;
        const beta = adjustments.brightness - 100;
        cv.convertScaleAbs(tmp, dst, alpha, beta);

        // Apply saturation by converting to HSV
        cv.cvtColor(dst, tmp, cv.COLOR_RGB2HSV);
        let channels = new cv.MatVector();
        cv.split(tmp, channels);

        // Adjust saturation (channel 1 in HSV)
        let saturationChannel = channels.get(1);
        cv.convertScaleAbs(
          saturationChannel,
          saturationChannel,
          adjustments.saturation / 100,
          0,
        );
        channels.set(1, saturationChannel);

        // Adjust hue (channel 0 in HSV) if needed
        if (adjustments.hue !== 0) {
          let hueChannel = channels.get(0);
          // Hue is 0-179 in OpenCV HSV
          let hueShift = Math.round((adjustments.hue / 360) * 179);
          // Create a Mat with the same size as hueChannel filled with the hue shift value
          let hueShiftMat = new cv.Mat(
            hueChannel.rows,
            hueChannel.cols,
            hueChannel.type(),
            new cv.Scalar(hueShift),
          );
          cv.add(hueChannel, hueShiftMat, hueChannel);
          hueShiftMat.delete();
          channels.set(0, hueChannel);
        }

        // Merge channels back
        cv.merge(channels, tmp);
        cv.cvtColor(tmp, dst, cv.COLOR_HSV2RGB);

        // Apply blur if needed
        if (adjustments.blur > 0) {
          const ksize = new cv.Size(
            Math.round(adjustments.blur) * 2 + 1,
            Math.round(adjustments.blur) * 2 + 1,
          );
          cv.GaussianBlur(dst, dst, ksize, 0);
        }

        // Apply sharpen if needed
        if (adjustments.sharpen > 0) {
          let blurred = new cv.Mat();
          let kernel = cv.Mat.ones(3, 3, cv.CV_8U);
          cv.GaussianBlur(dst, blurred, new cv.Size(5, 5), 0);
          cv.addWeighted(
            dst,
            1 + adjustments.sharpen / 5,
            blurred,
            -adjustments.sharpen / 5,
            0,
            dst,
          );
          blurred.delete();
          kernel.delete();
        }

        // Apply filter effects based on selectedFilter
        switch (adjustments.selectedFilter) {
          case "grayscale":
            cv.cvtColor(dst, dst, cv.COLOR_RGB2GRAY);
            cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGB);
            break;
          case "sepia":
            // Sepia effect
            let sepiaKernel = cv.matFromArray(
              3,
              3,
              cv.CV_32F,
              [0.393, 0.769, 0.189, 0.349, 0.686, 0.168, 0.272, 0.534, 0.131],
            );
            cv.transform(dst, dst, sepiaKernel);
            sepiaKernel.delete();
            break;
          case "invert":
            cv.bitwise_not(dst, dst);
            break;
          case "cool":
            // Cool blue tone
            let coolChannels = new cv.MatVector();
            cv.split(dst, coolChannels);
            let blueChannel = coolChannels.get(2);
            cv.convertScaleAbs(blueChannel, blueChannel, 1.2, 10);
            coolChannels.set(2, blueChannel);
            cv.merge(coolChannels, dst);
            coolChannels.delete();
            break;
          case "warm":
            // Warm orange tone
            let warmChannels = new cv.MatVector();
            cv.split(dst, warmChannels);
            let redChannel = warmChannels.get(0);
            cv.convertScaleAbs(redChannel, redChannel, 1.2, 10);
            warmChannels.set(0, redChannel);
            cv.merge(warmChannels, dst);
            warmChannels.delete();
            break;
          // 'normal' case - no additional processing
        }

        // Convert back to RGBA for canvas
        cv.cvtColor(dst, dst, cv.COLOR_RGB2RGBA);

        // Create ImageData and put back on canvas
        const processedImageData = new ImageData(
          new Uint8ClampedArray(dst.data),
          dst.cols,
          dst.rows,
        );
        ctx.putImageData(processedImageData, 0, 0);

        // Get the processed image as data URL
        const processedDataUrl = canvas.toDataURL("image/jpeg");
        setProcessedImage(processedDataUrl);

        // Store references to channels before deleting the vector
        let hueChannel;
        if (adjustments.hue !== 0) {
          hueChannel = channels.get(0).clone();
        }

        // Clean up OpenCV objects
        src.delete();
        dst.delete();
        tmp.delete();
        saturationChannel.delete();

        // Clean up additional OpenCV objects if they were created
        if (adjustments.hue !== 0 && hueChannel) {
          hueChannel.delete();
        }

        // Delete channels vector last
        channels.delete();

        if (onImageProcessed) {
          onImageProcessed(originalImage, processedDataUrl);
        }
      } catch (err) {
        console.error("Error processing image:", err);
        setError("Error processing image. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    };

    img.onerror = () => {
      setError("Error loading image for processing");
      setIsProcessing(false);
    };

    img.src = originalImage;
  };

  const handleAdjustmentChange = (adjustments: AdjustmentValues) => {
    processImage(adjustments);
  };

  const handleReset = () => {
    const defaultAdjustments = {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      sharpen: 0,
      hue: 0,
      selectedFilter: "normal",
      flipHorizontal: false,
      flipVertical: false,
    };
    setCurrentAdjustments(defaultAdjustments);
    processImage(defaultAdjustments);

    toast({
      title: "Adjustments reset",
      description: "All image adjustments have been reset to default values",
    });
  };

  const handleDownload = () => {
    if (!processedImage) return;

    const link = document.createElement("a");
    link.href = processedImage;
    link.download = "edited-image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Image downloaded",
      description: "Your edited image has been downloaded successfully",
    });
  };

  const handleUploadNew = () => {
    setActiveTab("upload");
  };

  return (
    <div className="w-full h-full bg-gray-50 p-4 md:p-6 flex flex-col">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="flex-1 overflow-hidden bg-white shadow-sm border rounded-lg">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full h-full"
        >
          <div className="p-4 border-b">
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="edit" disabled={!isImageLoaded}>
                Edit
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="upload"
            className="flex-1 p-4 h-[calc(100%-60px)]"
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-full max-w-md">
                <UploadArea
                  onImageUpload={handleImageUpload}
                  acceptedFormats={["image/jpeg", "image/png", "image/webp"]}
                  maxSizeMB={5}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="edit"
            className="flex-1 h-[calc(100%-60px)] overflow-hidden"
          >
            <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4 overflow-auto">
              <div className="flex-1 min-w-0 h-full lg:h-auto lg:max-h-full">
                <ImagePreview
                  originalImage={originalImage}
                  processedImage={processedImage}
                  isProcessing={isProcessing}
                  onDownload={handleDownload}
                  onReset={handleReset}
                />
              </div>

              <div className="w-full lg:w-auto">
                <AdjustmentPanel
                  onAdjustmentChange={handleAdjustmentChange}
                  onResetAll={handleReset}
                  initialValues={currentAdjustments}
                />
              </div>
            </div>

            <div className="p-4 border-t">
              <ActionButtons
                onDownload={handleDownload}
                onReset={handleReset}
                onUploadNew={handleUploadNew}
                isImageLoaded={isImageLoaded}
              />
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ImageEditor;
