import { useParams, Link, useNavigate } from "react-router-dom";
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
  Select,
  SelectItem,
} from "@nextui-org/react";
import {
  ArrowLeft,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  PlayCircle,
  XCircle,
  Save,
} from "lucide-react";
import {
  useRescue,
  useJoinRescue,
  useStartRescue,
  useCancelRescue,
  useCompleteRescue,
  useUpdateReportProgress,
} from "../hooks/useRescues";
import { useAuthStore } from "../store/auth.store";
import toast from "react-hot-toast";
import { RescueMap } from "../components/Map/RescueMap";
import { useState } from "react";

export const RescueDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isStartOpen,
    onOpen: onStartOpen,
    onOpenChange: onStartOpenChange,
  } = useDisclosure();
  const {
    isOpen: isCancelOpen,
    onOpen: onCancelOpen,
    onOpenChange: onCancelOpenChange,
  } = useDisclosure();
  const {
    isOpen: isCompleteOpen,
    onOpen: onCompleteOpen,
    onOpenChange: onCompleteOpenChange,
  } = useDisclosure();
  const {
    isOpen: isProgressOpen,
    onOpen: onProgressOpen,
    onOpenChange: onProgressOpenChange,
  } = useDisclosure();

  const [cancelReason, setCancelReason] = useState("");
  const [selectedReportProgress, setSelectedReportProgress] = useState<{
    rescueReportId: string;
    currentStatus: string;
    reportTitle: string;
  } | null>(null);
  const [progressStatus, setProgressStatus] = useState<
    "in_progress" | "success" | "cancelled"
  >("in_progress");
  const [progressNote, setProgressNote] = useState("");

  const { data: rescueData, isLoading, isError } = useRescue(id || "");
  const joinRescueMutation = useJoinRescue();
  const startRescueMutation = useStartRescue();
  const cancelRescueMutation = useCancelRescue();
  const completeRescueMutation = useCompleteRescue();
  const updateProgressMutation = useUpdateReportProgress();

  const rescue = rescueData?.data;

  // Check if current user is a participant (either leader or member)
  const currentUserParticipant = rescue?.participants?.find(
    (p) => p.users_id === user?.id
  );
  const isLeader = currentUserParticipant?.role === "leader";
  const isMember = currentUserParticipant?.role === "member";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "warning";
      case "in_progress":
        return "primary";
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "warning";
    }
  };

  const handleJoinRescue = async () => {
    if (!id) return;

    if (!isAuthenticated) {
      toast.error("Đăng nhập để tham gia chiến dịch cứu hộ");
      onOpenChange();
      navigate("/login", { state: { from: { pathname: `/rescues/${id}` } } });
      return;
    }

    try {
      await joinRescueMutation.mutateAsync(id);
      toast.success(
        "Tham gia chiến dịch cứu hộ thành công! Kiểm tra bảng điều khiển của bạn."
      );
      onOpenChange();
    } catch (error: unknown) {
      console.error("Failed to join rescue:", error);
      toast.error("Tham gia chiến dịch cứu hộ thất bại. Vui lòng thử lại.");
    }
  };

  const handleStartRescue = async () => {
    if (!id) return;
    try {
      await startRescueMutation.mutateAsync(id);
      toast.success("Bắt đầu chiến dịch cứu hộ thành công!");
      onStartOpenChange();
    } catch (error: unknown) {
      console.error("Failed to start rescue:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        "Bắt đầu chiến dịch cứu hộ thất bại. Vui lòng thử lại.";
      toast.error(errorMessage);
    }
  };

  const handleCancelRescue = async () => {
    if (!id) return;
    try {
      await cancelRescueMutation.mutateAsync({
        rescueId: id,
        reason: cancelReason,
      });
      toast.success("Hủy chiến dịch cứu hộ thành công!");
      setCancelReason("");
      onCancelOpenChange();
    } catch (error: unknown) {
      console.error("Failed to cancel rescue:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        "Hủy chiến dịch cứu hộ thất bại. Vui lòng thử lại.";
      toast.error(errorMessage);
    }
  };

  const handleCompleteRescue = async () => {
    if (!id) return;
    try {
      await completeRescueMutation.mutateAsync(id);
      toast.success("Hoàn thành chiến dịch cứu hộ thành công!");
      onCompleteOpenChange();
    } catch (error: unknown) {
      console.error("Failed to complete rescue:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        "Hoàn thành chiến dịch cứu hộ thất bại. Vui lòng thử lại.";
      toast.error(errorMessage);
    }
  };

  const handleOpenProgressModal = (rescueReport: {
    id: string;
    report_id: string;
    status: string;
    note?: string;
    report?: { title?: string };
  }) => {
    const reportId = rescueReport.report_id;
    const reportIdStr =
      typeof reportId === "string" ? reportId : String(reportId || "");

    setSelectedReportProgress({
      rescueReportId: rescueReport.id,
      currentStatus: rescueReport.status,
      reportTitle:
        rescueReport.report?.title || `Report #${reportIdStr.substring(0, 8)}`,
    });
    setProgressStatus(
      rescueReport.status === "success" || rescueReport.status === "cancelled"
        ? rescueReport.status
        : "in_progress"
    );
    setProgressNote(rescueReport.note || "");
    onProgressOpen();
  };

  const handleUpdateProgress = async () => {
    if (!selectedReportProgress) return;
    try {
      await updateProgressMutation.mutateAsync({
        rescueReportId: selectedReportProgress.rescueReportId,
        status: progressStatus,
        note: progressNote,
      });
      toast.success("Cập nhật tiến độ báo cáo thành công!");
      setSelectedReportProgress(null);
      onProgressOpenChange();
    } catch (error: unknown) {
      console.error("Failed to update progress:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Cập nhật tiến độ thất bại. Vui lòng thử lại.";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (isError || !rescue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardBody className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Không Tìm Thấy Chiến Dịch Cứu Hộ
            </h2>
            <p className="text-gray-600 mb-6">
              Chiến dịch cứu hộ bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
            <Button
              as={Link}
              to="/rescues"
              color="primary"
              variant="flat"
              startContent={<ArrowLeft className="w-4 h-4" />}
            >
              Quay Lại Danh Sách Cứu Hộ
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const currentParticipants = rescue.participants?.length || 0;
  const requiredParticipants = rescue.required_participants || 0;
  const isFull =
    requiredParticipants > 0 && currentParticipants >= requiredParticipants;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            as={Link}
            to="/rescues"
            variant="light"
            startContent={<ArrowLeft className="w-4 h-4" />}
          >
            Quay Lại Danh Sách Cứu Hộ
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title and Status - Full Width */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
                {rescue.title}
              </h1>
              <p className="text-xl text-gray-600">Chiến Dịch Cứu Hộ</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <Chip
              color={getStatusColor(rescue.status)}
              size="lg"
              variant="flat"
            >
              {rescue.status}
            </Chip>
            {isFull && (
              <Chip color="danger" size="lg" variant="flat">
                Đầy - Không Còn Chỗ
              </Chip>
            )}
            {isLeader && (
              <Chip color="success" size="lg" variant="flat">
                Bạn Là Trưởng Nhóm
              </Chip>
            )}
            {isMember && (
              <Chip color="primary" size="lg" variant="flat">
                Bạn Là Thành Viên
              </Chip>
            )}
          </div>

          {/* Info message for members */}
          {isMember &&
            (rescue.status === "planned" ||
              rescue.status === "in_progress") && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Bạn là thành viên của chiến dịch cứu
                  hộ này. Chỉ có trưởng nhóm mới có thể bắt đầu, hoàn thành, hủy
                  chiến dịch hoặc cập nhật tiến độ báo cáo.
                </p>
              </div>
            )}
        </div>

        {/* Single Column Layout */}
        <div className="space-y-6">
          {/* Campaign Information - Merged Component */}
          <Card>
            <CardBody className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Thông Tin Chiến Dịch
              </h2>

              {/* Description Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Giới Thiệu
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {rescue.description ||
                    "Tham gia chiến dịch cứu hộ này để giúp cứu các động vật cần giúp đỡ. Sự tham gia của bạn tạo nên sự khác biệt thật sự."}
                </p>
              </div>

              {/* Details Grid */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Chi Tiết
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Start Date */}
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Calendar className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ngày Bắt Đầu</p>
                      <p className="text-gray-900 font-medium">
                        {rescue.start_date
                          ? new Date(rescue.start_date).toLocaleDateString(
                              "vi-VN",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "Sẽ thông báo sau"}
                      </p>
                    </div>
                  </div>

                  {/* End Date */}
                  {rescue.end_date && (
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <Calendar className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Ngày Kết Thúc</p>
                        <p className="text-gray-900 font-medium">
                          {new Date(rescue.end_date).toLocaleDateString(
                            "vi-VN",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Participants */}
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Người Tham Gia</p>
                      <p className="text-gray-900 font-medium">
                        {currentParticipants}
                        {requiredParticipants > 0 &&
                          ` / ${requiredParticipants}`}{" "}
                        tình nguyện viên
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Related Reports */}
          {rescue.reports && rescue.reports.length > 0 && (
            <>
              <Card>
                <CardBody className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Báo Cáo Liên Quan
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rescue.reports.map((rescueReport) => {
                      const reportId = rescueReport.report_id;
                      const reportIdStr =
                        typeof reportId === "string"
                          ? reportId
                          : String(reportId || "");

                      return (
                        <div
                          key={rescueReport.id}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-gray-900">
                                {rescueReport.report?.title ||
                                  `Báo cáo #${reportIdStr.substring(0, 8)}`}
                              </p>
                              <Chip
                                size="sm"
                                color={
                                  rescueReport.status === "success"
                                    ? "success"
                                    : rescueReport.status === "cancelled"
                                    ? "danger"
                                    : "warning"
                                }
                              >
                                {rescueReport.status === "in_progress"
                                  ? "Đang Xử Lý"
                                  : rescueReport.status === "success"
                                  ? "Thành Công"
                                  : "Đã Hủy"}
                              </Chip>
                            </div>
                            {rescueReport.note && (
                              <p className="text-sm text-gray-600">
                                {rescueReport.note}
                              </p>
                            )}
                            {rescueReport.report?.location && (
                              <p className="text-sm text-gray-500">
                                📍 {rescueReport.report.location}
                              </p>
                            )}
                            <div className="flex gap-2 mt-2">
                              {isLeader && rescue.status === "in_progress" && (
                                <Button
                                  size="sm"
                                  variant="flat"
                                  color="primary"
                                  className="flex-1"
                                  onPress={() =>
                                    handleOpenProgressModal(rescueReport)
                                  }
                                >
                                  Cập Nhật
                                </Button>
                              )}
                              <Button
                                as={Link}
                                to={`/reports/${reportIdStr}`}
                                size="sm"
                                variant="flat"
                                color="default"
                                className="flex-1"
                              >
                                Xem Chi Tiết
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>

              {/* Map with Report Locations */}
              <Card className="relative z-0">
                <CardBody className="p-0">
                  <div className="h-[600px] rounded-lg overflow-hidden relative z-0">
                    <RescueMap reports={rescue.reports} />
                  </div>
                </CardBody>
              </Card>
            </>
          )}
        </div>

        {/* Action Buttons - Full Width Below Grid */}
        <div className="mt-6 space-y-4">
          {isLeader && rescue.status === "planned" && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                color="primary"
                size="lg"
                className="flex-1 font-bold"
                onPress={onStartOpen}
                startContent={<PlayCircle className="w-5 h-5" />}
              >
                Bắt Đầu Chiến Dịch Cứu Hộ
              </Button>
              <Button
                color="danger"
                size="lg"
                variant="flat"
                className="flex-1 font-bold"
                onPress={onCancelOpen}
                startContent={<XCircle className="w-5 h-5" />}
              >
                Hủy Chiến Dịch
              </Button>
            </div>
          )}

          {isLeader && rescue.status === "in_progress" && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                color="success"
                size="lg"
                className="flex-1 font-bold"
                onPress={onCompleteOpen}
                startContent={<CheckCircle className="w-5 h-5" />}
              >
                Hoàn Thành Chiến Dịch
              </Button>
              <Button
                color="danger"
                size="lg"
                variant="flat"
                className="flex-1 font-bold"
                onPress={onCancelOpen}
                startContent={<XCircle className="w-5 h-5" />}
              >
                Hủy Chiến Dịch
              </Button>
            </div>
          )}

          {!isLeader &&
            (rescue.status === "planned" || rescue.status === "in_progress") &&
            !isFull && (
              <Button
                color="primary"
                size="lg"
                className="w-full font-bold text-lg py-6 h-14"
                onPress={onOpen}
                startContent={<UserPlus className="w-5 h-5" />}
              >
                Tham Gia Chiến Dịch Cứu Hộ
              </Button>
            )}

          {!isLeader && isFull && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-orange-600 mx-auto mb-2" />
              <p className="text-orange-800 font-medium">
                Chiến dịch cứu hộ này đã đạt số lượng người tham gia tối đa.
              </p>
            </div>
          )}

          {rescue.status === "completed" && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-semibold">
                Chiến dịch cứu hộ này đã hoàn thành thành công. Cảm ơn tất cả
                tình nguyện viên!
              </p>
            </div>
          )}

          {rescue.status === "cancelled" && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800 font-medium">
                Chiến dịch cứu hộ này đã bị hủy.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Join Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold">
                  Tham Gia Chiến Dịch Cứu Hộ
                </h2>
                <p className="text-sm text-gray-600 font-normal">
                  Trở thành tình nguyện viên cho nhiệm vụ cứu hộ này
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  {!isAuthenticated && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Bạn cần đăng nhập để tham gia chiến dịch cứu hộ. Vui
                        lòng đăng nhập hoặc đăng ký trước.
                      </p>
                    </div>
                  )}
                  {isAuthenticated && (
                    <>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Lưu ý:</strong> Sau khi tham gia, chiến dịch
                          này sẽ xuất hiện trong bảng điều khiển của bạn. Vui
                          lòng cam kết tham gia nhiệm vụ cứu hộ.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-700 font-medium">
                          Chi Tiết Chiến Dịch:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          <li>
                            Trạng thái: <strong>{rescue.status}</strong>
                          </li>
                          {rescue.start_date && (
                            <li>
                              Ngày bắt đầu:{" "}
                              {new Date(rescue.start_date).toLocaleDateString(
                                "vi-VN"
                              )}
                            </li>
                          )}
                          <li>
                            Người tham gia hiện tại: {currentParticipants}
                            {requiredParticipants > 0 &&
                              ` / ${requiredParticipants}`}
                          </li>
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
                  onPress={handleJoinRescue}
                  isLoading={joinRescueMutation.isPending}
                  isDisabled={!isAuthenticated}
                  className="font-semibold"
                >
                  {isAuthenticated ? "Tham Gia Chiến Dịch" : "Cần Đăng Nhập"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Start Rescue Modal */}
      <Modal isOpen={isStartOpen} onOpenChange={onStartOpenChange} size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold">
                    Bắt Đầu Chiến Dịch Cứu Hộ
                  </h2>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Hành động này sẽ:</strong>
                    </p>
                    <ul className="list-disc list-inside text-sm text-blue-800 mt-2 space-y-1">
                      <li>Thay đổi trạng thái cứu hộ thành "Đang Thực Hiện"</li>
                      <li>Thông báo cho tất cả người tham gia</li>
                      <li>Cho phép bạn theo dõi và cập nhật tiến độ báo cáo</li>
                    </ul>
                  </div>
                  <p className="text-gray-700">
                    Bạn có chắc chắn muốn bắt đầu chiến dịch cứu hộ này?
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Hủy
                </Button>
                <Button
                  color="primary"
                  onPress={handleStartRescue}
                  isLoading={startRescueMutation.isPending}
                  startContent={<PlayCircle className="w-4 h-4" />}
                >
                  Bắt Đầu Chiến Dịch
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Cancel Rescue Modal */}
      <Modal isOpen={isCancelOpen} onOpenChange={onCancelOpenChange} size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-red-500" />
                  <h2 className="text-2xl font-bold">Hủy Chiến Dịch Cứu Hộ</h2>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Cảnh báo:</strong> Tất cả báo cáo được phân công
                      sẽ được trả về trạng thái chờ xử lý.
                    </p>
                  </div>
                  <p className="text-gray-700">
                    Bạn có chắc chắn muốn hủy chiến dịch cứu hộ này?
                  </p>
                  <Textarea
                    label="Lý do hủy (không bắt buộc)"
                    placeholder="Nhập lý do..."
                    value={cancelReason}
                    onValueChange={setCancelReason}
                    minRows={3}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Quay Lại
                </Button>
                <Button
                  color="danger"
                  onPress={handleCancelRescue}
                  isLoading={cancelRescueMutation.isPending}
                  startContent={<XCircle className="w-4 h-4" />}
                >
                  Hủy Chiến Dịch
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Complete Rescue Modal */}
      <Modal
        isOpen={isCompleteOpen}
        onOpenChange={onCompleteOpenChange}
        size="md"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <h2 className="text-2xl font-bold">
                    Hoàn Thành Chiến Dịch Cứu Hộ
                  </h2>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Hành động này sẽ:</strong>
                    </p>
                    <ul className="list-disc list-inside text-sm text-green-800 mt-2 space-y-1">
                      <li>Đánh dấu cứu hộ là "Hoàn Thành"</li>
                      <li>
                        Cập nhật tất cả báo cáo thành công thành "Đã Giải Quyết"
                      </li>
                      <li>
                        Trả lại báo cáo bị hủy/chưa hoàn thành về "Đang Chờ Xử
                        Lý"
                      </li>
                      <li>
                        Thông báo cho tất cả người tham gia về việc hoàn thành
                      </li>
                    </ul>
                  </div>
                  <p className="text-gray-700">
                    Bạn có chắc chắn muốn hoàn thành chiến dịch cứu hộ này?
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Hủy
                </Button>
                <Button
                  color="success"
                  onPress={handleCompleteRescue}
                  isLoading={completeRescueMutation.isPending}
                  startContent={<CheckCircle className="w-4 h-4" />}
                >
                  Hoàn Thành Chiến Dịch
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Update Report Progress Modal */}
      <Modal
        isOpen={isProgressOpen}
        onOpenChange={onProgressOpenChange}
        size="md"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-2">
                  <Save className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold">
                    Cập Nhật Tiến Độ Báo Cáo
                  </h2>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="font-medium text-gray-900">
                      {selectedReportProgress?.reportTitle}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Trạng thái hiện tại:{" "}
                      {selectedReportProgress?.currentStatus}
                    </p>
                  </div>

                  <Select
                    label="Trạng Thái Mới"
                    placeholder="Chọn trạng thái"
                    selectedKeys={[progressStatus]}
                    onChange={(e) =>
                      setProgressStatus(
                        e.target.value as
                          | "in_progress"
                          | "success"
                          | "cancelled"
                      )
                    }
                  >
                    <SelectItem key="in_progress" value="in_progress">
                      Đang Thực Hiện
                    </SelectItem>
                    <SelectItem key="success" value="success">
                      Thành Công (Đã Cứu)
                    </SelectItem>
                    <SelectItem key="cancelled" value="cancelled">
                      Đã Hủy
                    </SelectItem>
                  </Select>

                  <Textarea
                    label="Ghi Chú Tiến Độ"
                    placeholder="Thêm ghi chú về tiến độ..."
                    value={progressNote}
                    onValueChange={setProgressNote}
                    minRows={3}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Hủy
                </Button>
                <Button
                  color="primary"
                  onPress={handleUpdateProgress}
                  isLoading={updateProgressMutation.isPending}
                  startContent={<Save className="w-4 h-4" />}
                >
                  Cập Nhật Tiến Độ
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
