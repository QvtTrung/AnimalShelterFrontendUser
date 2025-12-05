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
import type { Report } from "../../types";

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

// Create custom colored markers based on urgency
const createCustomIcon = (urgency: string) => {
  const color =
    urgency === "critical"
      ? "#ef4444"
      : urgency === "high"
      ? "#f97316"
      : urgency === "medium"
      ? "#3b82f6"
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

interface AllReportsMapProps {
  reports: Report[];
  isLoading?: boolean;
  center?: [number, number];
}

export const AllReportsMap = ({
  reports,
  isLoading,
  center = [10.0452, 105.7469], // Default: Can Tho
}: AllReportsMapProps) => {
  const [selectedUrgency, setSelectedUrgency] = useState<string | null>(null);

  // Filter reports: only pending reports with valid coordinates
  let reportsWithCoordinates = reports.filter(
    (report) =>
      report.status === "pending" &&
      report.coordinates?.coordinates &&
      Array.isArray(report.coordinates.coordinates) &&
      report.coordinates.coordinates.length === 2
  );

  // Apply urgency filter if selected
  if (selectedUrgency) {
    reportsWithCoordinates = reportsWithCoordinates.filter(
      (report) => report.urgency_level === selectedUrgency
    );
  }

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

  return (
    <Card className="shadow-lg border-2 border-gray-200 relative z-0">
      <CardBody className="p-0 relative z-0">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/80 flex items-center justify-center">
            <Spinner size="lg" color="primary" />
          </div>
        )}
        <div className="h-[450px] w-full rounded-lg overflow-hidden">
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
            {reportsWithCoordinates.map((report) => {
              const [lng, lat] = report.coordinates!.coordinates;
              return (
                <Marker
                  key={report.id}
                  position={[lat, lng]}
                  icon={createCustomIcon(report.urgency_level)}
                >
                  <Popup maxWidth={400} minWidth={350}>
                    <div className="flex gap-3 p-2">
                      {/* Image on the left - square aspect ratio */}
                      {report.images && report.images.length > 0 ? (
                        <div className="flex-shrink-0">
                          <img
                            src={report.images[0].image_url}
                            alt={report.title}
                            className="w-24 h-24 object-cover rounded-md"
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-gray-400 text-xs">
                            No image
                          </span>
                        </div>
                      )}

                      {/* Content on the right */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">
                          {report.title}
                        </h3>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <Chip
                            size="sm"
                            color={getUrgencyColor(report.urgency_level)}
                            variant="flat"
                            classNames={{ base: "h-5" }}
                          >
                            <span className="text-xs">
                              {report.urgency_level}
                            </span>
                          </Chip>
                          <Chip
                            size="sm"
                            color={getStatusColor(report.status)}
                            variant="flat"
                            classNames={{ base: "h-5" }}
                          >
                            <span className="text-xs">{report.status}</span>
                          </Chip>
                        </div>
                        <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                          {report.description}
                        </p>
                        <p className="text-xs text-gray-500 mb-1">
                          <strong>Loài:</strong> {report.species}
                        </p>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                          <strong>Vị trí:</strong> {report.location}
                        </p>
                        <Link
                          to={`/reports/${report.id}`}
                          className="text-xs text-primary-600 hover:text-primary-700 font-semibold inline-block"
                        >
                          Xem Chi Tiết →
                        </Link>
                      </div>
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
              Báo cáo chờ xử lý: {reportsWithCoordinates.length}
            </p>

            {/* Urgency Filter Buttons */}
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-1">Lọc theo mức độ:</p>
              <ButtonGroup size="sm" variant="flat">
                <Button
                  color={selectedUrgency === null ? "primary" : "default"}
                  onPress={() => setSelectedUrgency(null)}
                >
                  Tất cả
                </Button>
                <Button
                  color={selectedUrgency === "critical" ? "danger" : "default"}
                  onPress={() => setSelectedUrgency("critical")}
                >
                  Khẩn
                </Button>
                <Button
                  color={selectedUrgency === "high" ? "warning" : "default"}
                  onPress={() => setSelectedUrgency("high")}
                >
                  Cao
                </Button>
                <Button
                  color={selectedUrgency === "medium" ? "primary" : "default"}
                  onPress={() => setSelectedUrgency("medium")}
                >
                  TB
                </Button>
                <Button
                  color={selectedUrgency === "low" ? "default" : "default"}
                  onPress={() => setSelectedUrgency("low")}
                >
                  Thấp
                </Button>
              </ButtonGroup>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-600">Khẩn Cấp</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-xs text-gray-600">Cao</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-600">Trung Bình</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span className="text-xs text-gray-600">Thấp</span>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
