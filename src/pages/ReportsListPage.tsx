import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Button,
  Spinner,
  Select,
  SelectItem,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import {
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  Phone,
  Search,
  CheckCircle,
} from "lucide-react";
import { useReports, useClaimReport } from "../hooks/useReports";
import { useAuthStore } from "../store/auth.store";
import toast from "react-hot-toast";

export const ReportsPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: reportsData, isLoading } = useReports({
    urgency_level: urgencyFilter || undefined,
    status: statusFilter || undefined,
  });

  const claimReportMutation = useClaimReport();

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
      case "in_progress":
        return "primary";
      case "resolved":
        return "success";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  const handleClaimReport = async () => {
    if (!selectedReport) return;

    if (!isAuthenticated) {
      toast.error("Please login to claim a report");
      onClose();
      return;
    }

    try {
      await claimReportMutation.mutateAsync(selectedReport);
      toast.success("Report claimed successfully! Check your dashboard.");
      onClose();
    } catch (error) {
      console.error("Failed to claim report:", error);
      toast.error("Failed to claim report. Please try again.");
    }
  };

  const openClaimModal = (reportId: string) => {
    setSelectedReport(reportId);
    onOpen();
  };

  // Filter reports by search query
  const filteredReports = reportsData?.data?.data?.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (report: any) => {
      const matchesSearch =
        !searchQuery ||
        report.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.animal_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.location?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    }
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-orange-500 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-heading font-bold">
              Animal Reports
            </h1>
            <p className="text-lg text-orange-50 max-w-2xl mx-auto">
              Help animals in need by responding to urgent reports. Volunteers
              can claim high-priority cases.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <Input
              placeholder="Search by title, animal type, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              classNames={{
                input: "text-sm",
                inputWrapper: "h-12",
              }}
            />

            {/* Urgency Filter */}
            <Select
              placeholder="Filter by urgency"
              selectedKeys={urgencyFilter ? [urgencyFilter] : []}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              aria-label="Filter by urgency level"
              classNames={{
                trigger: "h-12",
              }}
            >
              <SelectItem key="" value="">
                All Urgency Levels
              </SelectItem>
              <SelectItem key="critical" value="critical">
                Critical
              </SelectItem>
              <SelectItem key="high" value="high">
                High
              </SelectItem>
              <SelectItem key="medium" value="medium">
                Medium
              </SelectItem>
              <SelectItem key="low" value="low">
                Low
              </SelectItem>
            </Select>

            {/* Status Filter */}
            <Select
              placeholder="Filter by status"
              selectedKeys={statusFilter ? [statusFilter] : []}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              classNames={{
                trigger: "h-12",
              }}
            >
              <SelectItem key="" value="">
                All Statuses
              </SelectItem>
              <SelectItem key="pending" value="pending">
                Pending
              </SelectItem>
              <SelectItem key="in_progress" value="in_progress">
                In Progress
              </SelectItem>
              <SelectItem key="resolved" value="resolved">
                Resolved
              </SelectItem>
            </Select>
          </div>
        </div>
      </section>

      {/* Reports Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <Spinner size="lg" color="primary" />
            </div>
          )}

          {!isLoading && filteredReports?.length === 0 && (
            <div className="text-center py-20">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No reports found matching your criteria.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {filteredReports?.map((report: any) => (
              <Card
                key={report.id}
                className={`hover:shadow-xl transition-shadow duration-300 ${
                  report.urgency_level === "critical" ||
                  report.urgency_level === "high"
                    ? "border-2 border-red-300"
                    : ""
                }`}
              >
                <CardHeader className="p-0 relative">
                  {report.images && report.images.length > 0 ? (
                    <img
                      src={report.images[0]?.image_url}
                      alt={report.title || "Report"}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <AlertTriangle className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Chip
                      color={getUrgencyColor(report.urgency_level)}
                      variant="solid"
                      className="text-white font-bold"
                    >
                      {report.urgency_level}
                    </Chip>
                    <Chip color={getStatusColor(report.status)} variant="flat">
                      {report.status}
                    </Chip>
                  </div>
                </CardHeader>
                <CardBody className="p-5 space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {report.title || "Animal in Need"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {report.animal_type}
                    </p>
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-3">
                    {report.description}
                  </p>

                  {/* Location */}
                  {report.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{report.location}</span>
                    </div>
                  )}

                  {/* Reported Date */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Contact Info */}
                  {report.contact_name && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span className="text-sm">{report.contact_name}</span>
                    </div>
                  )}

                  {report.contact_phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{report.contact_phone}</span>
                    </div>
                  )}

                  {/* Claim Button for High/Critical Reports */}
                  {(report.urgency_level === "high" ||
                    report.urgency_level === "critical") &&
                    report.status === "pending" && (
                      <Button
                        color="danger"
                        className="w-full font-semibold mt-4"
                        size="lg"
                        onPress={() => openClaimModal(report.id)}
                        startContent={<CheckCircle className="w-4 h-4" />}
                      >
                        Claim & Help
                      </Button>
                    )}

                  {/* View Details for Other Reports */}
                  {(report.urgency_level === "medium" ||
                    report.urgency_level === "low" ||
                    report.status !== "pending") && (
                    <Button
                      color="primary"
                      variant="flat"
                      className="w-full font-semibold mt-4"
                      size="lg"
                    >
                      View Details
                    </Button>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Claim Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Claim Report
          </ModalHeader>
          <ModalBody>
            <p className="text-gray-700">
              Are you sure you want to claim this report? By claiming, you
              commit to helping this animal in need.
            </p>
            {!isAuthenticated && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  You need to be logged in to claim a report. Please login or
                  register first.
                </p>
              </div>
            )}
            {isAuthenticated && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Once claimed, this report will appear
                  in your dashboard. Please coordinate with the reporter and
                  take necessary action.
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleClaimReport}
              isLoading={claimReportMutation.isPending}
              isDisabled={!isAuthenticated}
            >
              {isAuthenticated ? "Claim Report" : "Login Required"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
