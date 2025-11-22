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
      toast.error("Please login to join a rescue campaign");
      onOpenChange();
      navigate("/login", { state: { from: { pathname: `/rescues/${id}` } } });
      return;
    }

    try {
      await joinRescueMutation.mutateAsync(id);
      toast.success(
        "Joined rescue campaign successfully! Check your dashboard."
      );
      onOpenChange();
    } catch (error: unknown) {
      console.error("Failed to join rescue:", error);
      toast.error("Failed to join rescue campaign. Please try again.");
    }
  };

  const handleStartRescue = async () => {
    if (!id) return;
    try {
      await startRescueMutation.mutateAsync(id);
      toast.success("Rescue campaign started successfully!");
      onStartOpenChange();
    } catch (error: unknown) {
      console.error("Failed to start rescue:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        "Failed to start rescue campaign. Please try again.";
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
      toast.success("Rescue campaign cancelled successfully!");
      setCancelReason("");
      onCancelOpenChange();
    } catch (error: unknown) {
      console.error("Failed to cancel rescue:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        "Failed to cancel rescue campaign. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleCompleteRescue = async () => {
    if (!id) return;
    try {
      await completeRescueMutation.mutateAsync(id);
      toast.success("Rescue campaign completed successfully!");
      onCompleteOpenChange();
    } catch (error: unknown) {
      console.error("Failed to complete rescue:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        "Failed to complete rescue campaign. Please try again.";
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
      toast.success("Report progress updated successfully!");
      setSelectedReportProgress(null);
      onProgressOpenChange();
    } catch (error: unknown) {
      console.error("Failed to update progress:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to update progress. Please try again.";
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
              Rescue Campaign Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The rescue campaign you're looking for doesn't exist or has been
              removed.
            </p>
            <Button
              as={Link}
              to="/rescues"
              color="primary"
              variant="flat"
              startContent={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Rescues
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            as={Link}
            to="/rescues"
            variant="light"
            startContent={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Rescues
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {/* Title and Status */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
                  {rescue.title}
                </h1>
                <p className="text-xl text-gray-600">Rescue Campaign</p>
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
                  Full - No more slots
                </Chip>
              )}
              {isLeader && (
                <Chip color="success" size="lg" variant="flat">
                  You are the Leader
                </Chip>
              )}
              {isMember && (
                <Chip color="primary" size="lg" variant="flat">
                  You are a Member
                </Chip>
              )}
            </div>

            {/* Info message for members */}
            {isMember &&
              (rescue.status === "planned" ||
                rescue.status === "in_progress") && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> You are a member of this rescue
                    campaign. Only the rescue leader can start, complete, cancel
                    the campaign or update report progress.
                  </p>
                </div>
              )}
          </div>

          {/* Description */}
          <Card>
            <CardBody className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                About This Campaign
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {rescue.description ||
                  "Join this rescue campaign to help save animals in need. Your participation makes a real difference."}
              </p>
            </CardBody>
          </Card>

          {/* Campaign Details */}
          <Card>
            <CardBody className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Campaign Details
              </h2>
              <div className="space-y-4">
                {/* Start Date */}
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="text-gray-700 font-medium">
                      {rescue.start_date
                        ? new Date(rescue.start_date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "To be announced"}
                    </p>
                  </div>
                </div>

                {/* End Date */}
                {rescue.end_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">End Date</p>
                      <p className="text-gray-700 font-medium">
                        {new Date(rescue.end_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Participants */}
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Participants</p>
                    <p className="text-gray-700 font-medium">
                      {currentParticipants}
                      {requiredParticipants > 0 &&
                        ` / ${requiredParticipants}`}{" "}
                      volunteers
                    </p>
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
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Related Reports
                  </h2>
                  <div className="space-y-3">
                    {rescue.reports.map((rescueReport) => {
                      const reportId = rescueReport.report_id;
                      const reportIdStr =
                        typeof reportId === "string"
                          ? reportId
                          : String(reportId || "");

                      return (
                        <div
                          key={rescueReport.id}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-medium text-gray-900">
                                  {rescueReport.report?.title ||
                                    `Report #${reportIdStr.substring(0, 8)}`}
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
                                  {rescueReport.status}
                                </Chip>
                              </div>
                              {rescueReport.note && (
                                <p className="text-sm text-gray-500 mb-1">
                                  {rescueReport.note}
                                </p>
                              )}
                              {rescueReport.report?.location && (
                                <p className="text-sm text-gray-500">
                                  📍 {rescueReport.report.location}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {isLeader && rescue.status === "in_progress" && (
                                <Button
                                  size="sm"
                                  variant="flat"
                                  color="primary"
                                  onPress={() =>
                                    handleOpenProgressModal(rescueReport)
                                  }
                                >
                                  Update Progress
                                </Button>
                              )}
                              <Button
                                as={Link}
                                to={`/reports/${reportIdStr}`}
                                size="sm"
                                variant="flat"
                                color="default"
                              >
                                View Report
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
                  <div className="h-[500px] rounded-lg overflow-hidden relative z-0">
                    <RescueMap reports={rescue.reports} />
                  </div>
                </CardBody>
              </Card>
            </>
          )}

          {/* Action Buttons */}
          {isLeader && rescue.status === "planned" && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                color="primary"
                size="lg"
                className="flex-1 font-bold"
                onPress={onStartOpen}
                startContent={<PlayCircle className="w-5 h-5" />}
              >
                Start Rescue Campaign
              </Button>
              <Button
                color="danger"
                size="lg"
                variant="flat"
                className="flex-1 font-bold"
                onPress={onCancelOpen}
                startContent={<XCircle className="w-5 h-5" />}
              >
                Cancel Campaign
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
                Complete Campaign
              </Button>
              <Button
                color="danger"
                size="lg"
                variant="flat"
                className="flex-1 font-bold"
                onPress={onCancelOpen}
                startContent={<XCircle className="w-5 h-5" />}
              >
                Cancel Campaign
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
                Join This Rescue Campaign
              </Button>
            )}

          {!isLeader && isFull && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-orange-600 mx-auto mb-2" />
              <p className="text-orange-800 font-medium">
                This rescue campaign has reached its maximum number of
                participants.
              </p>
            </div>
          )}

          {rescue.status === "completed" && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-semibold">
                This rescue campaign has been completed successfully. Thank you
                to all volunteers!
              </p>
            </div>
          )}

          {rescue.status === "cancelled" && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800 font-medium">
                This rescue campaign has been cancelled.
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
                <h2 className="text-2xl font-bold">Join Rescue Campaign</h2>
                <p className="text-sm text-gray-600 font-normal">
                  Become a volunteer for this rescue mission
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  {!isAuthenticated && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        You need to be logged in to join a rescue campaign.
                        Please login or register first.
                      </p>
                    </div>
                  )}
                  {isAuthenticated && (
                    <>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> Once you join, this campaign
                          will appear in your dashboard. Please commit to
                          participating in the rescue mission.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-700 font-medium">
                          Campaign Details:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          <li>
                            Status: <strong>{rescue.status}</strong>
                          </li>
                          {rescue.start_date && (
                            <li>
                              Start Date:{" "}
                              {new Date(rescue.start_date).toLocaleDateString()}
                            </li>
                          )}
                          <li>
                            Current Participants: {currentParticipants}
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
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleJoinRescue}
                  isLoading={joinRescueMutation.isPending}
                  isDisabled={!isAuthenticated}
                  className="font-semibold"
                >
                  {isAuthenticated ? "Join Campaign" : "Login Required"}
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
                  <h2 className="text-2xl font-bold">Start Rescue Campaign</h2>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>This will:</strong>
                    </p>
                    <ul className="list-disc list-inside text-sm text-blue-800 mt-2 space-y-1">
                      <li>Change the rescue status to "In Progress"</li>
                      <li>Notify all participants</li>
                      <li>Allow you to track and update report progress</li>
                    </ul>
                  </div>
                  <p className="text-gray-700">
                    Are you sure you want to start this rescue campaign?
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleStartRescue}
                  isLoading={startRescueMutation.isPending}
                  startContent={<PlayCircle className="w-4 h-4" />}
                >
                  Start Campaign
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
                  <h2 className="text-2xl font-bold">Cancel Rescue Campaign</h2>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Warning:</strong> All assigned reports will be
                      returned to pending status.
                    </p>
                  </div>
                  <p className="text-gray-700">
                    Are you sure you want to cancel this rescue campaign?
                  </p>
                  <Textarea
                    label="Reason for cancellation (optional)"
                    placeholder="Enter reason..."
                    value={cancelReason}
                    onValueChange={setCancelReason}
                    minRows={3}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Back
                </Button>
                <Button
                  color="danger"
                  onPress={handleCancelRescue}
                  isLoading={cancelRescueMutation.isPending}
                  startContent={<XCircle className="w-4 h-4" />}
                >
                  Cancel Campaign
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
                    Complete Rescue Campaign
                  </h2>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>This will:</strong>
                    </p>
                    <ul className="list-disc list-inside text-sm text-green-800 mt-2 space-y-1">
                      <li>Mark the rescue as "Completed"</li>
                      <li>Update all successful reports to "Resolved"</li>
                      <li>Return cancelled/incomplete reports to "Pending"</li>
                      <li>Notify all participants of completion</li>
                    </ul>
                  </div>
                  <p className="text-gray-700">
                    Are you sure you want to complete this rescue campaign?
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="success"
                  onPress={handleCompleteRescue}
                  isLoading={completeRescueMutation.isPending}
                  startContent={<CheckCircle className="w-4 h-4" />}
                >
                  Complete Campaign
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
                  <h2 className="text-2xl font-bold">Update Report Progress</h2>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="font-medium text-gray-900">
                      {selectedReportProgress?.reportTitle}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Current status: {selectedReportProgress?.currentStatus}
                    </p>
                  </div>

                  <Select
                    label="New Status"
                    placeholder="Select status"
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
                      In Progress
                    </SelectItem>
                    <SelectItem key="success" value="success">
                      Success (Rescued)
                    </SelectItem>
                    <SelectItem key="cancelled" value="cancelled">
                      Cancelled
                    </SelectItem>
                  </Select>

                  <Textarea
                    label="Progress Note"
                    placeholder="Add a note about the progress..."
                    value={progressNote}
                    onValueChange={setProgressNote}
                    minRows={3}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleUpdateProgress}
                  isLoading={updateProgressMutation.isPending}
                  startContent={<Save className="w-4 h-4" />}
                >
                  Update Progress
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
