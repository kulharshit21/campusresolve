import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseSecret = process.env.SUPABASE_SECRET_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!supabaseUrl) {
      return res.status(500).json({ status: 'error', message: 'SUPABASE_URL is not set' });
    }

    const supabase = createClient(supabaseUrl, supabaseSecret || process.env.VITE_SUPABASE_ANON_KEY || '');
    const { count, error } = await supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return res.status(500).json({ status: 'database_error', error: error.message });
    }

    return res.status(200).json({
      status: 'ok',
      service: 'CampusResolve Backend API',
      timestamp: new Date().toISOString(),
      database: 'connected',
      activeComplaintsCount: count,
    });
  } catch (err: any) {
    return res.status(500).json({ status: 'server_error', error: err.message });
  }
}
