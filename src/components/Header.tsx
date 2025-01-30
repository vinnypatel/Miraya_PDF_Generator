import { useState } from "react";
import Link from "next/link";
export default function Header({ user }: any) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <header className="bg-white shadow-md font-poppins sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-600">
          {/* <Link href="/"> */}
            <img src="/logo.webp" alt="Logo" className="w-12 h-12 rounded-lg" />
          {/* </Link> */}
        </div>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 items-center">
            <label className="text-gray-600 hover:text-blue-600">Welcome {user?.fullName || "User"}</label>
          {/* <Link href="/" className="text-gray-600 hover:text-blue-600">Home</Link>
          <Link href="/about" className="text-gray-600 hover:text-blue-600">About
          </Link>
          <Link href="/services" className="text-gray-600 hover:text-blue-600">Services
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-blue-600">Contact
          </Link> */}
          <button
          className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded"
          onClick={handleLogout}
        >
          Logout
        </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="block md:hidden text-gray-600 focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        {/* Mobile Navigation */}
        {/* {isMenuOpen && (
          <nav className="absolute top-16 left-0 w-full bg-white shadow-md md:hidden">
            <ul className="flex flex-col items-center space-y-4 py-4">
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600">Home
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600">About
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600">Services
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600">Contact
                </Link>
              </li>
            </ul>
          </nav>
        )} */}
      </div>
    </header>
  );
}