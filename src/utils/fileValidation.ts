import { toast } from "@/components/ui/use-toast";
import { FILE_UPLOAD } from "@/constants/upload";

interface ValidationResult {
  isValid: boolean;
  error?: {
    title: string;
    description: string;
  };
}

export const validateImageType = (file: File): ValidationResult => {
  if (!file.type.match(FILE_UPLOAD.ALLOWED_TYPES.IMAGE)) {
    return {
      isValid: false,
      error: FILE_UPLOAD.ERROR_MESSAGES.INVALID_TYPE,
    };
  }
  return { isValid: true };
};

export const validateFileSize = (
  file: File,
  maxSize = FILE_UPLOAD.MAX_SIZE,
): ValidationResult => {
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: FILE_UPLOAD.ERROR_MESSAGES.FILE_TOO_LARGE,
    };
  }
  return { isValid: true };
};

export const validateFile = (file: File): ValidationResult => {
  const typeValidation = validateImageType(file);
  if (!typeValidation.isValid) return typeValidation;

  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.isValid) return sizeValidation;

  return { isValid: true };
};
