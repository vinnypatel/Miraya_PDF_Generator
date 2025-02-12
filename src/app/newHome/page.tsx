'use client';
import { useState, ChangeEvent, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import Header from "@/components/Header";
import { firestore } from "@/Utilis/Firebase";
import { doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";

const PdfGenerator4: React.FC = () => {
  const [orientations, setOrientations] = useState<{ [key: number]: number }>({});

  const [firstPageImage, setFirstPageImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState<Blob | null>(null);
  const router = useRouter();
  const [isDragging, setIsDragging] = useState<boolean>(false); 
  const [userId, setUserId] = useState("");
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const targetDivRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const storedUserId = localStorage.getItem("user");
        console.log("Stored user ID:", storedUserId);
        if (storedUserId) {
          console.log("Stored user ID:", storedUserId);
          setUserId(storedUserId);
        } else {
          router.push("/");
        }
      }, []);
      const scrollToTargetDiv = () => {
        if (targetDivRef.current) {
          targetDivRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      useEffect(() => {
  
        if (!userId) {
          return;
        }
        const fetchUser = async () => {
          setTitle(`Loading User Details...`);
          setLoading(true);
          try {
            const userDocRef = doc(firestore, "users", userId); // Reference to the user document
            const docSnap = await getDoc(userDocRef); // Get document snapshot
    
            if (docSnap.exists()) {
              console.log("User data:", docSnap.data());
              setUser(docSnap.data());
              // setUser({ id: docSnap.id, ...docSnap.data() });
            } else {
              setUser({fullName: "Guest", email: "Guest"});
              // setError("User not found");
            }
          } catch (error) {
            console.error("Error fetching user details: ", error);
            // setError("Error fetching user data");
          } finally {
            setLoading(false);
          }
        };
    
        fetchUser();
      }, [userId]);
  const handleFirstPageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // const imageSrc = URL.createObjectURL(file);
        setFirstPageImage(file);
    }
  };
  
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
  
    if (files.length > 0) {
      const fileArray = Array.from(files);
  
      const compressedFiles = await Promise.all(
        fileArray.map(async (file) => {
            return file;
        })
      );  
      setAdditionalImages(compressedFiles); // Update state with File objects
    }
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true); // Set dragging state when dragging over the drop zone
  };

  const handleDragLeave = () => {
    setIsDragging(false); // Reset dragging state when dragging leaves the drop zone
  };

  const handleAdditionalImagesUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
            return file;
        })
      );
      setAdditionalImages(compressedFiles);
    }
  };

  const handleClearImages = () => {
    setFirstPageImage(null);
    setAdditionalImages([]);
    setPdfPreviewUrl(null);
    setGeneratedPdfBlob(null);
  };

  const generatePDF = async () => {
    if (!firstPageImage) {
      alert("Please upload the first page image.");
      return;
    }
    
    setLoading(true);
    setTitle(`Generating PDF...`);
    
    const pdf = new jsPDF("portrait", "mm", "a4"); // A4 size
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 10;
  
    // Function to load image as a canvas and auto-rotate it
    const loadImageAndRotate = async (file: File) => {
      return new Promise<HTMLCanvasElement>((resolve, reject) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
  
          if (!ctx) {
            reject("Failed to get canvas context");
            return;
          }
  
          // Read EXIF orientation
          const orientation = await getExifOrientation(file);
          let rotateAngle = 0;
  
          if (orientation === 6) {
            rotateAngle = 90;
          } else if (orientation === 3) {
            rotateAngle = 180;
          } else if (orientation === 8) {
            rotateAngle = 270;
          }
  
          // Swap width & height if rotating 90 or 270 degrees
          if (rotateAngle === 90 || rotateAngle === 270) {
            canvas.width = img.height;
            canvas.height = img.width;
          } else {
            canvas.width = img.width;
            canvas.height = img.height;
          }
  
          // Apply rotation
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotateAngle * Math.PI) / 180);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
  
          resolve(canvas);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    };
  
    // Function to get EXIF orientation
    const getExifOrientation = async (file: File) => {
      // const fixImageOrientation = async (file: File) => {
        return new Promise<number>((resolve) => {
          const reader = new FileReader();
          reader.readAsArrayBuffer(file);
      
          reader.onload = () => {
            const buffer = reader.result as ArrayBuffer;
            const view = new DataView(buffer);
      
            let little = false;
            let offset = 2;
      
            try {
              if (view.getUint16(0, false) !== 0xffd8) {
                throw new Error("Not a valid JPEG file");
              }
      
              while (offset < view.byteLength) {
                if (view.getUint16(offset, false) === 0xffe1) {
                  little = view.getUint16(offset + 10, false) === 0x4949;
                  break;
                }
                offset += view.getUint16(offset + 2, false) + 2;
              }
      
              if (offset + 4 >= view.byteLength) {
                throw new Error("Invalid EXIF data");
              }
      
              const tags = view.getUint16(offset, little);
              console.log("EXIF Tags:", tags);
            } catch (error) {
              console.warn("EXIF parsing failed:", error);
            }
      
            resolve(1); // Default orientation if EXIF parsing fails
          };
      
          reader.onerror = () => {
            console.error("File reading error:", reader.error);
            resolve(1);
          };
        });
      
      // return new Promise<number>((resolve) => {
      //   const reader = new FileReader();
      //   reader.onload = function (event) {
      //     if (!event.target?.result) return resolve(1); // Default orientation
  
      //     const view = new DataView(event.target.result as ArrayBuffer);
      //     if (view.getUint16(0, false) !== 0xffd8) return resolve(1);
  
      //     let length = view.byteLength,
      //       offset = 2;
  
      //     while (offset < length) {
      //       const marker = view.getUint16(offset, false);
      //       offset += 2;
  
      //       if (marker === 0xffe1) {
      //         if (view.getUint32(offset + 2, false) !== 0x45786966) {
      //           break;
      //         }
  
      //         const little = view.getUint16(offset + 6, false) === 0x4949;
      //         offset += view.getUint32(offset + 4, little);
  
      //         const tags = view.getUint16(offset, little);
      //         offset += 2;
  
      //         for (let i = 0; i < tags; i++) {
      //           if (view.getUint16(offset + i * 12, little) === 0x0112) {
      //             resolve(view.getUint16(offset + i * 12 + 8, little));
      //             return;
      //           }
      //         }
      //       } else if ((marker & 0xff00) !== 0xff00) {
      //         break;
      //       } else {
      //         offset += view.getUint16(offset, false);
      //       }
      //     }
  
      //     resolve(1);
      //   };
  
      //   reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
      // });
    };
  
    // Process first page image
    const firstCanvas = await loadImageAndRotate(firstPageImage);
    const firstImgWidth = pageWidth - margin * 2;
    const firstImgHeight = (firstCanvas.height / firstCanvas.width) * firstImgWidth;
  
    pdf.addImage(firstCanvas, "JPEG", margin, margin, firstImgWidth, firstImgHeight, undefined, "FAST");
  
    // Process additional images in grid
    if (additionalImages.length > 0) {
      pdf.addPage();
  
      const gridRows = 2;
      const gridCols = 2;
      const cellWidth = (pageWidth - margin * 3) / gridCols;
      const cellHeight = (pageHeight - margin * 3) / gridRows;
  
      let x = margin;
      let y = margin;
  
      for (let i = 0; i < additionalImages.length; i++) {
        const imgCanvas = await loadImageAndRotate(additionalImages[i]);
        const imgAspectRatio = imgCanvas.width / imgCanvas.height;
        let imgWidth = cellWidth;
        let imgHeight = imgWidth / imgAspectRatio;
  
        if (imgHeight > cellHeight) {
          imgHeight = cellHeight;
          imgWidth = imgHeight * imgAspectRatio;
        }
  
        const centeredX = x + (cellWidth - imgWidth) / 2;
        const centeredY = y + (cellHeight - imgHeight) / 2;
  
        pdf.addImage(imgCanvas, "JPEG", centeredX, centeredY, imgWidth, imgHeight, undefined, "FAST");
  
        x += cellWidth + margin;
  
        if ((i + 1) % gridCols === 0) {
          x = margin;
          y += cellHeight + margin;
        }
  
        if ((i + 1) % (gridRows * gridCols) === 0 && i !== additionalImages.length - 1) {
          pdf.addPage();
          x = margin;
          y = margin;
        }
      }
    }
  
    setLoading(false);
    const pdfBlob = pdf.output("blob");
    setGeneratedPdfBlob(pdfBlob);
    setPdfPreviewUrl(URL.createObjectURL(pdfBlob));
  };
  

  useEffect(() => {
    scrollToTargetDiv();
  }, [pdfPreviewUrl]);

  const savePdfToFile = async () => {
    if (!generatedPdfBlob) return;
  
    if (window.showSaveFilePicker) {
      // Use the native file picker
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: "generated-pdf.pdf",
        types: [
          {
            description: "PDF Files",
            accept: { "application/pdf": [".pdf"] },
          },
        ],
      });
  
      const writableStream = await fileHandle.createWritable();
      await writableStream.write(generatedPdfBlob);
      await writableStream.close();
    } else {
      // Fallback for unsupported browsers
      const link = document.createElement("a");
      link.href = URL.createObjectURL(generatedPdfBlob);
      link.download = "generated-pdf.pdf";
      link.click();
    }
  };

  return (
    <>
    <Header user={user}/>
    {/* <UploadFile /> */}
    {loading && 
    <div className="absolute inset-0 bg-black bg-opacity-50 h-screen w-full flex items-center justify-center">
    {loading && <Loader title={title} />}
    </div>
     }
    <div className="min-h-screen flex flex-col lg:flex-col">              
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">PDF Generator</h1>
     {/* Action Buttons */}
     <div className="flex justify-between gap-4">
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
      {/* First Page Image Upload */}
      <div className="space-y-2">
        <label className="block text-lg font-semibold">Upload First Page Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFirstPageUpload}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {/* {firstPageImage && (
          <img
            src={URL.createObjectURL(firstPageImage)}
            alt="First Page Preview"
            className="mt-4 w-full h-auto border border-gray-300 rounded-lg"
          />
        )} */}
         {firstPageImage && (
            <div>
              <img
                src={URL.createObjectURL(firstPageImage)}
                alt="First Page Preview"
                className="mt-4 w-full h-auto border border-gray-300 rounded-lg"
              />
            </div>
          )}
      </div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 p-6 text-center cursor-pointer transition-all duration-300 ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-dashed border-gray-400"
        }`}
      >
        <p className="text-lg font-semibold">Drag and drop additional images here</p>
        <button
          onClick={() => (document.querySelector("#additionalImagesInput") as HTMLInputElement)?.click()}
          className="mt-4 py-2 px-4 text-white bg-blue-600 rounded-lg"
        >
          Or select images manually
        </button>

        {/* Hidden file input for image selection */}
        <input
          type="file"
          accept="image/*"
          multiple
          id="additionalImagesInput"
          onChange={handleAdditionalImagesUpload}
          className="hidden"
        />
        
      </div>
    
      {additionalImages.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {additionalImages.map((file, index) => (
              <div key={index} style={{ position: "relative" }}>
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Additional Image ${index}`}
                  className="mt-4 w-full h-auto border border-gray-300 rounded-lg"
                />
              </div>
            ))}
        </div>
      )}
      {/* PDF Preview */}
      {pdfPreviewUrl && (
        <div ref={targetDivRef} className="mt-8 space-y-4">
          <h2 className="text-lg font-bold">PDF Preview:</h2>
          <iframe
            src={pdfPreviewUrl}
            className="w-full h-[500px] border border-gray-300 rounded-lg"
          ></iframe>
          <button
            onClick={savePdfToFile}
            className="py-2 px-4 w-full text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none"
          >
            Save PDF
          </button>
        </div>
      )}
    </div>
      </div>
    
    </>
  );
};

export default PdfGenerator4;


declare global {
    interface Window {
      showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
    }
  }
  
  interface SaveFilePickerOptions {
    suggestedName?: string;
    types?: {
      description: string;
      accept: Record<string, string[]>;
    }[];
  }