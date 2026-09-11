export interface Student {
  id: string;
  name: string;
  universityId: string;
  bloodType: string;
  allergies: string;
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  duration: string;
  conflict: 'آمن' | 'تحذير' | 'خطر';
}

export interface Prescription {
  id: string;
  patientName: string;
  status: 'pending' | 'dispensed';
  date: string;
  items?: Medication[];
}
