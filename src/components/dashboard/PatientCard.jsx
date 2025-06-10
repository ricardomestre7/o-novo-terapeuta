import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Activity, Eye, Edit3, UserCircle, Zap, Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

const PatientCard = ({ patient, onAction, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const phaseLabels = [
    "Fase 1: Liberação", "Fase 2: Regeneração", "Fase 3: Equilíbrio",
    "Fase 4: Vitalidade", "Fase 5: Integração", "Fase 6: Autonomia"
  ];
  const currentPhaseLabel = phaseLabels[(patient.current_phase_number || 1) - 1] || "Fase Desconhecida";

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(patient.id);
    } catch (error) {
      console.error("Error during onDelete callback:", error);
      // Toast for this error is handled in useDashboardLogic
    } finally {
      setIsDeleting(false); 
      // AlertDialog closes automatically on action, no need to manage open state here
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
      className="transition-all duration-300 h-full"
    >
      <Card 
        className={`quantum-card overflow-hidden h-full flex flex-col 
                    ${patient.has_analysis ? 'border-health-green/70 border-2' : 'border-divinity-gold-light/70 border-2 dark:border-divinity-gold/70'}`}
      >
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">{patient.name}</CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-400">{patient.email}</CardDescription>
            </div>
            {patient.has_analysis ? (
              <Activity className="h-6 w-6 text-health-green quantum-pulse" />
            ) : (
              <Edit3 className="h-6 w-6 text-divinity-gold" />
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-2 text-sm">
          <div><strong>Idade:</strong> {patient.age ? `${patient.age} anos` : 'N/A'}</div>
          <div><strong>Gênero:</strong> {patient.gender || 'N/A'}</div>
          {patient.therapistName && (
            <div className="flex items-center">
              <UserCircle className="h-4 w-4 mr-1 text-muted-foreground" />
              <strong>Terapeuta:</strong>&nbsp;{patient.therapistName}
            </div>
          )}
           <div className="flex items-center text-xs mt-1">
            <Zap className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
            <span className="font-medium text-purple-600 dark:text-purple-400">{currentPhaseLabel}</span>
          </div>
          <div className={`mt-2 p-2 rounded-md text-xs font-medium ${
            patient.has_analysis 
              ? 'bg-health-green-light text-health-green-foreground dark:bg-health-green/30 dark:text-health-green-dark' 
              : 'bg-divinity-gold-light text-divinity-gold-foreground dark:bg-divinity-gold/30 dark:text-divinity-gold-dark'
          }`}>
            {patient.has_analysis ? 'Análise Quântica Realizada' : 'Análise Quântica Pendente'}
          </div>
        </CardContent>
        <CardFooter className="border-t dark:border-gray-700 pt-4 flex flex-col sm:flex-row gap-2">
          <Button 
            className="w-full sm:flex-grow quantum-glow shadow-md bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            onClick={() => onAction(patient)}
          >
            {patient.has_analysis ? (
              <>
                <Eye className="mr-2 h-4 w-4" /> Ver Resultados
              </>
            ) : (
              <>
                <Activity className="mr-2 h-4 w-4" /> Realizar Análise
              </>
            )}
            <ArrowRight className="ml-auto h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="w-full sm:w-auto sm:flex-none"
                aria-label="Excluir Paciente"
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o paciente "{patient.name}"? Esta ação não pode ser desfeita e removerá todos os dados associados, incluindo análises.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteConfirm}
                  className="bg-destructive hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default PatientCard;