const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function checkPolices() {
  const { data, error } = await supabase.rpc('get_policies');
  if (error) {
     const { data: d2, error: e2 } = await supabase.from('pg_policies').select('*').eq('tablename', 'events');
     if(e2) {
       console.log('Failed to fetch from pg_policies');
     } else {
       console.log(d2);
     }
  } else {
    console.log(data);
  }
}
checkPolices();
