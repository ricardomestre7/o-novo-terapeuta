import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast.js';
import { getPatientById } from '@/lib/services/patientService.js';
import { getAllAnalysesForPatient } from '@/lib/services/analysisService.js';


export const useResultsPageLogic = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [patient, setPatient] = useState(null);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [allAnalyses, setAllAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchData = useCallback(async () => {
    if (!patientId) {
      toast({ title: "Erro", description: "ID do paciente não fornecido.", variant: "destructive" });
      navigate('/');
      return;
    }
    setIsLoading(true);
    try {
      const patientResponse = await getPatientById(patientId);
      if (patientResponse.data) {
        setPatient(patientResponse.data);
      } else {
        toast({ title: "Erro", description: patientResponse.error?.message || "Paciente não encontrado.", variant: "destructive" });
        navigate('/');
        setIsLoading(false);
        return;
      }

      const analysesResponse = await getAllAnalysesForPatient(patientId);
      if (analysesResponse.data) {
        const sortedAnalyses = [...analysesResponse.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setAllAnalyses(sortedAnalyses);
        
        if (sortedAnalyses.length > 0) {
          const latestAnalysis = sortedAnalyses[0];
          if (latestAnalysis && latestAnalysis.results && latestAnalysis.results.categories && Object.keys(latestAnalysis.results.categories).length > 0) {
              setCurrentAnalysis(latestAnalysis);
          } else {
              setCurrentAnalysis(null); 
              if (latestAnalysis) {
                toast({ 
                  title: "Dados da Análise Incompletos", 
                  description: "A análise mais recente não contém dados de categorias válidos para os gráficos.", 
                  variant: "warning", 
                  duration: 7000 
                });
              }
          }
        } else {
          setCurrentAnalysis(null);
        }
      } else {
         toast({ title: "Erro ao Carregar Análises", description: analysesResponse.error?.message || "Não foi possível buscar as análises.", variant: "destructive" });
         setAllAnalyses([]);
         setCurrentAnalysis(null);
      }

    } catch (error) {
      toast({ title: "Erro ao Carregar Resultados", description: "Ocorreu um erro inesperado.", variant: "destructive" });
      setAllAnalyses([]);
      setCurrentAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  }, [patientId, toast, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handlePrint = () => window.print();

  const handleShare = async () => {
    if (navigator.share && patient) {
      try {
        await navigator.share({
          title: `Resultados Quânticos de ${patient.full_name}`,
          text: `Confira os resultados da análise quântica de ${patient.full_name}.`,
          url: window.location.href,
        });
      } catch (error) {
        toast({ title: "Erro ao compartilhar", description: "Não foi possível compartilhar.", variant: "destructive" });
      }
    } else {
      toast({ title: "Não Suportado", description: "Compartilhamento não suportado neste navegador.", variant: "warning" });
    }
  };
  
  const handleNewAnalysis = () => {
    if(patientId) navigate(`/quantum-analysis/${patientId}`);
  };

  return { 
    patient, 
    currentAnalysis, 
    allAnalyses, 
    isLoading, 
    fetchData,
    handlePrint,
    handleShare,
    handleNewAnalysis
  };
};