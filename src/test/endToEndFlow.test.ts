import { describe, it, expect, beforeEach } from 'vitest';
import {
  createComplaint,
  fetchComplaints,
  fetchComplaintById,
  updateComplaintStatus,
  fetchStatusHistory,
  fetchComplaintStats,
  addComment,
  fetchComments,
} from '@/services/complaintService';

describe('CampusResolve End-to-End Master Lifecycle Verification (20-Step Review Flow)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('successfully executes the full 20-step student-to-admin lifecycle', async () => {
    // -------------------------------------------------------------
    // Step 1: Student Identity
    // -------------------------------------------------------------
    const studentUser = {
      id: 'st-rahul-001',
      name: 'Campus Scholar',
      email: 'student@campusresolve.edu',
      role: 'student' as const,
    };
    expect(studentUser.role).toBe('student');

    // -------------------------------------------------------------
    // Steps 2-7: Submit complaint with title, category, location, description & evidence
    // -------------------------------------------------------------
    const complaintTitle = 'Wi-Fi Not Working in Computer Lab';
    const category = 'Wi-Fi / Network';
    const location = 'Academic Block B, 3rd Floor, Lab 304';
    const description = 'Network disconnection during practicals. AP fails to assign DHCP address.';
    const sampleImageUrl = 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800';

    const { data: createdComplaint, error: createError } = await createComplaint({
      title: complaintTitle,
      category,
      campus_location: location,
      description,
      image_url: sampleImageUrl,
      student_id: studentUser.id,
      student_name: studentUser.name,
      student_email: studentUser.email,
    });

    // -------------------------------------------------------------
    // Steps 8-9: Verify row exists and confirm generated tracking ID
    // -------------------------------------------------------------
    expect(createError).toBeNull();
    expect(createdComplaint).not.toBeNull();
    const complaintId = createdComplaint!.id;
    const trackingCode = createdComplaint!.tracking_code;

    expect(createdComplaint?.title).toBe(complaintTitle);
    expect(createdComplaint?.category).toBe('Wi-Fi / Network');
    expect(createdComplaint?.status).toBe('open');
    expect(createdComplaint?.image_url).toBe(sampleImageUrl);
    expect(trackingCode).toMatch(/^CR-\d{4}-\d{4}$/);

    // Verify row query
    const { data: fetchedRow } = await fetchComplaintById(complaintId);
    expect(fetchedRow).not.toBeNull();
    expect(fetchedRow?.tracking_code).toBe(trackingCode);

    // Initial status history check
    const { data: initialHistory } = await fetchStatusHistory(complaintId);
    expect(initialHistory.length).toBe(1);
    expect(initialHistory[0].new_status).toBe('open');

    // -------------------------------------------------------------
    // Steps 10-12: Administrator logs in and finds the complaint
    // -------------------------------------------------------------
    const adminUser = {
      id: 'ad-anita-001',
      name: 'Campus Administrator',
      email: 'admin@campusresolve.edu',
      role: 'admin' as const,
    };
    expect(adminUser.role).toBe('admin');

    const { data: adminComplaintsList } = await fetchComplaints({ search: trackingCode });
    expect(adminComplaintsList.length).toBe(1);
    expect(adminComplaintsList[0].id).toBe(complaintId);

    // -------------------------------------------------------------
    // Steps 13-14: Admin changes status to "In Progress" & audit history logged
    // -------------------------------------------------------------
    const dispatchNote = 'IT Network Team dispatched with replacement Cisco AP.';
    const updateRes1 = await updateComplaintStatus({
      complaintId,
      newStatus: 'in_progress',
      resolutionNote: dispatchNote,
      changedBy: adminUser.id,
      changerName: adminUser.name,
      changerRole: 'admin',
    });
    expect(updateRes1.success).toBe(true);

    // Admin posts an official comment
    await addComment({
      complaintId,
      authorId: adminUser.id,
      message: 'Technician Mr. Rajesh is on-site at Lab 304 to replace the access point.',
      authorName: adminUser.name,
      authorRole: 'admin',
    });

    // -------------------------------------------------------------
    // Steps 15-16: Student view reflects updated status & timeline
    // -------------------------------------------------------------
    const { data: studentView } = await fetchComplaintById(complaintId);
    expect(studentView?.status).toBe('in_progress');

    const { data: historyAfterProgress } = await fetchStatusHistory(complaintId);
    expect(historyAfterProgress.length).toBe(2);
    expect(historyAfterProgress[1].old_status).toBe('open');
    expect(historyAfterProgress[1].new_status).toBe('in_progress');
    expect(historyAfterProgress[1].note).toBe(dispatchNote);

    // Student responds in comment thread
    await addComment({
      complaintId,
      authorId: studentUser.id,
      message: 'Technician has arrived and is configuring the router. Thank you!',
      authorName: studentUser.name,
      authorRole: 'student',
    });

    const { data: commentsList } = await fetchComments(complaintId);
    expect(commentsList.length).toBe(2);
    expect(commentsList[0].author_profile?.role).toBe('admin');
    expect(commentsList[1].author_profile?.role).toBe('student');

    // -------------------------------------------------------------
    // Steps 17-18: Admin resolves complaint with resolution note
    // -------------------------------------------------------------
    const finalResolutionNote =
      'Access point replaced, 5GHz band channel reconfigured, verified 100Mbps ping to university gateway.';
    const updateRes2 = await updateComplaintStatus({
      complaintId,
      newStatus: 'resolved',
      resolutionNote: finalResolutionNote,
      changedBy: adminUser.id,
      changerName: adminUser.name,
      changerRole: 'admin',
    });
    expect(updateRes2.success).toBe(true);

    // -------------------------------------------------------------
    // Step 19: Confirm final resolved state & timestamps
    // -------------------------------------------------------------
    const { data: finalComplaint } = await fetchComplaintById(complaintId);
    expect(finalComplaint?.status).toBe('resolved');
    expect(finalComplaint?.resolution_note).toBe(finalResolutionNote);
    expect(finalComplaint?.resolved_at).not.toBeNull();

    // -------------------------------------------------------------
    // Step 20: Verify dashboard counts and full audit history
    // -------------------------------------------------------------
    const { data: finalHistory } = await fetchStatusHistory(complaintId);
    expect(finalHistory.length).toBe(3);
    expect(finalHistory[2].new_status).toBe('resolved');
    expect(finalHistory[2].note).toBe(finalResolutionNote);

    const stats = await fetchComplaintStats();
    expect(stats.total).toBeGreaterThanOrEqual(1);
    expect(stats.resolved).toBeGreaterThanOrEqual(1);
  });
});
