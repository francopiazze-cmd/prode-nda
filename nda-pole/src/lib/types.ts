export type Modality = "presencial" | "virtual";

export interface Slot {
  id: string;
  modality: Modality;
  starts_at: string; // ISO timestamp
  duration_min: number;
  capacity: number;
  booked_count: number;
  location: string | null; // dirección (presencial)
  meeting_link: string | null; // link videollamada (virtual)
  note: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  slot_id: string;
  modality: Modality;
  starts_at: string;
  duration_min: number;
  student_name: string;
  student_phone: string;
  student_email: string;
  status: "confirmed" | "cancelled";
  created_at: string;
}

// Lo que ve el público de un turno disponible (sin datos de otras alumnas).
export interface PublicSlot {
  id: string;
  modality: Modality;
  starts_at: string;
  duration_min: number;
  spots_left: number;
  location: string | null;
  meeting_link: string | null;
  note: string | null;
}
