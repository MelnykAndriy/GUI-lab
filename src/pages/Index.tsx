
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4">
      <div className="text-center max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Welcome to Msgtrik
        </h1>
        <p className="text-xl mb-8 text-muted-foreground">
          Connect with friends and family with our simple, modern chat application.
          Register now to start chatting!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/register">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
          <Link to="/about">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-3">Simple & Clean</h2>
          <p className="text-muted-foreground">
            Enjoy a distraction-free chat experience with our minimalist design.
          </p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-3">Mobile Friendly</h2>
          <p className="text-muted-foreground">
            Chat on the go with our fully responsive mobile design.
          </p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-3">Fast & Secure</h2>
          <p className="text-muted-foreground">
            Experience fast messaging with privacy and security built in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
