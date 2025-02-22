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

  // const rotateImage = async (rotation: number) => {
  //   if (firstPageImage) {
  //     // Cycle through 0, 90, 180, 270 degrees (reset to 0 after 360)
  //     const newRotation = (rotation + 90) % 360;

  //     // Create rotated file using the Canvas API
  //     const rotatedImage = await rotateImageFile(firstPageImage, newRotation);

  //     // Update the state with rotated file and new rotation
  //     setFirstPageImage(rotatedImage); // Update the displayed image
  //     // setRotation(newRotation); // Update the rotation state
  //   }
  // };

  // Rotate image using Canvas and return a rotated File
  const rotateImageFile = async (imageFile: File, rotation: number): Promise<File> => {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = URL.createObjectURL(imageFile);
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    // Resize the canvas to fit the rotated image (Swap width and height for 90 or 270 degrees)
    if (rotation === 90 || rotation === 270) {
      canvas.width = image.height;
      canvas.height = image.width;
    } else {
      canvas.width = image.width;
      canvas.height = image.height;
    }

    // Move canvas origin to the center for rotation
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180); // Convert degrees to radians

    // Draw the image onto the canvas (centered)
    ctx.drawImage(image, -image.width / 2, -image.height / 2);

    // Export the rotated image to a Blob and convert it to a File
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject("Failed to create blob from canvas");
        }
      }, imageFile.type);
    });

    return new File([blob], imageFile.name, { type: imageFile.type });
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
    const margin = 10;
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
  
    // Add the first page image with dynamic scaling and compression
    const firstImage = new Image();
    firstImage.src = URL.createObjectURL(firstPageImage);
  
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
        pdf.addImage(firstImage, "JPEG", x, y, imgWidth, imgHeight, undefined, "FAST"); // Use "FAST" compression
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
  
            pdf.addImage(img, "JPEG", centeredX, centeredY, imgWidth, imgHeight, undefined, "FAST"); // Use "FAST" compression
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
  
    setLoading(false);
    // Generate a preview URL
    const pdfBlob = pdf.output("blob");
    setGeneratedPdfBlob(pdfBlob);
    setPdfPreviewUrl(URL.createObjectURL(pdfBlob));
  };
  

  useEffect(() => {
    scrollToTargetDiv();
  }, [pdfPreviewUrl]);

  const handleRotateClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault(); // Prevent the default action
    rotateImage(180); // Call the asynchronous rotateImage function
  };
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

  const rotateImage = async (index: number, isFirstPage: boolean = false) => {
    if (isFirstPage && firstPageImage) {
      const rotation = (orientations[0] || 0) + 90;
      const rotatedImage = await rotateImageFile(firstPageImage, rotation);
      setFirstPageImage(rotatedImage);
      setOrientations((prev) => ({ ...prev, 0: rotation % 360 }));
    } else if (!isFirstPage && additionalImages[index]) {
      const rotation = (orientations[index + 1] || 0) + 90;
      const rotatedImage = await rotateImageFile(additionalImages[index], rotation);
      setAdditionalImages((prevImages) =>
        prevImages.map((img, i) => (i === index ? rotatedImage : img))
      );
      setOrientations((prev) => ({
        ...prev,
        [index + 1]: rotation % 360,
      }));
    }
  };

  const rotateImageFile_new = async (imageFile: File, rotation: number): Promise<File> => {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = URL.createObjectURL(imageFile);
    });
  
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }
  
    // Swap canvas width and height for 90 or 270-degree rotations
    if (rotation === 90 || rotation === 270) {
      canvas.width = image.height;
      canvas.height = image.width;
    } else {
      canvas.width = image.width;
      canvas.height = image.height;
    }
  
    // Move origin and rotate
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
  
    // Draw the image centered at the new origin
    if (rotation === 90) {
      ctx.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);
    } else if (rotation === 180) {
      ctx.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);
    } else if (rotation === 270) {
      ctx.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);
    } else {
      ctx.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);
    }
  
    // Convert the rotated image back to a File
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject("Failed to create blob from canvas");
        }
      }, imageFile.type);
    });
  
    return new File([blob], imageFile.name, { type: imageFile.type });
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
              <button
                  onClick={() => rotateImage(0, true)}
                  style={{
                    backgroundColor: "blue",
                    color: "white",
                    padding: "5px",
                    borderRadius: "5px",
                  }}
                >Rotate First Page</button>
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
                {/* Rotate button over the additional images */}
                <button
                  onClick={() => rotateImage(index, false)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    backgroundColor: "blue",
                    color: "white",
                    padding: "5px",
                    borderRadius: "5px",
                  }}
                >
                  Rotate Image {index + 1}
                </button>
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Additional Image ${index}`}
                  className="mt-4 w-full h-auto border border-gray-300 rounded-lg"
                />
              </div>
            ))}
          {/* {additionalImages.map((file, index) => (
              <div key={index}>
                <img
              key={index}
              src={URL.createObjectURL(file)}
              alt={`Additional Image ${index + 1}`}
              className="w-full h-auto border border-gray-300 rounded-lg"
            />
            <button onClick={() => rotateImage(index, false)}>Rotate Image {index + 1}</button>
              </div>
            ))} */}
        </div>
      )}
      
      {/* {firstPageImage && (
        <div className="mt-4">
          <button 
          onClick={handleRotateClick}
          className="py-2 px-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none"
          >ROtate</button>  
        </div>
      )} */}
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