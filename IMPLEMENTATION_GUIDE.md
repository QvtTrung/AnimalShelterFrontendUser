# Pet Rescue & Adoption - Implementation Guide

## 📋 Project Overview

A modern React TypeScript application for pet rescue, adoption, and animal welfare management with:

- ✅ Public access for anonymous report submissions
- ✅ Authenticated features for adoptions and rescue campaigns
- ✅ Direct report claiming for high/critical urgency (bypassing full rescue campaign)
- ✅ User dashboard for tracking adoptions, reports, and rescue participation

## 🎯 Core Requirements

### 1. Anonymous Report Submission (PUBLIC - NO AUTH)

Users can report animals in need **without logging in**:

- Title, description, location (with map picker)
- Urgency level: low, medium, high, critical
- Photo uploads
- Contact info (optional)

### 2. Direct Report Addressing

Volunteers can **directly claim** high/critical reports without creating a full rescue campaign:

- Quick "Claim Report" button
- Skips the campaign creation process
- Immediate assignment to volunteer

### 3. Full Feature Set

- Pet browsing and adoption
- Rescue campaign creation and participation
- User dashboard with progress tracking

## 🏗️ Architecture

```
frontend_client/
├── src/
│   ├── components/          # Reusable UI components
│   ├── hooks/              # React Query API hooks
│   ├── lib/                # API client, utilities
│   ├── pages/              # Route pages
│   ├── store/              # Zustand state management
│   └── types/              # TypeScript interfaces
```

## ✅ What's Already Built

### Core Infrastructure

- ✅ Vite + React + TypeScript setup
- ✅ NextUI (HeroUI) components library
- ✅ Tailwind CSS with custom green theme
- ✅ API client with auth interceptors
- ✅ Zustand auth store
- ✅ React Query setup
- ✅ React Router configuration

### Components & Pages

- ✅ Header with navigation
- ✅ Footer
- ✅ MainLayout wrapper
- ✅ ProtectedRoute guard
- ✅ HomePage (landing page)
- ✅ LoginPage
- ✅ RegisterPage

### API Hooks

- ✅ useAuth (login, register, logout)
- ✅ usePets (list, get, create, update)
- ✅ useReports (list, get, create, **claim**)
- ✅ useRescues (list, get, create, join, leave)
- ✅ useAdoptions (list, get, create, cancel)

## 🚀 Next Steps - Implementation Guide

### STEP 1: Create Anonymous Report Submission Page

**File: `src/pages/reports/ReportFormPage.tsx`**

```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Card,
} from "@nextui-org/react";
import { useCreateReport } from "../../hooks/useReports";

export const ReportFormPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    urgency_level: "medium",
    animal_type: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
  });

  const createReport = useCreateReport();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReport.mutateAsync(formData);
      // Show success message
      alert("Report submitted successfully!");
      navigate("/");
    } catch (error) {
      alert("Failed to submit report");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6">Report Animal in Need</h1>
          <p className="text-gray-600 mb-8">
            No account required. Help us save an animal's life by reporting
            them.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Report Title"
              placeholder="Brief description of the situation"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />

            <Textarea
              label="Detailed Description"
              placeholder="Describe the animal's condition, behavior, and situation"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              minRows={4}
              required
            />

            <Input
              label="Location"
              placeholder="Street address or landmark"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              required
            />

            {/* Add Location Picker Component here */}

            <Select
              label="Urgency Level"
              placeholder="Select urgency"
              selectedKeys={[formData.urgency_level]}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  urgency_level: e.target.value,
                }))
              }
            >
              <SelectItem key="low" value="low">
                Low - Can wait
              </SelectItem>
              <SelectItem key="medium" value="medium">
                Medium - Needs attention
              </SelectItem>
              <SelectItem key="high" value="high">
                High - Urgent
              </SelectItem>
              <SelectItem key="critical" value="critical">
                Critical - Immediate danger
              </SelectItem>
            </Select>

            <Input
              label="Animal Type (Optional)"
              placeholder="Dog, cat, bird, etc."
              value={formData.animal_type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  animal_type: e.target.value,
                }))
              }
            />

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Contact Information (Optional)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Help us follow up if needed
              </p>

              <div className="space-y-4">
                <Input
                  label="Your Name"
                  placeholder="Full name"
                  value={formData.contact_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contact_name: e.target.value,
                    }))
                  }
                />

                <Input
                  label="Phone Number"
                  placeholder="Contact number"
                  value={formData.contact_phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contact_phone: e.target.value,
                    }))
                  }
                />

                <Input
                  type="email"
                  label="Email"
                  placeholder="Email address"
                  value={formData.contact_email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contact_email: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full"
              isLoading={createReport.isPending}
            >
              Submit Report
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
```

