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
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import {
  useCurrentUser,
  useUpdateProfile,
  useChangePassword,
} from "../hooks/useAuth";
import toast from "react-hot-toast";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: storeUser } = useAuthStore();
  const { data: userData, isLoading, refetch } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const user = userData?.data || storeUser;

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone_number: user?.phone_number || "",
    address: user?.address || "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync(formData);
      toast.success("Cập nhật hồ sơ thành công!");
      setIsEditing(false);
      await refetch();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Cập nhật hồ sơ thất bại. Vui lòng thử lại.");
    }
  };

  const handleChangePassword = async () => {
    // Validate passwords match
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    // Validate password length
    if (passwordData.new_password.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự!");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync(passwordData);
      toast.success("Đổi mật khẩu thành công!");
      setIsChangingPassword(false);
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error: any) {
      console.error("Failed to change password:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "Đổi mật khẩu thất bại. Vui lòng thử lại.";
      toast.error(errorMessage);
    }
  };

  const handleCancelPasswordChange = () => {
    setPasswordData({
      current_password: "",
      new_password: "",
      confirm_password: "",
    });
    setIsChangingPassword(false);
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
              Không Tìm Thấy Người Dùng
            </h2>
            <p className="text-gray-600 mb-6">
              Không thể tải thông tin người dùng.
            </p>
            <Button
              color="primary"
              variant="flat"
              onPress={() => navigate("/dashboard")}
              startContent={<ArrowLeft className="w-4 h-4" />}
            >
              Về Bảng Điều Khiển
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
            Về Bảng Điều Khiển
          </Button>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900">
            Hồ Sơ Của Tôi
          </h1>
          <p className="text-gray-600 mt-2">
            Quản lý thông tin cá nhân của bạn
          </p>
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
                    Ngày sinh:{" "}
                    {new Date(user.date_of_birth).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Information Card */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex items-center justify-between p-6 pb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Thông Tin Cá Nhân
              </h3>
              {!isEditing ? (
                <Button
                  color="primary"
                  variant="flat"
                  onPress={() => setIsEditing(true)}
                >
                  Chỉnh Sửa Hồ Sơ
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    color="default"
                    variant="light"
                    onPress={handleCancel}
                    isDisabled={updateProfileMutation.isPending}
                  >
                    Hủy
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSave}
                    isLoading={updateProfileMutation.isPending}
                  >
                    Lưu Thay Đổi
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardBody className="p-6 pt-2">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    label="Tên"
                    placeholder="Nhập tên của bạn"
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
                    label="Họ"
                    placeholder="Nhập họ của bạn"
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
                  description="Email không thể thay đổi"
                  classNames={{
                    input: "text-gray-900",
                    label: "text-gray-700 font-medium",
                  }}
                />

                <Input
                  type="tel"
                  label="Số Điện Thoại"
                  placeholder="Nhập số điện thoại của bạn"
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
                  label="Địa Chỉ"
                  placeholder="Nhập địa chỉ của bạn"
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
            <h3 className="text-xl font-bold text-gray-900">
              Trạng Thái Tài Khoản
            </h3>
          </CardHeader>
          <CardBody className="p-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Trạng Thái</span>
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
                <span className="text-gray-700 font-medium">Vai Trò</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                  {user.role
                    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                    : "User"}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Change Password Card */}
        <Card className="mt-6">
          <CardHeader className="flex items-center justify-between p-6 pb-4">
            <h3 className="text-xl font-bold text-gray-900">Đổi Mật Khẩu</h3>
            {!isChangingPassword ? (
              <Button
                color="primary"
                variant="flat"
                onPress={() => setIsChangingPassword(true)}
                startContent={<Lock className="w-4 h-4" />}
              >
                Đổi Mật Khẩu
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  color="default"
                  variant="light"
                  onPress={handleCancelPasswordChange}
                  isDisabled={changePasswordMutation.isPending}
                >
                  Hủy
                </Button>
                <Button
                  color="primary"
                  onPress={handleChangePassword}
                  isLoading={changePasswordMutation.isPending}
                >
                  Lưu Mật Khẩu
                </Button>
              </div>
            )}
          </CardHeader>
          <CardBody className="p-6 pt-2">
            {isChangingPassword ? (
              <div className="space-y-4">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  label="Mật Khẩu Hiện Tại"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={passwordData.current_password}
                  onChange={(e) =>
                    handlePasswordChange("current_password", e.target.value)
                  }
                  startContent={<Lock className="w-4 h-4 text-gray-400" />}
                  endContent={
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="focus:outline-none"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  }
                  variant="bordered"
                  classNames={{
                    input: "text-gray-900",
                    label: "text-gray-700 font-medium",
                  }}
                />

                <Input
                  type={showNewPassword ? "text" : "password"}
                  label="Mật Khẩu Mới"
                  placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                  value={passwordData.new_password}
                  onChange={(e) =>
                    handlePasswordChange("new_password", e.target.value)
                  }
                  startContent={<Lock className="w-4 h-4 text-gray-400" />}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="focus:outline-none"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  }
                  variant="bordered"
                  classNames={{
                    input: "text-gray-900",
                    label: "text-gray-700 font-medium",
                  }}
                />

                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  label="Xác Nhận Mật Khẩu Mới"
                  placeholder="Nhập lại mật khẩu mới"
                  value={passwordData.confirm_password}
                  onChange={(e) =>
                    handlePasswordChange("confirm_password", e.target.value)
                  }
                  startContent={<Lock className="w-4 h-4 text-gray-400" />}
                  endContent={
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  }
                  variant="bordered"
                  classNames={{
                    input: "text-gray-900",
                    label: "text-gray-700 font-medium",
                  }}
                />

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Lưu ý:</strong> Mật khẩu phải có ít nhất 8 ký tự.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  Nhấn vào nút "Đổi Mật Khẩu" để thay đổi mật khẩu của bạn
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
