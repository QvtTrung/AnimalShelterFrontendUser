import { useState } from "react";
import {
  Card,
  CardBody,
  Spinner,
  Chip,
  Button,
  ButtonGroup,
} from "@nextui-org/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Rescue } from "../../types";

// Fix Leaflet default marker icon
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Create custom colored markers based on status
const createCustomIcon = (status: string) => {
  const color =
    status === "planned"
      ? "#f59e0b"
      : status === "in_progress"
      ? "#3b82f6"
      : status === "completed"
      ? "#10b981"
      : "#6b7280";

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="
          transform: rotate(45deg);
          margin-top: 6px;
          margin-left: 6px;
          width: 14px;
          height: 14px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

interface AllRescuesMapProps {
  rescues: Rescue[];
  isLoading?: boolean;
  center?: [number, number];
}

export const AllRescuesMap = ({
  rescues,
  isLoading,
  center = [10.0452, 105.7469], // Default: Can Tho
}: AllRescuesMapProps) => {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Filter rescues that have at least one report with valid coordinates
  let rescuesWithCoordinates = rescues.filter((rescue) =>
    rescue.reports?.some(
      (rescueReport) =>
        rescueReport.report?.coordinates?.coordinates &&
        Array.isArray(rescueReport.report.coordinates.coordinates) &&
        rescueReport.report.coordinates.coordinates.length === 2
    )
  );

  // Apply status filter if selected
  if (selectedStatus) {
    rescuesWithCoordinates = rescuesWithCoordinates.filter(
      (rescue) => rescue.status === selectedStatus
    );
  }

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

  return (
    <Card className="shadow-lg border-2 border-gray-200 relative z-0">
      <CardBody className="p-0 relative z-0">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/80 flex items-center justify-center">
            <Spinner size="lg" color="primary" />
          </div>
        )}
        <div className="h-[500px] w-full rounded-lg overflow-hidden">
          <MapContainer
            center={center}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {rescuesWithCoordinates.map((rescue) => {
              // Get the first report with coordinates
              const reportWithCoords = rescue.reports?.find(
                (rr) =>
                  rr.report?.coordinates?.coordinates &&
                  Array.isArray(rr.report.coordinates.coordinates) &&
                  rr.report.coordinates.coordinates.length === 2
              );

              if (!reportWithCoords?.report?.coordinates) return null;

              const [lng, lat] =
                reportWithCoords.report.coordinates.coordinates;

              return (
                <Marker
                  key={rescue.id}
                  position={[lat, lng]}
                  icon={createCustomIcon(rescue.status)}
                >
                  <Popup maxWidth={400} minWidth={350}>
                    <div className="p-2">
                      <h3 className="font-bold text-gray-900 text-sm mb-2">
                        {rescue.title}
                      </h3>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <Chip
                          size="sm"
                          color={getStatusColor(rescue.status)}
                          variant="flat"
                          classNames={{ base: "h-5" }}
                        >
                          <span className="text-xs">
                            {getStatusLabel(rescue.status)}
                          </span>
                        </Chip>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {rescue.description}
                      </p>
                      {rescue.reports && rescue.reports.length > 0 && (
                        <p className="text-xs text-gray-500 mb-2">
                          <strong>Số báo cáo:</strong> {rescue.reports.length}
                        </p>
                      )}
                      {rescue.participants &&
                        rescue.participants.length > 0 && (
                          <p className="text-xs text-gray-500 mb-2">
                            <strong>Tình nguyện viên:</strong>{" "}
                            {rescue.participants.length}
                            {rescue.required_participants &&
                              `/${rescue.required_participants}`}
                          </p>
                        )}
                      <Link
                        to={`/rescues/${rescue.id}`}
                        className="text-xs text-primary-600 hover:text-primary-700 font-semibold inline-block"
                      >
                        Xem Chi Tiết →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
        {!isLoading && (
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[1000]">
            <p className="text-sm font-semibold text-gray-900 mb-2">
              Chiến dịch trên bản đồ: {rescuesWithCoordinates.length}
            </p>

            {/* Status Filter Buttons */}
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-1">Lọc theo trạng thái:</p>
              <ButtonGroup size="sm" variant="flat">
                <Button
                  color={selectedStatus === null ? "primary" : "default"}
                  onPress={() => setSelectedStatus(null)}
                >
                  Tất cả
                </Button>
                <Button
                  color={selectedStatus === "planned" ? "warning" : "default"}
                  onPress={() => setSelectedStatus("planned")}
                >
                  KH
                </Button>
                <Button
                  color={
                    selectedStatus === "in_progress" ? "primary" : "default"
                  }
                  onPress={() => setSelectedStatus("in_progress")}
                >
                  ĐTH
                </Button>
                <Button
                  color={selectedStatus === "completed" ? "success" : "default"}
                  onPress={() => setSelectedStatus("completed")}
                >
                  HT
                </Button>
              </ButtonGroup>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-xs text-gray-600">Kế Hoạch</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-600">Đang TH</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-600">Hoàn Thành</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span className="text-xs text-gray-600">Đã Hủy</span>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
