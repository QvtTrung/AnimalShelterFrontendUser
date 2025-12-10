import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
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
  Tabs,
  Tab,
  useDisclosure,
  Switch,
  Slider,
} from "@nextui-org/react";
import {
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  Phone,
  Search,
  Edit,
  Eye,
  Navigation,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useReports, useMyReports } from "../hooks/useReports";
import { useNearbyReports } from "../hooks/useDashboard";
import { AllReportsMap } from "../components/Map/AllReportsMap";
import { ReportEditModal } from "../components/ReportEditModal";
import type { Report } from "../types";
import { useAuthStore } from "../store/auth.store";
import {
  translateReportSpecies,
  translateReportStatus,
  translateUrgencyLevel,
} from "../utils/translations";

export const ReportsPage = () => {
  const { user } = useAuthStore();

  // Tab state
  const [selectedTab, setSelectedTab] = useState("all");

  // All reports filters
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [speciesFilter, setSpeciesFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>(
    null
  );
  const [page, setPage] = useState(1);
  const limit = 12;

  // My reports state
  const [myReportsPage, setMyReportsPage] = useState(1);
  const [myReportsStatusFilter, setMyReportsStatusFilter] =
    useState<string>("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Nearby reports state
  const [nearbyPage, setNearbyPage] = useState(1);
  const [userLocation, setUserLocation] = useState<
    { latitude: number; longitude: number } | undefined
  >();
  const [locationEnabled, setLocationEnabled] = useState(() => {
    const saved = localStorage.getItem("reports-location-enabled");
    return saved === "true";
  });
  const [searchRadius, setSearchRadius] = useState(() => {
    const saved = localStorage.getItem("reports-search-radius");
    return saved ? parseInt(saved) : 25000;
  });

  // Save location preferences
  useEffect(() => {
    localStorage.setItem(
      "reports-location-enabled",
      locationEnabled.toString()
    );
  }, [locationEnabled]);

  useEffect(() => {
    localStorage.setItem("reports-search-radius", searchRadius.toString());
  }, [searchRadius]);

  // Request user location
  useEffect(() => {
    if (locationEnabled && !userLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error("Error getting location:", error);
            setLocationEnabled(false);
          }
        );
      }
    }
  }, [locationEnabled, userLocation]);

  const { data: reportsData, isLoading } = useReports({
    urgency_level: urgencyFilter || undefined,
    status: statusFilter || undefined,
    search: searchQuery || undefined,
    sort: sortBy,
    page,
    limit,
  });

  // Fetch user's own reports
  const { data: myReportsResponse, isLoading: myReportsLoading } =
    useMyReports();

  // Fetch nearby reports
  const { data: nearbyReportsData, isLoading: nearbyLoading } =
    useNearbyReports(
      userLocation,
      searchRadius,
      locationEnabled && selectedTab === "nearby"
    );

  // Get reports from API with server-side filtering and pagination
  let reports = Array.isArray(reportsData?.data) ? reportsData.data : [];

  // Get user's reports
  const myReportsData = Array.isArray(myReportsResponse?.data)
    ? myReportsResponse.data
    : [];

  // Apply client-side species filter for all reports
  if (speciesFilter && reports.length > 0) {
    reports = reports.filter((report) => report.species === speciesFilter);
  }

  // Apply date range filter for all reports
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

  // Filter my reports by status
  const filteredMyReports = myReportsStatusFilter
    ? myReportsData.filter((r: Report) => r.status === myReportsStatusFilter)
    : myReportsData;

  // Paginate my reports (use same limit as all reports for consistency)
  const paginatedMyReports = filteredMyReports.slice(
    (myReportsPage - 1) * limit,
    myReportsPage * limit
  );
  const totalMyReportsPages = Math.ceil(filteredMyReports.length / limit);

  const total = reportsData?.meta?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Nearby reports
  const nearbyReports = Array.isArray(nearbyReportsData)
    ? nearbyReportsData
    : [];
  const paginatedNearbyReports = nearbyReports.slice(
    (nearbyPage - 1) * limit,
    nearbyPage * limit
  );
  const totalNearbyPages = Math.ceil(nearbyReports.length / limit);

  // Fetch all reports for map (without pagination)
  const { data: allReportsData, isLoading: mapLoading } = useReports({
    limit: 1000, // Get more reports for the map
  });
  const allReports = Array.isArray(allReportsData?.data)
    ? allReportsData.data
    : [];

  const handleEditReport = (report: Report) => {
    setSelectedReport(report);
    onOpen();
  };

  const handleCloseModal = () => {
    onClose();
    setSelectedReport(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="w-8 h-8" />
              <span className="text-sm font-semibold tracking-wide uppercase">
                CỨU HỘ
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold">
              Báo Cáo Động Vật Cần Giúp Đỡ
            </h1>
            <p className="text-lg text-red-50 max-w-3xl mx-auto">
              Mỗi báo cáo đều quan trọng và có thể cứu sống một sinh linh. Hãy
              cùng nhau giúp đỡ những động vật cần giúp đỡ trong khu vực của
              bạn.
            </p>
          </div>
        </div>
      </section>

      {/* Map Section - Show all reports on map */}
      <section className="py-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2 mb-2">
              <MapPin className="w-7 h-7 text-primary-600" />
              Bản Đồ Báo Cáo
            </h2>
            <p className="text-gray-600">
              Xem các báo cáo về động vật cần được giúp đỡ
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <AllReportsMap
              reports={allReports}
              isLoading={mapLoading}
              center={[10.0452, 105.7469]}
            />
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key.toString())}
            color="primary"
            size="lg"
            classNames={{
              base: "w-full",
            }}
          >
            {/* All Reports Tab */}
            <Tab key="all" title="Tất Cả Báo Cáo">
              {/* Filters Section */}
              <Card className="mb-6">
                <CardBody className="p-4">
                  <div className="flex flex-wrap items-end gap-2">
                    <Input
                      placeholder="Tìm kiếm theo tiêu đề, loài động vật hoặc vị trí..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      startContent={
                        <Search className="w-4 h-4 text-gray-400" />
                      }
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
                        setPage(1);
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
                </CardBody>
              </Card>

              {/* Reports List */}
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

              {/* List View - More suitable for urgent reports */}
              <div className="space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {reports?.map((report: any) => (
                  <Card
                    key={report.id}
                    className={`hover:shadow-lg transition-all duration-300 ${
                      report.urgency_level === "critical" ||
                      report.urgency_level === "high"
                        ? "ring-2 ring-red-200 bg-red-50/30"
                        : ""
                    }`}
                  >
                    <CardBody className="p-5">
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="shrink-0">
                          {report.images && report.images.length > 0 ? (
                            <img
                              src={report.images[0]?.image_url}
                              alt={report.title || "Report"}
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                              <AlertTriangle className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {report.title || "Animal in Need"}
                              </h3>
                              <div className="flex flex-wrap gap-2 mb-2">
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  className="bg-gray-100"
                                >
                                  {translateReportSpecies(report.species)}
                                </Chip>
                                <Chip
                                  size="sm"
                                  color={
                                    report.urgency_level === "critical"
                                      ? "danger"
                                      : report.urgency_level === "high"
                                      ? "warning"
                                      : report.urgency_level === "medium"
                                      ? "primary"
                                      : "default"
                                  }
                                  variant="solid"
                                  className="font-bold"
                                >
                                  {translateUrgencyLevel(report.urgency_level)}
                                </Chip>
                                <Chip
                                  size="sm"
                                  color={
                                    report.status === "pending"
                                      ? "warning"
                                      : report.status === "assigned"
                                      ? "primary"
                                      : "success"
                                  }
                                  variant="flat"
                                >
                                  {translateReportStatus(report.status)}
                                </Chip>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 line-clamp-2">
                            {report.description}
                          </p>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {report.location && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span className="line-clamp-1">
                                  {report.location}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              <span>
                                {report.date_created
                                  ? new Date(
                                      report.date_created
                                    ).toLocaleDateString("vi-VN", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "N/A"}
                              </span>
                            </div>

                            {report.contact_name && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <User className="w-4 h-4 flex-shrink-0" />
                                <span className="line-clamp-1">
                                  {report.contact_name}
                                </span>
                              </div>
                            )}

                            {report.contact_phone && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                <span>{report.contact_phone}</span>
                              </div>
                            )}
                          </div>

                          <div className="pt-2">
                            <Button
                              as={Link}
                              to={`/reports/${report.id}`}
                              color="primary"
                              variant="flat"
                              className="font-semibold"
                              size="sm"
                              startContent={<Eye className="w-4 h-4" />}
                            >
                              Xem Chi Tiết
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col items-center gap-4">
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
                      {Math.min(page * limit, total)} trong tổng số {total} báo
                      cáo
                    </p>
                  )}
                </div>
              )}
            </Tab>

            {/* My Reports Tab */}
            {user && (
              <Tab key="my-reports" title="Báo Cáo Của Tôi">
                {myReportsLoading ? (
                  <div className="flex justify-center py-12">
                    <Spinner size="lg" color="primary" />
                  </div>
                ) : filteredMyReports.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      {myReportsStatusFilter
                        ? `Không có báo cáo với trạng thái "${myReportsStatusFilter}"`
                        : "Bạn chưa gửi báo cáo nào."}
                    </p>
                    {!myReportsStatusFilter && (
                      <Button
                        as={Link}
                        to="/report"
                        color="primary"
                        className="font-semibold"
                      >
                        Báo Cáo Động Vật
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Filter */}
                    <Card>
                      <CardBody className="p-4">
                        <div className="flex justify-between items-center">
                          <Select
                            label="Lọc theo trạng thái"
                            placeholder="Tất cả trạng thái"
                            className="max-w-xs"
                            selectedKeys={
                              myReportsStatusFilter
                                ? [myReportsStatusFilter]
                                : []
                            }
                            onChange={(e) => {
                              setMyReportsStatusFilter(e.target.value);
                              setMyReportsPage(1);
                            }}
                            size="sm"
                          >
                            <SelectItem key="" value="">
                              Tất cả trạng thái
                            </SelectItem>
                            <SelectItem key="pending" value="pending">
                              Chờ Duyệt
                            </SelectItem>
                            <SelectItem key="assigned" value="assigned">
                              Đã Phân Công
                            </SelectItem>
                            <SelectItem key="resolved" value="resolved">
                              Đã Giải Quyết
                            </SelectItem>
                          </Select>
                          <p className="text-sm text-gray-500">
                            Hiển thị {paginatedMyReports.length} trong số{" "}
                            {filteredMyReports.length} báo cáo
                          </p>
                        </div>
                      </CardBody>
                    </Card>

                    {/* My Reports List - Same layout as All Reports */}
                    <div className="space-y-4">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {paginatedMyReports.map((report: any) => (
                        <Card
                          key={report.id}
                          className={`hover:shadow-lg transition-all duration-300 ${
                            report.urgency_level === "critical" ||
                            report.urgency_level === "high"
                              ? "ring-2 ring-red-200 bg-red-50/30"
                              : ""
                          }`}
                        >
                          <CardBody className="p-5">
                            <div className="flex gap-4">
                              {/* Image */}
                              <div className="shrink-0">
                                {report.images && report.images.length > 0 ? (
                                  <img
                                    src={report.images[0].image_url}
                                    alt={report.title || "Report"}
                                    className="w-32 h-32 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                                    <AlertTriangle className="w-12 h-12 text-gray-400" />
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                      {report.title || "Animal Report"}
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      <Chip
                                        size="sm"
                                        variant="flat"
                                        className="bg-gray-100"
                                      >
                                        {translateReportSpecies(report.species)}
                                      </Chip>
                                      <Chip
                                        size="sm"
                                        color={
                                          report.urgency_level === "critical"
                                            ? "danger"
                                            : report.urgency_level === "high"
                                            ? "warning"
                                            : report.urgency_level === "medium"
                                            ? "primary"
                                            : "default"
                                        }
                                        variant="solid"
                                        className="font-bold"
                                      >
                                        {translateUrgencyLevel(
                                          report.urgency_level
                                        )}
                                      </Chip>
                                      <Chip
                                        size="sm"
                                        color={
                                          report.status === "pending"
                                            ? "warning"
                                            : report.status === "assigned"
                                            ? "primary"
                                            : "success"
                                        }
                                        variant="flat"
                                      >
                                        {translateReportStatus(report.status)}
                                      </Chip>
                                    </div>
                                  </div>
                                </div>

                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {report.description}
                                </p>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {report.location && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <MapPin className="w-4 h-4 flex-shrink-0" />
                                      <span className="line-clamp-1">
                                        {report.location}
                                      </span>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="w-4 h-4 flex-shrink-0" />
                                    <span>
                                      {report.date_created
                                        ? new Date(
                                            report.date_created
                                          ).toLocaleDateString("vi-VN", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                          })
                                        : "N/A"}
                                    </span>
                                  </div>

                                  {report.contact_name && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <User className="w-4 h-4 flex-shrink-0" />
                                      <span className="line-clamp-1">
                                        {report.contact_name}
                                      </span>
                                    </div>
                                  )}

                                  {report.contact_phone && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <Phone className="w-4 h-4 flex-shrink-0" />
                                      <span>{report.contact_phone}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-2 pt-2">
                                  <Button
                                    as={Link}
                                    to={`/reports/${report.id}`}
                                    color="primary"
                                    variant="flat"
                                    size="sm"
                                    startContent={<Eye className="w-4 h-4" />}
                                  >
                                    Xem Chi Tiết
                                  </Button>
                                  {report.status !== "resolved" && (
                                    <Button
                                      color="secondary"
                                      variant="flat"
                                      size="sm"
                                      startContent={
                                        <Edit className="w-4 h-4" />
                                      }
                                      onPress={() => handleEditReport(report)}
                                    >
                                      Chỉnh Sửa
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalMyReportsPages > 1 && (
                      <div className="flex justify-center mt-6">
                        <Pagination
                          total={totalMyReportsPages}
                          page={myReportsPage}
                          onChange={setMyReportsPage}
                          showControls
                          color="primary"
                        />
                      </div>
                    )}
                  </div>
                )}
              </Tab>
            )}

            {/* Nearby Reports Tab */}
            <Tab
              key="nearby"
              title={
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  Báo Cáo Gần Đây
                </div>
              }
            >
              <div className="space-y-4">
                {/* Location Controls */}
                <Card className="border-2 border-primary-200 bg-primary-50">
                  <CardBody className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Navigation className="w-5 h-5 text-primary-600" />
                            Bật Vị Trí
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Chia sẻ vị trí để tìm báo cáo động vật gần bạn
                          </p>
                        </div>
                        <Switch
                          isSelected={locationEnabled}
                          onValueChange={setLocationEnabled}
                          color="primary"
                        />
                      </div>

                      {locationEnabled && userLocation && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-success-600">
                            <CheckCircle className="w-4 h-4" />
                            Đã phát hiện vị trí:{" "}
                            {userLocation.latitude.toFixed(4)},{" "}
                            {userLocation.longitude.toFixed(4)}
                          </div>

                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">
                              Bán Kính Tìm Kiếm:{" "}
                              {(searchRadius / 1000).toFixed(0)} km
                            </label>
                            <Slider
                              aria-label="Search radius in kilometers"
                              size="sm"
                              step={5000}
                              minValue={5000}
                              maxValue={100000}
                              value={searchRadius}
                              onChange={(value) => {
                                setSearchRadius(
                                  Array.isArray(value) ? value[0] : value
                                );
                                setNearbyPage(1);
                              }}
                              className="max-w-md"
                              color="primary"
                            />
                          </div>
                        </div>
                      )}

                      {locationEnabled && !userLocation && (
                        <div className="flex items-center gap-2 text-sm text-warning-600">
                          <Clock className="w-4 h-4" />
                          Đang yêu cầu quyền truy cập vị trí...
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>

                {/* Nearby Reports List */}
                {!locationEnabled ? (
                  <div className="text-center py-12">
                    <Navigation className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      Bật chia sẻ vị trí để xem báo cáo động vật gần bạn
                    </p>
                    <p className="text-sm text-gray-400">
                      Vị trí của bạn chỉ được sử dụng để tìm báo cáo gần bạn
                    </p>
                  </div>
                ) : nearbyLoading ? (
                  <div className="flex justify-center py-12">
                    <Spinner size="lg" color="primary" />
                  </div>
                ) : nearbyReports.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">
                      Không tìm thấy báo cáo trong vòng{" "}
                      {(searchRadius / 1000).toFixed(0)} km
                    </p>
                    <p className="text-sm text-gray-400">
                      Thử tăng bán kính tìm kiếm
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-gray-600 font-semibold">
                        Tìm thấy {nearbyReports.length} báo cáo gần đây
                      </p>
                      <p className="text-sm text-gray-500">
                        Hiển thị {paginatedNearbyReports.length} trong số{" "}
                        {nearbyReports.length}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {paginatedNearbyReports.map((report: any) => (
                        <Card
                          key={report.id}
                          className="hover:shadow-lg transition-all duration-300 border-primary-200"
                        >
                          <CardBody className="p-5">
                            <div className="flex gap-4">
                              {/* Image */}
                              <div className="shrink-0">
                                {report.images && report.images.length > 0 ? (
                                  <img
                                    src={report.images[0].image_url}
                                    alt={report.title || "Report"}
                                    className="w-32 h-32 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                                    <AlertTriangle className="w-12 h-12 text-gray-400" />
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                      {report.title || "Animal Report"}
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      <Chip
                                        size="sm"
                                        color="primary"
                                        variant="flat"
                                        className="font-semibold"
                                      >
                                        Cách {report.distance_km} km
                                      </Chip>
                                      <Chip
                                        size="sm"
                                        variant="flat"
                                        className="bg-gray-100"
                                      >
                                        {translateReportSpecies(report.species)}
                                      </Chip>
                                      <Chip
                                        size="sm"
                                        color={
                                          report.urgency_level === "critical"
                                            ? "danger"
                                            : report.urgency_level === "high"
                                            ? "warning"
                                            : report.urgency_level === "medium"
                                            ? "primary"
                                            : "default"
                                        }
                                        variant="solid"
                                        className="font-bold"
                                      >
                                        {translateUrgencyLevel(
                                          report.urgency_level
                                        )}
                                      </Chip>
                                      <Chip
                                        size="sm"
                                        color={
                                          report.status === "pending"
                                            ? "warning"
                                            : report.status === "assigned"
                                            ? "primary"
                                            : "success"
                                        }
                                        variant="flat"
                                      >
                                        {translateReportStatus(report.status)}
                                      </Chip>
                                    </div>
                                  </div>
                                </div>

                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {report.description}
                                </p>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {report.location && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <MapPin className="w-4 h-4 flex-shrink-0" />
                                      <span className="line-clamp-1">
                                        {report.location}
                                      </span>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="w-4 h-4 flex-shrink-0" />
                                    <span>
                                      {report.date_created
                                        ? new Date(
                                            report.date_created
                                          ).toLocaleDateString("vi-VN")
                                        : "N/A"}
                                    </span>
                                  </div>

                                  {report.contact_name && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <User className="w-4 h-4 flex-shrink-0" />
                                      <span className="line-clamp-1">
                                        {report.contact_name}
                                      </span>
                                    </div>
                                  )}

                                  {report.contact_phone && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <Phone className="w-4 h-4 flex-shrink-0" />
                                      <span>{report.contact_phone}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="pt-2">
                                  <Button
                                    as={Link}
                                    to={`/reports/${report.id}`}
                                    color="primary"
                                    variant="flat"
                                    size="sm"
                                    startContent={<Eye className="w-4 h-4" />}
                                  >
                                    Xem Chi Tiết
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalNearbyPages > 1 && (
                      <div className="flex justify-center mt-6">
                        <Pagination
                          total={totalNearbyPages}
                          page={nearbyPage}
                          onChange={setNearbyPage}
                          showControls
                          color="primary"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </Tab>
          </Tabs>
        </div>
      </section>

      {/* Edit Modal */}
      {selectedReport && (
        <ReportEditModal
          isOpen={isOpen}
          onClose={handleCloseModal}
          report={selectedReport}
        />
      )}
    </div>
  );
};
