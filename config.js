// Chave pública (anon/publishable) do Supabase — segura para expor no navegador,
// pois o acesso aos dados é controlado por Row Level Security no banco.
const SUPABASE_URL = "https://sflcykaencehjdllpodj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ReoIBiq6M2zYp3hL85h81A_UWwoYYFH";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
