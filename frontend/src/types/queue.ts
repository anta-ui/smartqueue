
export type QueueStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED'| "MAINTENANCE";
export interface Queue {
  id: string;
  name: string;
  status: QueueStatus;
  current_number: number;
  current_wait_time: number;
  queue_type: string;
}

export interface QueueType {
  id: string;
  name: string;
  category: "VEHICLE" | "PERSON" | "MIXED";
  description: string;
  estimatedServiceTime: number;
  maxCapacity: number;
  priorityLevels: Record<string, any>;
  requiresVehicleInfo: boolean;
  requiresIdentification: boolean;
  isActive: boolean;
}

export interface Ticket {
  id: string;
  number: string;
  status: "WAITING" | "CALLED" | "SERVING" | "COMPLETED" | "CANCELLED" | "NO_SHOW" | "TRANSFERRED";
  priorityLevel: number;
  estimatedWaitTime: number;
  checkInTime: string;
  calledTime?: string;
  serviceStartTime?: string;
  serviceEndTime?: string;
  vehicleInfo?: Record<string, any>;
  identificationInfo?: Record<string, any>;
  notes?: string;
}

export interface ServicePoint {
  id: string;
  name: string;
  status: "AVAILABLE" | "BUSY" | "OFFLINE" | "BREAK";
  currentTicket?: Ticket;
  isVehicleCompatible: boolean;
}


export interface QueueCreateUpdateData {
  name: string;
  queue_type: string;
  status?: QueueStatus;
  current_number?: number;
  current_wait_time?: number;
}
export interface QueueType {
  id: string;
  name: string;
  category: 'VEHICLE' | 'PERSON' | 'MIXED';
  estimated_service_time: number;
  max_capacity: number;
}