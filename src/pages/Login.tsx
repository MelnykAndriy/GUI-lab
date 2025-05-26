import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "@/components/AuthForm";
import { toast } from "@/components/ui/use-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUser,
  selectUserError,
  selectUserLoading,
} from "@/features/user/userSlice";
import { AppDispatch } from "@/app/store";

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

  const handleLogin = async (formData: any) => {
    const resultAction = await dispatch(
      loginUser({
        email: formData.email,
        password: formData.password,
      }),
    );

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

      <AuthForm type="login" onSubmit={handleLogin} isLoading={loading} />
    </div>
  );
};

export default Login;
