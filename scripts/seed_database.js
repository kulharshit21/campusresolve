// Seed script to populate live Supabase database with realistic university complaint tickets
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://aapgcfggzhosratewjpe.supabase.co';
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY || 'your-supabase-secret-key';

const RAHUL_ID = 'db0fc7b6-c031-499e-9730-0880d8c9834d';
const PRIYA_ID = 'c2672274-0899-4c65-a9dc-5f1c9e792cad';
const ADMIN_ID = 'e691351d-233c-4a60-bf35-db8bdad713d8';

async function seed() {
  console.log('Seeding initial complaints into live Supabase...');

  const complaints = [
    {
      tracking_code: 'CR-2026-1001',
      student_id: RAHUL_ID,
      title: 'Wi-Fi connection failing in Computer Lab 3',
      description: 'The access point AP-B304 keeps dropping connections every 5 minutes during practical sessions. DHCP lease fails repeatedly for 40+ students.',
      category: 'Wi-Fi / Network',
      campus_location: 'Academic Block B, 3rd Floor, Lab 304',
      status: 'in_progress',
      image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800',
      resolution_note: null,
      resolved_at: null,
      created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
    },
    {
      tracking_code: 'CR-2026-1002',
      student_id: RAHUL_ID,
      title: 'Water pipe leakage in Hostel Block 4 washroom',
      description: 'Continuous overhead pipe dripping causing water accumulation on floor near cubicle 3. Urgent repair required.',
      category: 'Water / Plumbing',
      campus_location: 'Hostel Block 4, Ground Floor West Wing',
      status: 'open',
      image_url: null,
      resolution_note: null,
      resolved_at: null,
      created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString()
    },
    {
      tracking_code: 'CR-2026-1003',
      student_id: PRIYA_ID,
      title: 'Projector flickering in Main Auditorium',
      description: 'HDMI wall box interface is loose, causing screen blackout every few minutes during presentations.',
      category: 'Classroom',
      campus_location: 'Central Admin Block, Auditorium Hall',
      status: 'resolved',
      image_url: null,
      resolution_note: 'AV technician replaced damaged HDMI wall interface and tested signal at 1080p 60Hz. Audio and video verified clear.',
      resolved_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
    },
    {
      tracking_code: 'CR-2026-1004',
      student_id: PRIYA_ID,
      title: 'Excessive fan screeching noise in Library 2nd Floor',
      description: 'Two ceiling fans above study desks 14-18 produce high-pitched screeching, disrupting study atmosphere.',
      category: 'Electrical',
      campus_location: 'Central Library, 2nd Floor Silent Zone',
      status: 'open',
      image_url: null,
      resolution_note: null,
      resolved_at: null,
      created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
    }
  ];

  const headers = {
    'apikey': SECRET_KEY,
    'Authorization': `Bearer ${SECRET_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/complaints`, {
    method: 'POST',
    headers,
    body: JSON.stringify(complaints)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to insert complaints: ${res.status} ${errText}`);
  }

  const insertedComplaints = await res.json();
  console.log(`Inserted ${insertedComplaints.length} complaints.`);

  const c1 = insertedComplaints.find(c => c.tracking_code === 'CR-2026-1001');
  const c3 = insertedComplaints.find(c => c.tracking_code === 'CR-2026-1003');

  if (c1) {
    // Add comments
    const comments = [
      {
        complaint_id: c1.id,
        author_id: ADMIN_ID,
        message: 'IT Network Team has dispatched a technician with a replacement Cisco AP. Firmware reload in progress.',
        created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString()
      },
      {
        complaint_id: c1.id,
        author_id: RAHUL_ID,
        message: 'Thank you Dr. Anita! We tested at 2:00 PM and signal is significantly more stable now.',
        created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
      }
    ];

    await fetch(`${SUPABASE_URL}/rest/v1/complaint_comments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(comments)
    });

    // Add status history
    const history = [
      {
        complaint_id: c1.id,
        changed_by: RAHUL_ID,
        old_status: null,
        new_status: 'open',
        note: 'Complaint registered by student',
        changed_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
      },
      {
        complaint_id: c1.id,
        changed_by: ADMIN_ID,
        old_status: 'open',
        new_status: 'in_progress',
        note: 'Assigned to IT Network Engineer for lab hardware inspection.',
        changed_at: new Date(Date.now() - 22 * 3600 * 1000).toISOString()
      }
    ];

    await fetch(`${SUPABASE_URL}/rest/v1/complaint_status_history`, {
      method: 'POST',
      headers,
      body: JSON.stringify(history)
    });
    console.log('Seeded comments and timeline history for CR-2026-1001');
  }

  if (c3) {
    const historyC3 = [
      {
        complaint_id: c3.id,
        changed_by: PRIYA_ID,
        old_status: null,
        new_status: 'open',
        note: 'Ticket submitted for Auditorium AV system',
        changed_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString()
      },
      {
        complaint_id: c3.id,
        changed_by: ADMIN_ID,
        old_status: 'open',
        new_status: 'in_progress',
        note: 'AV maintenance scheduled with external vendor.',
        changed_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
      },
      {
        complaint_id: c3.id,
        changed_by: ADMIN_ID,
        old_status: 'in_progress',
        new_status: 'resolved',
        note: 'AV technician replaced damaged HDMI wall interface and tested signal at 1080p 60Hz. Audio and video verified clear.',
        changed_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
      }
    ];

    await fetch(`${SUPABASE_URL}/rest/v1/complaint_status_history`, {
      method: 'POST',
      headers,
      body: JSON.stringify(historyC3)
    });
    console.log('Seeded timeline history for CR-2026-1003');
  }

  console.log('Database seeding successfully finished!');
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
