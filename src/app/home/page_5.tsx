'use client'
import { useState, ChangeEvent } from "react";

const PdfGenerator5: React.FC = () => {
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);

  const handleAdditionalImagesUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAdditionalImages((prev) => [...prev, ...files]); // Append new files to the additional images array
    }
  };

  const handleClearImages = () => {
    setAdditionalImages([]);
  };

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">PDF Generator</h1>

      {/* Drag-and-Drop Zone for Additional Images */}
      <div className="space-y-2">
        <p className="text-lg font-semibold">Upload Additional Images</p>

        <button
          onClick={() => (document.querySelector("input[type='file']") as HTMLInputElement)?.click()}
          className="mt-4 py-2 px-4 text-white bg-blue-600 rounded-lg"
        >
          Or select images manually
        </button>

        {/* Hidden file input for image selection */}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleAdditionalImagesUpload}
          className="hidden"
        />
      </div>

      {/* Display selected images */}
      {additionalImages.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {additionalImages.map((file, index) => (
            <img
              key={index}
              src={URL.createObjectURL(file)}
              alt={`Additional Image ${index + 1}`}
              className="w-full h-auto border border-gray-300 rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between mt-4">
        <button
          onClick={handleClearImages}
          className="py-2 px-4 text-lg font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          Clear Images
        </button>
      </div>
    </div>
  );
};

export default PdfGenerator5;
