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
    <div className="border-b" data-testid="navbar">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center" data-testid="logo-link">
            <MsgtrikLogo size={20} />
          </Link>
          <nav className="hidden md:flex gap-4">
            <Link
              to="/about"
              className="text-sm font-medium hover:text-primary"
              data-testid="about-link"
            >
              About
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link
                to="/profile"
                className="text-sm font-medium hover:text-primary"
                data-testid="profile-link"
              >
                My Account
              </Link>
              <Button
                variant="outline"
                onClick={onLogout}
                data-testid="logout-button"
              >
                Logout
              </Button>
            </>
          ) : (
            <div className="flex gap-2" data-testid="auth-buttons">
              <Link to="/login" data-testid="login-link">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register" data-testid="register-link">
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
