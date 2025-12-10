import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardBody,
  Chip,
  Button,
  Spinner,
  Tabs,
  Tab,
  Pagination,
  Select,
  SelectItem,
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
import { useMyAdoptions } from "../hooks/useAdoptions";
import { useMyReports } from "../hooks/useReports";
import { useMyRescues } from "../hooks/useRescues";
import { useDashboardStats } from "../hooks/useDashboard";
import type { Adoption, Report, Rescue, Pet } from "../types";
import {
  translateReportSpecies,
  translateReportStatus,
  translateUrgencyLevel,
} from "../utils/translations";

export const DashboardPage = () => {
  const [selectedTab, setSelectedTab] = useState("adoptions");

  // Pagination states
  const [adoptionsPage, setAdoptionsPage] = useState(1);
  const [reportsPage, setReportsPage] = useState(1);
  const [rescuesPage, setRescuesPage] = useState(1);
  const itemsPerPage = 5;

  // Filter states
  const [adoptionsStatusFilter, setAdoptionsStatusFilter] =
    useState<string>("");
  const [reportsStatusFilter, setReportsStatusFilter] = useState<string>("");
  const [rescuesStatusFilter, setRescuesStatusFilter] = useState<string>("");

  // Fetch user's data using the correct /me endpoints
  const { data: adoptionsResponse, isLoading: adoptionsLoading } =
    useMyAdoptions();
  const { data: reportsResponse, isLoading: reportsLoading } = useMyReports();
  const { data: rescuesResponse, isLoading: rescuesLoading } = useMyRescues();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  // Extract data from API responses - use useMemo to prevent recreating arrays on every render
  const adoptionsData = useMemo(
    () => adoptionsResponse?.data || [],
    [adoptionsResponse?.data]
  );
  const reportsData = useMemo(
    () => reportsResponse?.data || [],
    [reportsResponse?.data]
  );
  const rescuesData = useMemo(
    () => rescuesResponse?.data || [],
    [rescuesResponse?.data]
  );

  // Debug: Log first adoption to check data structure
  useEffect(() => {
    if (adoptionsData.length > 0) {
      console.log("First adoption data:", adoptionsData[0]);
      console.log("Pet data:", adoptionsData[0].pet_id);
      if (typeof adoptionsData[0].pet_id === "object") {
        console.log("Pet images:", (adoptionsData[0].pet_id as Pet).pet_images);
      }
    }
  }, [adoptionsData]);

  // Apply filters
  const filteredAdoptions = adoptionsStatusFilter
    ? adoptionsData.filter((a: Adoption) => a.status === adoptionsStatusFilter)
    : adoptionsData;

  const filteredReports = reportsStatusFilter
    ? reportsData.filter((r: Report) => r.status === reportsStatusFilter)
    : reportsData;

  const filteredRescues = rescuesStatusFilter
    ? rescuesData.filter((r: Rescue) => r.status === rescuesStatusFilter)
    : rescuesData;

  // Paginate data
  const paginatedAdoptions = filteredAdoptions.slice(
    (adoptionsPage - 1) * itemsPerPage,
    adoptionsPage * itemsPerPage
  );

  const paginatedReports = filteredReports.slice(
    (reportsPage - 1) * itemsPerPage,
    reportsPage * itemsPerPage
  );

  const paginatedRescues = filteredRescues.slice(
    (rescuesPage - 1) * itemsPerPage,
    rescuesPage * itemsPerPage
  );

  const totalAdoptionsPages = Math.ceil(
    filteredAdoptions.length / itemsPerPage
  );
  const totalReportsPages = Math.ceil(filteredReports.length / itemsPerPage);
  const totalRescuesPages = Math.ceil(filteredRescues.length / itemsPerPage);

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
            Bảng Điều Khiển
          </h1>
          <p className="text-gray-600 mt-2">
            Theo dõi đơn nhận nuôi, báo cáo và chiến dịch cứu hộ của bạn
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardBody className="flex flex-row items-center gap-4 p-6">
              <div className="p-3 bg-green-100 rounded-lg">
                <PawPrint className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Đơn Nhận Nuôi Của Tôi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {adoptionsData.length}
                </p>
                {statsLoading ? (
                  <Spinner size="sm" />
                ) : (
                  stats && (
                    <div className="flex gap-2 mt-1">
                      <Chip size="sm" color="warning" variant="flat">
                        {stats.adoptions.pending} chờ duyệt
                      </Chip>
                      <Chip size="sm" color="success" variant="flat">
                        {stats.adoptions.approved} đã chấp nhận
                      </Chip>
                    </div>
                  )
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex flex-row items-center gap-4 p-6">
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Báo Cáo Của Tôi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportsData.length}
                </p>
                {statsLoading ? (
                  <Spinner size="sm" />
                ) : (
                  stats && (
                    <div className="flex gap-2 mt-1">
                      <Chip size="sm" color="warning" variant="flat">
                        {stats.reports.pending} chờ duyệt
                      </Chip>
                      <Chip size="sm" color="success" variant="flat">
                        {stats.reports.resolved} đã giải quyết
                      </Chip>
                    </div>
                  )
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex flex-row items-center gap-4 p-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Cứu Hộ Của Tôi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rescuesData.length}
                </p>
                {statsLoading ? (
                  <Spinner size="sm" />
                ) : (
                  stats && (
                    <div className="flex gap-2 mt-1">
                      <Chip size="sm" color="primary" variant="flat">
                        {stats.rescues.in_progress} đang hoạt động
                      </Chip>
                      <Chip size="sm" color="success" variant="flat">
                        {stats.rescues.completed} hoàn thành
                      </Chip>
                    </div>
                  )
                )}
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
              <Tab key="adoptions" title="Đơn Nhận Nuôi Của Tôi">
                {adoptionsLoading ? (
                  <div className="flex justify-center py-12">
                    <Spinner size="lg" color="primary" />
                  </div>
                ) : filteredAdoptions.length === 0 ? (
                  <div className="text-center py-12">
                    <PawPrint className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      {adoptionsStatusFilter
                        ? `Không có đơn nhận nuôi với trạng thái "${adoptionsStatusFilter}"`
                        : "Bạn chưa nộp đơn nhận nuôi nào."}
                    </p>
                    {!adoptionsStatusFilter && (
                      <Button
                        as={Link}
                        to="/pets"
                        color="primary"
                        className="font-semibold"
                      >
                        Xem Thú Cưng
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Filter */}
                    <div className="flex justify-between items-center">
                      <Select
                        label="Lọc theo trạng thái"
                        placeholder="Tất cả trạng thái"
                        className="max-w-xs"
                        selectedKeys={
                          adoptionsStatusFilter ? [adoptionsStatusFilter] : []
                        }
                        onChange={(e) => {
                          setAdoptionsStatusFilter(e.target.value);
                          setAdoptionsPage(1);
                        }}
                      >
                        <SelectItem key="" value="">
                          Tất cả trạng thái
                        </SelectItem>
                        <SelectItem key="pending" value="pending">
                          Chờ Duyệt
                        </SelectItem>
                        <SelectItem key="confirming" value="confirming">
                          Đang Xác Nhận
                        </SelectItem>
                        <SelectItem key="confirmed" value="confirmed">
                          Đã Xác Nhận
                        </SelectItem>
                        <SelectItem key="approved" value="approved">
                          Đã Chấp Nhận
                        </SelectItem>
                        <SelectItem key="completed" value="completed">
                          Hoàn Thành
                        </SelectItem>
                        <SelectItem key="cancelled" value="cancelled">
                          Đã Hủy
                        </SelectItem>
                      </Select>
                      <p className="text-sm text-gray-500">
                        Hiển thị {paginatedAdoptions.length} trong số{" "}
                        {filteredAdoptions.length} đơn nhận nuôi
                      </p>
                    </div>

                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {paginatedAdoptions.map((adoption: any) => (
                      <Card key={adoption.id} className="border">
                        <CardBody className="p-5">
                          <div className="flex flex-col md:flex-row gap-4">
                            {/* Pet Image */}
                            <div className="shrink-0">
                              <img
                                src={
                                  adoption.pet_id?.pet_images?.[0]?.image_url ||
                                  "/placeholder-pet.jpg"
                                }
                                alt={adoption.pet_id?.name || "Pet"}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                            </div>

                            {/* Details */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900">
                                    {adoption.pet_id?.name || "Pet Name"}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {adoption.pet_id?.species}
                                    {adoption.pet_id?.breed &&
                                      ` • ${adoption.pet_id.breed}`}
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
                                  <span className="font-semibold">
                                    Ghi chú:
                                  </span>{" "}
                                  {adoption.notes}
                                </p>
                              )}

                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                Nộp đơn ngày{" "}
                                {new Date(
                                  adoption.date_created
                                ).toLocaleDateString()}
                              </div>

                              <div className="mt-4">
                                <Button
                                  as={Link}
                                  to={`/pets/${
                                    adoption.pet_id?.id || adoption.pet_id
                                  }`}
                                  color="primary"
                                  size="sm"
                                  variant="flat"
                                  className="font-semibold"
                                >
                                  Xem Chi Tiết Thú Cưng
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}

                    {/* Pagination */}
                    {totalAdoptionsPages > 1 && (
                      <div className="flex justify-center mt-6">
                        <Pagination
                          total={totalAdoptionsPages}
                          page={adoptionsPage}
                          onChange={setAdoptionsPage}
                          showControls
                          color="primary"
                        />
                      </div>
                    )}
                  </div>
                )}
              </Tab>

              {/* Reports Tab */}
              <Tab key="reports" title="Báo Cáo Của Tôi">
                {reportsLoading ? (
                  <div className="flex justify-center py-12">
                    <Spinner size="lg" color="primary" />
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      {reportsStatusFilter
                        ? `Không có báo cáo với trạng thái "${reportsStatusFilter}"`
                        : "Bạn chưa gửi báo cáo nào."}
                    </p>
                    {!reportsStatusFilter && (
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
                    <div className="flex justify-between items-center">
                      <Select
                        label="Lọc theo trạng thái"
                        placeholder="Tất cả trạng thái"
                        className="max-w-xs"
                        selectedKeys={
                          reportsStatusFilter ? [reportsStatusFilter] : []
                        }
                        onChange={(e) => {
                          setReportsStatusFilter(e.target.value);
                          setReportsPage(1);
                        }}
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
                        Hiển thị {paginatedReports.length} trong số{" "}
                        {filteredReports.length} báo cáo
                      </p>
                    </div>

                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {paginatedReports.map((report: any) => (
                      <Card key={report.id} className="border">
                        <CardBody className="p-5">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                  {report.title || "Animal Report"}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {translateReportSpecies(
                                    report.species || report.type
                                  )}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Chip
                                  color={getStatusColor(report.status)}
                                  variant="flat"
                                  size="sm"
                                >
                                  {translateReportStatus(report.status)}
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
                                  {translateUrgencyLevel(report.urgency_level)}
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
                              Báo cáo ngày{" "}
                              {new Date(
                                report.date_created
                              ).toLocaleDateString()}
                            </div>

                            <div className="flex gap-2 mt-4">
                              <Button
                                as={Link}
                                to={`/reports/${report.id}`}
                                color="primary"
                                size="sm"
                                variant="flat"
                                className="font-semibold"
                              >
                                Xem Chi Tiết
                              </Button>
                              {report.status === "assigned" && (
                                <Button
                                  as={Link}
                                  to={`/rescues`}
                                  color="secondary"
                                  size="sm"
                                  variant="flat"
                                  className="font-semibold"
                                >
                                  Xem Chiến Dịch Cứu Hộ
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}

                    {/* Pagination */}
                    {totalReportsPages > 1 && (
                      <div className="flex justify-center mt-6">
                        <Pagination
                          total={totalReportsPages}
                          page={reportsPage}
                          onChange={setReportsPage}
                          showControls
                          color="primary"
                        />
                      </div>
                    )}
                  </div>
                )}
              </Tab>

              {/* Rescue Campaigns Tab */}
              <Tab key="rescues" title="Cứu Hộ Của Tôi">
                {rescuesLoading ? (
                  <div className="flex justify-center py-12">
                    <Spinner size="lg" color="primary" />
                  </div>
                ) : filteredRescues.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      {rescuesStatusFilter
                        ? `Không có cứu hộ với trạng thái "${rescuesStatusFilter}"`
                        : "Bạn chưa tham gia chiến dịch cứu hộ nào."}
                    </p>
                    {!rescuesStatusFilter && (
                      <Button
                        as={Link}
                        to="/rescues"
                        color="primary"
                        className="font-semibold"
                      >
                        Xem Chiến Dịch
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Filter */}
                    <div className="flex justify-between items-center">
                      <Select
                        label="Lọc theo trạng thái"
                        placeholder="Tất cả trạng thái"
                        className="max-w-xs"
                        selectedKeys={
                          rescuesStatusFilter ? [rescuesStatusFilter] : []
                        }
                        onChange={(e) => {
                          setRescuesStatusFilter(e.target.value);
                          setRescuesPage(1);
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
                      <p className="text-sm text-gray-500">
                        Hiển thị {paginatedRescues.length} trong số{" "}
                        {filteredRescues.length} cứu hộ
                      </p>
                    </div>

                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {paginatedRescues.map((rescue: any) => (
                      <Card key={rescue.id} className="border">
                        <CardBody className="p-5">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
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
                                {rescue.status?.replace("_", " ")}
                              </Chip>
                            </div>

                            {rescue.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                {rescue.location}
                              </div>
                            )}

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              {rescue.start_date && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(
                                    rescue.start_date
                                  ).toLocaleDateString()}
                                </div>
                              )}
                              {rescue.participants && (
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  {rescue.participants.length} người tham gia
                                </div>
                              )}
                            </div>

                            <div className="mt-4">
                              <Button
                                as={Link}
                                to={`/rescues/${rescue.id}`}
                                color="primary"
                                size="sm"
                                className="font-semibold"
                              >
                                Xem Chiến Dịch
                              </Button>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}

                    {/* Pagination */}
                    {totalRescuesPages > 1 && (
                      <div className="flex justify-center mt-6">
                        <Pagination
                          total={totalRescuesPages}
                          page={rescuesPage}
                          onChange={setRescuesPage}
                          showControls
                          color="primary"
                        />
                      </div>
                    )}
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
