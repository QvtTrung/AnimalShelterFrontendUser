import { Card, CardBody, Spinner } from "@nextui-org/react";
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

interface InteractiveRescueMapProps {
  reports: Report[];
  isLoading?: boolean;
}

export const InteractiveRescueMap = ({
  reports,
  isLoading,
}: InteractiveRescueMapProps) => {
  // Filter reports with valid coordinates
  const reportsWithCoordinates = reports.filter(
    (report) =>
      report.coordinates?.coordinates &&
      Array.isArray(report.coordinates.coordinates) &&
      report.coordinates.coordinates.length === 2
  );

  // Calculate center from reports or use default
  const getMapCenter = (): [number, number] => {
    if (reportsWithCoordinates.length === 0) {
      return [10.0452, 105.7469]; // Can Tho default
    }

    const latSum = reportsWithCoordinates.reduce((sum, report) => {
      const [, lat] = report.coordinates!.coordinates;
      return sum + lat;
    }, 0);

    const lngSum = reportsWithCoordinates.reduce((sum, report) => {
      const [lng] = report.coordinates!.coordinates;
      return sum + lng;
    }, 0);

    const avgLat = latSum / reportsWithCoordinates.length;
    const avgLng = lngSum / reportsWithCoordinates.length;

    return [avgLat, avgLng];
  };

  const getZoomLevel = () => {
    if (reportsWithCoordinates.length === 0) return 12;
    if (reportsWithCoordinates.length === 1) return 15;
    return 13;
  };

  return (
    <Card className="shadow-lg border-2 border-gray-200 h-full">
      <CardBody className="p-0 h-full">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/80 flex items-center justify-center">
            <Spinner size="lg" color="primary" />
          </div>
        )}
        <div className="h-full w-full">
          <MapContainer
            center={getMapCenter()}
            zoom={getZoomLevel()}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
            zoomControl={true}
            key={`map-${reportsWithCoordinates.length}-${
              reportsWithCoordinates[0]?.id || "empty"
            }`}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {reportsWithCoordinates.length === 0 && !isLoading && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 1000,
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: "16px",
                    marginBottom: "8px",
                  }}
                >
                  Chọn một chiến dịch để xem vị trí
                </p>
                <p style={{ color: "#9ca3af", fontSize: "14px" }}>
                  Các báo cáo trong chiến dịch sẽ hiển thị trên bản đồ
                </p>
              </div>
            )}
            {reportsWithCoordinates.map((report) => {
              const [lng, lat] = report.coordinates!.coordinates;
              return (
                <Marker
                  key={report.id}
                  position={[lat, lng]}
                  icon={createCustomIcon(report.urgency_level)}
                >
                  <Popup maxWidth={300}>
                    <div className="p-2">
                      <h3 className="font-bold text-gray-900 text-sm mb-2">
                        {report.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">
                        {report.description}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        <strong>Loài:</strong> {report.species}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        <strong>Vị trí:</strong> {report.location}
                      </p>
                      <Link
                        to={`/reports/${report.id}`}
                        className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
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
      </CardBody>
    </Card>
  );
};
