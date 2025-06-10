import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import FormField from '@/components/patient/FormField.jsx';
import SectionCard from '@/components/patient/SectionCard.jsx';
import { patientFormStructure, getInitialPatientFormData } from '@/lib/config/formStructures.js';
import { savePatientToSupabase } from '@/lib/services/patientService.js';
import { useToast } from '@/components/ui/use-toast.js';
import { motion } from 'framer-motion';
import { UserPlus, Save, ArrowLeft, UserCircle, Briefcase, HeartPulse, Sparkles, FileText, Brain, Activity } from 'lucide-react';

const iconMap = {
  UserCircle,
  Briefcase,
  HeartPulse,
  Sparkles,
  FileText,
  Brain,
  Activity
};

const PatientDataFormPage = ({ userSession }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState(getInitialPatientFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let isValid = true;
    let firstErrorFieldLabel = '';

    for (const section of Object.values(patientFormStructure)) {
      for (const field of section.fields) {
        if (field.required && (!formData[field.id] || formData[field.id].toString().trim() === '')) {
          isValid = false;
          if (!firstErrorFieldLabel) firstErrorFieldLabel = field.label;
          break; 
        }
      }
      if (!isValid) break;
    }

    if (!isValid) {
      toast({
          title: "Campo Obrigatório",
          description: `O campo "${firstErrorFieldLabel}" é obrigatório. Por favor, preencha todos os campos marcados com *.`,
          variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    const result = await savePatientToSupabase(formData);
    setIsSubmitting(false);

    if (result.data && !result.error) {
      navigate('/'); 
    }
  };

  if (!userSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(space.24))] p-6 bg-slate-900 text-center">
        <h1 className="text-2xl font-bold text-purple-400 mb-4">Acesso Negado</h1>
        <p className="text-slate-300 mb-6">Você precisa estar logado para acessar esta página.</p>
        <Button onClick={() => navigate('/login')} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          Ir para Login
        </Button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8"
    >
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <UserPlus className="h-10 w-10 text-purple-400 mr-3" />
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Coleta de Dados do Paciente
          </h1>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)} className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-slate-900">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {Object.entries(patientFormStructure).map(([sectionKey, section]) => {
          const IconComponent = iconMap[section.icon] || UserCircle;
          return (
            <SectionCard key={sectionKey} title={section.title} icon={IconComponent}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                {section.fields.map(field => (
                  <FormField
                    key={field.id}
                    field={field}
                    value={formData[field.id]}
                    onChange={handleChange}
                    onSelectChange={handleSelectChange}
                  />
                ))}
              </div>
            </SectionCard>
          );
        })}

        <motion.div 
          className="flex justify-end pt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            {isSubmitting ? (
              <motion.div className="flex items-center" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Save className="mr-2 h-5 w-5" /> Salvando...
              </motion.div>
            ) : (
              <div className="flex items-center">
                <Save className="mr-2 h-5 w-5" /> Salvar Paciente
              </div>
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default PatientDataFormPage;