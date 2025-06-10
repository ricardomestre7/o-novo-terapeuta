import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast.js';
import { getInitialPatientFormData, patientFormStructure } from '@/lib/config/formStructures.js';
import { savePatientToSupabase, getPatientById } from '@/lib/services/patientService.js'; 
import { UserCircle, Briefcase, HeartPulse, Sparkles } from 'lucide-react';

const iconMap = {
  UserCircle,
  Briefcase,
  HeartPulse,
  Sparkles,
};

export const usePatientFormLogic = (userSession) => {
  const { patientId } = useParams(); 
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState(getInitialPatientFormData());
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSection, setCurrentSection] = useState(Object.keys(patientFormStructure)[0]);

  useEffect(() => {
    if (patientId) {
      setIsEditing(true);
      setIsLoading(true);
      const fetchPatientData = async () => {
        const { data, error } = await getPatientById(patientId);
        if (data) {
          const fetchedData = {};
          Object.keys(getInitialPatientFormData()).forEach(key => {
            fetchedData[key] = data[key] || '';
          });
          setFormData(fetchedData);
        } else {
          toast({ title: "Erro", description: `Não foi possível carregar dados do paciente: ${error?.message || 'Erro desconhecido'}.`, variant: "destructive" });
          navigate('/collect-data'); 
        }
        setIsLoading(false);
      };
      fetchPatientData();
    } else {
      setFormData(getInitialPatientFormData());
      setIsEditing(false);
    }
  }, [patientId, toast, navigate]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }, []);
  
  const handleSelectChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userSession || !userSession.user) {
        toast({ title: "Erro de Autenticação", description: "Sessão de usuário inválida. Faça login novamente.", variant: "destructive" });
        navigate('/login');
        return;
    }

    setIsLoading(true);
    
    const dataToSave = { ...formData, user_id: userSession.user.id };

    try {
      let response;
      if (isEditing) {
        // Implement update logic if needed, for now, it re-saves.
        // response = await updatePatientInSupabase(patientId, dataToSave);
        toast({ title: "Atenção", description: "Funcionalidade de edição ainda não implementada completamente. Salvando como novo para demonstração.", variant: "warning" });
        response = await savePatientToSupabase(dataToSave); // Placeholder
      } else {
        response = await savePatientToSupabase(dataToSave);
      }

      if (response.error) {
        throw new Error(response.error.message || "Erro desconhecido ao salvar.");
      }
      
      toast({
        title: isEditing ? "Paciente Atualizado!" : "Paciente Cadastrado!",
        description: `${response.data.full_name} foi ${isEditing ? 'atualizado(a)' : 'cadastrado(a)'} com sucesso.`,
        className: "bg-green-500 text-white",
      });
      navigate('/'); 
    } catch (error) {
      toast({
        title: "Erro ao Salvar",
        description: error.message || "Não foi possível salvar os dados do paciente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const sections = Object.entries(patientFormStructure).map(([key, value]) => ({
    id: key,
    ...value,
    icon: iconMap[value.icon] || UserCircle,
  }));

  const currentSectionIndex = sections.findIndex(sec => sec.id === currentSection);
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === sections.length - 1;

  const handleNextSection = () => {
    if (!isLastSection) {
      setCurrentSection(sections[currentSectionIndex + 1].id);
    }
  };

  const handlePrevSection = () => {
    if (!isFirstSection) {
      setCurrentSection(sections[currentSectionIndex - 1].id);
    }
  };


  return {
    formData,
    isLoading,
    isEditing,
    handleInputChange,
    handleSelectChange,
    handleSubmit,
    patientFormStructure: sections, 
    currentSection,
    setCurrentSection,
    handleNextSection,
    handlePrevSection,
    isFirstSection,
    isLastTab: isLastSection, 
    isLastSection,
  };
};