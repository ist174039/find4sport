const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function fix() {
  const { error } = await supabase.from('events').update({ 
    organizer_name: 'Diogo varela',
    professional_id: 'fff151df-a350-409c-b715-04d4ead19053'
  }).eq('id', '85f33dcc-e088-4b3f-a634-22abc9a9f3aa');
  console.log('Fixed:', error);
}
fix();
