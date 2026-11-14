import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseSecret = process.env.SUPABASE_SECRET_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    if (!supabaseUrl) {
      return res.status(503).json({ status: 'degraded', message: 'Backend configuration pending' });
    }

    const supabase = createClient(supabaseUrl, supabaseSecret || process.env.VITE_SUPABASE_ANON_KEY || '');
    const { count, error } = await supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return res.status(503).json({ status: 'degraded', service: 'CampusResolve Backend API' });
    }

    return res.status(200).json({
      status: 'ok',
      service: 'CampusResolve Backend API',
      timestamp: new Date().toISOString(),
      database: 'connected',
      activeComplaintsCount: count,
    });
  } catch {
    return res.status(500).json({ status: 'error', message: 'Health check failed' });
  }
}
