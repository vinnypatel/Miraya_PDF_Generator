'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "@/Utilis/Firebase";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import Loader from "@/components/Loader";


export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUserId = localStorage.getItem("user");
    if (storedUserId) {
      router.push("/home");
    }
  });
  async function createUser(email: string, fullName: string, password: string) {
    setLoading(true);
    try {
      // Create user in Firebase Authentication
      const authResult = await createUserWithEmailAndPassword(auth, email, password);
      const user = authResult.user;
      // Store additional user data in Firestore
      await storeUserInFirestore(user.uid, email, fullName);
      // alert(`User created`)
      // console.log("User created:", user);
      return user;
    } catch (error: any) {
      setLoading(false);
      // console.error("Error creating user:", error.message);
      throw error;
    }
  }

  async function storeUserInFirestore(uid: string, email: string, fullName: string) {
    const user = {
      uid,
      email,
      fullName,
    };
  
    try {
      await setDoc(doc(firestore, "users", uid), user);
      console.log("User stored in Firestore");
    } catch (error: any) {
      console.error("Error storing user in Firestore:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }
  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // console.log("User Name:", userName);
      // console.log("Email:", email);
      // console.log("Password:", password);
      // const email = "newuser@example.com";
      // const fullName = "New User";
      // const password = "password123";
      if (!email || !userName || !password || !confirmPassword) {
        setError("Please fill in all the fields");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      const user = await createUser(email, userName, password);
      alert(`User created with email: ${user.email}`);
      router.push("/");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        alert("This email is already in use. Please try logging in or use a different email.");
      } else {
        alert("An unexpected error occurred. Please try again later.");
      }
      // alert(error.message)
      // console.error("User creation failed:", error.message);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row">
      {loading && <Loader title="Signing Up" />}
      {/* Left Side: Image */}
      <div className="w-full lg:w-1/2 hidden lg:block">
        <img
          src="/logo.webp" // Replace with your image path
          alt="SignUp"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side: SignUp Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white p-8 rounded shadow-md mx-4">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Sign Up
          </h2>

          <form onSubmit={handleCreateUser}>
          {error && <p style={{ color: "red" }}>{error}</p>}
            {/* User Name */}
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-gray-700 font-medium mb-2"
              >
                User Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                id="username"
                placeholder="Enter your name"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label
                htmlFor="confirm-password"
                className="block text-gray-700 font-medium mb-2"
              >
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                id="confirm-password"
                placeholder="Confirm your password"
                className="w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Sign Up
            </button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <Link
              href="/"
              className="text-blue-600 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
    // <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    //   <form onSubmit={handleCreateUser} style={{ width: "300px", textAlign: "center" }}>
    //     <h2>Sign Up</h2>
    //     {error && <p style={{ color: "red" }}>{error}</p>}
    //     <div style={{ marginBottom: "10px", borderRadius: "5px" }}>
    //       <input
    //         type="text"
    //         placeholder="User Name"
    //         value={userName}
    //         onChange={(e) => setUserName(e.target.value)}
    //         required
    //         style={{ width: "100%", padding: "8px", marginBottom: "10px", color: "black" }}
    //       />
    //     </div>
    //     <div style={{ marginBottom: "10px", borderRadius: "5px" }}>
    //       <input
    //         type="email"
    //         placeholder="Email"
    //         value={email}
    //         onChange={(e) => setEmail(e.target.value)}
    //         required
    //         style={{ width: "100%", padding: "8px", marginBottom: "10px", color: "black" }}
    //       />
    //     </div>
    //     <div style={{ marginBottom: "10px" }}>
    //       <input
    //         type="password"
    //         placeholder="Password"
    //         value={password}
    //         onChange={(e) => setPassword(e.target.value)}
    //         required
    //         style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
    //       />
    //     </div>
    //     <div style={{ marginBottom: "10px" }}>
    //       <input
    //         type="password"
    //         placeholder="Confirm Password"
    //         value={confirmPassword}
    //         onChange={(e) => setConfirmPassword(e.target.value)}
    //         required
    //         style={{ width: "100%", padding: "8px" }}
    //       />
    //     </div>
    //     <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "green", color: "white", border: "none" }}>
    //       Sign Up
    //     </button>
    //   </form>
    // </div>
  );
}
