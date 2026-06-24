import { supabase } from './api.js';

export async function loginUser(email, password) {
    return await supabase.auth.signInWithPassword({ email, password });
}