import React from "react";

interface FilterOption {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
}

interface FilterGalleryProps {
  onSelectFilter?: (filterId: string) => void;
  selectedFilter?: string;
  filters?: FilterOption[];
}

const FilterGallery = ({
  onSelectFilter = () => {},
  selectedFilter = "normal",
  filters = [
    {
      id: "normal",
      name: "Normal",
      thumbnail:
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&q=70",
      description: "No filter applied",
    },
    {
      id: "grayscale",
      name: "Grayscale",
      thumbnail:
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&q=70&auto=format&fit=crop&sat=-100",
      description: "Convert image to black and white",
    },
    {
      id: "sepia",
      name: "Sepia",
      thumbnail:
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&q=70&auto=format&fit=crop&duotone=964B00,FFFFFF",
      description: "Warm brownish tone",
    },
    {
      id: "invert",
      name: "Invert",
      thumbnail:
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&q=70&auto=format&fit=crop&invert=80",
      description: "Invert all colors",
    },
    {
      id: "cool",
      name: "Cool",
      thumbnail:
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&q=70&auto=format&fit=crop&cs=tinysrgb&tint=blue",
      description: "Cool blue tone",
    },
    {
      id: "warm",
      name: "Warm",
      thumbnail:
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&q=70&auto=format&fit=crop&cs=tinysrgb&tint=orange",
      description: "Warm orange tone",
    },
  ],
}: FilterGalleryProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-3">Color Filters</h3>
      <div className="grid grid-cols-3 gap-2">
        {filters.map((filter) => (
          <div key={filter.id}>
            <div
              className={`cursor-pointer overflow-hidden transition-all hover:scale-105 border rounded-md ${selectedFilter === filter.id ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => onSelectFilter(filter.id)}
              title={filter.description}
            >
              <div className="relative aspect-square w-full">
                <img
                  src={filter.thumbnail}
                  alt={filter.name}
                  className="object-cover w-full h-full"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                  {filter.name}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterGallery;
