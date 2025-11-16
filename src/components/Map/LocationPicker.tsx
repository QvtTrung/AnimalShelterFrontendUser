import { useState, useEffect } from "react";
import { Input, Button } from "@nextui-org/react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin } from "lucide-react";

// Fix default marker icon
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/images/leaflet/marker-icon-2x.png",
  iconUrl: "/images/leaflet/marker-icon.png",
  shadowUrl: "/images/leaflet/marker-shadow.png",
});

interface LocationPickerProps {
  value?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  onChange?: (value: { type: "Point"; coordinates: [number, number] }) => void;
  locationText?: string;
  onLocationTextChange?: (value: string) => void;
  readOnly?: boolean;
}

// Component to recenter map when position changes
const RecenterMap: React.FC<{ position: [number, number] }> = ({
  position,
}) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 16, { animate: true });
    }
  }, [position, map]);
  return null;
};

// Component to handle map click events
const MapEvents: React.FC<{
  onClick: (lat: number, lng: number) => void;
  readOnly?: boolean;
}> = ({ onClick, readOnly }) => {
  useMapEvents({
    click: (e) => {
      if (!readOnly) onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  locationText,
  onLocationTextChange,
  readOnly = false,
}) => {
  const [position, setPosition] = useState<[number, number]>(() => {
    if (value?.coordinates) {
      const [lng, lat] = value.coordinates;
      return [lat, lng]; // Convert [lng, lat] -> [lat, lng]
    }
    return [21.0285, 105.8542]; // Default: Hanoi
  });

  const [locText, setLocText] = useState(locationText || "");
  const [loading, setLoading] = useState(false);
  const [shouldRecenter, setShouldRecenter] = useState(false);

  // Sync when prop value changes
  useEffect(() => {
    if (value?.coordinates) {
      const [lng, lat] = value.coordinates;
      setPosition([lat, lng]);
    }
  }, [value]);

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      if (data?.display_name) {
        setLocText(data.display_name);
        onLocationTextChange?.(data.display_name);
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    }
  };

  // Handle map click
  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    setShouldRecenter(false);
    onChange?.({ type: "Point", coordinates: [lng, lat] });
    reverseGeocode(lat, lng);
  };

  // Handle location text input
  const handleLocationTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocText(e.target.value);
    onLocationTextChange?.(e.target.value);
  };

  // Handle search button click
  const handleSearch = async () => {
    if (!locText) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          locText
        )}`
      );
      const data = await res.json();
      if (data?.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newPosition: [number, number] = [
          parseFloat(lat),
          parseFloat(lon),
        ];
        setPosition(newPosition);
        setShouldRecenter(true);
        onChange?.({
          type: "Point",
          coordinates: [parseFloat(lon), parseFloat(lat)],
        });
        if (display_name) {
          setLocText(display_name);
          onLocationTextChange?.(display_name);
        }
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Enter address to search"
          value={locText}
          onChange={handleLocationTextChange}
          isDisabled={readOnly}
          startContent={<MapPin className="w-4 h-4 text-gray-400" />}
          classNames={{
            input: "text-gray-900",
          }}
        />
        <Button
          color="primary"
          onPress={handleSearch}
          isLoading={loading}
          isDisabled={readOnly}
          startContent={!loading && <Search className="w-4 h-4" />}
        >
          Search
        </Button>
      </div>

      <div className="h-96 w-full overflow-hidden rounded-lg border-2 border-gray-200 relative z-0">
        <MapContainer
          center={position}
          zoom={16}
          className="h-full w-full"
          style={{ height: "384px" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapEvents onClick={handleMapClick} readOnly={readOnly} />
          {position && <Marker position={position} />}
          {shouldRecenter && <RecenterMap position={position} />}
        </MapContainer>
      </div>

      {!readOnly && (
        <p className="text-sm text-gray-600">
          Click on the map to select a location or search by address above
        </p>
      )}
    </div>
  );
};
