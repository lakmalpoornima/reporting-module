export interface PatientData {
  name: string;
  age: string;
  sex: 'Male' | 'Female' | 'Other';
  id: string;
  reportType: string;
  referredBy: string;
}

export interface ReportContent {
  technique: string[];
  clinicalFindings: string;
  diagnosis: string;
  recommendation: string;
  impression: string;
}

export interface MedicalReport {
  id: string;
  doctorId: string;
  patient: PatientData;
  content: ReportContent;
  date: string;
  timestamp: number;
  consultantName: string;
  images: string[];
}

export interface DoctorProfile {
  id: string;
  name: string;
  centerName: string;
  address: string;
  contact: string;
  logoUrl: string;
  technologistSignatureUrl: string;
  radiologist1SignatureUrl: string;
  radiologist2SignatureUrl: string;
}

export interface PaymentHistory {
  date: string;
  reportCount: number;
  amount: number;
  status: 'Paid' | 'Pending';
}

export type AppState = 'login' | 'dashboard' | 'history' | 'profile' | 'preview';
