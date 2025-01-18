export default function Loader({title}:any) {
    return (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-10 font-poppins">
          <div className="relative flex items-center justify-center">
            {/* Spinner */}
            <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-blue-500"></div>
            {/* Logo */}
            <div className="absolute">
              <img
                src="/logo.webp" // Replace with your logo path
                alt="Logo"
                className="h-20 w-20 rounded-full"
              />
            </div>
          </div>
          {/* Text Below Spinner */}
          <p className="text-white mt-4 text-lg font-semibold">{title}...</p>
        </div>
    );
  }