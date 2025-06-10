
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { getAllPatients, deletePatientById } from '@/lib/services/patientService.js';

const useDashboardLogic = (userSession) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, recentlyAdded: 0, withAnalysis: 0 });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  const loadData = useCallback(async () => {
    if (!userSession?.user?.id) {
      setError("Sessão do usuário não encontrada. Por favor, faça login novamente.");
      setIsLoading(false);
      setPatients([]); // Limpa pacientes se não houver sessão
      setStats({ total: 0, recentlyAdded: 0, withAnalysis: 0 }); // Reseta estatísticas
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllPatients(); // patientService should handle user_id filtering or rely on RLS
      
      if (response.error) {
        throw new Error(response.error.message || "Falha ao buscar pacientes.");
      }
      
      const fetchedPatients = response.data || [];
      setPatients(fetchedPatients);

      const total = fetchedPatients.length;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentlyAdded = fetchedPatients.filter(p => {
        const createdAt = p.created_at ? new Date(p.created_at) : new Date(0); // Handle null/undefined created_at
        return createdAt > sevenDaysAgo;
      }).length;
      
      const withAnalysis = fetchedPatients.filter(p => p.has_analysis).length;
      setStats({ total, recentlyAdded, withAnalysis });

    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(err.message || "Ocorreu um erro desconhecido ao carregar os dados.");
      toast({
        title: "Erro ao Carregar Dados do Painel",
        description: err.message || "Não foi possível buscar os pacientes. Verifique sua conexão ou tente mais tarde.",
        variant: "destructive",
      });
      setPatients([]); 
      setStats({ total: 0, recentlyAdded: 0, withAnalysis: 0 }); 
    } finally {
      setIsLoading(false);
    }
  }, [userSession, toast]); // userSession.user.id is implicitly part of userSession

  useEffect(() => {
    if (userSession?.user?.id) { // Only load if user is effectively logged in
        loadData();
    } else {
        setIsLoading(false); // If no user, stop loading, error will be set by loadData
        setPatients([]);
        setStats({ total: 0, recentlyAdded: 0, withAnalysis: 0 });
    }
  }, [userSession, loadData]); // loadData is now a dependency

  const handleSearch = (term) => {
    setSearchTerm(term.toLowerCase());
  };

  const filteredPatients = patients.filter(patient =>
    (patient.full_name && patient.full_name.toLowerCase().includes(searchTerm)) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm))
  );

  const handlePatientAction = (patient) => {
    if (patient.has_analysis) {
      navigate(`/results/${patient.id}`);
    } else {
      navigate(`/quantum-analysis/${patient.id}`);
    }
  };

  const confirmDeletePatient = (patient) => {
    setPatientToDelete(patient);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!patientToDelete) return;
    
    const originalPatients = [...patients]; // Keep a copy for potential rollback on UI (optimistic update)
    setPatients(prevPatients => prevPatients.filter(p => p.id !== patientToDelete.id)); // Optimistic update
    
    setIsLoading(true); 
    try {
      const { success, error: deleteError } = await deletePatientById(patientToDelete.id);
      if (success) {
        toast({
          title: "Paciente Excluído",
          description: `${patientToDelete.full_name} foi removido com sucesso.`,
          className: "bg-green-500 text-white",
        });
        // Data is already updated optimistically, but loadData will refresh stats and ensure consistency.
        await loadData(); 
      } else {
        setPatients(originalPatients); // Rollback optimistic update
        throw new Error(deleteError?.message || "Falha ao excluir paciente.");
      }
    } catch (err) {
      console.error("Error deleting patient:", err);
      toast({
        title: "Erro ao Excluir",
        description: err.message || "Não foi possível remover o paciente.",
        variant: "destructive",
      });
      setPatients(originalPatients); // Ensure rollback on any catch
    } finally {
      setShowDeleteConfirm(false);
      setPatientToDelete(null);
      setIsLoading(false); // Ensure loading state is reset
    }
  };
  
  const handleAddNewPatient = () => {
    navigate('/collect-data');
  };

  return {
    patients: filteredPatients,
    isLoading,
    error,
    stats,
    searchTerm,
    handleSearch,
    handlePatientAction,
    loadData, // Expose loadData for manual refresh if needed
    confirmDeletePatient,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleDeleteConfirmed,
    patientToDelete,
    handleAddNewPatient
  };
};

export default useDashboardLogic;
