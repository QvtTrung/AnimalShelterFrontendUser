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
  images?: PetImage[]; // Deprecated: use pet_images
  pet_images?: PetImage[]; // Directus relation field name
  date_created?: string;
}

export interface PetImage {
  id: string;
  pet_id?: string;
  image_url: string;
  is_primary?: boolean;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  species: 'Dog' | 'Cat' | 'Other';
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
  user_created?: string | Partial<User>; // Can be ID string or expanded User object
  images?: ReportImage[]; // Transformed by backend from report_images
  report_images?: ReportImage[]; // Raw field from database
  date_created?: string;
  date_updated?: string;
}

export interface ReportImage {
  id: string;
  report_id: string;
  image_url: string;
}

export interface Rescue {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  required_participants?: number;
  created_by?: string;
  reports?: RescueReport[];
  participants?: RescueVolunteer[];
  date_created?: string;
}

export interface RescueReport {
  id: string;
  report_id: string;
  status: string;
  note?: string;
  report?: Report;
}

export interface RescueVolunteer {
  id: string;
  rescues_id: string;
  users_id: string;
  role: 'leader' | 'member';
  user?: User;
  date_created?: string;
  date_updated?: string;
}

export interface Adoption {
  id: string;
  pet_id: string | Pet; // Can be ID string or expanded Pet object
  user_id: string | User; // Can be ID string or expanded User object
  pet?: Pet; // Deprecated: use pet_id when expanded
  user?: User; // Deprecated: use user_id when expanded
  status: 'pending' | 'confirming' | 'confirmed' | 'completed' | 'cancelled';
  appointment_date?: string;
  approval_date?: string;
  notes?: string;
  date_created?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'adoption' | 'rescue' | 'report' | 'system';
  related_id?: string;
  is_read: boolean;
  read_at?: string;
  date_created?: string;
  date_updated?: string;
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
