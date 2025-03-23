import React, { useState, useEffect } from "react";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Undo2, Redo2, RotateCcw } from "lucide-react";
import FilterGallery from "./FilterGallery";

interface AdjustmentPanelProps {
  onAdjustmentChange?: (adjustments: AdjustmentValues) => void;
  onResetAll?: () => void;
  initialValues?: AdjustmentValues;
}

export interface AdjustmentValues {
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

const AdjustmentPanel = ({
  onAdjustmentChange = () => {},
  onResetAll = () => {},
  initialValues = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sharpen: 0,
    hue: 0,
    selectedFilter: "normal",
    flipHorizontal: false,
    flipVertical: false,
  },
}: AdjustmentPanelProps) => {
  const [adjustments, setAdjustments] =
    useState<AdjustmentValues>(initialValues);

  // Update local state when initialValues change
  useEffect(() => {
    setAdjustments(initialValues);
  }, [initialValues]);

  const handleAdjustmentChange = (
    key: keyof AdjustmentValues,
    value: number | boolean | string
  ) => {
    const newAdjustments = { ...adjustments, [key]: value };
    setAdjustments(newAdjustments);
    onAdjustmentChange(newAdjustments);
  };

  const handleReset = () => {
    const defaultValues = {
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
    setAdjustments(defaultValues);
    onResetAll();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full max-w-[350px] h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Adjustments</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          title="Reset all adjustments">
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <Label htmlFor="brightness">Brightness</Label>
                <span className="text-sm text-gray-500">
                  {adjustments.brightness}%
                </span>
              </div>
              <Slider
                id="brightness"
                min={0}
                max={200}
                step={1}
                value={[adjustments.brightness]}
                onValueChange={(value) =>
                  handleAdjustmentChange("brightness", value[0])
                }
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <Label htmlFor="contrast">Contrast</Label>
                <span className="text-sm text-gray-500">
                  {adjustments.contrast}%
                </span>
              </div>
              <Slider
                id="contrast"
                min={0}
                max={200}
                step={1}
                value={[adjustments.contrast]}
                onValueChange={(value) =>
                  handleAdjustmentChange("contrast", value[0])
                }
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <Label htmlFor="saturation">Saturation</Label>
                <span className="text-sm text-gray-500">
                  {adjustments.saturation}%
                </span>
              </div>
              <Slider
                id="saturation"
                min={0}
                max={200}
                step={1}
                value={[adjustments.saturation]}
                onValueChange={(value) =>
                  handleAdjustmentChange("saturation", value[0])
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <Label htmlFor="blur">Blur</Label>
                <span className="text-sm text-gray-500">
                  {adjustments.blur}px
                </span>
              </div>
              <Slider
                id="blur"
                min={0}
                max={20}
                step={0.5}
                value={[adjustments.blur]}
                onValueChange={(value) =>
                  handleAdjustmentChange("blur", value[0])
                }
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <Label htmlFor="sharpen">Sharpen</Label>
                <span className="text-sm text-gray-500">
                  {adjustments.sharpen}
                </span>
              </div>
              <Slider
                id="sharpen"
                min={0}
                max={10}
                step={0.1}
                value={[adjustments.sharpen]}
                onValueChange={(value) =>
                  handleAdjustmentChange("sharpen", value[0])
                }
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <Label htmlFor="hue">Hue Rotation</Label>
                <span className="text-sm text-gray-500">
                  {adjustments.hue}°
                </span>
              </div>
              <Slider
                id="hue"
                min={0}
                max={360}
                step={1}
                value={[adjustments.hue]}
                onValueChange={(value) =>
                  handleAdjustmentChange("hue", value[0])
                }
              />
            </div>

            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="flip-h">Flip Horizontal</Label>
                <Switch
                  id="flip-h"
                  checked={adjustments.flipHorizontal}
                  onCheckedChange={(checked) =>
                    handleAdjustmentChange("flipHorizontal", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="flip-v">Flip Vertical</Label>
                <Switch
                  id="flip-v"
                  checked={adjustments.flipVertical}
                  onCheckedChange={(checked) =>
                    handleAdjustmentChange("flipVertical", checked)
                  }
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <FilterGallery
            selectedFilter={adjustments.selectedFilter}
            onSelectFilter={(filterId) =>
              handleAdjustmentChange("selectedFilter", filterId)
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdjustmentPanel;
