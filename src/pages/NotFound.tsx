import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-md w-full">
        <h1 className="mb-4 text-4xl sm:text-5xl md:text-6xl font-bold">404</h1>
        <p className="mb-4 text-lg sm:text-xl text-gray-600 px-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 underline hover:text-blue-700 text-sm sm:text-base">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
