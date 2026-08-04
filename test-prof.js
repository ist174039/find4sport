const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkProf() {
  const { data, error } = await supabase.from('professionals').select('id, full_name, professional_name').eq('user_id', '02e0503a-eec8-4200-8b5e-03d26b939547');
  console.log('Professionals:', data);
}
checkProf();
