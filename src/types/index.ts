export interface Token {
  access_token: string;
  token_type: string;
}

export type UserRole = "admin" | "ranger" | "user";

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  is_locked: boolean;
}

export interface AdminUserResponse extends UserResponse {
  failed_login_count: number;
  last_login_at: string | null;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface BookingCreate {
  user_id: number;
  location: string;
  start_time: string;
  end_time: string;
}

export interface BookingResponse {
  id: number;
  user_id: number;
  location: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  qr_code_data: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface AnnouncementResponse {
  id: number;
  title: string;
  body: string;
  created_by: number;
  is_active: boolean;
  created_at: string;
}

export interface AnnouncementCreate {
  title: string;
  body: string;
}

export interface AnnouncementUpdate {
  title?: string;
  body?: string;
  is_active?: boolean;
}

export interface HotspotResponse {
  id: number;
  species: string;
  latitude: number;
  longitude: number;
  notes: string | null;
  recorded_by: number;
  recorded_at: string;
  masked: boolean;
}

export type ComplaintStatus = "open" | "in_progress" | "resolved";

export interface ComplaintCreate {
  description: string;
  latitude: number;
  longitude: number;
}

export interface ComplaintResponse {
  id: number;
  user_id: number;
  description: string;
  latitude: number;
  longitude: number;
  status: ComplaintStatus;
  created_at: string;
  updated_at: string | null;
}

export type IncidentType = "poaching" | "fence_break" | "other";
export type IncidentStatus = "open" | "investigating" | "resolved";

export interface IncidentResponse {
  id: number;
  reporter_id: number;
  type: IncidentType;
  latitude: number;
  longitude: number;
  gps_timestamp: string;
  photo_path: string;
  status: IncidentStatus;
  created_at: string;
}

export interface SosPayload {
  latitude: number;
  longitude: number;
}

export interface SosResponse {
  id: number;
  sender_id: number;
  latitude: number;
  longitude: number;
  sent_at: string;
  resolved: boolean;
}

export interface SightingLogEntry {
  local_id?: string;
  species: string;
  latitude: number;
  longitude: number;
  observed_at: string;
}

export interface PatrolRouteEntry {
  local_id?: string;
  coordinates: number[][];
  patrol_date: string;
}

export interface SyncPayload {
  sightings: SightingLogEntry[];
  patrol_routes: PatrolRouteEntry[];
}

export interface SyncResult {
  sightings_synced: number;
  routes_synced: number;
  conflicts_resolved: number;
}

export type ItemCategory = "vehicle" | "radio" | "trap" | "other";
export type ItemStatus = "available" | "in_use" | "maintenance" | "decommissioned";

export interface InventoryItemCreate {
  name: string;
  category: ItemCategory;
  quantity: number;
  status: ItemStatus;
  location?: string;
}

export interface InventoryItemUpdate {
  name?: string;
  category?: ItemCategory;
  quantity?: number;
  status?: ItemStatus;
  location?: string;
  last_maintained?: string;
}

export interface InventoryItemResponse {
  id: number;
  name: string;
  category: ItemCategory;
  quantity: number;
  status: ItemStatus;
  location: string | null;
  last_maintained: string | null;
  created_at: string;
}

export interface AuditLogResponse {
  id: number;
  user_id: number | null;
  action: string;
  ip_address: string;
  success: boolean;
  detail: string | null;
  timestamp: string;
}

export interface SpeciesResult {
  species: string;
  confidence: number;
  filename: string;
}
