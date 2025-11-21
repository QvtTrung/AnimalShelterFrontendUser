import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
} from "@nextui-org/react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Heart,
  Share2,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { usePet } from "../hooks/usePets";
import { useCreateAdoption } from "../hooks/useAdoptions";
import { useAuthStore } from "../store/auth.store";

export const PetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [adoptionNotes, setAdoptionNotes] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: petData, isLoading, isError } = usePet(id || "");
  const createAdoption = useCreateAdoption();

  const pet = petData?.data;

  const handleAdoptClick = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/pets/${id}` } } });
      return;
    }
    onOpen();
  };

  const handleSubmitAdoption = async () => {
    if (!pet) return;

    try {
      await createAdoption.mutateAsync({
        pet_id: pet.id,
        notes: adoptionNotes || undefined,
      });
      onOpenChange();
      // Show success message
      alert("Adoption request submitted successfully! We'll contact you soon.");
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to submit adoption:", error);
      alert("Failed to submit adoption request. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (isError || !pet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardBody className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pet Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The pet you're looking for doesn't exist or has been removed.
            </p>
            <Button
              as={Link}
              to="/pets"
              color="primary"
              variant="flat"
              startContent={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Pets
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            as={Link}
            to="/pets"
            variant="light"
            startContent={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Pets
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-200 shadow-lg cursor-pointer group">
              <img
                src={
                  pet.images?.[selectedImageIndex]?.image_url ||
                  "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image"
                }
                alt={pet.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <Chip
                color={pet.status === "available" ? "success" : "default"}
                className="absolute top-4 right-4"
                size="lg"
                variant="flat"
              >
                {pet.status}
              </Chip>
            </div>

            {/* Thumbnail Gallery */}
            {pet.images && pet.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {pet.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden bg-gray-200 transition-all duration-200 hover:ring-4 hover:ring-blue-400 ${
                      selectedImageIndex === index
                        ? "ring-4 ring-blue-500"
                        : "ring-2 ring-gray-300"
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={`${pet.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
                    {pet.name}
                  </h1>
                  <p className="text-xl text-gray-600 capitalize">
                    {pet.species} • {pet.breed || "Mixed Breed"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button isIconOnly variant="flat" color="danger">
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button isIconOnly variant="flat">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-3 mb-6">
                {pet.age && (
                  <Chip
                    size="lg"
                    variant="flat"
                    startContent={<Calendar className="w-4 h-4" />}
                  >
                    {pet.age} {pet.age_unit || "years"} old
                  </Chip>
                )}
                {pet.size && (
                  <Chip size="lg" variant="flat">
                    {pet.size}
                  </Chip>
                )}
                {pet.gender && (
                  <Chip size="lg" variant="flat">
                    {pet.gender}
                  </Chip>
                )}
                {pet.location && (
                  <Chip
                    size="lg"
                    variant="flat"
                    startContent={<MapPin className="w-4 h-4" />}
                  >
                    {pet.location}
                  </Chip>
                )}
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardBody className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  About {pet.name}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {pet.description ||
                    `${pet.name} is a wonderful ${pet.species} looking for a loving home. This adorable companion is waiting to bring joy to your family!`}
                </p>
              </CardBody>
            </Card>

            {/* Medical Info */}
            {(pet.medical_history || pet.vaccination_status) && (
              <Card>
                <CardBody className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Medical Information
                  </h2>
                  <div className="space-y-2">
                    {pet.vaccination_status && (
                      <div className="flex items-center gap-2">
                        <Chip color="success" size="sm">
                          ✓
                        </Chip>
                        <span className="text-gray-700">
                          Vaccination: {pet.vaccination_status}
                        </span>
                      </div>
                    )}
                    {pet.medical_history && (
                      <p className="text-gray-600 mt-2">
                        {pet.medical_history}
                      </p>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Adoption Button */}
            {pet.status === "available" && (
              <Button
                color="primary"
                size="lg"
                className="w-full font-bold text-lg py-6 h-14"
                onPress={handleAdoptClick}
                isLoading={createAdoption.isPending}
              >
                Adopt {pet.name}
              </Button>
            )}

            {pet.status === "adopted" && (
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <p className="text-gray-600 font-medium">
                  {pet.name} has already been adopted and found a loving home!
                  ❤️
                </p>
              </div>
            )}

            {pet.status === "pending" && (
              <div className="bg-yellow-50 rounded-lg p-6 text-center">
                <p className="text-yellow-800 font-medium">
                  {pet.name} has a pending adoption application.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Adoption Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold">Adopt {pet.name}</h2>
                <p className="text-sm text-gray-600 font-normal">
                  Fill out this form to start the adoption process
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Next Steps:</strong> After submitting, our team
                      will review your application and contact you within 2-3
                      business days to discuss the adoption process.
                    </p>
                  </div>

                  <Textarea
                    label="Additional Notes (Optional)"
                    placeholder="Tell us about your home, experience with pets, or any questions you have..."
                    value={adoptionNotes}
                    onChange={(e) => setAdoptionNotes(e.target.value)}
                    minRows={4}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmitAdoption}
                  isLoading={createAdoption.isPending}
                  className="font-semibold"
                >
                  Submit Adoption Request
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
