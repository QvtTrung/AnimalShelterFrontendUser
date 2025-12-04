import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Image,
} from "@nextui-org/react";
import { X, Upload, MapPin } from "lucide-react";
import { useUpdateMyReport, useDeleteReportImage } from "../hooks/useReports";
import { LocationPicker } from "./Map/LocationPicker";
import type { Report } from "../types";
import toast from "react-hot-toast";

interface ReportEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report;
}

export const ReportEditModal = ({
  isOpen,
  onClose,
  report,
}: ReportEditModalProps) => {
  // Initialize form data from report prop
  const initializeFormData = () => ({
    title: report.title,
    description: report.description,
    species: report.species,
    type: report.type,
    location: report.location,
    urgency_level: report.urgency_level,
    coordinates: report.coordinates,
  });

  const [formData, setFormData] = useState(initializeFormData);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const updateMutation = useUpdateMyReport();
  const deleteImageMutation = useDeleteReportImage();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(initializeFormData());
      setNewImages([]);
      setPreviewUrls([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);

    // Create preview URLs
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...urls]);
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imageId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hình ảnh này?")) {
      try {
        await deleteImageMutation.mutateAsync({
          reportId: report.id,
          imageId,
        });
        toast.success("Đã xóa hình ảnh thành công");
      } catch (error) {
        toast.error("Không thể xóa hình ảnh");
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const updateData = new FormData();

      // Append form fields
      updateData.append("title", formData.title);
      updateData.append("description", formData.description);
      updateData.append("species", formData.species);
      updateData.append("type", formData.type);
      updateData.append("location", formData.location);
      updateData.append("urgency_level", formData.urgency_level);

      if (formData.coordinates) {
        updateData.append("coordinates", JSON.stringify(formData.coordinates));
      }

      // Append new images
      newImages.forEach((file) => {
        updateData.append("images", file);
      });

      await updateMutation.mutateAsync({
        id: report.id,
        data: updateData,
      });

      toast.success("Cập nhật báo cáo thành công!");
      onClose();
    } catch (error) {
      console.error("Error updating report:", error);
      toast.error("Không thể cập nhật báo cáo. Vui lòng thử lại.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">Chỉnh Sửa Báo Cáo</h2>
          <p className="text-sm text-gray-500 font-normal">
            Cập nhật thông tin báo cáo của bạn
          </p>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Title */}
            <Input
              label="Tiêu Đề"
              placeholder="Nhập tiêu đề báo cáo"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              isRequired
            />

            {/* Description */}
            <Textarea
              label="Mô Tả"
              placeholder="Mô tả chi tiết tình trạng động vật"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              minRows={4}
              isRequired
            />

            {/* Species & Type */}
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Loài Động Vật"
                placeholder="Chọn loài động vật"
                selectedKeys={[formData.species]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    species: e.target.value as "Dog" | "Cat" | "Other",
                  })
                }
                disallowEmptySelection
                isRequired
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

              <Select
                label="Loại Báo Cáo"
                placeholder="Chọn loại báo cáo"
                selectedKeys={[formData.type]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as
                      | "abuse"
                      | "abandonment"
                      | "injured_animal"
                      | "other",
                  })
                }
                disallowEmptySelection
                isRequired
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

            {/* Urgency Level */}
            <Select
              label="Mức Độ Khẩn Cấp"
              placeholder="Chọn mức độ khẩn cấp"
              selectedKeys={[formData.urgency_level]}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  urgency_level: e.target.value as
                    | "low"
                    | "medium"
                    | "high"
                    | "critical",
                })
              }
              disallowEmptySelection
              isRequired
            >
              <SelectItem key="low" value="low">
                Thấp
              </SelectItem>
              <SelectItem key="medium" value="medium">
                Trung Bình
              </SelectItem>
              <SelectItem key="high" value="high">
                Cao
              </SelectItem>
              <SelectItem key="critical" value="critical">
                Khẩn Cấp
              </SelectItem>
            </Select>

            {/* Location */}
            <div>
              <Input
                label="Địa Điểm"
                placeholder="Nhập địa điểm"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                endContent={
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => setShowLocationPicker(!showLocationPicker)}
                    isIconOnly
                  >
                    <MapPin className="w-4 h-4" />
                  </Button>
                }
                isRequired
              />
              {showLocationPicker && (
                <div className="mt-2">
                  <LocationPicker
                    value={formData.coordinates}
                    onChange={(coords) => {
                      setFormData({
                        ...formData,
                        coordinates: coords,
                      });
                    }}
                    locationText={formData.location}
                    onLocationTextChange={(location) => {
                      setFormData({
                        ...formData,
                        location,
                      });
                    }}
                  />
                </div>
              )}
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình Ảnh Hiện Tại
              </label>
              {report.images && report.images.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {report.images.map((image) => (
                    <div key={image.id} className="relative group">
                      <Image
                        src={image.image_url}
                        alt="Report"
                        className="w-full aspect-square object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(image.id)}
                        disabled={deleteImageMutation.isPending}
                        className="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 disabled:opacity-50 shadow-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">Chưa có hình ảnh</p>
              )}

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thêm Hình Ảnh Mới
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Nhấn để chọn hình ảnh
                  </span>
                </label>
              </div>

              {/* Preview new images */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full aspect-square object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="flat" onPress={onClose}>
            Hủy
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={updateMutation.isPending}
          >
            Cập Nhật
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
