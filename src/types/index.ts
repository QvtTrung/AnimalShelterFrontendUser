export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role?: 'Administrator' | 'Staff' | 'User';
  status?: 'active' | 'inactive';
  avatar?: string;
  address?: string;
  date_of_birth?: string;
  directus_user_id?: string;
  date_created?: string;
  date_updated?: string;
}

export interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed?: string;
  age?: number;
  age_unit?: 'months' | 'years';
  size?: 'small' | 'medium' | 'large';
  gender?: 'male' | 'female';
  color?: string;
  description?: string;
  health_status?: string;
  vaccination_status?: string;
  medical_history?: string;
  location?: string;
  status: 'available' | 'pending' | 'adopted';
  adoption_status: 'available' | 'pending' | 'adopted';
  rescue_id?: string;
  images?: PetImage[];
  date_created?: string;
}

export interface PetImage {
  id: string;
  pet_id: string;
  image_url: string;
  is_primary: boolean;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  species: string;
  type: 'abuse' | 'abandonment' | 'injured_animal' | 'other';
  location: string;
  coordinates?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  status: 'pending' | 'assigned' | 'resolved';
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  reported_by?: string;
  user_created?: string;
  images?: ReportImage[];
  date_created?: string;
  date_updated?: string;
}

export interface ReportImage {
  id: string;
  reports_id: string;
  image_url: string;
}

export interface Rescue {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  max_volunteers?: number;
  created_by?: string;
  reports?: Report[];
  volunteers?: RescueVolunteer[];
  date_created?: string;
}

export interface RescueVolunteer {
  id: string;
  rescue_id: string;
  user_id: string;
  user?: User;
  status: 'pending' | 'confirmed' | 'cancelled';
  date_joined?: string;
}

export interface Adoption {
  id: string;
  pet_id: string;
  user_id: string;
  pet?: Pet;
  user?: User;
  status: 'pending' | 'confirming' | 'confirmed' | 'completed' | 'cancelled';
  appointment_date?: string;
  approval_date?: string;
  notes?: string;
  date_created?: string;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  meta?: { total: number };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
