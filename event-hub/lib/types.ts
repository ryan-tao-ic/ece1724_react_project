import { UserRole, EventStatus, RegistrationStatus } from '@prisma/client';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActivated: boolean;
  registrationDate: Date;
  phoneNumber?: string | null;
  affiliation?: string | null;
  occupancy?: string | null;
  expertise?: string | null;
}

export interface Event {
  id: string;
  name: string;
  description?: string | null;
  location: string;
  eventStartTime: Date;
  eventEndTime: Date;
  availableSeats: number;
  status: EventStatus;
  categoryId: string;
  waitlistCapacity: number;
  isArchived: boolean;
  ticketSaleRequired: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  status: RegistrationStatus;
  registrationTime: Date;
  checkInTime?: Date | null;
  checkOutTime?: Date | null;
  qrCode: string;
  waitlistPosition?: number | null;
}

export interface EventCategory {
  id: string;
  name: string;
}

export interface EventLecturer {
  id: string;
  eventId: string;
  lecturerId: string;
}

export interface EventMaterial {
  id: string;
  eventId: string;
  filePath: string;
  fileName: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Lounge {
  id: string;
  eventId: string;
  openedAt: Date;
  closedAt?: Date | null;
  isActive: boolean;
}

export interface QAMessage {
  id: string;
  eventId: string;
  userId: string;
  content: string;
  timestamp: Date;
} 