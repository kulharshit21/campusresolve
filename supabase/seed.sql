-- ==============================================================================
-- CampusResolve: Seed Data for Testing and Evaluation Demonstration
-- ==============================================================================

-- Sample Complaints
-- Note: Replace student_id UUIDs with real auth.users IDs or run after student signup
INSERT INTO public.complaints (
  tracking_code,
  student_id,
  title,
  description,
  category,
  campus_location,
  status,
  image_url,
  created_at
)
SELECT
  'CR-2026-1001',
  p.id,
  'Wi-Fi not working in Computer Lab 3',
  'The access point keeps dropping connections every 5 minutes during practicals. IP address lease fails frequently.',
  'Wi-Fi / Network',
  'Academic Block B, 3rd Floor, Lab 304',
  'in_progress',
  'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800',
  now() - interval '2 days'
FROM public.profiles p
WHERE p.role = 'student'
LIMIT 1
ON CONFLICT (tracking_code) DO NOTHING;

INSERT INTO public.complaints (
  tracking_code,
  student_id,
  title,
  description,
  category,
  campus_location,
  status,
  created_at
)
SELECT
  'CR-2026-1002',
  p.id,
  'Water leakage in Hostel Block 4 Washroom',
  'Continuous overhead pipe leakage creating slippery floors near cubicle 3. Urgent plumbing required before water wastage increases.',
  'Water / Plumbing',
  'Hostel Block 4, Ground Floor West Wing',
  'open',
  now() - interval '14 hours'
FROM public.profiles p
WHERE p.role = 'student'
LIMIT 1
ON CONFLICT (tracking_code) DO NOTHING;

INSERT INTO public.complaints (
  tracking_code,
  student_id,
  title,
  description,
  category,
  campus_location,
  status,
  resolution_note,
  resolved_at,
  created_at
)
SELECT
  'CR-2026-1003',
  p.id,
  'Projector flickering in Main Auditorium',
  'HDMI input connector is loose and display flickers every few seconds during presentations.',
  'Classroom',
  'Central Admin Block, Auditorium Hall',
  'resolved',
  'AV technician replaced damaged HDMI wall interface and tested signal at 1080p 60Hz. Audio and video verified clear.',
  now() - interval '4 hours',
  now() - interval '3 days'
FROM public.profiles p
WHERE p.role = 'student'
LIMIT 1
ON CONFLICT (tracking_code) DO NOTHING;
