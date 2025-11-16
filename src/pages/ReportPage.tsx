import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Radio,
  RadioGroup,
} from "@nextui-org/react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useCreateReport } from "../hooks/useReports";
import { LocationPicker } from "../components/Map/LocationPicker";

export const ReportPage = () => {
  const navigate = useNavigate();
  const createReport = useCreateReport();

  const [formData, setFormData] = useState({
    title: "",
    species: "",
    type: "injured_animal" as
      | "abuse"
      | "abandonment"
      | "injured_animal"
      | "other",
    description: "",
    urgency_level: "medium" as "low" | "medium" | "high" | "critical",
    location: "",
    coordinates: {
      type: "Point" as const,
      coordinates: [105.8542, 21.0285] as [number, number], // Default: Hanoi [lng, lat]
    },
    contact_name: "",
    contact_phone: "",
    contact_email: "",
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCoordinatesChange = (value: {
    type: "Point";
    coordinates: [number, number];
  }) => {
    setFormData((prev) => ({ ...prev, coordinates: value }));
  };

  const handleLocationTextChange = (value: string) => {
    setFormData((prev) => ({ ...prev, location: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReport.mutateAsync({
        title: formData.title,
        species: formData.species,
        type: formData.type,
        description: formData.description,
        urgency_level: formData.urgency_level,
        location: formData.location || "Unknown location",
        coordinates: formData.coordinates,
        status: "pending" as const,
        contact_name: formData.contact_name || undefined,
        contact_phone: formData.contact_phone || undefined,
        contact_email: formData.contact_email || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error("Failed to submit report:", error);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-2 border-primary-200 bg-white">
          <CardBody className="p-12 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-primary-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-bold text-gray-900">
                Report Submitted!
              </h2>
              <p className="text-gray-600">
                Thank you for reporting. Our rescue team will respond as soon as
                possible based on the urgency level.
              </p>
            </div>
            <Button
              color="primary"
              size="lg"
              onPress={() => navigate("/")}
              className="font-semibold"
            >
              Back to Home
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-red-500 to-red-600 text-white py-16 -mt-20 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-16 h-16" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold">
              Report Animal in Need
            </h1>
            <p className="text-lg text-red-50 max-w-2xl mx-auto">
              See an animal that needs help? Report it here. No account
              required. High and critical urgency reports get immediate
              attention.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl border-2 border-gray-100">
            <CardHeader className="p-6 pb-0">
              <div className="space-y-2">
                <h2 className="text-2xl font-heading font-bold text-gray-900">
                  Animal Information
                </h2>
                <p className="text-gray-600">
                  Provide details about the animal that needs help
                </p>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {createReport.isError && (
                  <div className="bg-danger-50 border-2 border-danger-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-danger-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-danger-700 font-medium">
                      Failed to submit report. Please try again.
                    </p>
                  </div>
                )}

                <Input
                  type="text"
                  label="Report Title"
                  placeholder="Brief title for the report"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                  size="lg"
                  classNames={{
                    label: "font-medium text-gray-700",
                    input: "text-gray-900",
                  }}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Animal Species <span className="text-red-500">*</span>
                  </label>
                  <Select
                    placeholder="Select animal species"
                    selectedKeys={formData.species ? [formData.species] : []}
                    onChange={(e) => handleChange("species", e.target.value)}
                    required
                    size="lg"
                    aria-label="Animal species"
                    classNames={{
                      value: "text-gray-900",
                    }}
                  >
                    <SelectItem key="dog" value="dog">
                      Dog
                    </SelectItem>
                    <SelectItem key="cat" value="cat">
                      Cat
                    </SelectItem>
                    <SelectItem key="bird" value="bird">
                      Bird
                    </SelectItem>
                    <SelectItem key="rabbit" value="rabbit">
                      Rabbit
                    </SelectItem>
                    <SelectItem key="other" value="other">
                      Other
                    </SelectItem>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Type <span className="text-red-500">*</span>
                  </label>
                  <Select
                    placeholder="Select report type"
                    selectedKeys={formData.type ? [formData.type] : []}
                    onChange={(e) => handleChange("type", e.target.value)}
                    required
                    size="lg"
                    aria-label="Report type"
                    classNames={{
                      value: "text-gray-900",
                    }}
                  >
                    <SelectItem key="abuse" value="abuse">
                      Abuse
                    </SelectItem>
                    <SelectItem key="abandonment" value="abandonment">
                      Abandonment
                    </SelectItem>
                    <SelectItem key="injured_animal" value="injured_animal">
                      Injured Animal
                    </SelectItem>
                    <SelectItem key="other" value="other">
                      Other
                    </SelectItem>
                  </Select>
                </div>

                <RadioGroup
                  label="Urgency Level"
                  value={formData.urgency_level}
                  onValueChange={(value) =>
                    handleChange("urgency_level", value)
                  }
                  orientation="horizontal"
                  classNames={{
                    label: "font-medium text-gray-700",
                  }}
                >
                  <Radio value="low" color="success">
                    Low
                  </Radio>
                  <Radio value="medium" color="warning">
                    Medium
                  </Radio>
                  <Radio value="high" color="danger">
                    High
                  </Radio>
                  <Radio value="critical" color="danger">
                    Critical
                  </Radio>
                </RadioGroup>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>High & Critical reports</strong> can be claimed
                    directly by volunteers for immediate rescue without waiting
                    for a full campaign.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <LocationPicker
                    value={formData.coordinates}
                    onChange={handleCoordinatesChange}
                    locationText={formData.location}
                    onLocationTextChange={handleLocationTextChange}
                  />
                </div>

                <Textarea
                  label="Description"
                  placeholder="Describe the animal's condition, behavior, and any other relevant details..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  required
                  minRows={4}
                  classNames={{
                    label: "font-medium text-gray-700",
                    input: "text-gray-900",
                  }}
                />

                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Your Information (Optional)
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Help us contact you for updates or more information
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter your name"
                      value={formData.contact_name}
                      onChange={(e) =>
                        handleChange("contact_name", e.target.value)
                      }
                      size="lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.contact_phone}
                      onChange={(e) =>
                        handleChange("contact_phone", e.target.value)
                      }
                      size="lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.contact_email}
                      onChange={(e) =>
                        handleChange("contact_email", e.target.value)
                      }
                      size="lg"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="bordered"
                    size="lg"
                    className="flex-1"
                    onPress={() => navigate("/")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    className="flex-1 font-semibold"
                    isLoading={createReport.isPending}
                  >
                    Submit Report
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
};
