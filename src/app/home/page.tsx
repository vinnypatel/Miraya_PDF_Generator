'use client'
import { useState, ChangeEvent } from "react";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import Header from "@/components/Header";

const PdfGenerator1: React.FC = () => {
  const [firstPageImage, setFirstPageImage] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);

  // Handle first page upload
  const handleFirstPageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFirstPageImage(URL.createObjectURL(file));
    }
  };

  // Handle additional images upload
  const handleAdditionalImagesUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAdditionalImages(files);
    }
  };

  // Clear all images
  const handleClearImages = () => {
    setFirstPageImage(null);
    setAdditionalImages([]);
  };

  // Generate PDF with 2x2 grid for subsequent pages
  const generatePDF = async () => {
    if (!firstPageImage) {
      alert("Please upload the first page image.");
      return;
    }

    const pdf = new jsPDF("portrait", "mm", "a4"); // A4 size
    const margin = 4;
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm

    // Add the first page image with dynamic scaling
    const firstImage = new Image();
    firstImage.src = firstPageImage;

    await new Promise((resolve) => {
      firstImage.onload = () => {
        const imgAspectRatio = firstImage.width / firstImage.height;
        let imgWidth = pageWidth - margin * 2;
        let imgHeight = imgWidth / imgAspectRatio;

        if (imgHeight > pageHeight - margin * 2) {
          imgHeight = pageHeight - margin * 2;
          imgWidth = imgHeight * imgAspectRatio;
        }

        const x = (pageWidth - imgWidth) / 2; // Center horizontally
        const y = (pageHeight - imgHeight) / 2; // Center vertically
        pdf.addImage(firstImage, "JPEG", x, y, imgWidth, imgHeight);
        resolve(true);
      };
    });

    // Add subsequent images in a 2x2 grid with original aspect ratios
    if (additionalImages.length > 0) {
      pdf.addPage(); // Start new page for additional images

      const gridRows = 2;
      const gridCols = 2;
      const cellWidth = (pageWidth - margin * 3) / gridCols; // Width for each grid cell
      const cellHeight = (pageHeight - margin * 3) / gridRows; // Height for each grid cell

      let x = margin; // Starting X position
      let y = margin; // Starting Y position

      for (let i = 0; i < additionalImages.length; i++) {
        const img = new Image();
        img.src = URL.createObjectURL(additionalImages[i]);

        await new Promise((resolve) => {
          img.onload = () => {
            const imgAspectRatio = img.width / img.height;
            let imgWidth = cellWidth;
            let imgHeight = imgWidth / imgAspectRatio;

            if (imgHeight > cellHeight) {
              imgHeight = cellHeight;
              imgWidth = imgHeight * imgAspectRatio;
            }

            // Center the image within its cell
            const centeredX = x + (cellWidth - imgWidth) / 2;
            const centeredY = y + (cellHeight - imgHeight) / 2;

            pdf.addImage(img, "JPEG", centeredX, centeredY, imgWidth, imgHeight);
            resolve(true);
          };
        });

        x += cellWidth + margin; // Move to the next column

        // If we're at the end of a row, reset X and move to the next row
        if ((i + 1) % gridCols === 0) {
          x = margin;
          y += cellHeight + margin;
        }

        // If we're at the end of the page, add a new page
        if ((i + 1) % (gridRows * gridCols) === 0 && i !== additionalImages.length - 1) {
          pdf.addPage();
          x = margin;
          y = margin;
        }
      }
    }

    // Save the PDF
    const pdfBlob = pdf.output("blob");
    saveAs(pdfBlob, "generated-pdf.pdf");
  };
  // const generatePDF = async () => {
  //   if (!firstPageImage) {
  //     alert("Please upload the first page image.");
  //     return;
  //   }

  //   const pdf = new jsPDF("portrait", "mm", "a4"); // A4 size
  //   const margin = 10;
  //   const pageWidth = 210; // A4 width in mm
  //   const pageHeight = 297; // A4 height in mm

  //   // Add the first page image with dynamic scaling
  //   const firstImage = new Image();
  //   firstImage.src = firstPageImage;

  //   await new Promise((resolve) => {
  //     firstImage.onload = () => {
  //       const imgAspectRatio = firstImage.width / firstImage.height;
  //       let imgWidth = pageWidth - margin * 2;
  //       let imgHeight = imgWidth / imgAspectRatio;

  //       if (imgHeight > pageHeight - margin * 2) {
  //         imgHeight = pageHeight - margin * 2;
  //         imgWidth = imgHeight * imgAspectRatio;
  //       }

  //       const x = (pageWidth - imgWidth) / 2; // Center horizontally
  //       const y = (pageHeight - imgHeight) / 2; // Center vertically
  //       pdf.addImage(firstImage, "JPEG", x, y, imgWidth, imgHeight);
  //       resolve(true);
  //     };
  //   });

  //   // Add subsequent images in a 2x2 grid
  //   if (additionalImages.length > 0) {
  //     pdf.addPage(); // Start new page for additional images

  //     let x = margin; // Starting X position
  //     let y = margin; // Starting Y position
  //     const gridImgWidth = (pageWidth - margin * 3) / 2; // Width for 2x2 grid
  //     const gridImgHeight = (pageHeight - margin * 3) / 2; // Height for 2x2 grid

  //     for (let i = 0; i < additionalImages.length; i++) {
  //       const img = new Image();
  //       img.src = URL.createObjectURL(additionalImages[i]);

  //       await new Promise((resolve) => {
  //         img.onload = () => {
  //           pdf.addImage(img, "JPEG", x, y, gridImgWidth, gridImgHeight);
  //           resolve(true);
  //         };
  //       });

  //       x += gridImgWidth + margin; // Move to the next column

  //       // If we're at the end of a row, reset X and move to the next row
  //       if ((i + 1) % 2 === 0) {
  //         x = margin;
  //         y += gridImgHeight + margin;
  //       }

  //       // If we're at the end of the page, add a new page
  //       if ((i + 1) % 4 === 0 && i !== additionalImages.length - 1) {
  //         pdf.addPage();
  //         x = margin;
  //         y = margin;
  //       }
  //     }
  //   }

  //   // Save the PDF
  //   const pdfBlob = pdf.output("blob");
  //   saveAs(pdfBlob, "generated-pdf.pdf");
  // };
  
  return (
    <>
    <Header/>
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">PDF Generator</h1>

      {/* First Page Image Upload */}
      <div className="space-y-2">
        <label className="block text-lg font-semibold">Upload First Page Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFirstPageUpload}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {firstPageImage && (
          <img
            src={firstPageImage}
            alt="First Page Preview"
            className="mt-4 w-full h-auto border border-gray-300 rounded-lg"
          />
        )}
      </div>

      {/* Additional Images Upload */}
      <div className="space-y-2">
        <label className="block text-lg font-semibold">Upload Additional Images</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleAdditionalImagesUpload}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
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
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={handleClearImages}
          className="py-2 px-4 text-lg font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none"
        >
          Clear Images
        </button>
        <button
          onClick={generatePDF}
          className="py-2 px-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none"
        >
          Generate PDF
        </button>
      </div>
    </div>
    </>
  );
};

export default PdfGenerator1;

