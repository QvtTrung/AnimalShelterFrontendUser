import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Card, CardBody, CardHeader } from "@nextui-org/react";
import { Mail, Lock, User, Phone, AlertCircle } from "lucide-react";
import { useRegister } from "../hooks/useAuth";
import toast from "react-hot-toast";

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    phone_number: "",
  });
  const [error, setError] = useState("");
  const register = useRegister();
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("ẬMật khẩu không khớp");
      toast.error("ẬMật khẩu không khớp");
      return;
    }

    if (formData.password.length < 8) {
      setError("ẬMật khẩu phải có ít nhất 8 ký tự");
      toast.error("ẬMật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    try {
      await register.mutateAsync({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number || undefined,
      });
      toast.success("Đăng ký thành công! Chào mừng bạn!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      setError("Đăng ký thất bại. Vui lòng thử lại.");
      toast.error("Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-green-50 to-emerald-50 flex items-center justify-center p-4 py-12 paw-pattern">
      <Card className="w-full max-w-2xl shadow-2xl border-2 border-white/50 bg-white/95 backdrop-blur-sm">
        <CardHeader className="flex flex-col items-center gap-2 p-8 pb-4 text-center">
          <h1 className="text-3xl font-heading font-bold text-gray-900">
            Tạo Tài Khoản
          </h1>
          <p className="text-gray-600 text-base">
            Tham gia cộng đồng và giúp cứu sống động vật
          </p>
        </CardHeader>
        <CardBody className="p-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            {(error || register.isError) && (
              <div className="bg-danger-50 border-2 border-danger-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-danger-500 shrink-0 mt-0.5" />
                <p className="text-sm text-danger-700 font-medium">
                  {error || "Đăng ký thất bại. Vui lòng thử lại."}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                label="Tên"
                placeholder="Nhập tên của bạn"
                value={formData.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
                startContent={<User className="w-4 h-4 text-gray-400" />}
                required
                size="lg"
                classNames={{
                  input: "text-gray-900",
                  label: "text-gray-700 font-medium",
                  inputWrapper: "bg-white border-2 border-gray-200",
                }}
              />

              <Input
                type="text"
                label="Họ"
                placeholder="Nhập họ của bạn"
                value={formData.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
                startContent={<User className="w-4 h-4 text-gray-400" />}
                required
                size="lg"
                classNames={{
                  input: "text-gray-900",
                  label: "text-gray-700 font-medium",
                  inputWrapper: "bg-white border-2 border-gray-200",
                }}
              />
            </div>

            <Input
              type="email"
              label="Email"
              placeholder="Nhập email của bạn"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              startContent={<Mail className="w-4 h-4 text-gray-400" />}
              required
              size="lg"
              classNames={{
                input: "text-gray-900",
                label: "text-gray-700 font-medium",
                inputWrapper: "bg-white border-2 border-gray-200",
              }}
            />

            <Input
              type="tel"
              label="Số Điện Thoại (Tùy chọn)"
              placeholder="Nhập số điện thoại của bạn"
              value={formData.phone_number}
              onChange={(e) => handleChange("phone_number", e.target.value)}
              startContent={<Phone className="w-4 h-4 text-gray-400" />}
              size="lg"
              classNames={{
                input: "text-gray-900",
                label: "text-gray-700 font-medium",
                inputWrapper: "bg-white border-2 border-gray-200",
              }}
            />

            <Input
              type="password"
              label="Mật Khẩu"
              placeholder="Tạo mật khẩu (ít nhất 8 ký tự)"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              startContent={<Lock className="w-4 h-4 text-gray-400" />}
              required
              size="lg"
              classNames={{
                input: "text-gray-900",
                label: "text-gray-700 font-medium",
                inputWrapper: "bg-white border-2 border-gray-200",
              }}
            />

            <Input
              type="password"
              label="Xác Nhận Mật Khẩu"
              placeholder="Xác nhận mật khẩu của bạn"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              startContent={<Lock className="w-4 h-4 text-gray-400" />}
              required
              size="lg"
              classNames={{
                input: "text-gray-900",
                label: "text-gray-700 font-medium",
                inputWrapper: "bg-white border-2 border-gray-200",
              }}
            />

            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full font-semibold text-base mt-2"
              isLoading={register.isPending}
            >
              Tạo Tài Khoản
            </Button>

            <p className="text-center text-gray-600 pt-2">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-primary-600 font-semibold hover:text-primary-700"
              >
                Đăng nhập
              </Link>
            </p>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
