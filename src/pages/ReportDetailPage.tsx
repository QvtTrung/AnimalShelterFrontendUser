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
} from "@nextui-org/react";
import {
  ArrowLeft,
  AlertTriangle,
  User,
  Phone,
  Mail,
  CheckCircle,
  Calendar,
  Info,
} from "lucide-react";
import { useReport, useClaimReport } from "../hooks/useReports";
import { useAuthStore } from "../store/auth.store";
import toast from "react-hot-toast";
import { ReportMap } from "../components/Map/ReportMap";

export const ReportDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { data: reportData, isLoading, isError } = useReport(id || "");
  const claimReportMutation = useClaimReport();

  const report = reportData?.data;

  // Debug: Log the report data to check user_created
  console.log("[ReportDetailPage] Report data:", report);
  console.log("[ReportDetailPage] user_created field:", report?.user_created);
  console.log(
    "[ReportDetailPage] user_created type:",
    typeof report?.user_created
  );

  // Extract user info from user_created field for reporter fallback
  const getUserInfo = () => {
    if (!report?.user_created || typeof report.user_created === "string") {
      return null;
    }

    const user = report.user_created as Record<string, unknown>;
    return {
      name:
        user.first_name || user.last_name
          ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
          : undefined,
      email: typeof user.email === "string" ? user.email : undefined,
    };
  };

  const reporterInfo = getUserInfo();

  // Debug: Log extracted reporter info
  console.log("[ReportDetailPage] Extracted reporterInfo:", reporterInfo);

  // Determine which contact info to display (explicit contact or fallback to user_created)
  const displayName = report?.contact_name || reporterInfo?.name || undefined;
  const displayEmail =
    report?.contact_email || reporterInfo?.email || undefined;
  const displayPhone = report?.contact_phone || undefined;

  const hasContactInfo = displayName || displayEmail || displayPhone;

  // Debug: Log contact info calculation
  console.log("[ReportDetailPage] Display name:", displayName);
  console.log("[ReportDetailPage] Display email:", displayEmail);
  console.log("[ReportDetailPage] Display phone:", displayPhone);
  console.log("[ReportDetailPage] hasContactInfo:", hasContactInfo);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "danger";
      case "high":
        return "warning";
      case "medium":
        return "primary";
      case "low":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "assigned":
        return "primary";
      case "resolved":
        return "success";
      default:
        return "default";
    }
  };

  const handleClaimReport = async () => {
    if (!id) return;

    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để nhận báo cáo");
      onOpenChange();
      navigate("/login", { state: { from: { pathname: `/reports/${id}` } } });
      return;
    }

    try {
      await claimReportMutation.mutateAsync(id);
      toast.success(
        "Nhận báo cáo thành công! Kiểm tra bảng điều khiển của bạn."
      );
      onOpenChange();
    } catch (error) {
      console.error("Failed to claim report:", error);
      toast.error("Nhận báo cáo thất bại. Vui lòng thử lại.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardBody className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Không Tìm Thấy Báo Cáo
            </h2>
            <p className="text-gray-600 mb-6">
              Báo cáo bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
            <Button
              as={Link}
              to="/reports"
              color="primary"
              variant="flat"
              startContent={<ArrowLeft className="w-4 h-4" />}
            >
              Quay Lại Danh Sách Báo Cáo
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation - NOT Sticky */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            as={Link}
            to="/reports"
            variant="light"
            size="lg"
            startContent={<ArrowLeft className="w-5 h-5" />}
          >
            Quay Lại Danh Sách Báo Cáo
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div
          className={`grid grid-cols-1 gap-6 ${
            hasContactInfo ? "lg:grid-cols-3" : "lg:grid-cols-1"
          }`}
        >
          {/* Main Content - Left Column (2/3 or full width) */}
          <div className={hasContactInfo ? "lg:col-span-2" : "lg:col-span-1"}>
            <div className="space-y-5">
              {/* Title and Status */}
              <Card className="shadow-sm">
                <CardBody className="p-5">
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-2">
                    {report.title}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <span className="capitalize font-medium">
                      {report.species}
                    </span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {report.date_created
                          ? new Date(report.date_created).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Chip
                      color={getUrgencyColor(report.urgency_level)}
                      size="sm"
                      variant="solid"
                      className="font-semibold capitalize"
                    >
                      {report.urgency_level} urgency
                    </Chip>
                    <Chip
                      color={getStatusColor(report.status)}
                      size="sm"
                      variant="flat"
                      className="capitalize"
                    >
                      {report.status}
                    </Chip>
                    <Chip size="sm" variant="flat" className="capitalize">
                      {report.type.replace("_", " ")}
                    </Chip>
                  </div>
                </CardBody>
              </Card>

              {/* Images - Consistent layout for 1-5 images */}
              {report.images && report.images.length > 0 && (
                <Card className="shadow-sm">
                  <CardBody className="p-4">
                    <div
                      className={`grid gap-3 ${
                        report.images.length === 1
                          ? "grid-cols-1"
                          : report.images.length === 2
                          ? "grid-cols-2"
                          : report.images.length === 3
                          ? "grid-cols-3"
                          : report.images.length === 4
                          ? "grid-cols-2 md:grid-cols-4"
                          : "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
                      }`}
                    >
                      {report.images?.slice(0, 5).map((image, index) => (
                        <div
                          key={index}
                          className={`rounded-lg overflow-hidden bg-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                            report.images && report.images.length === 1
                              ? "aspect-video max-h-96"
                              : "aspect-square"
                          }`}
                        >
                          <img
                            src={image.image_url}
                            alt={`${report.title} ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Description */}
              <Card className="shadow-sm">
                <CardBody className="p-5">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary-500" />
                    Mô Tả
                  </h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                    {report.description}
                  </p>
                </CardBody>
              </Card>

              {/* Location & Map with z-0 to prevent overlap */}
              <div className="relative z-0">
                <ReportMap
                  title={report.title}
                  location={report.location}
                  coordinates={report.coordinates}
                />
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column (1/3) - Only render if there's contact info */}
          {hasContactInfo && (
            <div className="lg:col-span-1">
              {/* Contact Information */}
              <Card className="lg:sticky lg:top-24 shadow-sm">
                <CardBody className="p-5">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Thông Tin Liên Hệ
                  </h2>
                  <div className="space-y-3">
                    {displayName && (
                      <div className="flex items-start gap-2.5">
                        <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
                            Tên
                          </p>
                          <p className="text-gray-900 font-medium text-sm">
                            {displayName}
                          </p>
                          {reporterInfo && !report?.contact_name && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              (Người Báo Cáo)
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {displayPhone && (
                      <div className="flex items-start gap-2.5">
                        <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Phone className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
                            SĐT
                          </p>
                          <a
                            href={`tel:${displayPhone}`}
                            className="text-primary-600 hover:text-primary-700 font-medium hover:underline text-sm"
                          >
                            {displayPhone}
                          </a>
                        </div>
                      </div>
                    )}
                    {displayEmail && (
                      <div className="flex items-start gap-2.5">
                        <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Mail className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
                            Email
                          </p>
                          <a
                            href={`mailto:${displayEmail}`}
                            className="text-primary-600 hover:text-primary-700 font-medium hover:underline break-all text-sm"
                          >
                            {displayEmail}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Claim Button - Only show for pending reports */}
                  {report.status === "pending" && (
                    <div className="mt-5 pt-4 border-t border-gray-200">
                      <Button
                        color={
                          report.urgency_level === "critical" ||
                          report.urgency_level === "high"
                            ? "danger"
                            : "primary"
                        }
                        size="md"
                        className="w-full font-semibold"
                        onPress={onOpen}
                        startContent={<CheckCircle className="w-4 h-4" />}
                      >
                        Nhận Báo Cáo
                      </Button>
                    </div>
                  )}

                  {/* Status Notes for Assigned/Resolved Reports */}
                  {report.status === "assigned" && (
                    <div className="mt-5 pt-4 border-t border-gray-200">
                      <div className="bg-primary-50 rounded-lg p-6 text-center">
                        <p className="text-primary-800 font-medium">
                          Báo cáo này đã được nhận và đang được xử lý. 🚑
                        </p>
                      </div>
                    </div>
                  )}

                  {report.status === "resolved" && (
                    <div className="mt-5 pt-4 border-t border-gray-200">
                      <div className="bg-green-50 rounded-lg p-6 text-center">
                        <p className="text-green-800 font-medium">
                          Báo cáo này đã được giải quyết thành công! ✅
                        </p>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Claim Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold">Nhận Báo Cáo</h2>
                <p className="text-sm text-gray-600 font-normal">
                  Cam kết giúp đỡ động vật cần giúp này
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  {!isAuthenticated && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Bạn cần đăng nhập để nhận báo cáo. Vui lòng đăng nhập
                        hoặc đăng ký trước.
                      </p>
                    </div>
                  )}
                  {isAuthenticated && (
                    <>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Lưu ý:</strong> Một chiến dịch cứu hộ sẽ được
                          tạo và báo cáo này sẽ xuất hiện trong bảng điều khiển
                          của bạn. Vui lòng phối hợp với người báo cáo và thực
                          hiện hành động cần thiết.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-700 font-medium">
                          Chi Tiết Báo Cáo:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          <li className="capitalize">
                            Mức độ khẩn cấp:{" "}
                            <strong>{report.urgency_level}</strong>
                          </li>
                          <li>Vị trí: {report.location}</li>
                          <li className="capitalize">Loài: {report.species}</li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Hủy
                </Button>
                <Button
                  color="primary"
                  onPress={handleClaimReport}
                  isLoading={claimReportMutation.isPending}
                  isDisabled={!isAuthenticated}
                  className="font-semibold"
                >
                  {isAuthenticated ? "Nhận Báo Cáo" : "Cần Đăng Nhập"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
