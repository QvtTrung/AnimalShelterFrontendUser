import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Avatar,
  Spinner,
} from "@nextui-org/react";
import { User, Mail, Phone, MapPin, Calendar, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import { useCurrentUser, useUpdateProfile } from "../hooks/useAuth";
import toast from "react-hot-toast";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: storeUser } = useAuthStore();
  const { data: userData, isLoading, refetch } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);

  const user = userData?.data || storeUser;

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone_number: user?.phone_number || "",
    address: user?.address || "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync(formData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      await refetch();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      phone_number: user?.phone_number || "",
      address: user?.address || "",
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardBody className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              User Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              Unable to load user information.
            </p>
            <Button
              color="primary"
              variant="flat"
              onPress={() => navigate("/dashboard")}
              startContent={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Dashboard
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="light"
            onPress={() => navigate("/dashboard")}
            startContent={<ArrowLeft className="w-4 h-4" />}
            className="mb-4"
          >
            Back to Dashboard
          </Button>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900">
            My Profile
          </h1>
          <p className="text-gray-600 mt-2">Manage your personal information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardBody className="p-6 text-center">
              <Avatar
                src={user.avatar}
                name={`${user.first_name} ${user.last_name}`}
                className="w-32 h-32 mx-auto mb-4"
                isBordered
                color="primary"
              />
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-gray-600 mb-2">{user.email}</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
                {user.role
                  ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                  : "User"}
              </div>
              {user.date_of_birth && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Born: {new Date(user.date_of_birth).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Information Card */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex items-center justify-between p-6 pb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Personal Information
              </h3>
              {!isEditing ? (
                <Button
                  color="primary"
                  variant="flat"
                  onPress={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    color="default"
                    variant="light"
                    onPress={handleCancel}
                    isDisabled={updateProfileMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSave}
                    isLoading={updateProfileMutation.isPending}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardBody className="p-6 pt-2">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    label="First Name"
                    placeholder="Enter your first name"
                    value={formData.first_name}
                    onChange={(e) => handleChange("first_name", e.target.value)}
                    startContent={<User className="w-4 h-4 text-gray-400" />}
                    isReadOnly={!isEditing}
                    variant={isEditing ? "bordered" : "flat"}
                    classNames={{
                      input: "text-gray-900",
                      label: "text-gray-700 font-medium",
                    }}
                  />

                  <Input
                    type="text"
                    label="Last Name"
                    placeholder="Enter your last name"
                    value={formData.last_name}
                    onChange={(e) => handleChange("last_name", e.target.value)}
                    startContent={<User className="w-4 h-4 text-gray-400" />}
                    isReadOnly={!isEditing}
                    variant={isEditing ? "bordered" : "flat"}
                    classNames={{
                      input: "text-gray-900",
                      label: "text-gray-700 font-medium",
                    }}
                  />
                </div>

                <Input
                  type="email"
                  label="Email"
                  value={user.email}
                  startContent={<Mail className="w-4 h-4 text-gray-400" />}
                  isReadOnly
                  variant="flat"
                  description="Email cannot be changed"
                  classNames={{
                    input: "text-gray-900",
                    label: "text-gray-700 font-medium",
                  }}
                />

                <Input
                  type="tel"
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  value={formData.phone_number}
                  onChange={(e) => handleChange("phone_number", e.target.value)}
                  startContent={<Phone className="w-4 h-4 text-gray-400" />}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                  classNames={{
                    input: "text-gray-900",
                    label: "text-gray-700 font-medium",
                  }}
                />

                <Input
                  type="text"
                  label="Address"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  startContent={<MapPin className="w-4 h-4 text-gray-400" />}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                  classNames={{
                    input: "text-gray-900",
                    label: "text-gray-700 font-medium",
                  }}
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Account Status Card */}
        <Card className="mt-6">
          <CardHeader className="p-6 pb-4">
            <h3 className="text-xl font-bold text-gray-900">Account Status</h3>
          </CardHeader>
          <CardBody className="p-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.status === "active"
                      ? "bg-success-100 text-success-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {user.status
                    ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
                    : "Unknown"}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Role</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                  {user.role
                    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                    : "User"}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
