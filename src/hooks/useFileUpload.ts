import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { FILE_UPLOAD } from "@/constants/upload";
import { validateFile } from "@/utils/fileValidation";

interface UseFileUploadOptions<T> {
  onUpload: (file: File) => Promise<T>;
  onSuccess?: (response: T) => void;
  onError?: (error: Error) => void;
}

export const useFileUpload = <T>({
  onUpload,
  onSuccess,
  onError,
}: UseFileUploadOptions<T>) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    const validation = validateFile(file);

    if (!validation.isValid && validation.error) {
      toast({
        ...validation.error,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setIsUploading(true);
    toast(FILE_UPLOAD.SUCCESS_MESSAGES.UPLOAD_STARTED);

    try {
      const response = await onUpload(file);
      toast(FILE_UPLOAD.SUCCESS_MESSAGES.UPLOAD_COMPLETED);
      onSuccess?.(response);
    } catch (error) {
      console.error("File upload error:", error);
      toast({
        ...FILE_UPLOAD.ERROR_MESSAGES.UPLOAD_FAILED,
        variant: "destructive",
      });
      onError?.(error as Error);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    handleFileUpload,
    isUploading,
  };
};
