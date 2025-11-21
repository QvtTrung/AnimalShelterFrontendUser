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
} from "@nextui-org/react";
import {
  ArrowLeft,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  UserPlus,
} from "lucide-react";
import { useRescue, useJoinRescue } from "../hooks/useRescues";
import { useAuthStore } from "../store/auth.store";
import toast from "react-hot-toast";
import { RescueMap } from "../components/Map/RescueMap";

export const RescueDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { data: rescueData, isLoading, isError } = useRescue(id || "");
  console.log("rescueData", rescueData);
  const joinRescueMutation = useJoinRescue();

  const rescue = rescueData?.data;

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
    } catch (error) {
      console.error("Failed to join rescue:", error);
      toast.error("Failed to join rescue campaign. Please try again.");
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
            </div>
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
                              <p className="font-medium text-gray-900">
                                {rescueReport.report?.title ||
                                  `Report #${reportIdStr.substring(0, 8)}`}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                Status: {rescueReport.status}
                              </p>
                              {rescueReport.note && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {rescueReport.note}
                                </p>
                              )}
                              {rescueReport.report?.location && (
                                <p className="text-sm text-gray-500 mt-1">
                                  📍 {rescueReport.report.location}
                                </p>
                              )}
                            </div>
                            <Button
                              as={Link}
                              to={`/reports/${reportIdStr}`}
                              size="sm"
                              variant="flat"
                              color="primary"
                            >
                              View Report
                            </Button>
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
          {(rescue.status === "planned" || rescue.status === "in_progress") &&
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

          {isFull && (
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
    </div>
  );
};
