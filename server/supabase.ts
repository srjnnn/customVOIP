import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import "dotenv/config";
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY as string;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Loaded' : 'Not Loaded');

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export default supabase;