**Add route in App.tsx:**

```typescript
<Route path="/report" element={<ReportFormPage />} />
```

**IMPORTANT:** Modify the API client to allow anonymous requests for reports:

```typescript
// In src/hooks/useReports.ts, update useCreateReport:
export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Report>) => {
      // Create axios instance without auth header for anonymous reports
      return axios.post(`${API_BASE_URL}/reports`, data, {
        headers: {
          "Content-Type": "application/json",
          // No Authorization header
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};
```

### STEP 2: Implement Direct Report Claiming

**File: `src/pages/reports/UrgentReportsPage.tsx`**

```typescript
import { Card, Button, Chip } from "@nextui-org/react";
import { AlertCircle, MapPin } from "lucide-react";
import { useReports, useClaimReport } from "../../hooks/useReports";
import { useAuthStore } from "../../store/auth.store";

export const UrgentReportsPage = () => {
  const { data, isLoading } = useReports({
    urgency_level: "high,critical",
    status: "pending",
  });
  const claimReport = useClaimReport();
  const { user } = useAuthStore();

  const isVolunteer = user?.role === "volunteer" || user?.role === "admin";

  const handleQuickClaim = async (reportId: string) => {
    if (
      !confirm(
        "Are you sure you want to claim this report? You will be directly assigned to handle it."
      )
    ) {
      return;
    }

    try {
      await claimReport.mutateAsync(reportId);
      alert("Report claimed successfully! Check your dashboard for details.");
    } catch (error) {
      alert("Failed to claim report");
    }
  };

  if (isLoading) return <div>Loading...</div>;

  const reports = data?.data.data || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Urgent Reports</h1>
          <p className="text-gray-600">
            Animals in immediate need.{" "}
            {isVolunteer &&
              "You can directly claim these reports without creating a full campaign."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Chip
                  color={
                    report.urgency_level === "critical" ? "danger" : "warning"
                  }
                  variant="flat"
                  startContent={<AlertCircle className="w-4 h-4" />}
                >
                  {report.urgency_level?.toUpperCase()}
                </Chip>
              </div>

              <h3 className="text-xl font-semibold mb-2">{report.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {report.description}
              </p>

              <div className="flex items-center text-sm text-gray-500 mb-4">
                <MapPin className="w-4 h-4 mr-1" />
                {report.location}
              </div>

              {isVolunteer && (
                <Button
                  color="primary"
                  className="w-full"
                  onClick={() => handleQuickClaim(report.id)}
                  isLoading={claimReport.isPending}
                >
                  Quick Claim Report
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
```

**Add route:**

```typescript
<Route
  path="/reports/urgent"
  element={
    <ProtectedRoute>
      <UrgentReportsPage />
    </ProtectedRoute>
  }
/>
```

### STEP 3: Backend API Endpoint for Direct Claiming

**Backend file: `backend/src/controllers/report.controller.ts`**

Add this endpoint:

```typescript
// POST /api/reports/:id/claim
async claimReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // From auth middleware

    // Create a minimal rescue record for tracking
    const rescue = await this.rescueService.create({
      title: `Direct Response: ${report.title}`,
      description: 'Direct volunteer response to urgent report',
      status: 'in_progress',
      created_by: userId,
    });

    // Link report to rescue
    await this.rescueService.addReport(rescue.id, id);

    // Add volunteer to rescue
    await this.rescueService.addVolunteer(rescue.id, userId);

    // Update report status
    await this.reportService.update(id, {
      status: 'assigned',
    });

    sendSuccess(res, { rescue }, 'Report claimed successfully');
  } catch (error) {
    next(error);
  }
}
```

### STEP 4: Create Pet Listing Page

**File: `src/pages/pets/PetListPage.tsx`**

