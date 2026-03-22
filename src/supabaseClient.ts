import { createClient } from '@supabase/supabase-js';

// Твой URL из предыдущего шага
const supabaseUrl = 'https://svkebnkghhsaayookptu.supabase.co'; 
// Твой Publishable key, который ты копируешь сейчас
const supabaseAnonKey = 'sb_publishable_Jzv1JxsuH9myEApYgjlusg_Ad2DY40y'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
