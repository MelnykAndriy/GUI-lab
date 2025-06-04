export const FILE_UPLOAD = {
  MAX_SIZE: 2 * 1024 * 1024, // 2MB in bytes
  ALLOWED_TYPES: {
    IMAGE: "image.*",
  },
  ERROR_MESSAGES: {
    INVALID_TYPE: {
      title: "Invalid File Type",
      description: "Please select an image file.",
    },
    FILE_TOO_LARGE: {
      title: "File Too Large",
      description: "Please select an image smaller than 2MB.",
    },
    UPLOAD_FAILED: {
      title: "Upload Failed",
      description: "Could not upload avatar. Please try again.",
    },
  },
  SUCCESS_MESSAGES: {
    UPLOAD_STARTED: {
      title: "Uploading",
      description: "Uploading your avatar...",
    },
    UPLOAD_COMPLETED: {
      title: "Avatar Updated",
      description: "Your avatar has been updated successfully.",
    },
  },
} as const;
