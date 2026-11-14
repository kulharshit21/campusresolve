import { ComplaintCategory, ComplaintStatus } from '@/types';

export const UNIVERSITY_INFO = {
  name: 'Apex Institute of Technology & Engineering',
  shortName: 'Apex University',
  portalName: 'CampusResolve',
  tagline: 'Smart Campus Issue & Grievance Redressal System',
  compliance: 'Compliant with UGC (Redressal of Grievances of Students) Regulations',
  helpline: '+91 (080) 4123-8900',
  supportEmail: 'grievance.cell@campus.edu',
  adminContact: 'harshitkulkarni608@gmail.com',
};

export const STATUS_CONFIG: Record<
  ComplaintStatus,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
  }
> = {
  open: {
    label: 'Open / Pending',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500 animate-pulse',
  },
  resolved: {
    label: 'Resolved',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

export const CATEGORY_COLORS: Record<ComplaintCategory, string> = {
  'Wi-Fi / Network': 'bg-blue-100 text-blue-800 border-blue-200',
  Electrical: 'bg-amber-100 text-amber-800 border-amber-200',
  Hostel: 'bg-purple-100 text-purple-800 border-purple-200',
  Classroom: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  Cleanliness: 'bg-teal-100 text-teal-800 border-teal-200',
  'Water / Plumbing': 'bg-sky-100 text-sky-800 border-sky-200',
  Library: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Other: 'bg-slate-100 text-slate-800 border-slate-200',
};

// Department Routing mapping
export const CATEGORY_DEPARTMENT: Record<ComplaintCategory, string> = {
  'Wi-Fi / Network': 'Campus IT & Optical Fiber Division',
  Electrical: 'Electrical Maintenance & Substation Division',
  Hostel: 'Hostel Wardens & Residential Office',
  Classroom: 'Academic AV & Infrastructure Facilities',
  Cleanliness: 'Campus Sanitation & Housekeeping Cell',
  'Water / Plumbing': 'Estate Civil Works & Water Supply Cell',
  Library: 'Central Library Management',
  Other: 'General Campus Administration',
};

// Service Level Agreement (SLA) in hours
export const CATEGORY_SLA_HOURS: Record<ComplaintCategory, number> = {
  'Water / Plumbing': 8,
  Electrical: 12,
  Cleanliness: 12,
  'Wi-Fi / Network': 24,
  Classroom: 24,
  Hostel: 24,
  Library: 48,
  Other: 72,
};

// Priority classification based on category
export const CATEGORY_PRIORITY: Record<ComplaintCategory, 'critical' | 'high' | 'medium' | 'low'> = {
  'Water / Plumbing': 'critical',
  Electrical: 'high',
  'Wi-Fi / Network': 'high',
  Classroom: 'high',
  Cleanliness: 'medium',
  Hostel: 'high',
  Library: 'medium',
  Other: 'low',
};

// Common university locations for one-click selection
export const CAMPUS_LOCATION_PRESETS = [
  { zone: 'Academic Block B', landmark: 'Computer Lab 304 (3rd Floor)' },
  { zone: 'Academic Block A', landmark: 'Lecture Hall 102 (Ground Floor)' },
  { zone: 'Central Admin Block', landmark: 'Main Auditorium Hall' },
  { zone: 'Hostel Block 4', landmark: 'Ground Floor West Wing Washroom' },
  { zone: 'Hostel Block 2', landmark: 'Room 214 (2nd Floor)' },
  { zone: 'Central Library', landmark: '2nd Floor Silent Reading Zone' },
  { zone: 'Mechanical Engineering Block', landmark: 'Corridor Water Dispenser' },
  { zone: 'Dining Complex / Mess', landmark: 'Cafeteria Dining Hall' },
];

// Admin Resolution Templates
export const RESOLUTION_TEMPLATES = [
  'Technician inspected site, replaced faulty connector/hardware, and conducted full verification test.',
  'Maintenance team dispatched. Issue remediated as per campus safety and facilities standards.',
  'IT Network team replaced the access point and validated signal stability at full bandwidth.',
  'Sanitation supervisor completed deep disinfection and scheduled recurring inspection.',
  'Civil works contractor repaired pipe seal and verified drainage clearance.',
];
