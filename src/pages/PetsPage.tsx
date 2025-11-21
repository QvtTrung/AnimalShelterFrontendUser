import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Spinner,
  Pagination,
} from "@nextui-org/react";
import { Search, MapPin, Heart, Calendar, PawPrint } from "lucide-react";
import { usePets } from "../hooks/usePets";
import type { Pet } from "../types";

export const PetsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("available");
  const [sizeFilter, setSizeFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(9);

  const {
    data: petsData,
    isLoading,
    isError,
  } = usePets({
    search: searchTerm || undefined,
    species: speciesFilter || undefined,
    status: statusFilter || undefined,
    size: sizeFilter || undefined,
    page,
    limit,
  });

  const species = [
    { label: "Dog", value: "dog" },
    { label: "Cat", value: "cat" },
    { label: "Bird", value: "bird" },
    { label: "Other", value: "other" },
  ];

  const statuses = [
    { label: "Available", value: "available" },
    { label: "Adopted", value: "adopted" },
    { label: "Pending", value: "pending" },
  ];

  const sizes = [
    { label: "Small", value: "small" },
    { label: "Medium", value: "medium" },
    { label: "Large", value: "large" },
  ];

  // API response structure: { status: 'success', message: string, data: Pet[], meta: { total: number } }
  const pets: Pet[] = Array.isArray(petsData?.data) ? petsData.data : [];
  const total = petsData?.meta?.total || 0;

  // Calculate pagination
  const totalPages = Math.ceil(total / limit) || 1;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "success";
      case "adopted":
        return "default";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <PawPrint className="w-8 h-8" />
              <span className="text-sm font-semibold tracking-wide uppercase">
                ADOPT
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold">
              Find a New Friend
            </h1>
            <p className="text-lg text-primary-50 max-w-3xl mx-auto">
              Browse our rescued animals waiting for their forever home. Every
              pet deserves a loving family, and you could be the one to make a
              difference.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Search pets by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              size="lg"
              isClearable
              onClear={() => setSearchTerm("")}
              classNames={{
                inputWrapper: "bg-gray-50",
              }}
            />
            <Select
              placeholder="All Species"
              selectedKeys={speciesFilter ? [speciesFilter] : []}
              onChange={(e) => {
                setSpeciesFilter(e.target.value);
                setPage(1);
              }}
              size="lg"
              aria-label="Filter by species"
              classNames={{
                trigger: "bg-gray-50",
              }}
            >
              {species.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </Select>
            <Select
              placeholder="All Sizes"
              selectedKeys={sizeFilter ? [sizeFilter] : []}
              onChange={(e) => {
                setSizeFilter(e.target.value);
                setPage(1);
              }}
              size="lg"
              aria-label="Filter by size"
              classNames={{
                trigger: "bg-gray-50",
              }}
            >
              {sizes.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </Select>
            <Select
              placeholder="Filter by status"
              selectedKeys={statusFilter ? [statusFilter] : []}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              size="lg"
              aria-label="Filter by status"
              classNames={{
                trigger: "bg-gray-50",
              }}
            >
              {statuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </section>

      {/* Pets Grid */}
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
                Failed to load pets. Please try again later.
              </p>
            </div>
          )}

          {!isLoading && !isError && pets?.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">
                No pets found matching your criteria.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets?.map((pet) => (
              <Card
                key={pet.id}
                className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader className="p-0 relative overflow-hidden group">
                  <img
                    src={
                      pet.images?.[0]?.image_url ||
                      "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image"
                    }
                    alt={pet.name}
                    className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <Chip
                    color={getStatusColor(pet.status)}
                    className="absolute top-4 right-4"
                    variant="flat"
                  >
                    {pet.status}
                  </Chip>
                </CardHeader>
                <CardBody className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {pet.name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {pet.species} • {pet.breed || "Mixed"}
                      </p>
                    </div>
                    <Button
                      isIconOnly
                      variant="light"
                      color="danger"
                      aria-label="Add to favorites"
                    >
                      <Heart className="w-5 h-5" />
                    </Button>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2">
                    {pet.description || "No description available."}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {pet.age && (
                      <Chip
                        size="sm"
                        variant="flat"
                        startContent={<Calendar className="w-3 h-3" />}
                      >
                        {pet.age} {pet.age_unit || "years"}
                      </Chip>
                    )}
                    {pet.location && (
                      <Chip
                        size="sm"
                        variant="flat"
                        startContent={<MapPin className="w-3 h-3" />}
                      >
                        {pet.location}
                      </Chip>
                    )}
                  </div>
                </CardBody>
                <CardFooter className="p-5 pt-0">
                  <Button
                    as={Link}
                    to={`/pets/${pet.id}`}
                    color="primary"
                    className="w-full font-semibold"
                    size="lg"
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col items-center gap-4">
              <Pagination
                total={totalPages}
                page={page}
                onChange={setPage}
                color="primary"
                showControls
                size="lg"
              />
              {total > 0 && (
                <p className="text-gray-500 text-sm">
                  Showing {(page - 1) * limit + 1}-
                  {Math.min(page * limit, total)} of {total} pets
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
