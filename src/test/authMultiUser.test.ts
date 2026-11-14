import { describe, it, expect, beforeEach } from 'vitest';
import {
  createComplaint,
  fetchComplaints,
  updateComplaintStatus,
  fetchComplaintById,
} from '@/services/complaintService';

describe('CampusResolve Multi-User Profile & Work Isolation Verification', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('correctly isolates and saves work for every user profile', async () => {
    // -------------------------------------------------------------
    // 1. Student 1: Ananya registers and files a complaint
    // -------------------------------------------------------------
    const student1 = {
      id: 'st-ananya-101',
      full_name: 'Ananya Sen',
      email: 'ananya@campus.edu',
      role: 'student' as const,
    };

    const { data: ananyaComplaint } = await createComplaint({
      title: 'Broken electrical socket in Room 101',
      category: 'Electrical',
      campus_location: 'Science Block, 1st Floor, Room 101',
      description: 'Sparking noticed when laptop charger was plugged in.',
      student_id: student1.id,
      student_name: student1.full_name,
      student_email: student1.email,
    });

    expect(ananyaComplaint).not.toBeNull();
    expect(ananyaComplaint?.student_id).toBe(student1.id);

    // Verify Ananya only sees her own complaints
    const { data: ananyaList } = await fetchComplaints({ studentId: student1.id });
    expect(ananyaList.length).toBe(1);
    expect(ananyaList[0].title).toBe('Broken electrical socket in Room 101');

    // -------------------------------------------------------------
    // 2. Student 2: Vikram registers and files a separate complaint
    // -------------------------------------------------------------
    const student2 = {
      id: 'st-vikram-202',
      full_name: 'Vikram Joshi',
      email: 'vikram@campus.edu',
      role: 'student' as const,
    };

    const { data: vikramComplaint } = await createComplaint({
      title: 'Water cooler leaking in Hostel C',
      category: 'Water / Plumbing',
      campus_location: 'Hostel C, Ground Floor Mess',
      description: 'Large puddle forming near water cooler dispenser.',
      student_id: student2.id,
      student_name: student2.full_name,
      student_email: student2.email,
    });

    expect(vikramComplaint).not.toBeNull();
    expect(vikramComplaint?.student_id).toBe(student2.id);

    // Verify Vikram only sees his own complaints (ISOLATION CHECK)
    const { data: vikramList } = await fetchComplaints({ studentId: student2.id });
    expect(vikramList.length).toBe(1);
    expect(vikramList[0].title).toBe('Water cooler leaking in Hostel C');
    expect(vikramList.some((c) => c.id === ananyaComplaint?.id)).toBe(false);

    // -------------------------------------------------------------
    // 3. Admin logs in and sees ALL complaints across both students
    // -------------------------------------------------------------
    const admin = {
      id: 'ad-anita-001',
      full_name: 'Campus Administrator',
      email: 'admin@campusresolve.edu',
      role: 'admin' as const,
    };

    const { data: allComplaints } = await fetchComplaints();
    const ananyaFound = allComplaints.some((c) => c.id === ananyaComplaint?.id);
    const vikramFound = allComplaints.some((c) => c.id === vikramComplaint?.id);
    expect(ananyaFound).toBe(true);
    expect(vikramFound).toBe(true);

    // -------------------------------------------------------------
    // 4. Admin updates Vikram's complaint to "In Progress"
    // -------------------------------------------------------------
    const updateResult = await updateComplaintStatus({
      complaintId: vikramComplaint!.id,
      newStatus: 'in_progress',
      resolutionNote: 'Plumber dispatched to Hostel C.',
      changedBy: admin.id,
      changerName: admin.full_name,
      changerRole: 'admin',
    });
    expect(updateResult.success).toBe(true);

    // -------------------------------------------------------------
    // 5. Vikram logs back in and confirms his status changed to "in_progress"
    // -------------------------------------------------------------
    const { data: vikramCheck } = await fetchComplaintById(vikramComplaint!.id);
    expect(vikramCheck?.status).toBe('in_progress');

    // -------------------------------------------------------------
    // 6. Ananya logs back in and confirms her complaint remains "open" (Independent lifecycle)
    // -------------------------------------------------------------
    const { data: ananyaCheck } = await fetchComplaintById(ananyaComplaint!.id);
    expect(ananyaCheck?.status).toBe('open');
  });
});
