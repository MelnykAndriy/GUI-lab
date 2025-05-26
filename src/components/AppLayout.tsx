
import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@/features/user/userSlice";

interface AppLayoutProps {
  onLogout: () => void;
  userData: {
    id: number;
    name: string;
    email: string;
    avatarUrl?: string;
    avatarColor?: string;
  };
}

const AppLayout: React.FC<AppLayoutProps> = ({ onLogout, userData }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated && !userData) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isLoggedIn={true} onLogout={onLogout} />
      
      <div className="container flex-1 flex flex-col md:flex-row gap-8 py-8">        
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
