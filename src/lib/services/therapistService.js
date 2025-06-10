
import { supabase, getSupabaseUser } from '@/lib/supabaseClient.jsx';
import { toast } from "@/components/ui/use-toast";

// Note: The 'therapists' table is not defined in the provided database schema.
// These functions assume a 'therapists' table with 'id' and 'name' columns,
// and that it's NOT user_id specific, meaning therapists are globally available.
// If therapists are user-specific, the RLS and queries would need adjustment.

export const getTherapists = async () => {
  const { data, error } = await supabase
    .from('therapists') // Assuming 'therapists' table exists and is accessible
    .select('id, name')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching therapists:', error);
    toast({ title: "Erro ao Buscar Terapeutas", description: error.message, variant: "destructive" });
    return [];
  }
  return data || [];
};

export const saveTherapist = async (therapistName) => {
  if (!therapistName || therapistName.trim() === "") {
    toast({ title: "Nome Inválido", description: "O nome do terapeuta não pode estar vazio.", variant: "destructive" });
    return { success: false, message: "O nome do terapeuta não pode estar vazio." };
  }

  const trimmedName = therapistName.trim();

  // Check if therapist already exists (case-insensitive for example, adapt as needed)
  const { data: existingTherapist, error: fetchError } = await supabase
    .from('therapists')
    .select('id')
    .ilike('name', trimmedName) // Case-insensitive search
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine
    console.error('Error checking existing therapist:', fetchError);
    toast({ title: "Erro ao Verificar Terapeuta", description: fetchError.message, variant: "destructive" });
    return { success: false, message: 'Erro ao verificar terapeuta.' };
  }

  if (existingTherapist) {
    toast({ title: "Terapeuta Já Existe", description: "Este terapeuta já está cadastrado.", variant: "warning" });
    return { success: false, message: "Este terapeuta já está cadastrado." };
  }

  const { data: newTherapist, error: insertError } = await supabase
    .from('therapists')
    .insert([{ name: trimmedName }])
    .select('id, name')
    .single();

  if (insertError) {
    console.error('Error saving therapist:', insertError);
    toast({ title: "Erro ao Salvar Terapeuta", description: insertError.message, variant: "destructive" });
    return { success: false, message: 'Erro ao salvar terapeuta.' };
  }
  toast({ title: "Terapeuta Adicionado!", description: `${newTherapist.name} foi adicionado com sucesso.`, className: "bg-green-500 text-white" });
  return { success: true, therapist: newTherapist, message: "Terapeuta adicionado com sucesso!" };
};

export const deleteTherapist = async (therapistId) => {
  if (!therapistId) {
    toast({ title: "ID Inválido", description: "ID do terapeuta não fornecido.", variant: "destructive" });
    return { success: false, message: "ID do terapeuta não fornecido." };
  }
  
  // Before deleting, check if this therapist is associated with any patients.
  // If so, you might want to prevent deletion or handle unlinking.
  // For now, this function will proceed with deletion.
  // A more robust solution would involve checking patient_therapist_id_fkey constraints
  // or explicitly unsetting therapist_id on patients.

  const { error } = await supabase
    .from('therapists')
    .delete()
    .eq('id', therapistId);

  if (error) {
    console.error('Error deleting therapist:', error);
    let userMessage = "Erro ao remover terapeuta.";
    if (error.code === '23503') { // Foreign key violation
        userMessage = "Não é possível remover este terapeuta pois ele está associado a um ou mais pacientes. Desvincule-o dos pacientes primeiro.";
    } else {
        userMessage = `Erro ao remover terapeuta: ${error.message}`;
    }
    toast({ title: "Erro na Exclusão", description: userMessage, variant: "destructive" });
    return { success: false, message: userMessage };
  }
  toast({ title: "Terapeuta Removido!", description: "Terapeuta removido com sucesso.", className: "bg-red-500 text-white" });
  return { success: true, message: "Terapeuta removido com sucesso." };
};
