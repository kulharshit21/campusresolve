import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import {
  Complaint,
  ComplaintCategory,
  ComplaintComment,
  ComplaintStats,
  ComplaintStatus,
  ComplaintStatusHistory,
} from '@/types';

const STORAGE_KEY = 'campusresolve_complaints_data';
const COMMENTS_KEY = 'campusresolve_comments_data';
const HISTORY_KEY = 'campusresolve_history_data';

// Helper to generate unique tracking code in format CR-YYYY-XXXX
export function generateTrackingCode(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CR-${year}-${randomNum}`;
}

// Initial fixture data for development preview
const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'c-101',
    tracking_code: 'CR-2026-1001',
    student_id: 'db0fc7b6-c031-499e-9730-0880d8c9834d',
    title: 'Wi-Fi not working in Computer Lab 3',
    description:
      'The access point keeps dropping connections every 5 minutes during our distributed systems practicals. IP address lease fails frequently.',
    category: 'Wi-Fi / Network',
    campus_location: 'Academic Block B, 3rd Floor, Lab 304',
    status: 'in_progress',
    image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800',
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    student_profile: { full_name: 'Campus Scholar', email: 'student1@campusresolve.edu', role: 'student' },
  },
  {
    id: 'c-102',
    tracking_code: 'CR-2026-1002',
    student_id: 'db0fc7b6-c031-499e-9730-0880d8c9834d',
    title: 'Water leakage in Hostel Block 4 Washroom',
    description:
      'Continuous overhead pipe leakage creating slippery floors near cubicle 3. Urgent plumbing required before water wastage increases.',
    category: 'Water / Plumbing',
    campus_location: 'Hostel Block 4, Ground Floor West Wing',
    status: 'open',
    created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    student_profile: { full_name: 'Campus Scholar', email: 'student1@campusresolve.edu', role: 'student' },
  },
  {
    id: 'c-103',
    tracking_code: 'CR-2026-1003',
    student_id: 'c2672274-0899-4c65-a9dc-5f1c9e792cad',
    title: 'Projector flickering in Main Auditorium',
    description:
      'HDMI input connector is loose and display flickers every few seconds during presentations.',
    category: 'Classroom',
    campus_location: 'Central Admin Block, Auditorium Hall',
    status: 'resolved',
    resolution_note: 'AV technician replaced damaged HDMI wall interface and tested signal at 1080p 60Hz. Audio and video verified clear.',
    resolved_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    student_profile: { full_name: 'Hostel Scholar', email: 'student2@campusresolve.edu', role: 'student' },
  },
  {
    id: 'c-104',
    tracking_code: 'CR-2026-1004',
    student_id: 'c2672274-0899-4c65-a9dc-5f1c9e792cad',
    title: 'Faulty ceiling fans in Library Reading Section',
    description:
      'Two ceiling fans near aisle 4 produce excessive screeching noise, disturbing students preparing for semester exams.',
    category: 'Electrical',
    campus_location: 'Central Library, 2nd Floor Silent Zone',
    status: 'open',
    created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    student_profile: { full_name: 'Hostel Scholar', email: 'student2@campusresolve.edu', role: 'student' },
  },
];

const INITIAL_COMMENTS: ComplaintComment[] = [
  {
    id: 'com-1',
    complaint_id: 'c-101',
    author_id: 'e691351d-233c-4a60-bf35-db8bdad713d8',
    message: 'IT Network Team has been dispatched with a replacement Cisco AP. Firmware update currently in progress.',
    created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    author_profile: { full_name: 'Dr. Anita Desai (Campus Admin)', role: 'admin' },
  },
  {
    id: 'com-2',
    complaint_id: 'c-101',
    author_id: 'db0fc7b6-c031-499e-9730-0880d8c9834d',
    message: 'Thank you maam! We tested at 2:00 PM and signal is significantly more stable now.',
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    author_profile: { full_name: 'Rahul Sharma', role: 'student' },
  },
];

const INITIAL_HISTORY: ComplaintStatusHistory[] = [
  {
    id: 'h-1',
    complaint_id: 'c-101',
    changed_by: 'db0fc7b6-c031-499e-9730-0880d8c9834d',
    old_status: null,
    new_status: 'open',
    note: 'Complaint registered by student',
    changed_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    changer_profile: { full_name: 'Rahul Sharma', role: 'student' },
  },
  {
    id: 'h-2',
    complaint_id: 'c-101',
    changed_by: 'e691351d-233c-4a60-bf35-db8bdad713d8',
    old_status: 'open',
    new_status: 'in_progress',
    note: 'Assigned to IT Network Engineer for lab hardware inspection.',
    changed_at: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
    changer_profile: { full_name: 'Dr. Anita Desai (Campus Admin)', role: 'admin' },
  },
];

function getStoredFixtures<T>(key: string, defaults: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaults));
    return defaults;
  }
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaults;
  }
}

export async function fetchComplaints(params?: {
  studentId?: string;
  category?: string;
  status?: string;
  search?: string;
}): Promise<{ data: Complaint[]; error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('complaints')
        .select(`
          *,
          student_profile:profiles!complaints_student_id_fkey(full_name, email, role)
        `)
        .order('created_at', { ascending: false });

      if (params?.studentId) {
        query = query.eq('student_id', params.studentId);
      }
      if (params?.category && params.category !== 'all') {
        query = query.eq('category', params.category);
      }
      if (params?.status && params.status !== 'all') {
        query = query.eq('status', params.status);
      }
      if (params?.search) {
        query = query.or(
          `title.ilike.%${params.search}%,description.ilike.%${params.search}%,tracking_code.ilike.%${params.search}%,campus_location.ilike.%${params.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: (data as any) || [], error: null };
    } catch (err: any) {
      console.error('fetchComplaints error:', err);
      return { data: [], error: err.message };
    }
  }

  // Development fixtures
  let list = getStoredFixtures<Complaint[]>(STORAGE_KEY, INITIAL_COMPLAINTS);

  if (params?.studentId) {
    list = list.filter((c) => c.student_id === params.studentId);
  }
  if (params?.category && params.category !== 'all') {
    list = list.filter((c) => c.category === params.category);
  }
  if (params?.status && params.status !== 'all') {
    list = list.filter((c) => c.status === params.status);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tracking_code.toLowerCase().includes(q) ||
        c.campus_location.toLowerCase().includes(q)
    );
  }

  return { data: list, error: null };
}

