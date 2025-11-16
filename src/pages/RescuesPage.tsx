import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Button,
  Chip,
  Progress,
  Spinner,
  Tabs,
  Tab,
} from "@nextui-org/react";
import {
  Users,
  Target,
  Calendar,
  MapPin,
  TrendingUp,
  Heart,
} from "lucide-react";
import { useRescues } from "../hooks/useRescues";

export const RescuesPage = () => {
  const [selectedTab, setSelectedTab] = useState("active");

  const {
    data: rescuesData,
    isLoading,
    isError,
  } = useRescues({
    status:
      selectedTab === "active"
        ? "active"
        : selectedTab === "completed"
        ? "completed"
        : undefined,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "completed":
        return "default";
      case "cancelled":
        return "danger";
      default:
        return "warning";
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-heading font-bold">
              Rescue Campaigns
            </h1>
            <p className="text-lg text-blue-50 max-w-2xl mx-auto">
              Join organized rescue missions to save animals in need. Every
              contribution makes a difference!
            </p>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key.toString())}
            color="primary"
            size="lg"
            classNames={{
              tabList: "gap-6",
              cursor: "bg-primary-500",
              tab: "h-12",
            }}
          >
            <Tab key="active" title="Active Campaigns" />
            <Tab key="completed" title="Completed" />
            <Tab key="all" title="All Campaigns" />
          </Tabs>
        </div>
      </section>

      {/* Campaigns Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <Spinner size="lg" color="primary" />
            </div>
          )}

          {isError && (
            <div className="text-center py-20">
              <p className="text-red-500 text-lg">
                Failed to load campaigns. Please try again later.
              </p>
            </div>
          )}

          {!isLoading && !isError && rescuesData?.data?.data?.length === 0 && (
            <div className="text-center py-20">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No rescue campaigns found for this category.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {rescuesData?.data?.data?.map((rescue: any) => (
              <Card
                key={rescue.id}
                className="hover:shadow-xl transition-shadow duration-300"
              >
                <CardHeader className="p-0 relative">
                  <img
                    src={
                      rescue.images?.[0]?.image_url || "/placeholder-rescue.jpg"
                    }
                    alt={rescue.title}
                    className="w-full h-48 object-cover"
                  />
                  <Chip
                    color={getStatusColor(rescue.status)}
                    className="absolute top-4 right-4"
                    variant="flat"
                  >
                    {rescue.status}
                  </Chip>
                </CardHeader>
                <CardBody className="p-5 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {rescue.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {rescue.description ||
                        "Join this rescue campaign to help animals in need."}
                    </p>
                  </div>

                  {/* Location */}
                  {rescue.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{rescue.location}</span>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {rescue.start_date
                        ? new Date(rescue.start_date).toLocaleDateString()
                        : "Date TBD"}
                    </span>
                  </div>

                  {/* Volunteers Progress */}
                  {rescue.target_volunteers && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Volunteers
                        </span>
                        <span className="font-semibold text-gray-900">
                          {rescue.current_volunteers || 0} /{" "}
                          {rescue.target_volunteers}
                        </span>
                      </div>
                      <Progress
                        value={calculateProgress(
                          rescue.current_volunteers || 0,
                          rescue.target_volunteers
                        )}
                        color="primary"
                        size="sm"
                      />
                    </div>
                  )}

                  {/* Funding Progress */}
                  {rescue.target_funding && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          Funding
                        </span>
                        <span className="font-semibold text-gray-900">
                          ${rescue.current_funding || 0} / $
                          {rescue.target_funding}
                        </span>
                      </div>
                      <Progress
                        value={calculateProgress(
                          rescue.current_funding || 0,
                          rescue.target_funding
                        )}
                        color="success"
                        size="sm"
                      />
                    </div>
                  )}

                  {/* Urgency Level */}
                  {rescue.urgency_level && (
                    <Chip
                      color={
                        rescue.urgency_level === "critical" ||
                        rescue.urgency_level === "high"
                          ? "danger"
                          : rescue.urgency_level === "medium"
                          ? "warning"
                          : "default"
                      }
                      size="sm"
                      variant="flat"
                      startContent={<TrendingUp className="w-3 h-3" />}
                    >
                      {rescue.urgency_level} urgency
                    </Chip>
                  )}
                </CardBody>
                <CardFooter className="p-5 pt-0">
                  <Button
                    as={Link}
                    to={`/rescues/${rescue.id}`}
                    color="primary"
                    className="w-full font-semibold"
                    size="lg"
                  >
                    View Campaign
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination placeholder */}
          {rescuesData?.data?.data && rescuesData.data.data.length > 0 && (
            <div className="mt-12 flex justify-center">
              <p className="text-gray-500 text-sm">
                Showing {rescuesData.data.data.length} campaigns
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-500">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Want to Start a Campaign?
          </h2>
          <p className="text-lg text-blue-50 mb-8">
            Have you encountered animals that need urgent rescue? Create a
            campaign and rally volunteers to help!
          </p>
          <Button
            as={Link}
            to="/dashboard"
            size="lg"
            className="bg-white text-blue-600 font-bold hover:bg-gray-100 px-10 h-14"
          >
            Create Campaign
          </Button>
        </div>
      </section>
    </div>
  );
};
