import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateTrackingCode,
  fetchComplaints,
  createComplaint,
  updateComplaintStatus,
  fetchComments,
  addComment,
  fetchStatusHistory,
} from '@/services/complaintService';

describe('CampusResolve Complaint Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('generates valid tracking code with format CR-YYYY-XXXX', () => {
    const code = generateTrackingCode();
    const currentYear = new Date().getFullYear();
    expect(code).toMatch(new RegExp(`^CR-${currentYear}-\\d{4}$`));
  });

  it('fetches complaints with initial seed fixtures', async () => {
    const { data, error } = await fetchComplaints();
    expect(error).toBeNull();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('tracking_code');
    expect(data[0]).toHaveProperty('status');
  });

  it('creates a new complaint with generated tracking code and status open', async () => {
    const newTitle = 'Classroom projector broken in B301';
    const { data, error } = await createComplaint({
      title: newTitle,
      category: 'Classroom',
      campus_location: 'Academic Block B, Room 301',
      description: 'The projector power cable is severed.',
      student_id: 'test-student-1',
      student_name: 'Test Student',
      student_email: 'test@campus.edu',
    });

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data?.title).toBe(newTitle);
    expect(data?.status).toBe('open');
    expect(data?.tracking_code).toMatch(/^CR-\d{4}-\d{4}$/);

    // Verify it appears in complaints list
    const { data: updatedList } = await fetchComplaints({ studentId: 'test-student-1' });
    expect(updatedList.length).toBe(1);
    expect(updatedList[0].title).toBe(newTitle);
  });

  it('updates complaint status and records status history', async () => {
    const { data: created } = await createComplaint({
      title: 'Water tap leaking',
      category: 'Water / Plumbing',
      campus_location: 'Hostel 2',
      description: 'Continuous drip',
      student_id: 'test-student-1',
    });

    expect(created).not.toBeNull();
    const complaintId = created!.id;

    // Admin updates status to in_progress
    const updateRes = await updateComplaintStatus({
      complaintId,
      newStatus: 'in_progress',
      resolutionNote: 'Plumber dispatched',
      changedBy: 'admin-1',
      changerName: 'Dr. Anita',
      changerRole: 'admin',
    });

    expect(updateRes.success).toBe(true);

    // Check history
    const { data: history } = await fetchStatusHistory(complaintId);
    expect(history.length).toBeGreaterThan(0);
    expect(history.some((h) => h.new_status === 'in_progress')).toBe(true);
  });

  it('adds and retrieves comments', async () => {
    const { data: created } = await createComplaint({
      title: 'Lab AC malfunctioning',
      category: 'Electrical',
      campus_location: 'Lab 1',
      description: 'Temperature stuck at 30C',
      student_id: 'test-student-2',
    });

    const complaintId = created!.id;

    const { data: newComment, error } = await addComment({
      complaintId,
      authorId: 'test-student-2',
      message: 'Can this be checked before 3 PM please?',
      authorName: 'Test Student',
      authorRole: 'student',
    });

    expect(error).toBeNull();
    expect(newComment?.message).toBe('Can this be checked before 3 PM please?');

    const { data: commentList } = await fetchComments(complaintId);
    expect(commentList.some((c) => c.message === 'Can this be checked before 3 PM please?')).toBe(
      true
    );
  });
});
