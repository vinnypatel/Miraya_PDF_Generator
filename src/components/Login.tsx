'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/Utilis/Firebase";
import Link from 'next/link'
import Loader from "./Loader";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      router.push("/home");
    }
  });

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const authResult = await signInWithEmailAndPassword(auth, email, password);
      const user = authResult.user;
      // console.log("Logged in user:", user.uid, user.email, user.displayName);
      localStorage.setItem("user", user.uid);
      // Optionally, fetch user data if required
      // await fetchUser(user.uid);
      return user;
    } catch (error: any) {
      console.error("Error logging in:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const handleLogin = async (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      router.push("/home");
      console.log("Logged in user:", user);
    } catch (error: any) {
      alert(error.message)
      // console.error("Login failed:", error.message);
    }
  };

  const navigateToSignUp = () => {
    
    // router.push("/signup");
  };

  const navigateToForgotPassword = () => {
    router.push("/forgot-password");
  };

  return (

   <>
    
    <div className="relative min-h-screen flex flex-col lg:flex-row">
      {/* Left Side: Image */}
      {loading && <Loader title="Logging In" />}
      <div className="w-full lg:w-1/2 hidden lg:block">
        <img
          src="/logo.webp" // Replace with your image path
          alt="Login"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white p-8 rounded shadow-md mx-4">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Login
          </h2>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-2"
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-2"
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end mb-4">
              <label className="flex items-center text-sm text-gray-600">
                <input type="checkbox" className="mr-2" />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Login
            </button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-6">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-blue-600 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
   </>
    // <>
    // <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      
    // </div>
    // <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    //   <form onSubmit={handleLogin} style={{ width: "300px", textAlign: "center" }}>
    //     <h2>Login</h2>
    //     {error && <p style={{ color: "red" }}>{error}</p>}
    //     <div style={{ marginBottom: "10px" }}>
    //       <input
    //         type="email"
    //         placeholder="Email"
    //         value={email}
    //         onChange={(e) => setEmail(e.target.value)}
    //         required
    //         style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
    //       />
    //     </div>
    //     <div style={{ marginBottom: "10px" }}>
    //       <input
    //         type="password"
    //         placeholder="Password"
    //         value={password}
    //         onChange={(e) => setPassword(e.target.value)}
    //         required
    //         style={{ width: "100%", padding: "8px" }}
    //       />
    //     </div>
    //     <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "blue", color: "white", border: "none" }}>
    //       Login
    //     </button>
    //     <div style={{ marginTop: "10px" }}>
    //       <Link href={"/signup"}>
    //       <button
    //         type="button"
    //         style={{ padding: "5px 10px" }}
    //       >
    //         Sign Up
    //       </button>
    //       </Link>
          
    //     </div>
    //   </form>
    // </div>
    // </>
    
  );
}
