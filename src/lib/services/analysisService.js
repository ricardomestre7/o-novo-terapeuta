import { supabase, getSupabaseUser, isSupabaseConnected } from '@/lib/supabaseClient.jsx';
import { toast } from '@/components/ui/use-toast.js';
import { updatePatientHasAnalysisFlag } from '@/lib/services/patientService.js';

export const saveQuantumAnalysis = async (patientId, analysisData) => {
  if (!isSupabaseConnected) {
    toast({ title: "Erro de Conexão", description: "Supabase não conectado.", variant: "destructive" });
    return { data: null, error: { message: "Supabase não conectado." } };
  }
  const user = await getSupabaseUser();
  if (!user) {
    toast({ title: "Erro de Autenticação", description: "Usuário não autenticado.", variant: "destructive" });
    return { data: null, error: { message: "Usuário não autenticado." } };
  }

  const { answers, results, recommendations } = analysisData;

  const { data: newAnalysis, error } = await supabase
    .from('quantum_analyses')
    .insert([{ 
      patient_id: patientId, 
      user_id: user.id,
      answers, 
      results, 
      recommendations 
    }])
    .select()
    .single();

  if (error) {
    console.error('Error saving quantum analysis:', error);
    toast({ title: "Erro ao Salvar Análise", description: error.message, variant: "destructive" });
    return { data: null, error };
  }
  
  const updateFlagResult = await updatePatientHasAnalysisFlag(patientId, true);
    
  if (updateFlagResult.error) {
    toast({ title: "Aviso", description: "Análise salva, mas houve um erro ao atualizar o status do paciente.", variant: "warning" });
  }

  toast({ title: "Análise Salva!", description: `Análise para o paciente foi salva com sucesso.`, className: "bg-green-500 text-white" });
  return { data: newAnalysis, error: null };
};

export const getAllAnalysesForPatient = async (patientId) => {
  if (!isSupabaseConnected) {
    toast({ title: "Erro de Conexão", description: "Supabase não conectado.", variant: "destructive" });
    return { data: [], error: { message: "Supabase não conectado." } };
  }
  const user = await getSupabaseUser();
  if (!user) {
    toast({ title: "Erro de Autenticação", description: "Usuário não autenticado.", variant: "destructive" });
    return { data: [], error: { message: "Usuário não autenticado." } };
  }

  const { data, error } = await supabase
    .from('quantum_analyses')
    .select('*')
    .eq('patient_id', patientId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching analyses for patient:", error);
    toast({ title: "Erro ao Buscar Análises", description: error.message, variant: "destructive" });
    return { data: [], error };
  }
  return { data: data || [], error: null };
};