import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Radio,
  RadioGroup,
  Chip,
  Progress,
} from "@nextui-org/react";
import { AlertCircle, CheckCircle, Upload, X } from "lucide-react";
import { useCreateReport } from "../hooks/useReports";
import { LocationPicker } from "../components/Map/LocationPicker";
import { useAuthStore } from "../store/auth.store";

export const ReportPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const createReport = useCreateReport();

  const [formData, setFormData] = useState({
    title: "",
    species: "Dog" as "Dog" | "Cat" | "Other",
    type: "injured_animal" as
      | "abuse"
      | "abandonment"
      | "injured_animal"
      | "other",
    description: "",
    urgency_level: "medium" as "low" | "medium" | "high" | "critical",
    location: "",
    coordinates: {
      type: "Point" as const,
      coordinates: [105.7829, 10.0452] as [number, number], // Default: Can Tho [lng, lat]
    },
    contact_name: "",
    contact_phone: "",
    contact_email: "",
  });

  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCoordinatesChange = (value: {
    type: "Point";
    coordinates: [number, number];
  }) => {
    setFormData((prev) => ({ ...prev, coordinates: value }));
  };

  const handleLocationTextChange = (value: string) => {
    setFormData((prev) => ({ ...prev, location: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 5 - images.length;
    const filesToAdd = files.slice(0, remainingSlots);
    setImages((prev) => [...prev, ...filesToAdd]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous validation errors
    setValidationErrors({});

    // Validate required fields
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = "Tiêu đề là bắt buộc";
    if (!formData.species) errors.species = "Loài động vật là bắt buộc";
    if (!formData.type) errors.type = "Loại báo cáo là bắt buộc";
    if (!formData.description.trim()) errors.description = "Mô tả là bắt buộc";
    if (!formData.location.trim()) errors.location = "Vị trí là bắt buộc";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      // Create FormData for multipart/form-data submission
      const formDataToSubmit = new FormData();

      // Add text fields
      formDataToSubmit.append("title", formData.title);
      formDataToSubmit.append("species", formData.species);
      formDataToSubmit.append("type", formData.type);
      formDataToSubmit.append("description", formData.description);
      formDataToSubmit.append("urgency_level", formData.urgency_level);
      formDataToSubmit.append(
        "location",
        formData.location || "Unknown location"
      );
      formDataToSubmit.append(
        "coordinates",
        JSON.stringify(formData.coordinates)
      );
      formDataToSubmit.append("status", "pending");

      if (formData.contact_name) {
        formDataToSubmit.append("contact_name", formData.contact_name);
      }
      if (formData.contact_phone) {
        formDataToSubmit.append("contact_phone", formData.contact_phone);
      }
      if (formData.contact_email) {
        formDataToSubmit.append("contact_email", formData.contact_email);
      }

      // Add image files
      images.forEach((image) => {
        formDataToSubmit.append("images", image);
      });

      // Call API with progress tracking
      setUploadProgress(50);
      await createReport.mutateAsync(
        formDataToSubmit as unknown as Parameters<
          typeof createReport.mutateAsync
        >[0]
      );
      setUploadProgress(100);
      setSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error: unknown) {
      console.error("Failed to submit report:", error);
      setUploadProgress(0);

      // Handle validation errors from backend
      const apiError = error as {
        response?: {
          data?: { errors?: Array<{ field?: string; message: string }> };
        };
      };
      if (
        apiError?.response?.data?.errors &&
        Array.isArray(apiError.response.data.errors)
      ) {
        const backendErrors: Record<string, string> = {};
        apiError.response.data.errors.forEach(
          (err: { field?: string; message: string }) => {
            // Extract field name from path like 'body.species' -> 'species'
            const field = err.field?.split(".").pop() || "general";
            backendErrors[field] = err.message;
          }
        );
        setValidationErrors(backendErrors);
      }
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-2 border-primary-200 bg-white">
          <CardBody className="p-12 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-primary-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-bold text-gray-900">
                Report Submitted!
              </h2>
              <p className="text-gray-600">
                Thank you for reporting. Our rescue team will respond as soon as
                possible based on the urgency level.
              </p>
            </div>
            <Button
              color="primary"
              size="lg"
              onPress={() => navigate("/")}
              className="font-semibold"
            >
              Về Trang Chủ
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16 -mt-20 pt-24 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-16 h-16 drop-shadow-lg" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold drop-shadow-md">
              Báo Cáo Động Vật Cần Giúp
            </h1>
            <p className="text-lg text-white drop-shadow-sm max-w-2xl mx-auto">
              Nhìn thấy động vật cần giúp đỡ? Hãy báo cáo tại đây. Không cần tài
              khoản. Báo cáo mức độ cao và khẩn cấp được ưu tiên xử lý ngay.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl border-2 border-gray-100">
            <CardHeader className="p-6 pb-0">
              <div className="space-y-2">
                <h2 className="text-2xl font-heading font-bold text-gray-900">
                  Thông Tin Động Vật
                </h2>
                <p className="text-gray-600">
                  Cung cấp thông tin chi tiết về động vật cần giúp đỡ
                </p>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <form
                onSubmit={handleSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target instanceof HTMLElement) {
                    // Allow Enter on textarea and submit button
                    if (
                      e.target.tagName !== "TEXTAREA" &&
                      e.target.tagName !== "BUTTON"
                    ) {
                      e.preventDefault();
                    }
                  }
                }}
                className="space-y-6"
              >
                {createReport.isError && (
                  <div className="bg-danger-50 border-2 border-danger-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-danger-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-danger-700 font-medium">
                        {(
                          createReport.error as {
                            response?: { data?: { message?: string } };
                          }
                        )?.response?.data?.message ||
                          "Gửi báo cáo thất bại. Vui lòng thử lại."}
                      </p>
                      {Object.keys(validationErrors).length > 0 && (
                        <ul className="mt-2 text-xs text-danger-600 list-disc list-inside">
                          {Object.entries(validationErrors).map(
                            ([field, error]) => (
                              <li key={field}>{error}</li>
                            )
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                <Input
                  type="text"
                  label="Tiêu Đề Báo Cáo"
                  placeholder="Tiêu đề ngắn gọn cho báo cáo"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                  size="lg"
                  classNames={{
                    label: "font-medium text-gray-700",
                    input: "text-gray-900",
                  }}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loài Động Vật <span className="text-red-500">*</span>
                  </label>
                  <Select
                    placeholder="Chọn loài động vật"
                    selectedKeys={formData.species ? [formData.species] : []}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        handleChange("species", value);
                        // Clear validation error when user selects
                        setValidationErrors((prev) => ({
                          ...prev,
                          species: "",
                        }));
                      }
                    }}
                    required
                    size="lg"
                    aria-label="Loài động vật"
                    isInvalid={!!validationErrors.species}
                    errorMessage={validationErrors.species}
                    disallowEmptySelection
                    classNames={{
                      value: "text-gray-900",
                    }}
                  >
                    <SelectItem key="Dog" value="Dog">
                      Chó
                    </SelectItem>
                    <SelectItem key="Cat" value="Cat">
                      Mèo
                    </SelectItem>
                    <SelectItem key="Other" value="Other">
                      Khác
                    </SelectItem>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại Báo Cáo <span className="text-red-500">*</span>
                  </label>
                  <Select
                    placeholder="Chọn loại báo cáo"
                    selectedKeys={formData.type ? [formData.type] : []}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        handleChange("type", value);
                        // Clear validation error when user selects
                        setValidationErrors((prev) => ({ ...prev, type: "" }));
                      }
                    }}
                    required
                    size="lg"
                    aria-label="Loại báo cáo"
                    isInvalid={!!validationErrors.type}
                    errorMessage={validationErrors.type}
                    disallowEmptySelection
                    classNames={{
                      value: "text-gray-900",
                    }}
                  >
                    <SelectItem key="abuse" value="abuse">
                      Bạo Hành
                    </SelectItem>
                    <SelectItem key="abandonment" value="abandonment">
                      Bỏ Rơi
                    </SelectItem>
                    <SelectItem key="injured_animal" value="injured_animal">
                      Động Vật Bị Thương
                    </SelectItem>
                    <SelectItem key="other" value="other">
                      Khác
                    </SelectItem>
                  </Select>
                </div>

                <RadioGroup
                  label="Mức Độ Khẩn Cấp"
                  value={formData.urgency_level}
                  onValueChange={(value) =>
                    handleChange("urgency_level", value)
                  }
                  orientation="horizontal"
                  classNames={{
                    label: "font-medium text-gray-700",
                  }}
                >
                  <Radio value="low" color="success">
                    Thấp
                  </Radio>
                  <Radio value="medium" color="warning">
                    Trung Bình
                  </Radio>
                  <Radio value="high" color="danger">
                    Cao
                  </Radio>
                  <Radio value="critical" color="danger">
                    Khẩn Cấp
                  </Radio>
                </RadioGroup>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Tất cả báo cáo</strong> có thể được nhận bởi các
                    tình nguyện viên muốn giúp đỡ.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vị Trí <span className="text-red-500">*</span>
                  </label>
                  <LocationPicker
                    value={formData.coordinates}
                    onChange={handleCoordinatesChange}
                    locationText={formData.location}
                    onLocationTextChange={handleLocationTextChange}
                  />
                </div>

                <Textarea
                  label="Mô Tả"
                  placeholder="Mô tả tình trạng, hành vi của động vật và các chi tiết liên quan khác..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  required
                  minRows={4}
                  classNames={{
                    label: "font-medium text-gray-700",
                    input: "text-gray-900",
                  }}
                />

                {/* Image Upload Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Tải Ảnh Lên (Không bắt buộc)
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Thêm tối đa 5 ảnh để giúp xác định động vật và tình trạng
                    của chúng. Ảnh giúp tình nguyện viên phản hồi nhanh hơn.
                  </p>

                  {/* Image Preview Grid */}
                  {images.length > 0 && (
                    <div className="mb-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {images.map((image, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 border-2 border-gray-300"
                          >
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <Chip
                              size="sm"
                              className="absolute bottom-1 left-1 bg-gray-800 text-white"
                            >
                              {index + 1}
                            </Chip>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Đã chọn {images.length} / 5 ảnh
                      </p>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mb-4">
                      <Progress
                        size="md"
                        value={uploadProgress}
                        className="max-w-md"
                        color="primary"
                        aria-label="Tiến trình tải lên"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Đang tải lên... {uploadProgress}%
                      </p>
                    </div>
                  )}

                  {/* Upload Button */}
                  {images.length < 5 && (
                    <div>
                      <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100">
                        <Upload className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {images.length === 0
                            ? "Nhấp để tải ảnh lên hoặc kéo thả"
                            : "Thêm ảnh"}
                        </span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={createReport.isPending}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG, GIF tối đa 5 ảnh, mỗi ảnh 5MB
                      </p>
                    </div>
                  )}

                  {images.length === 5 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        ✓ Đã đạt số lượng ảnh tối đa
                      </p>
                    </div>
                  )}
                </div>

                {!isAuthenticated && (
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Thông Tin Của Bạn (Không bắt buộc)
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Giúp chúng tôi liên hệ với bạn để cập nhật hoặc biết thêm
                      thông tin
                    </p>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên Của Bạn
                      </label>
                      <Input
                        type="text"
                        placeholder="Nhập tên của bạn"
                        value={formData.contact_name}
                        onChange={(e) =>
                          handleChange("contact_name", e.target.value)
                        }
                        size="lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số Điện Thoại
                      </label>
                      <Input
                        type="tel"
                        placeholder="Nhập số điện thoại của bạn"
                        value={formData.contact_phone}
                        onChange={(e) =>
                          handleChange("contact_phone", e.target.value)
                        }
                        size="lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa Chỉ Email
                      </label>
                      <Input
                        type="email"
                        placeholder="Nhập địa chỉ email của bạn"
                        value={formData.contact_email}
                        onChange={(e) =>
                          handleChange("contact_email", e.target.value)
                        }
                        size="lg"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="bordered"
                    size="lg"
                    className="flex-1"
                    onPress={() => navigate("/")}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    className="flex-1 font-semibold"
                    isLoading={createReport.isPending}
                  >
                    Gửi Báo Cáo
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
};
