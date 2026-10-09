export type RoleName = 'ADMIN_GENERAL' | 'BANK_MANAGER';
export type BloodType = 'A' | 'B' | 'AB' | 'O';
export type RhFactor = 'POSITIVE' | 'NEGATIVE';
export type BloodUnitStatus = 'AVAILABLE' | 'NEAR_EXPIRATION' | 'EXPIRED' | 'DISCARDED' | 'TRANSFERRED';
export type TransferRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_TRANSIT' | 'COMPLETED';

export interface User {
  id_user: number;
  full_name: string;
  email: string;
  role: RoleName;
  id_medical_center: number | null;
  medical_center_name?: string | null;
}

export interface MedicalCenter {
  id_medical_center: number;
  name: string;
  type: string;
  address: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
  _count?: {
    blood_units: number;
    users: number;
  };
}

export interface BloodUnit {
  id_blood_unit: number;
  blood_type: BloodType;
  rh_factor: RhFactor;
  extraction_date: string;
  expiration_date: string;
  status: BloodUnitStatus;
  id_medical_center: number;
  medical_center?: MedicalCenter;
  created_at?: string;
}

export interface TransferDetail {
  id_transfer_detail: number;
  id_transfer_request: number;
  id_blood_unit: number;
  blood_unit?: BloodUnit;
}

export interface TransferRequest {
  id_transfer_request: number;
  id_requesting_center: number;
  id_supplying_center: number;
  blood_type: BloodType;
  quantity: number;
  status: TransferRequestStatus;
  request_date: string;
  requesting_center?: MedicalCenter;
  supplying_center?: MedicalCenter;
  transfer_details?: TransferDetail[];
}

export interface MovementHistory {
  id_movement_history: number;
  id_blood_unit: number;
  id_user: number;
  action: string;
  timestamp: string;
  blood_unit?: {
    id_blood_unit: number;
    blood_type: BloodType;
    rh_factor: RhFactor;
    status: BloodUnitStatus;
    medical_center?: { name: string };
  };
  user?: {
    id_user: number;
    full_name: string;
    email: string;
  };
}

export interface DashboardMetrics {
  bloodTypeBreakdown: Record<string, number>;
  totalAvailableUnits: number;
  expiringSoonCount: number;
  expiringSoonUnits: Array<{
    id_blood_unit: number;
    blood_type: string;
    expiration_date: string;
    days_remaining: number;
    medical_center: string;
  }>;
  pendingRequestsCount: number;
  pendingRequestsList: TransferRequest[];
}
