import React from "react";
import { Button } from "./ui/button";
import { Download, RotateCcw, Upload } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface ActionButtonsProps {
  onDownload?: () => void;
  onReset?: () => void;
  onUploadNew?: () => void;
  isImageLoaded?: boolean;
}

const ActionButtons = ({
  onDownload = () => console.log("Download clicked"),
  onReset = () => console.log("Reset clicked"),
  onUploadNew = () => console.log("Upload new clicked"),
  isImageLoaded = true,
}: ActionButtonsProps) => {
  return (
    <div className="flex items-center justify-center gap-4 p-4 bg-white rounded-lg shadow-sm w-full max-w-md mx-auto">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onReset}
              disabled={!isImageLoaded}
              className="h-10 w-10"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset adjustments</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onUploadNew}
              className="h-10 w-10"
            >
              <Upload className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upload new image</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="icon"
              onClick={onDownload}
              disabled={!isImageLoaded}
              className="h-10 w-10 bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download edited image</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ActionButtons;
