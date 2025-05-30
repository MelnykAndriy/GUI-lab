import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  registerUser,
  selectUserError,
  selectUserLoading,
} from "@/features/user/userSlice";
import { AppDispatch } from "@/app/store";
import { RegisterData } from "@/services/authService";
import RegisterForm from "@/components/RegisterForm";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);

  // Monitor error state
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error,
      });
    }
  }, [error]);

  const handleRegister = async (formData: RegisterData) => {
    const resultAction = await dispatch(registerUser(formData));

    if (registerUser.fulfilled.match(resultAction)) {
      toast({
        title: "Registration Successful",
        description: "Your account has been created.",
      });

      // Force navigation to chat page
      setTimeout(() => {
        navigate("/chat", { replace: true });
      }, 100);
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-md mx-auto text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create an Account</h1>
        <p className="text-muted-foreground mt-2">
          Join our community and start chatting
        </p>
      </div>

      <RegisterForm onSubmit={handleRegister} isLoading={loading} />
    </div>
  );
};

export default Register;
