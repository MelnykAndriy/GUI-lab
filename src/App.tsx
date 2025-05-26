
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import { useDispatch, useSelector } from "react-redux";
import { selectIsAuthenticated, setUser, logoutUser } from "./features/user/userSlice";

const queryClient = new QueryClient();

const App = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      setUserData(parsedUser);
      dispatch(setUser(parsedUser));
    }
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    dispatch(logoutUser());
    setUserData(null);
    window.location.href = "/";
  };

  // Authentication guard
  const AuthRoute = ({ children }: { children: JSX.Element }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  // Public routes guard (redirect to chat if logged in)
  const PublicRoute = ({ children }: { children: JSX.Element }) => {
    return isAuthenticated ? <Navigate to="/chat" replace /> : children;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Routes>
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Navigate to="/chat" replace />
                  ) : (
                    <>
                      <Navbar isLoggedIn={isAuthenticated} onLogout={handleLogout} />
                      <div className="flex-1">
                        <Index />
                      </div>
                    </>
                  )
                }
              />

              {/* Auth protected routes */}
              <Route
                path="/profile"
                element={
                  <AuthRoute>
                    <AppLayout onLogout={handleLogout} userData={userData} />                  
                  </AuthRoute>
                }
              >
                <Route index element={<Profile />} />
              </Route>
              
              <Route
                path="/chat"
                element={
                  <AuthRoute>
                    <AppLayout onLogout={handleLogout} userData={userData} />
                  </AuthRoute>
                }
              >
                <Route index element={<Chat />} />
              </Route>
              
              {/* Public routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <>
                      <Navbar isLoggedIn={isAuthenticated} onLogout={handleLogout} />
                      <div className="flex-1">
                        <Login />
                      </div>
                    </>
                  </PublicRoute>
                }
              />
              
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <>
                      <Navbar isLoggedIn={isAuthenticated} onLogout={handleLogout} />
                      <div className="flex-1">
                        <Register />
                      </div>
                    </>
                  </PublicRoute>
                }
              />
              
              <Route
                path="/about"
                element={
                  <>
                    <Navbar isLoggedIn={isAuthenticated} onLogout={handleLogout} />
                    <div className="flex-1">
                      <About />
                    </div>
                  </>
                }
              />
              
              {/* Catch-all route */}
              <Route
                path="*"
                element={
                  <>
                    <Navbar isLoggedIn={isAuthenticated} onLogout={handleLogout} />
                    <div className="flex-1">
                      <NotFound />
                    </div>
                  </>
                }
              />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
