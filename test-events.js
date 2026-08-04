const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkEvents() {
  const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false }).limit(5);
  if (error) console.error(error);
  console.log(data);
}
checkEvents();
