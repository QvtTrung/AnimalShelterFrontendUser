import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Card, CardBody, CardHeader } from "@nextui-org/react";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { useLogin } from "../hooks/useAuth";
import toast from "react-hot-toast";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({ email, password });
      toast.success("Chào mừng trở lại!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-green-50 to-emerald-50 flex items-center justify-center p-4 paw-pattern">
      <Card className="w-full max-w-md shadow-2xl border-2 border-white/50 bg-white/95 backdrop-blur-sm">
        <CardHeader className="flex flex-col items-center gap-2 p-8 pb-2 text-center">
          <h1 className="text-3xl font-heading font-bold text-gray-900">
            Chào Mừng Trở Lại
          </h1>
          <p className="text-gray-600 text-base">
            Đăng nhập vào tài khoản của bạn
          </p>
        </CardHeader>
        <CardBody className="p-8 pt-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            {login.isError && (
              <div className="bg-danger-50 border-2 border-danger-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-danger-500 shrink-0 mt-0.5" />
                <p className="text-sm text-danger-700 font-medium">
                  Email hoặc mật khẩu không đúng. Vui lòng thử lại.
                </p>
              </div>
            )}

            <Input
              type="email"
              label="Email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              type="password"
              label="Mật khẩu"
              placeholder="Nhập mật khẩu của bạn"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startContent={<Lock className="w-4 h-4 text-gray-400" />}
              required
              size="lg"
              classNames={{
                input: "text-gray-900",
                label: "text-gray-700 font-medium",
                inputWrapper: "bg-white border-2 border-gray-200",
              }}
            />

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full font-semibold text-base mt-2"
              isLoading={login.isPending}
            >
              Đăng Nhập
            </Button>

            <p className="text-center text-gray-600 pt-2">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-primary-600 font-semibold hover:text-primary-700"
              >
                Đăng ký
              </Link>
            </p>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
