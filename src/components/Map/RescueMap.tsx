import { Link } from "react-router-dom";
import { Button } from "@nextui-org/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

interface RescueReport {
  id: string;
  report_id?: string;
  status: string;
  note?: string;
  report?: {
    id: string;
    title: string;
    location?: string;
    coordinates?: {
      type: string;
      coordinates: [number, number]; // [longitude, latitude]
    };
  };
}

interface RescueMapProps {
  reports: RescueReport[];
  className?: string;
}

export const RescueMap = ({ reports, className = "" }: RescueMapProps) => {
  // Filter reports that have coordinates
  const reportsWithCoords = reports.filter((r) => r.report?.coordinates);

  // Calculate map center from all reports with coordinates
  const getMapCenter = (): [number, number] => {
    if (reportsWithCoords.length === 0) {
      return [21.0285, 105.8542]; // Hanoi default
    }

    const coordinates = reportsWithCoords.map((r) => {
      const [lng, lat] = r.report!.coordinates!.coordinates;
      return [lat, lng] as [number, number];
    });

    const avgLat =
      coordinates.reduce((sum, [lat]) => sum + lat, 0) / coordinates.length;
    const avgLng =
      coordinates.reduce((sum, [, lng]) => sum + lng, 0) / coordinates.length;

    return [avgLat, avgLng];
  };

  // Determine zoom level based on number of markers
  const getZoomLevel = () => {
    if (reportsWithCoords.length === 0) return 12;
    if (reportsWithCoords.length === 1) return 15;
    return 12;
  };

  if (reportsWithCoords.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
      >
        <p className="text-gray-500">No report locations available</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={getMapCenter()}
      zoom={getZoomLevel()}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
      className={className}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reportsWithCoords.map((rescueReport) => {
        const [lng, lat] = rescueReport.report!.coordinates!.coordinates;
        const reportId = rescueReport.report_id || rescueReport.id;

        return (
          <Marker key={rescueReport.id} position={[lat, lng]}>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-gray-900 mb-1">
                  {rescueReport.report!.title}
                </h3>
                {rescueReport.report!.location && (
                  <p className="text-sm text-gray-600 mb-2">
                    {rescueReport.report!.location}
                  </p>
                )}
                <p className="text-xs text-gray-500 mb-2">
                  Status:{" "}
                  <span className="font-medium">{rescueReport.status}</span>
                </p>
                <Button
                  as={Link}
                  to={`/reports/${reportId}`}
                  size="sm"
                  color="primary"
                  variant="flat"
                  className="w-full"
                >
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};