export async function fetchComplaintById(
  id: string
): Promise<{ data: Complaint | null; error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          student_profile:profiles!complaints_student_id_fkey(full_name, email, role)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data: data as any, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }

  const list = getStoredFixtures<Complaint[]>(STORAGE_KEY, INITIAL_COMPLAINTS);
  const found = list.find((c) => c.id === id || c.tracking_code === id) || null;
  return { data: found, error: null };
}

export async function createComplaint(payload: {
  title: string;
  description: string;
  category: ComplaintCategory;
  campus_location: string;
  image_url?: string | null;
  student_id: string;
  student_name?: string;
  student_email?: string;
}): Promise<{ data: Complaint | null; error: string | null }> {
  const tracking_code = generateTrackingCode();

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .insert({
          tracking_code,
          student_id: payload.student_id,
          title: payload.title,
          description: payload.description,
          category: payload.category,
          campus_location: payload.campus_location,
          image_url: payload.image_url || null,
          status: 'open',
        })
        .select(`
          *,
          student_profile:profiles!complaints_student_id_fkey(full_name, email, role)
        `)
        .single();

      if (error) throw error;

      return { data: data as any, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }

  const list = getStoredFixtures<Complaint[]>(STORAGE_KEY, INITIAL_COMPLAINTS);
  const newComplaint: Complaint = {
    id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    tracking_code,
    student_id: payload.student_id,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    campus_location: payload.campus_location,
    status: 'open',
    image_url: payload.image_url || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    student_profile: {
      full_name: payload.student_name || 'Student',
      email: payload.student_email || '',
      role: 'student',
    },
  };

  list.unshift(newComplaint);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

  // Add initial history
  const history = getStoredFixtures<ComplaintStatusHistory[]>(HISTORY_KEY, INITIAL_HISTORY);
  history.push({
    id: `h-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    complaint_id: newComplaint.id,
    changed_by: payload.student_id,
    old_status: null,
    new_status: 'open',
    note: 'Complaint registered by student',
    changed_at: new Date().toISOString(),
    changer_profile: {
      full_name: payload.student_name || 'Student',
      role: 'student',
    },
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

  return { data: newComplaint, error: null };
}

export async function updateComplaintStatus(payload: {
  complaintId: string;
  newStatus: ComplaintStatus;
  resolutionNote?: string;
  changedBy: string;
  changerName?: string;
  changerRole?: 'admin' | 'student';
}): Promise<{ success: boolean; error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const updateData: any = {
        status: payload.newStatus,
        updated_at: new Date().toISOString(),
      };

      if (payload.newStatus === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
        if (payload.resolutionNote) {
          updateData.resolution_note = payload.resolutionNote;
        }
      }

      const { error: updateError } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', payload.complaintId);

      if (updateError) throw updateError;

      // Note: Database triggers automatically log to complaint_status_history,
      // but if trigger is not yet attached, we also safely insert directly
      await supabase.from('complaint_status_history').insert({
        complaint_id: payload.complaintId,
        changed_by: payload.changedBy,
        new_status: payload.newStatus,
        note: payload.resolutionNote || `Status updated to ${payload.newStatus}`,
      });

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // Update in fixture storage
  const list = getStoredFixtures<Complaint[]>(STORAGE_KEY, INITIAL_COMPLAINTS);
  const index = list.findIndex((c) => c.id === payload.complaintId);
  if (index === -1) return { success: false, error: 'Complaint not found.' };

  const oldStatus = list[index].status;
  list[index].status = payload.newStatus;
  list[index].updated_at = new Date().toISOString();
  if (payload.newStatus === 'resolved') {
    list[index].resolved_at = new Date().toISOString();
    list[index].resolution_note = payload.resolutionNote || 'Resolved by administrator.';
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

  // Add history entry
  const history = getStoredFixtures<ComplaintStatusHistory[]>(HISTORY_KEY, INITIAL_HISTORY);
  history.push({
    id: `h-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    complaint_id: payload.complaintId,
    changed_by: payload.changedBy,
    old_status: oldStatus,
    new_status: payload.newStatus,
    note: payload.resolutionNote || `Status updated to ${payload.newStatus}`,
    changed_at: new Date().toISOString(),
    changer_profile: {
      full_name: payload.changerName || 'Administrator',
      role: payload.changerRole || 'admin',
    },
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

  return { success: true, error: null };
}

export async function fetchComments(
  complaintId: string
): Promise<{ data: ComplaintComment[]; error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('complaint_comments')
        .select(`
          *,
          author_profile:profiles!complaint_comments_author_id_fkey(full_name, role)
        `)
        .eq('complaint_id', complaintId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data: (data as any) || [], error: null };
    } catch (err: any) {
      return { data: [], error: err.message };
    }
  }

  const allComments = getStoredFixtures<ComplaintComment[]>(COMMENTS_KEY, INITIAL_COMMENTS);
  const filtered = allComments.filter((c) => c.complaint_id === complaintId);
  return { data: filtered, error: null };
}

