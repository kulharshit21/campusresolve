import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseSecret = process.env.SUPABASE_SECRET_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, fullName, role } = req.body || {};

  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Missing required fields: email, password, and fullName are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const trimmedName = String(fullName).trim();
  const userRole = role === 'admin' ? 'admin' : 'student';

  if (!supabaseUrl || !supabaseSecret) {
    return res.status(500).json({ error: 'Server authentication credentials are not configured.' });
  }

  try {
    const adminClient = createClient(supabaseUrl, supabaseSecret, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create user with email_confirm: true to prevent Supabase from attempting to send verification emails
    const { data, error } = await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: trimmedName,
        role: userRole,
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data.user) {
      return res.status(500).json({ error: 'Failed to create user account.' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: trimmedName,
        role: userRole,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
