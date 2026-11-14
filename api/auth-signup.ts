import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseSecret = process.env.SUPABASE_SECRET_KEY || '';

// Basic email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enforce POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Prevent response caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  const { email, password, fullName, role } = req.body || {};

  // 1. Mandatory presence check
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'All fields (email, password, fullName) are required.' });
  }

  // 2. Data type validation
  if (typeof email !== 'string' || typeof password !== 'string' || typeof fullName !== 'string') {
    return res.status(400).json({ error: 'Invalid input data format.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = fullName.trim();

  // 3. Email validation
  if (normalizedEmail.length > 254 || !EMAIL_REGEX.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  // 4. Password security
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }
  if (password.length > 128) {
    return res.status(400).json({ error: 'Password exceeds maximum length.' });
  }

  // 5. Name length check and script sanitization
  if (trimmedName.length < 2 || trimmedName.length > 100) {
    return res.status(400).json({ error: 'Full name must be between 2 and 100 characters.' });
  }
  if (/<[a-z][\s\S]*>/i.test(trimmedName)) {
    return res.status(400).json({ error: 'HTML and script tags are not allowed in names.' });
  }

  // 6. Role validation
  const userRole = role === 'admin' ? 'admin' : 'student';

  if (!supabaseUrl || !supabaseSecret) {
    return res.status(500).json({ error: 'Authentication service is temporarily unavailable.' });
  }

  try {
    const adminClient = createClient(supabaseUrl, supabaseSecret, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create user with email_confirm: true to prevent bounce restrictions
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
      // Return clean user-facing error without leaking database internals
      return res.status(400).json({ error: error.message || 'Unable to create account.' });
    }

    if (!data.user) {
      return res.status(500).json({ error: 'Account creation failed.' });
    }

    // Upsert into public.profiles to guarantee profile synchronization
    await adminClient.from('profiles').upsert({
      id: data.user.id,
      email: normalizedEmail,
      full_name: trimmedName,
      role: userRole,
      updated_at: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: trimmedName,
        role: userRole,
      },
    });
  } catch {
    return res.status(500).json({ error: 'Internal server error while processing registration.' });
  }
}
