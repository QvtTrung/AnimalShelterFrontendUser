import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Input,
  Select,
  SelectItem,
  Checkbox,
} from "@nextui-org/react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Heart,
  Share2,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { usePet } from "../hooks/usePets";
import { useCreateAdoption } from "../hooks/useAdoptions";
import { useAuthStore } from "../store/auth.store";
import {
  translatePetSpecies,
  translatePetStatus,
  translatePetSize,
  translatePetGender,
} from "../utils/translations";

export const PetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Adoption form state
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    address: "",
    housing_type: "",
    housing_area: "",
    has_yard: false,
    pet_experience: "",
    adoption_reason: "",
    care_commitment: "",
    notes: "",
  });

  const { data: petData, isLoading, isError } = usePet(id || "");
  const createAdoption = useCreateAdoption();

  const pet = petData?.data;

  const handleAdoptClick = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/pets/${id}` } } });
      return;
    }
    onOpen();
  };

  const handleSubmitAdoption = async () => {
    if (!pet) return;

    // Validate required fields
    if (
      !formData.full_name ||
      !formData.phone_number ||
      !formData.email ||
      !formData.address ||
      !formData.housing_type ||
      !formData.adoption_reason
    ) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc (đánh dấu *)");
      return;
    }

    try {
      await createAdoption.mutateAsync({
        pet_id: pet.id,
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        email: formData.email,
        address: formData.address,
        housing_type: formData.housing_type as "apartment" | "house" | "villa",
        housing_area: formData.housing_area
          ? parseInt(formData.housing_area)
          : undefined,
        has_yard: formData.has_yard,
        pet_experience: formData.pet_experience || undefined,
        adoption_reason: formData.adoption_reason,
        care_commitment: formData.care_commitment || undefined,
        notes: formData.notes || undefined,
      });
      onOpenChange();
      // Reset form
      setFormData({
        full_name: "",
        phone_number: "",
        email: "",
        address: "",
        housing_type: "",
        housing_area: "",
        has_yard: false,
        pet_experience: "",
        adoption_reason: "",
        care_commitment: "",
        notes: "",
      });
      toast.success(
        "Đơn xin nhận nuôi đã gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm."
      );
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to submit adoption:", error);
      toast.error("Gửi đơn xin nhận nuôi thất bại. Vui lòng thử lại.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (isError || !pet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardBody className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Không Tìm Thấy Thú Cưng
            </h2>
            <p className="text-gray-600 mb-6">
              Thú cưng bạn đang tìm không tồn tại hoặc đã bị xóa.
            </p>
            <Button
              as={Link}
              to="/pets"
              color="primary"
              variant="flat"
              startContent={<ArrowLeft className="w-4 h-4" />}
            >
              Quay Lại Danh Sách Thú Cưng
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            as={Link}
            to="/pets"
            variant="light"
            startContent={<ArrowLeft className="w-4 h-4" />}
          >
            Quay Lại Danh Sách Thú Cưng
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-200 shadow-lg cursor-pointer group">
              <img
                src={
                  pet.images?.[selectedImageIndex]?.image_url ||
                  "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image"
                }
                alt={pet.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <Chip
                color={pet.status === "available" ? "success" : "default"}
                className="absolute top-4 right-4"
                size="lg"
                variant="flat"
              >
                {translatePetStatus(pet.status)}
              </Chip>
            </div>

            {/* Thumbnail Gallery */}
            {pet.images && pet.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {pet.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden bg-gray-200 transition-all duration-200 hover:ring-4 hover:ring-blue-400 ${
                      selectedImageIndex === index
                        ? "ring-4 ring-blue-500"
                        : "ring-2 ring-gray-300"
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={`${pet.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
                    {pet.name}
                  </h1>
                  <p className="text-xl text-gray-600">
                    {translatePetSpecies(pet.species)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button isIconOnly variant="flat" color="danger">
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button isIconOnly variant="flat">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-3 mb-6">
                {pet.age && (
                  <Chip
                    size="lg"
                    variant="flat"
                    startContent={<Calendar className="w-4 h-4" />}
                  >
                    {pet.age}{" "}
                    {pet.age_unit === "years"
                      ? "tuổi"
                      : pet.age_unit === "months"
                      ? "tháng"
                      : pet.age_unit}
                  </Chip>
                )}
                {pet.size && (
                  <Chip size="lg" variant="flat">
                    {translatePetSize(pet.size)}
                  </Chip>
                )}
                {pet.gender && (
                  <Chip size="lg" variant="flat">
                    {translatePetGender(pet.gender)}
                  </Chip>
                )}
                {pet.location && (
                  <Chip
                    size="lg"
                    variant="flat"
                    startContent={<MapPin className="w-4 h-4" />}
                  >
                    {pet.location}
                  </Chip>
                )}
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardBody className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Về {pet.name}
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {pet.description ||
                    `${pet.name} là một ${translatePetSpecies(
                      pet.species
                    ).toLowerCase()} tuyệt vời đang tìm kiếm một ngôi nhà ấm áp. Người bạn đáng yêu này đang chờ để mang niềm vui đến gia đình bạn!`}
                </p>
              </CardBody>
            </Card>

            {/* Medical Info */}
            {(pet.medical_history || pet.vaccination_status) && (
              <Card>
                <CardBody className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Thông Tin Y Tế
                  </h2>
                  <div className="space-y-2">
                    {pet.vaccination_status && (
                      <div className="flex items-center gap-2">
                        <Chip color="success" size="sm">
                          ✓
                        </Chip>
                        <span className="text-gray-700">
                          Tiêm chủng: {pet.vaccination_status}
                        </span>
                      </div>
                    )}
                    {pet.medical_history && (
                      <p className="text-gray-600 mt-2">
                        {pet.medical_history}
                      </p>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Adoption Button */}
            {pet.status === "available" && (
              <Button
                color="primary"
                size="lg"
                className="w-full font-bold text-lg py-6 h-14"
                onPress={handleAdoptClick}
                isLoading={createAdoption.isPending}
              >
                Nhận Nuôi {pet.name}
              </Button>
            )}

            {pet.status === "adopted" && (
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <p className="text-gray-600 font-medium">
                  {pet.name} đã được nhận nuôi và tìm được một ngôi nhà ấm áp!
                  ❤️
                </p>
              </div>
            )}

            {pet.status === "pending" && (
              <div className="bg-yellow-50 rounded-lg p-6 text-center">
                <p className="text-yellow-800 font-medium">
                  {pet.name} có đơn xin nhận nuôi đang chờ duyệt.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Adoption Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold">
                  Đơn Xin Nhận Nuôi {pet.name}
                </h2>
                <p className="text-sm text-gray-600 font-normal">
                  Vui lòng điền đầy đủ thông tin để chúng tôi có thể xem xét đơn
                  của bạn
                </p>
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="space-y-6">
                  {/* Info Banner */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Lưu ý:</strong> Các trường đánh dấu (*) là bắt
                      buộc. Sau khi gửi, chúng tôi sẽ liên hệ với bạn trong vòng
                      2-3 ngày làm việc.
                    </p>
                  </div>

                  {/* Section 1: Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      1. Thông Tin Liên Hệ
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Họ và Tên"
                        placeholder="Nguyễn Văn A"
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            full_name: e.target.value,
                          })
                        }
                        isRequired
                        variant="bordered"
                      />
                      <Input
                        label="Số Điện Thoại"
                        placeholder="0912345678"
                        value={formData.phone_number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phone_number: e.target.value,
                          })
                        }
                        isRequired
                        variant="bordered"
                      />
                      <Input
                        label="Email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        isRequired
                        variant="bordered"
                      />
                      <Input
                        label="Địa Chỉ"
                        placeholder="123 Đường ABC, Quận XYZ"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        isRequired
                        variant="bordered"
                      />
                    </div>
                  </div>

                  {/* Section 2: Housing Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      2. Thông Tin Nhà Ở
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Loại Nhà Ở"
                        placeholder="Chọn loại nhà ở"
                        selectedKeys={
                          formData.housing_type ? [formData.housing_type] : []
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            housing_type: e.target.value,
                          })
                        }
                        isRequired
                        variant="bordered"
                      >
                        <SelectItem key="apartment" value="apartment">
                          Chung cư
                        </SelectItem>
                        <SelectItem key="house" value="house">
                          Nhà riêng
                        </SelectItem>
                        <SelectItem key="villa" value="villa">
                          Biệt thự
                        </SelectItem>
                      </Select>
                      <Input
                        label="Diện Tích (m²)"
                        type="number"
                        placeholder="50"
                        value={formData.housing_area}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            housing_area: e.target.value,
                          })
                        }
                        variant="bordered"
                      />
                    </div>
                    <div className="mt-4">
                      <Checkbox
                        isSelected={formData.has_yard}
                        onValueChange={(checked) =>
                          setFormData({ ...formData, has_yard: checked })
                        }
                      >
                        Nhà có sân vườn/không gian ngoài trời
                      </Checkbox>
                    </div>
                  </div>

                  {/* Section 3: Experience & Commitment */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      3. Kinh Nghiệm và Cam Kết
                    </h3>
                    <div className="space-y-4">
                      <Textarea
                        label="Kinh Nghiệm Nuôi Thú Cưng"
                        placeholder="Bạn đã từng nuôi thú cưng chưa? Nếu có, hãy chia sẻ kinh nghiệm của bạn..."
                        value={formData.pet_experience}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pet_experience: e.target.value,
                          })
                        }
                        minRows={3}
                        variant="bordered"
                      />
                      <Textarea
                        label="Lý Do Muốn Nhận Nuôi"
                        placeholder="Tại sao bạn muốn nhận nuôi thú cưng này?"
                        value={formData.adoption_reason}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            adoption_reason: e.target.value,
                          })
                        }
                        isRequired
                        minRows={3}
                        variant="bordered"
                      />
                      <Textarea
                        label="Cam Kết Chăm Sóc"
                        placeholder="Bạn cam kết sẽ chăm sóc thú cưng như thế nào? (chi phí, thời gian, chăm sóc y tế...)"
                        value={formData.care_commitment}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            care_commitment: e.target.value,
                          })
                        }
                        minRows={3}
                        variant="bordered"
                      />
                    </div>
                  </div>

                  {/* Section 4: Additional Notes */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      4. Ghi Chú Thêm (Tùy chọn)
                    </h3>
                    <Textarea
                      placeholder="Bất kỳ thông tin nào khác bạn muốn chia sẻ..."
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      minRows={3}
                      variant="bordered"
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Hủy
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmitAdoption}
                  isLoading={createAdoption.isPending}
                  className="font-semibold"
                >
                  Gửi Đơn Xin Nhận Nuôi
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
