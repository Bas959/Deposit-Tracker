import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { passcode, allActuals, config, counsellors, casActuals, lastUpdated } = req.body;

  if (!passcode || passcode !== process.env.EDIT_PASSCODE) {
    return res.status(401).json({ error: 'Invalid passcode' });
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { error } = await supabase
    .from('tracker_data')
    .update({ all_actuals: allActuals, course_config: config, counsellors, cas_actuals: casActuals, last_updated: lastUpdated || new Date().toISOString() })
    .eq('id', 1);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true });
}
