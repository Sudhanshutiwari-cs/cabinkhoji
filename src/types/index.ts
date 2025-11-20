export type UserRole = 'student' | 'hod' | 'guard';

export interface Profile {
  id: string;
  name: string;
  roll: string;
  department: string;
  role: UserRole;
  created_at: string;
}

export interface GatePass {
  id: string;
  student_id: string;
  reason: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  qr_url: string | null;
  created_at: string;
  student?: Profile;
}

export interface QRData {
  passId: string;
  studentId: string;
}