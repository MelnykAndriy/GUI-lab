import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "@/components/AuthForm";
import { toast } from "@/components/ui/use-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  registerUser,
  selectUserError,
  selectUserLoading,
} from "@/features/user/userSlice";
import { AppDispatch } from "@/app/store";

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

  const handleRegister = async (formData: any) => {
    const resultAction = await dispatch(
      registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
        dob: formData.dob,
      }),
    );

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

      <AuthForm type="register" onSubmit={handleRegister} isLoading={loading} />
    </div>
  );
};

export default Register;
