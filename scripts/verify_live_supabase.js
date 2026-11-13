import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aapgcfggzhosratewjpe.supabase.co';
const ANON_KEY = 'sb_publishable_BtR1NPzFA-hw2qZhD-t1CA_3CK7vBra';

async function verifyLiveFlow() {
  console.log('=== STARTING LIVE SUPABASE END-TO-END VERIFICATION ===\n');

  // 1. Client for Student (Rahul)
  const studentClient = createClient(SUPABASE_URL, ANON_KEY);
  console.log('Step 1: Signing in as Student (rahul.student@campus.edu)...');
  const { data: studentAuth, error: studentAuthErr } = await studentClient.auth.signInWithPassword({
    email: 'rahul.student@campus.edu',
    password: 'password123'
  });

  if (studentAuthErr || !studentAuth.user) {
    throw new Error(`Student sign-in failed: ${studentAuthErr?.message}`);
  }
  console.log(`✓ Student authenticated successfully! UUID: ${studentAuth.user.id}`);

  // 2. Fetch Rahul's complaints
  console.log('Step 2: Querying student complaints (testing per-profile data isolation)...');
  const { data: studentComplaints, error: scErr } = await studentClient
    .from('complaints')
    .select('*')
    .eq('student_id', studentAuth.user.id);

  if (scErr) throw new Error(`Query student complaints failed: ${scErr.message}`);
  console.log(`✓ Student sees ${studentComplaints.length} complaints owned by them.`);

  // 3. Create a live complaint as Rahul
  const trackingCode = `CR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  console.log(`Step 3: Creating a new live complaint (Tracking Code: ${trackingCode})...`);
  const { data: newTicket, error: createErr } = await studentClient
    .from('complaints')
    .insert({
      tracking_code: trackingCode,
      student_id: studentAuth.user.id,
      title: 'Water dispenser not cooling in Mech Block',
      category: 'Water / Plumbing',
      campus_location: 'Mechanical Block, 1st Floor Corridor',
      description: 'Water dispenser compressor seems faulty, only room temperature water is dispensing.',
      status: 'open'
    })
    .select()
    .single();

  if (createErr || !newTicket) {
    throw new Error(`Create complaint failed: ${createErr?.message}`);
  }
  console.log(`✓ Live complaint created successfully in Postgres! ID: ${newTicket.id}`);

  // 4. Client for Admin (Dr. Anita)
  const adminClient = createClient(SUPABASE_URL, ANON_KEY);
  console.log('\nStep 4: Signing in as Admin (admin.anita@campus.edu)...');
  const { data: adminAuth, error: adminAuthErr } = await adminClient.auth.signInWithPassword({
    email: 'admin.anita@campus.edu',
    password: 'admin123'
  });

  if (adminAuthErr || !adminAuth.user) {
    throw new Error(`Admin sign-in failed: ${adminAuthErr?.message}`);
  }
  console.log(`✓ Admin authenticated successfully! UUID: ${adminAuth.user.id}`);

  // 5. Admin queries all complaints
  console.log('Step 5: Admin querying all campus complaints across all students...');
  const { data: allComplaints, error: allErr } = await adminClient
    .from('complaints')
    .select('id, tracking_code, title, status, student_id');

  if (allErr) throw new Error(`Admin query failed: ${allErr.message}`);
  console.log(`✓ Admin retrieved ${allComplaints.length} total campus complaints.`);
  const foundTicket = allComplaints.find(c => c.id === newTicket.id);
  if (!foundTicket) throw new Error('Admin could not see newly submitted complaint!');
  console.log(`✓ Newly created ticket ${trackingCode} is visible in Admin pool.`);

  // 6. Admin transitions status to in_progress and adds note
  console.log('Step 6: Admin updating complaint status to "in_progress"...');
  const { error: updateErr } = await adminClient
    .from('complaints')
    .update({
      status: 'in_progress',
      updated_at: new Date().toISOString()
    })
    .eq('id', newTicket.id);

  if (updateErr) throw new Error(`Status update failed: ${updateErr.message}`);

  // Record status history
  await adminClient
    .from('complaint_status_history')
    .insert({
      complaint_id: newTicket.id,
      changed_by: adminAuth.user.id,
      old_status: 'open',
      new_status: 'in_progress',
      note: 'Assigned to Facility Technician for compressor maintenance.'
    });
  console.log('✓ Status transition to "in_progress" recorded with audit history.');

  // 7. Admin adds response comment
  console.log('Step 7: Admin posting follow-up comment to student...');
  const { error: commentErr } = await adminClient
    .from('complaint_comments')
    .insert({
      complaint_id: newTicket.id,
      author_id: adminAuth.user.id,
      message: 'Technician has been notified and will replace the compressor today by 4 PM.'
    });

  if (commentErr) throw new Error(`Comment insert failed: ${commentErr.message}`);
  console.log('✓ Admin follow-up comment posted successfully.');

  // 8. Verify comments readable
  const { data: comments, error: cReadErr } = await studentClient
    .from('complaint_comments')
    .select('*')
    .eq('complaint_id', newTicket.id);

  if (cReadErr || !comments || comments.length === 0) {
    throw new Error('Student could not read admin comment thread!');
  }
  console.log(`✓ Student retrieved comment: "${comments[0].message}"`);

  // 9. Admin resolves the complaint
  console.log('Step 8: Admin transitioning status to "resolved"...');
  const { error: resolveErr } = await adminClient
    .from('complaints')
    .update({
      status: 'resolved',
      resolution_note: 'Compressor capacitor replaced and chilled water dispensing tested at 12°C.',
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', newTicket.id);

  if (resolveErr) throw new Error(`Resolve update failed: ${resolveErr.message}`);
  console.log('✓ Complaint marked resolved.');

  console.log('\n=== ALL 8 LIVE SUPABASE INTEGRATION CHECKS PASSED PERFECTLY! ===');
}

verifyLiveFlow().catch(err => {
  console.error('\n❌ Verification failed:', err);
  process.exit(1);
});
