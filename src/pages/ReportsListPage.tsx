import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Button,
  Spinner,
  Select,
  SelectItem,
  Input,
  Pagination,
  DateRangePicker as NextUIDateRangePicker,
} from "@nextui-org/react";
import {
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  Phone,
  Search,
} from "lucide-react";
import { useReports } from "../hooks/useReports";

export const ReportsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [dateRange, setDateRange] = useState<{ start: any; end: any } | null>(
    null
  );
  const [page, setPage] = useState(1);
  const limit = 9;

  const { data: reportsData, isLoading } = useReports({
    urgency_level: urgencyFilter || undefined,
    status: statusFilter || undefined,
    search: searchQuery || undefined,
    page,
    limit,
  });

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

  // Get reports from API with server-side filtering and pagination
  let reports = Array.isArray(reportsData?.data) ? reportsData.data : [];

  // Apply date range filter
  if (dateRange?.start && dateRange?.end && reports.length > 0) {
    const startTime = new Date(
      dateRange.start.year,
      dateRange.start.month - 1,
      dateRange.start.day
    ).getTime();
    const endTime = new Date(
      dateRange.end.year,
      dateRange.end.month - 1,
      dateRange.end.day,
      23,
      59,
      59
    ).getTime();
    reports = reports.filter((report) => {
      if (!report.date_created) return false;
      const reportTime = new Date(report.date_created).getTime();
      return reportTime >= startTime && reportTime <= endTime;
    });
  }

  // Apply client-side sorting by date_created
  if (reports.length > 0) {
    reports = [...reports].sort((a, b) => {
      const dateA = a.date_created ? new Date(a.date_created).getTime() : 0;
      const dateB = b.date_created ? new Date(b.date_created).getTime() : 0;
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });
  }

  const total = reportsData?.meta?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="w-8 h-8" />
              <span className="text-sm font-semibold tracking-wide uppercase">
                RESCUE
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold">
              Animal Reports
            </h1>
            <p className="text-lg text-red-50 max-w-3xl mx-auto">
              Help animals in need by responding to urgent reports. Every report
              matters and could save a life.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-end gap-2">
            <Input
              placeholder="Search by title, animal type, or location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              size="sm"
              isClearable
              onClear={() => setSearchQuery("")}
              className="w-64"
              classNames={{
                inputWrapper: "bg-gray-50",
              }}
            />

            <Select
              placeholder="All Urgency Levels"
              selectedKeys={urgencyFilter ? [urgencyFilter] : []}
              onChange={(e) => {
                setUrgencyFilter(e.target.value);
                setPage(1);
              }}
              size="sm"
              aria-label="Filter by urgency level"
              className="w-40"
              classNames={{
                trigger: "bg-gray-50",
              }}
            >
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

            <Select
              placeholder="All Statuses"
              selectedKeys={statusFilter ? [statusFilter] : []}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              size="sm"
              aria-label="Filter by status"
              className="w-32"
              classNames={{
                trigger: "bg-gray-50",
              }}
            >
              <SelectItem key="pending" value="pending">
                Pending
              </SelectItem>
              <SelectItem key="assigned" value="assigned">
                Assigned
              </SelectItem>
              <SelectItem key="resolved" value="resolved">
                Resolved
              </SelectItem>
            </Select>

            <NextUIDateRangePicker
              label="Date Range"
              className="w-64"
              value={dateRange}
              onChange={setDateRange}
              size="sm"
              aria-label="Date range filter"
              showMonthAndYearPickers
              visibleMonths={2}
            />

            <Select
              label="Sort"
              selectedKeys={[sortBy]}
              onChange={(e) => setSortBy(e.target.value)}
              size="sm"
              aria-label="Sort by date"
              className="w-36"
              classNames={{
                trigger: "bg-gray-50",
              }}
            >
              <SelectItem key="newest" value="newest">
                Newest First
              </SelectItem>
              <SelectItem key="oldest" value="oldest">
                Oldest First
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

          {!isLoading && reports?.length === 0 && (
            <div className="text-center py-20">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No reports found matching your criteria.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {reports?.map((report: any) => (
              <Card
                key={report.id}
                className={`hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${
                  report.urgency_level === "critical" ||
                  report.urgency_level === "high"
                    ? "ring-2 ring-red-200"
                    : ""
                }`}
              >
                <CardHeader className="p-0 relative overflow-hidden group">
                  {report.images && report.images.length > 0 ? (
                    <div
                      className="relative w-full"
                      style={{ paddingBottom: "66.67%" }}
                    >
                      <img
                        src={report.images[0]?.image_url}
                        alt={report.title || "Report"}
                        className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  ) : (
                    <div
                      className="relative w-full"
                      style={{ paddingBottom: "66.67%" }}
                    >
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <AlertTriangle className="w-16 h-16 text-gray-400" />
                      </div>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <Chip
                      color={getUrgencyColor(report.urgency_level)}
                      variant="solid"
                      size="sm"
                      className="font-bold capitalize"
                    >
                      {report.urgency_level}
                    </Chip>
                  </div>
                  <div className="absolute top-3 left-3">
                    <Chip
                      color={getStatusColor(report.status)}
                      variant="flat"
                      size="sm"
                      className="bg-white/90 backdrop-blur-sm capitalize"
                    >
                      {report.status}
                    </Chip>
                  </div>
                </CardHeader>
                <CardBody className="p-5 space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                      {report.title || "Animal in Need"}
                    </h3>
                    <Chip
                      size="sm"
                      variant="flat"
                      className="capitalize bg-gray-100"
                    >
                      {report.species}
                    </Chip>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {report.description}
                  </p>

                  <div className="space-y-2 pt-2">
                    {report.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm line-clamp-1">
                          {report.location}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">
                        {report.date_created
                          ? new Date(report.date_created).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "N/A"}
                      </span>
                    </div>

                    {report.contact_name && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm line-clamp-1">
                          {report.contact_name}
                        </span>
                      </div>
                    )}

                    {report.contact_phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{report.contact_phone}</span>
                      </div>
                    )}
                  </div>
                </CardBody>
                <CardFooter className="p-5 pt-0">
                  <Button
                    as={Link}
                    to={`/reports/${report.id}`}
                    color="primary"
                    variant="flat"
                    className="w-full font-semibold"
                    size="lg"
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col items-center gap-4">
              <Pagination
                total={totalPages}
                page={page}
                onChange={setPage}
                color="primary"
                size="lg"
                showControls
              />
              {total > 0 && (
                <p className="text-gray-500 text-sm">
                  Showing {(page - 1) * limit + 1}-
                  {Math.min(page * limit, total)} of {total} reports
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
