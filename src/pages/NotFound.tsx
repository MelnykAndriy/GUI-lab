import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Log the error immediately
    const message = "404 Error: User attempted to access non-existent route:";
    console.error(message, location.pathname);

    // Return cleanup function
    return () => {
      // Optional: Clean up any side effects if needed
    };
  }, [location.pathname]); // Keep pathname in dependencies

  return (
    <div
      data-testid="not-found-page"
      className="min-h-screen flex items-center justify-center bg-gray-100"
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a
          href="/"
          data-testid="return-home-link"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
