import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Spinner,
  Tabs,
  Tab,
  Accordion,
  AccordionItem,
  Divider,
  Pagination,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Select,
  SelectItem,
  DateRangePicker as NextUIDateRangePicker,
  type DateValue,
  type RangeValue,
} from "@nextui-org/react";
import {
  Calendar,
  MapPin,
  Users,
  ChevronRight,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useRescues, useMyRescues } from "../hooks/useRescues";
import { InteractiveRescueMap } from "../components/Map/InteractiveRescueMap";
import { useAuthStore } from "../store/auth.store";
import type { Rescue, Report } from "../types";

export const RescuesPage = () => {
  const { user } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState("in_progress");
  const [selectedRescue, setSelectedRescue] = useState<Rescue | null>(null);

  // Status filter for map section (top)
  const [mapStatusFilter, setMapStatusFilter] = useState<string>("");

  // Pagination and filters for table list
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>(
    null
  );
  const limit = 9;

  // Fetch ALL rescues for map section (no status filter)
  const { data: allRescuesData, isLoading: allRescuesLoading } = useRescues({});

  // Fetch rescues for table with pagination
  const {
    data: rescuesData,
    isLoading,
    isError,
  } = useRescues({
    status:
      selectedTab === "all" || selectedTab === "my" ? undefined : selectedTab,
    page: selectedTab === "my" ? undefined : page,
    limit: selectedTab === "my" ? undefined : limit,
  });

  // Fetch user's rescues
  const {
    data: myRescuesData,
    isLoading: myRescuesLoading,
    isError: myRescuesError,
  } = useMyRescues();

  // Determine which data to display based on selected tab
  const isMyTab = selectedTab === "my";
  const currentData = isMyTab ? myRescuesData : rescuesData;
  const currentLoading = isMyTab ? myRescuesLoading : isLoading;
  const currentError = isMyTab ? myRescuesError : isError;

  // Base rescues list for MAP section - uses ALL rescues data
  let baseRescues = Array.isArray(allRescuesData?.data)
    ? allRescuesData.data
    : [];

  // Sort base rescues by newest first
  baseRescues = [...baseRescues].sort((a, b) => {
    const dateA = a.date_created ? new Date(a.date_created).getTime() : 0;
    const dateB = b.date_created ? new Date(b.date_created).getTime() : 0;
    return dateB - dateA;
  });

  // Apply map status filter ONLY for the map section
  const filteredRescuesForMap = mapStatusFilter
    ? baseRescues.filter((r) => r.status === mapStatusFilter)
    : baseRescues;

  // Table rescues list - uses filtered data from tab selection
  let tableRescues = Array.isArray(currentData?.data) ? currentData.data : [];

  // Apply date range filter for table only
  if (dateRange?.start && dateRange?.end && tableRescues.length > 0) {
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
    tableRescues = tableRescues.filter((rescue) => {
      if (!rescue.date_created) return false;
      const rescueTime = new Date(rescue.date_created).getTime();
      return rescueTime >= startTime && rescueTime <= endTime;
    });
  }

  // Apply sort for table
  tableRescues = [...tableRescues].sort((a, b) => {
    const dateA = a.date_created ? new Date(a.date_created).getTime() : 0;
    const dateB = b.date_created ? new Date(b.date_created).getTime() : 0;
    return sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });

  const total = rescuesData?.meta?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Get reports from selected rescue
  const selectedReports: Report[] =
    selectedRescue?.reports
      ?.map((rr) => rr.report)
      .filter((r): r is Report => r !== undefined && r !== null) || [];

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
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "planned":
        return "Đã Lên Kế Hoạch";
      case "in_progress":
        return "Đang Thực Hiện";
      case "completed":
        return "Hoàn Thành";
      case "cancelled":
        return "Đã Hủy";
      default:
        return status;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa xác định";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-12">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-heading font-bold">
              Chiến Dịch Cứu Hộ
            </h1>
            <p className="text-lg text-blue-50 max-w-2xl mx-auto">
              Tham gia các nhiệm vụ cứu hộ có tổ chức để cứu giúp động vật cần
              giúp đỡ
            </p>
          </div>
        </div>
      </section>

      {/* Main Content - Map and Rescue List Side by Side */}
      <section className="py-8 bg-gradient-to-br from-blue-50 via-gray-50 to-blue-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {currentLoading && (
            <div className="flex justify-center items-center py-20">
              <Spinner size="lg" color="primary" />
            </div>
          )}

          {currentError && (
            <div className="text-center py-20">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-red-500 text-lg">
                Không thể tải chiến dịch. Vui lòng thử lại sau.
              </p>
            </div>
          )}

          {!currentLoading && !currentError && baseRescues.length === 0 && (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {isMyTab
                  ? "Bạn chưa tham gia chiến dịch cứu hộ nào."
                  : "Không tìm thấy chiến dịch cứu hộ nào cho danh mục này."}
              </p>
            </div>
          )}

          {!currentLoading && !currentError && baseRescues.length > 0 && (
            <Card className="shadow-xl border-2 border-blue-200 bg-white relative z-0">
              <CardBody className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                  {/* Map Section - 7 columns */}
                  <div className="lg:col-span-7">
                    <Card className="shadow-md border border-gray-200 h-full relative z-0">
                      <CardBody className="p-4">
                        <div className="mb-4">
                          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-6 h-6 text-blue-600" />
                            Bản Đồ Báo Cáo
                          </h2>
                          <p className="text-gray-600 text-sm mt-1">
                            {selectedRescue
                              ? `Hiển thị ${selectedReports.length} báo cáo trong chiến dịch "${selectedRescue.title}"`
                              : "Chọn một chiến dịch để xem các báo cáo trên bản đồ"}
                          </p>
                        </div>
                        <div className="h-[600px]">
                          <InteractiveRescueMap
                            reports={selectedReports}
                            isLoading={false}
                          />
                        </div>
                      </CardBody>
                    </Card>
                  </div>

                  {/* Rescue List Section - 3 columns */}
                  <div className="lg:col-span-3">
                    <Card className="shadow-md border border-gray-200 h-full">
                      <CardBody className="p-4">
                        <div className="mb-4">
                          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Users className="w-6 h-6 text-blue-600" />
                            Danh Sách Chiến Dịch
                          </h2>
                          <p className="text-gray-600 text-sm mt-1">
                            {filteredRescuesForMap.length} chiến dịch
                          </p>
                        </div>

                        {/* Status Filter */}
                        <div className="mb-4">
                          <Select
                            label="Lọc theo trạng thái"
                            placeholder="Tất cả trạng thái"
                            selectedKeys={
                              mapStatusFilter ? [mapStatusFilter] : []
                            }
                            onChange={(e) => setMapStatusFilter(e.target.value)}
                            size="sm"
                            classNames={{
                              base: "w-full",
                            }}
                          >
                            <SelectItem key="" value="">
                              Tất cả trạng thái
                            </SelectItem>
                            <SelectItem key="planned" value="planned">
                              Đã Lên Kế Hoạch
                            </SelectItem>
                            <SelectItem key="in_progress" value="in_progress">
                              Đang Thực Hiện
                            </SelectItem>
                            <SelectItem key="completed" value="completed">
                              Hoàn Thành
                            </SelectItem>
                            <SelectItem key="cancelled" value="cancelled">
                              Đã Hủy
                            </SelectItem>
                          </Select>
                        </div>

                        <Divider className="my-4" />

                        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
                          <Accordion
                            selectionMode="single"
                            variant="splitted"
                            selectedKeys={
                              selectedRescue ? [selectedRescue.id] : []
                            }
                            onSelectionChange={(keys) => {
                              const selectedKey = Array.from(keys)[0] as string;
                              const rescue = filteredRescuesForMap.find(
                                (r) => r.id === selectedKey
                              );
                              setSelectedRescue(rescue || null);
                            }}
                          >
                            {filteredRescuesForMap.map((rescue) => (
                              <AccordionItem
                                key={rescue.id}
                                aria-label={rescue.title}
                                title={
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-bold text-gray-900 text-base line-clamp-1">
                                        {rescue.title}
                                      </h3>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Chip
                                          size="sm"
                                          color={getStatusColor(rescue.status)}
                                          variant="flat"
                                        >
                                          {getStatusLabel(rescue.status)}
                                        </Chip>
                                      </div>
                                    </div>
                                  </div>
                                }
                                classNames={{
                                  base: "shadow-md hover:shadow-lg transition-shadow",
                                  title: "text-base",
                                  trigger:
                                    "px-4 py-3 data-[hover=true]:bg-gray-50",
                                  content: "px-4 pb-4 pt-2",
                                }}
                              >
                                <div className="space-y-3">
                                  <p className="text-sm text-gray-600 line-clamp-3">
                                    {rescue.description ||
                                      "Không có mô tả cho chiến dịch này"}
                                  </p>

                                  <Divider />

                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                      <Calendar className="w-4 h-4 text-gray-400" />
                                      <span className="text-gray-600">
                                        Ngày tạo:{" "}
                                        {formatDate(rescue.date_created)}
                                      </span>
                                    </div>

                                    {rescue.start_date && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">
                                          Bắt đầu:{" "}
                                          {formatDate(rescue.start_date)}
                                        </span>
                                      </div>
                                    )}

                                    <div className="flex items-center gap-2 text-sm">
                                      <Users className="w-4 h-4 text-gray-400" />
                                      <span className="text-gray-600">
                                        Tình nguyện viên:{" "}
                                        {rescue.participants?.length || 0}
                                        {rescue.required_participants &&
                                          ` / ${rescue.required_participants}`}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                      <FileText className="w-4 h-4 text-gray-400" />
                                      <span className="text-gray-600">
                                        Báo cáo: {rescue.reports?.length || 0}
                                      </span>
                                    </div>
                                  </div>

                                  <Divider />

                                  <Button
                                    as={Link}
                                    to={`/rescues/${rescue.id}`}
                                    color="primary"
                                    variant="flat"
                                    className="w-full"
                                    endContent={
                                      <ChevronRight className="w-4 h-4" />
                                    }
                                  >
                                    Xem Chi Tiết
                                  </Button>
                                </div>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </section>

      {/* Tabs Section */}
      <section className="bg-white shadow-md z-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key) => {
              setSelectedTab(key.toString());
              setSelectedRescue(null); // Reset selection when changing tabs
              setPage(1); // Reset page when changing tabs
            }}
            color="primary"
            size="lg"
            classNames={{
              tabList: "gap-6",
              cursor: "bg-primary-500",
              tab: "h-12",
            }}
          >
            <Tab key="in_progress" title="Đang Thực Hiện" />
            <Tab key="planned" title="Đã Lên Kế Hoạch" />
            {user && <Tab key="my" title="Của Tôi" />}
            <Tab key="completed" title="Hoàn Thành" />
            <Tab key="all" title="Tất Cả" />
          </Tabs>
        </div>
      </section>

      {/* Table List Section */}
      <section className="py-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Tất Cả Chiến Dịch Cứu Hộ
            </h2>
            <p className="text-gray-600">
              Danh sách đầy đủ các chiến dịch với bộ lọc nâng cao
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <NextUIDateRangePicker
              label="Chọn khoảng thời gian"
              className="max-w-xs"
              value={dateRange}
              onChange={setDateRange}
            />
            <Select
              label="Sắp xếp theo"
              placeholder="Chọn thứ tự"
              className="max-w-xs"
              selectedKeys={[sortBy]}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <SelectItem key="newest" value="newest">
                Mới nhất
              </SelectItem>
              <SelectItem key="oldest" value="oldest">
                Cũ nhất
              </SelectItem>
            </Select>
          </div>

          {/* Empty State for Filters */}
          {!currentLoading && !currentError && tableRescues.length === 0 && (
            <Card className="shadow-lg mb-6">
              <CardBody className="py-16">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Không tìm thấy chiến dịch
                  </h3>
                  <p className="text-gray-600">
                    Không có chiến dịch nào phù hợp với bộ lọc hiện tại. Thử
                    điều chỉnh bộ lọc của bạn.
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Table View */}
          {!currentLoading && !currentError && tableRescues.length > 0 && (
            <>
              <Card className="shadow-lg mb-6">
                <CardBody className="p-0">
                  <Table
                    aria-label="Bảng chiến dịch cứu hộ"
                    classNames={{
                      wrapper: "min-h-[400px]",
                      th: "bg-gray-100 text-gray-700 font-semibold text-sm",
                      td: "py-5 px-6",
                    }}
                  >
                    <TableHeader>
                      <TableColumn className="text-base">
                        CHIẾN DỊCH
                      </TableColumn>
                      <TableColumn className="text-base">
                        TRẠNG THÁI
                      </TableColumn>
                      <TableColumn className="text-base">
                        NGÀY BẮT ĐẦU
                      </TableColumn>
                      <TableColumn className="text-base">
                        NGƯỜI THAM GIA
                      </TableColumn>
                      <TableColumn className="text-base">HÀNH ĐỘNG</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {tableRescues.map((rescue) => (
                        <TableRow key={rescue.id} className="hover:bg-gray-50">
                          <TableCell className="max-w-md">
                            <div>
                              <p className="font-semibold text-gray-900 text-base mb-1">
                                {rescue.title}
                              </p>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {rescue.description ||
                                  "Tham gia chiến dịch cứu hộ này"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Chip
                              color={getStatusColor(rescue.status)}
                              variant="flat"
                              size="md"
                              className="font-medium"
                            >
                              {getStatusLabel(rescue.status)}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar className="w-4 h-4" />
                              <span className="text-base">
                                {formatDate(rescue.date_created)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-medium text-gray-900">
                                {rescue.participants?.length || 0} /{" "}
                                {rescue.required_participants || "∞"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              as={Link}
                              to={`/rescues/${rescue.id}`}
                              color="primary"
                              size="md"
                              variant="flat"
                              className="font-medium"
                            >
                              Xem Chi Tiết
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>

              {/* Pagination - only show for paginated tabs */}
              {!isMyTab && totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination
                    total={totalPages}
                    page={page}
                    onChange={setPage}
                    color="primary"
                    size="lg"
                    showControls
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-500">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Muốn Tạo Chiến Dịch?
          </h2>
          <p className="text-lg text-blue-50 mb-8">
            Bạn đã gặp động vật cần cứu hộ khẩn cấp? Tạo một chiến dịch và tập
            hợp tình nguyện viên để giúp đỡ!
          </p>
          <Button
            as={Link}
            to="/dashboard"
            size="lg"
            className="bg-white text-blue-600 font-bold hover:bg-gray-100 px-10 h-14"
          >
            Tạo Chiến Dịch
          </Button>
        </div>
      </section>
    </div>
  );
};
