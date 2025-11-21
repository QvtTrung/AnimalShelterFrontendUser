import { Card, CardBody } from "@nextui-org/react";
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

interface ReportMapProps {
  title: string;
  location: string;
  coordinates?: {
    type: "Point";
    coordinates: [number, number];
  };
}

export const ReportMap = ({ title, location, coordinates }: ReportMapProps) => {
  // Extract coordinates - GeoJSON format is [lng, lat], Leaflet uses [lat, lng]
  const coordArray = coordinates?.coordinates;
  const hasValidCoordinates =
    coordArray && Array.isArray(coordArray) && coordArray.length === 2;

  const [lng, lat] = hasValidCoordinates ? coordArray : [105.8542, 21.0285]; // Default: Hanoi [lng, lat]

  return (
    <Card className="shadow-sm">
      <CardBody className="p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-primary-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          Location
        </h2>
        <p className="text-gray-700 mb-2 text-sm">{location}</p>
        <p className="text-xs text-gray-500 mb-3">
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>
        <div className="h-80 rounded-lg overflow-hidden border border-gray-200">
          <MapContainer
            center={[lat, lng]}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
                  <p className="text-xs text-gray-600">{location}</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </CardBody>
    </Card>
  );
};
