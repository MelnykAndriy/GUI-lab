import React from "react";
import { Zap } from "lucide-react";

interface MsgtrikLogoProps {
  size?: number;
  className?: string;
}

const MsgtrikLogo: React.FC<MsgtrikLogoProps> = ({
  size = 24,
  className = "",
}) => {
  return (
    <div
      data-testid="msgtrik-logo"
      className={`flex items-center ${className}`}
    >
      <div
        data-testid="msgtrik-logo-icon-container"
        className="mr-2 p-1 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-md"
      >
        <Zap
          data-testid="msgtrik-logo-icon"
          size={size}
          className="text-white"
        />
      </div>
      <span data-testid="msgtrik-logo-text" className="font-bold text-xl">
        Msgtrik
      </span>
    </div>
  );
};

export default MsgtrikLogo;
