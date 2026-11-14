export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export type ComplaintCategory =
  | 'Wi-Fi / Network'
  | 'Electrical'
  | 'Hostel'
  | 'Classroom'
  | 'Cleanliness'
  | 'Water / Plumbing'
  | 'Library'
  | 'Other';

export const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  'Wi-Fi / Network',
  'Electrical',
  'Hostel',
  'Classroom',
  'Cleanliness',
  'Water / Plumbing',
  'Library',
  'Other',
];

export type ComplaintStatus = 'open' | 'in_progress' | 'resolved';

export type ComplaintPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Complaint {
  id: string;
  tracking_code: string;
  student_id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  campus_location: string;
  status: ComplaintStatus;
  priority?: ComplaintPriority;
  image_url?: string | null;
  resolution_note?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
  student_profile?: {
    full_name: string;
    email?: string;
    role?: UserRole;
  };
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'status_change' | 'comment' | 'system';
  complaintId?: string;
  trackingCode?: string;
}

export interface ComplaintComment {
  id: string;
  complaint_id: string;
  author_id: string;
  message: string;
  created_at: string;
  author_profile?: {
    full_name: string;
    role: UserRole;
  };
}

export interface ComplaintStatusHistory {
  id: string;
  complaint_id: string;
  changed_by: string;
  old_status: ComplaintStatus | null;
  new_status: ComplaintStatus;
  note?: string | null;
  changed_at: string;
  changer_profile?: {
    full_name: string;
    role: UserRole;
  };
}

export interface ComplaintStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  categoryCounts: { name: string; count: number }[];
}