```typescript
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { Search } from "lucide-react";
import { usePets } from "../../hooks/usePets";

export const PetListPage = () => {
  const [filters, setFilters] = useState({
    species: "",
    size: "",
    search: "",
    page: 1,
  });

  const { data, isLoading } = usePets(filters);

  const pets = data?.data.data || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Adopt a Pet</h1>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search pets..."
              startContent={<Search className="w-4 h-4" />}
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />

            <Select
              label="Species"
              placeholder="All species"
              selectedKeys={filters.species ? [filters.species] : []}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, species: e.target.value }))
              }
            >
              <SelectItem key="dog" value="dog">
                Dogs
              </SelectItem>
              <SelectItem key="cat" value="cat">
                Cats
              </SelectItem>
              <SelectItem key="other" value="other">
                Other
              </SelectItem>
            </Select>

            <Select
              label="Size"
              placeholder="All sizes"
              selectedKeys={filters.size ? [filters.size] : []}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, size: e.target.value }))
              }
            >
              <SelectItem key="small" value="small">
                Small
              </SelectItem>
              <SelectItem key="medium" value="medium">
                Medium
              </SelectItem>
              <SelectItem key="large" value="large">
                Large
              </SelectItem>
            </Select>

            <Button
              color="primary"
              onClick={() =>
                setFilters({ species: "", size: "", search: "", page: 1 })
              }
            >
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* Pet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <Card key={pet.id} className="card-hover">
              <CardBody className="p-0">
                <img
                  src={pet.images?.[0]?.image_url || "/placeholder-pet.jpg"}
                  alt={pet.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-2">{pet.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {pet.description}
                  </p>
                  <Button
                    as={Link}
                    to={`/pets/${pet.id}`}
                    color="primary"
                    className="w-full"
                  >
                    View Details
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### STEP 5: Create User Dashboard

**File: `src/pages/dashboard/DashboardPage.tsx`**

```typescript
import { Tabs, Tab, Card } from "@nextui-org/react";
import { useMyAdoptions } from "../../hooks/useAdoptions";
import { useMyReports } from "../../hooks/useReports";
import { useMyRescues } from "../../hooks/useRescues";

export const DashboardPage = () => {
  const { data: adoptions } = useMyAdoptions();
  const { data: reports } = useMyReports();
  const { data: rescues } = useMyRescues();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

        <Tabs aria-label="Dashboard sections">
          <Tab
            key="adoptions"
            title={`Adoptions (${adoptions?.data.length || 0})`}
          >
            <Card className="p-6">
              {/* Render adoption cards with status timeline */}
            </Card>
          </Tab>

          <Tab key="reports" title={`Reports (${reports?.data.length || 0})`}>
            <Card className="p-6">{/* Render report cards with status */}</Card>
          </Tab>

          <Tab key="rescues" title={`Rescues (${rescues?.data.length || 0})`}>
            <Card className="p-6">
              {/* Render rescue participation cards */}
            </Card>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};
```

## 🎨 Design Guidelines

### Color Scheme

- Primary: `#00c369` (Green)
- Use NextUI's built-in theming
- Apply `.card-hover` for interactive cards
- Use `.paw-pattern` for decorative backgrounds

### Typography

- Headings: `font-heading` (Poppins)
- Body: `font-sans` (Inter)

### Components

- Use NextUI components consistently
- Add smooth transitions
- Ensure mobile responsiveness

## 🔒 Authentication

### Public Routes (No Auth Required)

- `/` - Home page
- `/login` - Login page
- `/register` - Registration
- `/report` - **Anonymous report submission**
- `/pets` - Browse pets
- `/rescues` - Browse campaigns

### Protected Routes (Auth Required)

- `/dashboard` - User dashboard
- `/profile` - Profile settings
- `/pets/:id/adopt` - Adoption application
- `/reports/urgent` - Claim urgent reports
- `/rescues/:id/join` - Join rescue

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Deployment Checklist

- [ ] Update `.env` with production API URL
- [ ] Test all public routes work without auth
- [ ] Test direct report claiming
- [ ] Verify token refresh works
- [ ] Test responsive design on mobile
- [ ] Optimize images
- [ ] Run `npm run build`
- [ ] Deploy to hosting platform

## 🐛 Debugging Tips

1. **CORS Issues**: Ensure backend allows requests from frontend origin
2. **Auth Issues**: Check localStorage for tokens
3. **API Errors**: Check Network tab in DevTools
4. **Build Errors**: Run `npm run build` to catch TypeScript errors

---

**Happy Coding! 🐾**
