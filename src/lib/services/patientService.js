
import { supabase, getSupabaseUser } from '@/lib/supabaseClient.jsx';
import { toast } from "@/components/ui/use-toast";

export const savePatientToSupabase = async (patientData) => {
  const user = await getSupabaseUser();
  if (!user) {
    toast({ title: "Erro de Autenticação", description: "Usuário não autenticado.", variant: "destructive" });
    return { success: false, error: { message: "Usuário não autenticado." } };
  }

  const patientRecord = {
    ...patientData, // Ensure all fields from formData are included
    user_id: user.id, 
    updated_at: new Date().toISOString(),
  };

  // Explicitly set null for fields that might be empty strings but should be null in DB
  Object.keys(patientRecord).forEach(key => {
    if (patientRecord[key] === '') {
      // Example: Convert empty birth_date to null if it's a date field
      // Add more specific checks if needed for other field types
      if (key === 'birth_date' || key === 'therapist_id') { 
        patientRecord[key] = null;
      }
    }
  });


  if (!patientData.id) { 
    patientRecord.created_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('patients')
      .insert(patientRecord)
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting patient:', error);
      toast({ title: "Erro ao Salvar", description: `Não foi possível cadastrar o paciente: ${error.message}`, variant: "destructive" });
      return { success: false, error };
    }
    toast({ title: "Paciente Cadastrado!", description: `${data.full_name} foi cadastrado(a) com sucesso.`, className: "bg-green-500 text-white" });
    return { success: true, data };
  } else {
    const { data, error } = await supabase
      .from('patients')
      .update(patientRecord)
      .eq('id', patientData.id)
      .eq('user_id', user.id) // Ensure user can only update their own patients
      .select()
      .single();

    if (error) {
      console.error('Error updating patient:', error);
      toast({ title: "Erro ao Atualizar", description: `Não foi possível atualizar o paciente: ${error.message}`, variant: "destructive" });
      return { success: false, error };
    }
    toast({ title: "Paciente Atualizado!", description: `${data.full_name} foi atualizado(a) com sucesso.`, className: "bg-blue-500 text-white" });
    return { success: true, data };
  }
};


export const getAllPatients = async () => {
  const user = await getSupabaseUser();
  if (!user) {
    return { error: { message: "Usuário não autenticado para buscar pacientes." }, data: [] };
  }

  const { data, error } = await supabase
    .from('patients')
    .select('*') // Selects all columns from patients table
    .eq('user_id', user.id) // Explicitly filter by the logged-in user's ID
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching patients:', error);
    // Do not toast here, let the caller (hook) handle UI feedback for fetch errors
    return { error, data: [] };
  }
  return { error: null, data: data || [] }; // Ensure data is always an array
};

export const getPatientById = async (id) => {
  if (!id) {
    console.error('Patient ID is required to fetch patient data.');
    return { success: false, data: null, error: { message: "ID do paciente não fornecido." } };
  }

  const user = await getSupabaseUser();
  if (!user) {
     return { success: false, data: null, error: { message: "Usuário não autenticado para buscar paciente." } };
  }

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id) // Ensure the patient belongs to the user
    .single();

  if (error) {
    console.error('Error fetching patient by ID:', error);
    if (error.code === 'PGRST116') { // Not found
        return { success: false, data: null, error: { message: "Paciente não encontrado ou acesso negado." } };
    }
    return { success: false, data: null, error };
  }
  return { success: true, data, error: null };
};

export const deletePatientById = async (patientId) => {
  if (!patientId) {
    return { success: false, error: { message: 'ID do paciente é obrigatório para exclusão.' } };
  }

  const user = await getSupabaseUser();
  if (!user) {
    return { success: false, error: { message: "Usuário não autenticado para excluir paciente." } };
  }
  
  // RLS on quantum_analyses should be patient_id.user_id = auth.uid()
  // RLS on patients should be user_id = auth.uid()
  
  // First, delete related quantum_analyses for this patient
  const { error: analysesError } = await supabase
    .from('quantum_analyses')
    .delete()
    .eq('patient_id', patientId);

  if (analysesError) {
    console.error('Supabase error deleting patient analyses:', analysesError);
    // Toasting here as it's a critical part of the deletion cascade
    toast({
      title: "Erro ao Excluir Análises",
      description: `Falha ao excluir análises associadas: ${analysesError.message}`,
      variant: "destructive",
    });
    return { success: false, error: { message: `Falha ao excluir análises: ${analysesError.message}` } };
  }
  
  // Then, delete the patient record itself
  const { error: patientError } = await supabase
    .from('patients')
    .delete()
    .eq('id', patientId)
    .eq('user_id', user.id); // Explicitly ensure user owns patient

  if (patientError) {
    console.error('Supabase error deleting patient record:', patientError);
    toast({
      title: "Erro ao Excluir Paciente",
      description: `Falha ao excluir o registro do paciente: ${patientError.message}`,
      variant: "destructive",
    });
    return { success: false, error: { message: `Falha ao excluir paciente: ${patientError.message}` } };
  }
  
  // Toast for overall success is handled in useDashboardLogic
  return { success: true, error: null };
};

export const updatePatientHasAnalysisFlag = async (patientId, hasAnalysis) => {
  const user = await getSupabaseUser();
  if (!user) {
    return { success: false, error: { message: "Usuário não autenticado para atualizar status." } };
  }

  const { data, error } = await supabase
    .from('patients')
    .update({ has_analysis: hasAnalysis, updated_at: new Date().toISOString() })
    .eq('id', patientId)
    .eq('user_id', user.id) // Ensure update only happens if user owns the patient
    .select('id, has_analysis') // Select only what's needed
    .single();
  
  if (error) {
    console.error('Error updating patient has_analysis flag:', error);
    return { success: false, error };
  }
  return { success: true, data };
};
