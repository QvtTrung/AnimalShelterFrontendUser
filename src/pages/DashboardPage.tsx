import { useState } from "react";
import {
  Card,
  CardBody,
  Chip,
  Button,
  Spinner,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { Link } from "react-router-dom";
import {
  PawPrint,
  AlertTriangle,
  Users,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import { useAdoptions } from "../hooks/useAdoptions";
import { useReports } from "../hooks/useReports";
import { useRescues } from "../hooks/useRescues";

export const DashboardPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState("adoptions");

  // Fetch user's data only if authenticated and user exists
  const { data: adoptionsData, isLoading: adoptionsLoading } = useAdoptions(
    user?.id ? { user_id: user.id } : undefined,
    { enabled: isAuthenticated && !!user?.id }
  );
  const { data: reportsData, isLoading: reportsLoading } = useReports(
    user?.id ? { reporter_id: user.id } : undefined,
    { enabled: isAuthenticated && !!user?.id }
  );
  const { data: rescuesData, isLoading: rescuesLoading } = useRescues(
    user?.id ? { volunteer_id: user.id } : undefined,
    { enabled: isAuthenticated && !!user?.id }
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
      case "completed":
      case "active":
        return "success";
      case "rejected":
      case "cancelled":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
      case "completed":
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900">
            My Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Track your adoptions, reports, and rescue campaigns
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardBody className="flex flex-row items-center gap-4 p-6">
              <div className="p-3 bg-green-100 rounded-lg">
                <PawPrint className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Adoptions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Array.isArray(adoptionsData?.data)
                    ? adoptionsData.data.length
                    : 0}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex flex-row items-center gap-4 p-6">
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Reports</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Array.isArray(reportsData?.data)
                    ? reportsData.data.length
                    : 0}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex flex-row items-center gap-4 p-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rescue Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Array.isArray(rescuesData?.data)
                    ? rescuesData.data.length
                    : 0}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Card>
          <CardBody className="p-0">
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={(key) => setSelectedTab(key.toString())}
              color="primary"
              size="lg"
              classNames={{
                base: "w-full",
                tabList: "w-full",
                panel: "p-6",
              }}
            >
              {/* Adoptions Tab */}
              <Tab key="adoptions" title="My Adoptions">
                {adoptionsLoading ? (
                  <div className="flex justify-center py-12">
                    <Spinner size="lg" color="primary" />
                  </div>
                ) : !Array.isArray(adoptionsData?.data) ||
                  adoptionsData.data.length === 0 ? (
                  <div className="text-center py-12">
                    <PawPrint className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      You haven't applied for any adoptions yet.
                    </p>
                    <Button
                      as={Link}
                      to="/pets"
                      color="primary"
                      className="font-semibold"
                    >
                      Browse Pets
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {adoptionsData.data.map((adoption: any) => (
                      <Card key={adoption.id} className="border">
                        <CardBody className="p-5">
                          <div className="flex flex-col md:flex-row gap-4">
                            {/* Pet Image */}
                            <div className="shrink-0">
                              <img
                                src={
                                  adoption.pet?.images?.[0]?.image_url ||
                                  "/placeholder-pet.jpg"
                                }
                                alt={adoption.pet?.name}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                            </div>

                            {/* Details */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900">
                                    {adoption.pet?.name || "Pet Name"}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {adoption.pet?.species} •{" "}
                                    {adoption.pet?.breed}
                                  </p>
                                </div>
                                <Chip
                                  color={getStatusColor(adoption.status)}
                                  variant="flat"
                                  startContent={getStatusIcon(adoption.status)}
                                >
                                  {adoption.status}
                                </Chip>
                              </div>

                              {adoption.notes && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-semibold">Notes:</span>{" "}
                                  {adoption.notes}
                                </p>
                              )}

                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                Applied on{" "}
                                {new Date(
                                  adoption.created_at
                                ).toLocaleDateString()}
                              </div>

                              {adoption.status === "approved" && (
                                <div className="mt-4">
                                  <Button
                                    as={Link}
                                    to={`/pets/${adoption.pet_id}`}
                                    color="primary"
                                    size="sm"
                                    className="font-semibold"
                                  >
                                    View Pet Details
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                )}
              </Tab>

              {/* Reports Tab */}
              <Tab key="reports" title="My Reports">
                {reportsLoading ? (
                  <div className="flex justify-center py-12">
                    <Spinner size="lg" color="primary" />
                  </div>
                ) : !Array.isArray(reportsData?.data) ||
                  reportsData.data.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      You haven't submitted any reports yet.
                    </p>
                    <Button
                      as={Link}
                      to="/report"
                      color="primary"
                      className="font-semibold"
                    >
                      Report Animal
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {reportsData.data.map((report: any) => (
                      <Card key={report.id} className="border">
                        <CardBody className="p-5">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                  {report.title || "Animal Report"}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {report.animal_type}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Chip
                                  color={getStatusColor(report.status)}
                                  variant="flat"
                                  size="sm"
                                >
                                  {report.status}
                                </Chip>
                                <Chip
                                  color={
                                    report.urgency_level === "critical" ||
                                    report.urgency_level === "high"
                                      ? "danger"
                                      : report.urgency_level === "medium"
                                      ? "warning"
                                      : "default"
                                  }
                                  variant="flat"
                                  size="sm"
                                >
                                  {report.urgency_level}
                                </Chip>
                              </div>
                            </div>

                            {report.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                {report.location}
                              </div>
                            )}

                            <p className="text-sm text-gray-700">
                              {report.description}
                            </p>

                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              Reported on{" "}
                              {new Date(report.created_at).toLocaleDateString()}
                            </div>

                            {report.rescue_id && (
                              <div className="mt-4">
                                <Button
                                  as={Link}
                                  to={`/rescues/${report.rescue_id}`}
                                  color="primary"
                                  size="sm"
                                  variant="flat"
                                  className="font-semibold"
                                >
                                  View Rescue Campaign
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                )}
              </Tab>

              {/* Rescue Campaigns Tab */}
              <Tab key="rescues" title="My Rescues">
                {rescuesLoading ? (
                  <div className="flex justify-center py-12">
                    <Spinner size="lg" color="primary" />
                  </div>
                ) : !Array.isArray(rescuesData?.data) ||
                  rescuesData.data.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      You're not participating in any rescue campaigns yet.
                    </p>
                    <Button
                      as={Link}
                      to="/rescues"
                      color="primary"
                      className="font-semibold"
                    >
                      Browse Campaigns
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {rescuesData.data.map((rescue: any) => (
                      <Card key={rescue.id} className="border">
                        <CardBody className="p-5">
                          <div className="flex flex-col md:flex-row gap-4">
                            {/* Rescue Image */}
                            <div className="shrink-0">
                              <img
                                src={
                                  rescue.images?.[0]?.image_url ||
                                  "/placeholder-rescue.jpg"
                                }
                                alt={rescue.title}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                            </div>

                            {/* Details */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900">
                                    {rescue.title}
                                  </h3>
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {rescue.description ||
                                      "Rescue campaign description"}
                                  </p>
                                </div>
                                <Chip
                                  color={getStatusColor(rescue.status)}
                                  variant="flat"
                                >
                                  {rescue.status}
                                </Chip>
                              </div>

                              {rescue.location && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <MapPin className="w-4 h-4" />
                                  {rescue.location}
                                </div>
                              )}

                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                {rescue.start_date
                                  ? new Date(
                                      rescue.start_date
                                    ).toLocaleDateString()
                                  : "Date TBD"}
                              </div>

                              <div className="mt-4">
                                <Button
                                  as={Link}
                                  to={`/rescues/${rescue.id}`}
                                  color="primary"
                                  size="sm"
                                  className="font-semibold"
                                >
                                  View Campaign
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                )}
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
