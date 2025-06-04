import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Edit, Save, Upload, Loader2 } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { useDispatch, useSelector } from "react-redux";
import {
  updateUserProfile,
  fetchCurrentUser,
  selectUser,
  selectUserLoading,
  selectUserError,
} from "@/features/user/userSlice";
import { AppDispatch } from "@/app/store";
import { uploadAvatar } from "@/services/userService";
import { useFileUpload } from "@/hooks/useFileUpload";
import { UploadAvatarResponse } from "@/services/userService";

interface ProfileFormState {
  id: number;
  email: string;
  name: string;
  gender: string;
  dob: string;
  createdAt: string;
  avatarUrl?: string;
  avatarColor?: string;
}

const AVATAR_COLORS = [
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-yellow-500", label: "Yellow" },
  { value: "bg-pink-500", label: "Pink" },
  { value: "bg-indigo-500", label: "Indigo" },
];

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<ProfileFormState | null>(null);
  const [editMode, setEditMode] = useState({
    name: false,
    gender: false,
    dob: false,
    avatarColor: false,
    avatarUrl: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();

  // Get user data from Redux store
  const currentUser = useSelector(selectUser);
  const isLoading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);

  const { handleFileUpload, isUploading } = useFileUpload<UploadAvatarResponse>(
    {
      onUpload: uploadAvatar,
      onSuccess: (response) => {
        if (response.avatarUrl && userData) {
          // Update local state
          handleInputChange("avatarUrl", response.avatarUrl);
          // Update in Redux/backend
          dispatch(
            updateUserProfile({ profile: { avatarUrl: response.avatarUrl } }),
          );
        }
      },
    },
  );

  useEffect(() => {
    console.log("Profile component mounted - fetching user data");
    // Fetch current user data from API when component mounts
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // Update local state when Redux store updates
  useEffect(() => {
    if (currentUser) {
      // Create a user data object that matches our form state interface
      const formData: ProfileFormState = {
        id: currentUser.id,
        email: currentUser.email || "",
        name: currentUser.profile?.name || "",
        gender: currentUser.profile?.gender || "",
        dob: currentUser.profile?.dob || "",
        createdAt: currentUser.profile?.createdAt || "",
        avatarUrl: currentUser.profile?.avatarUrl,
        avatarColor: currentUser.profile?.avatarColor,
      };
      setUserData(formData);
    }
  }, [currentUser]);

  const handleInputChange = (field: string, value: string) => {
    if (!userData) return;

    setUserData({
      ...userData,
      [field]: value,
    });
  };

  const saveChanges = (field: keyof typeof editMode) => {
    if (!userData) return;

    // Create update data object with only the changed field
    const updateData = { profile: { [field]: userData[field] } };
    // Dispatch update action
    dispatch(updateUserProfile(updateData))
      .unwrap()
      .then(() => {
        // Exit edit mode
        setEditMode({
          ...editMode,
          [field]: false,
        });

        toast({
          title: "Profile Updated",
          description: `Your ${field} has been updated.`,
        });
      })
      .catch((error) => {
        console.error(`Error updating ${field}:`, error);
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: `Could not update your ${field}. Please try again.`,
        });
      });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileUpload(file);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateString || "N/A";
    }
  };

  // Show loading state
  if (isLoading && !userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading profile information...</p>
      </div>
    );
  }

  // Show error state
  if (error && !userData) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Profile Error</h1>
        <div className="text-destructive mb-4">{error}</div>
        <Button onClick={() => dispatch(fetchCurrentUser())}>Retry</Button>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Profile Not Found</h1>
        <p className="mb-4">
          Could not load user profile data. Please try logging in again.
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="flex justify-center mb-8">
        <div className="text-center">
          <UserAvatar
            user={{
              profile: {
                name: userData.name,
                avatarUrl: userData.avatarUrl,
                avatarColor: userData.avatarColor,
              },
              email: userData.email,
            }}
            size="lg"
            className="mx-auto mb-4"
          />
          <div className="text-sm font-medium">{userData.name || "N/A"}</div>
          <div className="text-xs text-muted-foreground">
            {userData.email || "N/A"}
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={triggerFileInput}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Avatar
                </>
              )}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
              data-testid="avatar-upload"
            />

            {!userData.avatarUrl && (
              <div className="text-xs text-muted-foreground mt-1 mb-2">
                Or choose a color:
              </div>
            )}

            {!userData.avatarUrl &&
              (editMode.avatarColor ? (
                <div>
                  <Select
                    value={userData.avatarColor || ""}
                    onValueChange={(value) =>
                      handleInputChange("avatarColor", value)
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVATAR_COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center">
                            <div
                              className={`w-4 h-4 rounded-full ${color.value} mr-2`}
                            ></div>
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={() => saveChanges("avatarColor")}
                    className="mt-2"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setEditMode({ ...editMode, avatarColor: true })
                  }
                >
                  Change avatar color
                </Button>
              ))}
          </div>
        </div>
      </div>

      <Card className="mb-6" data-testid="profile-card">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">Name</div>
              {editMode.name ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={userData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="max-w-xs"
                    aria-label="Name"
                  />
                  <Button size="sm" onClick={() => saveChanges("name")}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="mr-2">{userData.name || "N/A"}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditMode({ ...editMode, name: true })}
                    aria-label="Edit name"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Email field */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">Email</div>
              <div>{userData.email || "N/A"}</div>
              <div className="text-xs text-muted-foreground">
                Email cannot be changed
              </div>
            </div>
          </div>

          {/* Gender field */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">Gender</div>
              {editMode.gender ? (
                <div className="flex items-center space-x-2">
                  <Select
                    value={userData.gender || ""}
                    onValueChange={(value) =>
                      handleInputChange("gender", value)
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={() => saveChanges("gender")}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="capitalize mr-2">
                    {userData.gender || "N/A"}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditMode({ ...editMode, gender: true })}
                    aria-label="Edit gender"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Date of Birth field */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">Date of Birth</div>
              {editMode.dob ? (
                <div className="flex items-center space-x-2">
                  <Input
                    type="date"
                    value={userData.dob || ""}
                    onChange={(e) => handleInputChange("dob", e.target.value)}
                    className="max-w-xs"
                    aria-label="Date of Birth"
                  />
                  <Button size="sm" onClick={() => saveChanges("dob")}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="mr-2">{userData.dob || "N/A"}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditMode({ ...editMode, dob: true })}
                    aria-label="Edit date of birth"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Joined on field */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">Joined on</div>
              <div>{formatDate(userData.createdAt)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Profile;
