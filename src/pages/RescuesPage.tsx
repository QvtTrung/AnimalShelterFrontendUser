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
} from "@nextui-org/react";
import { Calendar } from "lucide-react";
import { useRescues } from "../hooks/useRescues";

export const RescuesPage = () => {
  const [selectedTab, setSelectedTab] = useState("all");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [dateRange, setDateRange] = useState<{ start: any; end: any } | null>(
    null
  );
  const limit = 9;

  const {
    data: rescuesData,
    isLoading,
    isError,
  } = useRescues({
    status: selectedTab === "all" ? undefined : selectedTab,
    page,
    limit,
  });
  console.log("rescuesData", rescuesData);

  let rescues = Array.isArray(rescuesData?.data) ? rescuesData.data : [];

  // Apply date range filter
  if (dateRange?.start && dateRange?.end && rescues.length > 0) {
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
    rescues = rescues.filter((rescue) => {
      if (!rescue.date_created) return false;
      const rescueTime = new Date(rescue.date_created).getTime();
      return rescueTime >= startTime && rescueTime <= endTime;
    });
  }

  // Apply client-side sorting by date_created
  if (rescues.length > 0) {
    rescues = [...rescues].sort((a, b) => {
      const dateA = a.date_created ? new Date(a.date_created).getTime() : 0;
      const dateB = b.date_created ? new Date(b.date_created).getTime() : 0;
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });
  }

  const total = rescuesData?.meta?.total || 0;
  const totalPages = Math.ceil(total / limit);

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

      {/* Tabs and Filters Section */}
      <section className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={(key) => {
                setSelectedTab(key.toString());
                setPage(1);
              }}
              color="primary"
              size="lg"
              classNames={{
                tabList: "gap-6",
                cursor: "bg-primary-500",
                tab: "h-12",
              }}
            >
              <Tab key="all" title="All Campaigns" />
              <Tab key="planned" title="Planned" />
              <Tab key="in_progress" title="In Progress" />
              <Tab key="completed" title="Completed" />
              <Tab key="cancelled" title="Cancelled" />
            </Tabs>
            <div className="flex flex-wrap items-end gap-2">
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
                className="w-36"
                size="sm"
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

          {!isLoading && !isError && rescues.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">
                No rescue campaigns found for this category.
              </p>
            </div>
          )}

          {/* Table View */}
          {rescues.length > 0 && (
            <Card className="shadow-lg">
              <CardBody className="p-0">
                <Table
                  aria-label="Rescue campaigns table"
                  classNames={{
                    wrapper: "min-h-[400px]",
                    th: "bg-gray-100 text-gray-700 font-semibold text-sm",
                    td: "py-5 px-6",
                  }}
                >
                  <TableHeader>
                    <TableColumn className="text-base">CAMPAIGN</TableColumn>
                    <TableColumn className="text-base">STATUS</TableColumn>
                    <TableColumn className="text-base">START DATE</TableColumn>
                    <TableColumn className="text-base">
                      PARTICIPANTS
                    </TableColumn>
                    <TableColumn className="text-base">ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {rescues.map((rescue) => (
                      <TableRow key={rescue.id} className="hover:bg-gray-50">
                        <TableCell className="max-w-md">
                          <div>
                            <p className="font-semibold text-gray-900 text-base mb-1">
                              {rescue.title}
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {rescue.description ||
                                "Join this rescue campaign"}
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
                            {rescue.status}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4" />
                            <span className="text-base">
                              {rescue.date_created
                                ? new Date(
                                    rescue.date_created
                                  ).toLocaleDateString()
                                : "Date TBD"}
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
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
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
