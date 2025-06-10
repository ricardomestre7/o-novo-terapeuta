import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://eelzfwfqznmlguumfkfu.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlbHpmd2Zxem5tbGd1dW1ma2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzI0NTQsImV4cCI6MjA2MjkwODQ1NH0.6IS82qxxL06oE-LC2gyiWMh7pqEjTfUDN630zxrhBG8";

let supabaseInstance = null;
let connectionChecked = false;
let connectionSuccessful = false;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Check environment variables.");
  if (typeof window !== 'undefined') {
    
    setTimeout(() => {
        const { toast } = useToast();
        if (toast) {
             toast({
                title: "Erro de Configuração",
                description: "As credenciais do Supabase não foram encontradas. A aplicação pode não funcionar corretamente.",
                variant: "destructive",
            });
        } else {
            console.warn("useToast is not available at the moment of Supabase config error.");
        }
    }, 0);
  }
} else {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    connectionSuccessful = true; 
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    if (typeof window !== 'undefined') {
        setTimeout(() => {
            const { toast } = useToast();
            if (toast) {
                toast({
                    title: "Erro de Conexão Supabase",
                    description: `Falha ao inicializar o Supabase: ${error.message}`,
                    variant: "destructive",
                });
            } else {
                 console.warn("useToast is not available at the moment of Supabase init error.");
            }
        }, 0);
    }
  }
}
connectionChecked = true;

export const supabase = supabaseInstance;

export const isSupabaseConnected = connectionSuccessful && !!supabaseInstance;

export const getSupabaseUser = async () => {
  if (!isSupabaseConnected) {
    console.warn("Supabase client not initialized or connection failed. Cannot get user.");
    return null;
  }
  try {
    const { data: { user } , error } = await supabase.auth.getUser();
    if (error) {
      console.warn("Error getting Supabase user:", error.message);
      return null;
    }
    return user;
  } catch (error) {
    console.error("Exception while getting Supabase user:", error);
    return null;
  }
};

export const checkSupabaseConnection = async () => {
  if (!supabaseInstance) return false;
  try {
    // A simple query to check connection, like fetching user or a small public table
    const { data, error } = await supabase.from('patients').select('id').limit(1); // Example query
    if (error && error.message !== 'relation "public.patients" does not exist') { // Ignore if table doesn't exist yet
        console.warn("Supabase connection check failed:", error.message);
        return false;
    }
    return true;
  } catch (e) {
    console.error("Supabase connection check exception:", e);
    return false;
  }
};