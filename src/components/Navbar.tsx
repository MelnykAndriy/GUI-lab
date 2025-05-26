
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MsgtrikLogo from "./MsgtrikLogo";

interface NavbarProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, onLogout }) => {
  return (
    <div className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center">
            <MsgtrikLogo size={20} />
          </Link>
          <nav className="hidden md:flex gap-4">
            <Link to="/about" className="text-sm font-medium hover:text-primary">
              About
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link to="/profile" className="text-sm font-medium hover:text-primary">
                My Account
              </Link>
              <Button variant="outline" onClick={onLogout}>
                Logout
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
