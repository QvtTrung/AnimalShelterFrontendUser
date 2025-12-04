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
import { Search, MapPin, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

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
  const [locationError, setLocationError] = useState(false);

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
    setLocationError(false); // Clear error when user types
    onLocationTextChange?.(e.target.value);
  };

  // Handle search button click with better Vietnamese address support
  const handleSearch = async () => {
    if (!locText) return;
    setLoading(true);
    setLocationError(false);

    try {
      // First attempt: Direct search with Vietnamese context
      let searchQuery = locText;

      // Add Vietnam context if not already present
      if (
        !locText.toLowerCase().includes("vietnam") &&
        !locText.toLowerCase().includes("việt nam") &&
        !locText.toLowerCase().includes("cần thơ") &&
        !locText.toLowerCase().includes("can tho")
      ) {
        // If searching in Can Tho area, add city context
        searchQuery = `${locText}, Cần Thơ, Việt Nam`;
      } else if (
        !locText.toLowerCase().includes("vietnam") &&
        !locText.toLowerCase().includes("việt nam")
      ) {
        searchQuery = `${locText}, Việt Nam`;
      }

      console.log("Searching for:", searchQuery);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=vn&limit=5&addressdetails=1`
      );
      const data = await res.json();

      if (data?.length > 0) {
        // Filter results to prioritize those in Can Tho or nearby
        const canThoResults = data.filter(
          (result: { display_name?: string }) =>
            result.display_name?.toLowerCase().includes("cần thơ") ||
            result.display_name?.toLowerCase().includes("can tho")
        );

        const bestResult =
          canThoResults.length > 0 ? canThoResults[0] : data[0];
        const { lat, lon, display_name } = bestResult;

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
        toast.success("Tìm thấy vị trí thành công!");
      } else {
        // Second attempt: Broader search without city context
        const fallbackRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            locText
          )}&countrycodes=vn&limit=1`
        );
        const fallbackData = await fallbackRes.json();

        if (fallbackData?.length > 0) {
          const { lat, lon, display_name } = fallbackData[0];
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
          toast.success("Tìm thấy vị trí thành công!");
        } else {
          setLocationError(true);
          toast.error(
            "Không tìm thấy địa chỉ. Vui lòng thử địa chỉ khác hoặc nhấp vào bản đồ để chọn vị trí."
          );
        }
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      setLocationError(true);
      toast.error("Tìm kiếm thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Nhập địa chỉ để tìm kiếm (VD: hẻm 51 đường 3 tháng 2)"
          value={locText}
          onChange={handleLocationTextChange}
          isDisabled={readOnly}
          isInvalid={locationError}
          errorMessage={locationError ? "Không tìm thấy địa chỉ" : ""}
          description="Mẹo: Nhập tên đường hoặc khu vực. Hệ thống sẽ tự thêm ngữ cảnh Cần Thơ."
          startContent={
            locationError ? (
              <AlertCircle className="w-4 h-4 text-danger-500" />
            ) : (
              <MapPin className="w-4 h-4 text-gray-400" />
            )
          }
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
          Tìm
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
          Nhấp vào bản đồ để chọn vị trí hoặc tìm kiếm theo địa chỉ ở trên
        </p>
      )}
    </div>
  );
};
