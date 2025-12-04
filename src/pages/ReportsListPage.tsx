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
  type DateValue,
  type RangeValue,
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
  const [speciesFilter, setSpeciesFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>(
    null
  );
  const [page, setPage] = useState(1);
  const limit = 9;

  const { data: reportsData, isLoading } = useReports({
    urgency_level: urgencyFilter || undefined,
    status: statusFilter || undefined,
    search: searchQuery || undefined,
    sort: sortBy,
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

  // Apply client-side species filter
  if (speciesFilter && reports.length > 0) {
    reports = reports.filter((report) => report.species === speciesFilter);
  }

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

  // Backend now handles sorting, so we don't need client-side sorting
  // Note: Client-side sorting would only sort the current page, not all reports

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
              Báo Cáo Động Vật
            </h1>
            <p className="text-lg text-red-50 max-w-3xl mx-auto">
              Giúp đỡ động vật cần giúp bằng cách phản hồi các báo cáo khẩn cấp.
              Mỗi báo cáo đều quan trọng và có thể cứu sống một sinh linh.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-end gap-2">
            <Input
              placeholder="Tìm kiếm theo tiêu đề, loài động vật hoặc vị trí..."
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
              placeholder="Tất Cả Mức Độ Khẩn Cấp"
              selectedKeys={urgencyFilter ? [urgencyFilter] : []}
              onChange={(e) => {
                setUrgencyFilter(e.target.value);
                setPage(1);
              }}
              size="sm"
              aria-label="Lọc theo mức độ khẩn cấp"
              className="w-40"
              classNames={{
                trigger: "bg-gray-50",
              }}
            >
              <SelectItem key="critical" value="critical">
                Khẩn Cấp
              </SelectItem>
              <SelectItem key="high" value="high">
                Cao
              </SelectItem>
              <SelectItem key="medium" value="medium">
                Trung Bình
              </SelectItem>
              <SelectItem key="low" value="low">
                Thấp
              </SelectItem>
            </Select>

            <Select
              placeholder="Tất Cả Trạng Thái"
              selectedKeys={statusFilter ? [statusFilter] : []}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              size="sm"
              aria-label="Lọc theo trạng thái"
              className="w-32"
              classNames={{
                trigger: "bg-gray-50",
              }}
            >
              <SelectItem key="pending" value="pending">
                Chờ Duyệt
              </SelectItem>
              <SelectItem key="assigned" value="assigned">
                Đã Nhận
              </SelectItem>
              <SelectItem key="resolved" value="resolved">
                Đã Giải Quyết
              </SelectItem>
            </Select>

            <Select
              placeholder="Tất Cả Loài"
              selectedKeys={speciesFilter ? [speciesFilter] : []}
              onChange={(e) => {
                setSpeciesFilter(e.target.value);
                setPage(1);
              }}
              size="sm"
              aria-label="Lọc theo loài động vật"
              className="w-32"
              classNames={{
                trigger: "bg-gray-50",
              }}
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

            <NextUIDateRangePicker
              label="Khoảng Thời Gian"
              className="w-64"
              value={dateRange}
              onChange={setDateRange}
              size="sm"
              aria-label="Lọc theo khoảng thời gian"
              showMonthAndYearPickers
              visibleMonths={2}
            />

            <Select
              label="Sắp Xếp"
              selectedKeys={[sortBy]}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1); // Reset to first page when changing sort
              }}
              size="sm"
              aria-label="Sắp xếp theo ngày"
              className="w-36"
              classNames={{
                trigger: "bg-gray-50",
              }}
            >
              <SelectItem key="newest" value="newest">
                Mới Nhất
              </SelectItem>
              <SelectItem key="oldest" value="oldest">
                Cũ Nhất
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
                Không tìm thấy báo cáo nào phù hợp với tiêu chí của bạn.
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
                    Xem Chi Tiết
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
                  Hiển thị {(page - 1) * limit + 1}-
                  {Math.min(page * limit, total)} trong tổng số {total} báo cáo
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