export async function addComment(payload: {
  complaintId: string;
  authorId: string;
  message: string;
  authorName?: string;
  authorRole?: 'student' | 'admin';
}): Promise<{ data: ComplaintComment | null; error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('complaint_comments')
        .insert({
          complaint_id: payload.complaintId,
          author_id: payload.authorId,
          message: payload.message,
        })
        .select(`
          *,
          author_profile:profiles!complaint_comments_author_id_fkey(full_name, role)
        `)
        .single();

      if (error) throw error;
      return { data: data as any, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }

  const allComments = getStoredFixtures<ComplaintComment[]>(COMMENTS_KEY, INITIAL_COMMENTS);
  const newComment: ComplaintComment = {
    id: `com-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    complaint_id: payload.complaintId,
    author_id: payload.authorId,
    message: payload.message,
    created_at: new Date().toISOString(),
    author_profile: {
      full_name: payload.authorName || 'User',
      role: payload.authorRole || 'student',
    },
  };
  allComments.push(newComment);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
  return { data: newComment, error: null };
}

export async function fetchStatusHistory(
  complaintId: string
): Promise<{ data: ComplaintStatusHistory[]; error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('complaint_status_history')
        .select(`
          *,
          changer_profile:profiles!complaint_status_history_changed_by_fkey(full_name, role)
        `)
        .eq('complaint_id', complaintId)
        .order('changed_at', { ascending: true });

      if (error) throw error;
      return { data: (data as any) || [], error: null };
    } catch (err: any) {
      return { data: [], error: err.message };
    }
  }

  const allHistory = getStoredFixtures<ComplaintStatusHistory[]>(HISTORY_KEY, INITIAL_HISTORY);
  const filtered = allHistory.filter((h) => h.complaint_id === complaintId);
  return { data: filtered, error: null };
}

export async function fetchComplaintStats(
  studentId?: string
): Promise<ComplaintStats> {
  const { data: list } = await fetchComplaints(studentId ? { studentId } : undefined);

  const total = list.length;
  const open = list.filter((c) => c.status === 'open').length;
  const inProgress = list.filter((c) => c.status === 'in_progress').length;
  const resolved = list.filter((c) => c.status === 'resolved').length;

  const categoryMap: Record<string, number> = {};
  list.forEach((c) => {
    categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
  });

  const categoryCounts = Object.entries(categoryMap).map(([name, count]) => ({
    name,
    count,
  }));

  return { total, open, inProgress, resolved, categoryCounts };
}

export function subscribeToComplaintsRealtime(
  onUpdate: (payload: any) => void
) {
  if (!isSupabaseConfigured) return () => {};

  const channel = supabase
    .channel('complaints_realtime_channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'complaints',
      },
      (payload) => {
        onUpdate(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
