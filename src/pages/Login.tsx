import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUser,
  selectUserError,
  selectUserLoading,
} from "@/features/user/userSlice";
import { AppDispatch } from "@/app/store";
import { LoginData } from "@/services/authService";
import LoginForm from "@/components/LoginForm";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);

  // Monitor error state
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error,
      });
    }
  }, [error]);

  const handleLogin = async (formData: LoginData) => {
    const resultAction = await dispatch(loginUser(formData));

    if (loginUser.fulfilled.match(resultAction)) {
      toast({
        title: "Login Successful",
        description: "Welcome back!",
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
        <h1 className="text-3xl font-bold tracking-tight">Welcome Back!</h1>
        <p className="text-muted-foreground mt-2">
          Login to continue chatting with your friends on Msgtrik
        </p>
      </div>

      <LoginForm onSubmit={handleLogin} isLoading={loading} />
    </div>
  );
};

export default Login;
