import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MsgtrikLogo from "@/components/MsgtrikLogo";

const About: React.FC = () => {
  return (
    <div className="container py-12" data-testid="about-container">
      <div className="max-w-2xl mx-auto" data-testid="about-wrapper">
        <Card role="article">
          <CardHeader role="banner" className="text-center">
            <div
              className="w-24 h-24 mx-auto flex items-center justify-center mb-4"
              data-testid="logo-container"
            >
              <MsgtrikLogo size={48} className="scale-150" />
            </div>
            <div className="max-w-3xl mx-auto text-center mb-12">
              <p className="text-xl text-muted-foreground">
                A simple, modern chat application
              </p>
            </div>
          </CardHeader>
          <CardContent role="region" className="text-center">
            <p className="mb-4">
              Msgtrik is a modern web application that provides simple and
              intuitive messaging capabilities. With Msgtrik, you can connect
              with friends, family, and colleagues in a clean, distraction-free
              environment.
            </p>
            <p className="mb-4">
              Built with the latest web technologies, Msgtrik offers a
              responsive design that works on all your devices, from desktop
              computers to mobile phones.
            </p>

            <div className="mt-8 flex justify-center">
              <a href="/register" className="text-primary hover:underline">
                Join us today!
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
