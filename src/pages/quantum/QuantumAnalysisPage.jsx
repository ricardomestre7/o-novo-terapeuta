import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuantumAnalysisPageLogic } from '@/hooks/useQuantumAnalysisPageLogic.js';
import QuantumAnalysisTabs from '@/components/quantumAnalysis/QuantumAnalysisTabs.jsx';
import QuantumQuestionnaire from '@/components/quantumAnalysis/QuantumQuestionnaire.jsx';
import LoadingSpinner from '@/components/quantumAnalysis/LoadingSpinner.jsx';
import { Button } from '@/components/ui/button.jsx';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card.jsx';
import { Progress } from '@/components/ui/progress.jsx';


const QuantumAnalysisPage = ({ userSession }) => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const {
    patient,
    answers,
    currentTab,
    setCurrentTab,
    isLoading,
    isSubmitting,
    handleAnswerChange,
    handleSubmit,
    isFormComplete,
    totalQuestions,
    answeredQuestions,
    quantumQuestions: questionsByCategory,
    handleNextTab,
    handlePrevTab,
    isFirstTab,
    isLastTab,
  } = useQuantumAnalysisPageLogic();

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

  if (isLoading) {
    return <LoadingSpinner message={`Carregando dados da análise para ${patientId}...`} />;
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(space.24))] p-6 bg-slate-900 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Paciente Não Encontrado</h1>
        <p className="text-slate-300 mb-6">Não foi possível carregar os dados do paciente. Verifique o ID ou tente novamente.</p>
        <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          Voltar ao Painel
        </Button>
      </div>
    );
  }
  
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <BarChart3 className="h-10 w-10 text-purple-400 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Análise Quântica 5D
            </h1>
            <p className="text-slate-400 text-lg">Paciente: {patient.full_name}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)} className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-slate-900">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>

      <Card className="mb-8 bg-slate-800/60 backdrop-blur-sm border-purple-500/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-200">Progresso da Análise</CardTitle>
          <CardDescription className="text-slate-400">
            {answeredQuestions} de {totalQuestions} perguntas respondidas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="w-full h-3 [&>div]:bg-gradient-to-r [&>div]:from-pink-500 [&>div]:to-purple-500" />
        </CardContent>
      </Card>
      
      <QuantumAnalysisTabs 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab}
        questionsByCategory={questionsByCategory}
      >
        {(categoryKey, questions) => (
          <QuantumQuestionnaire
            category={categoryKey}
            questions={questions}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onNextTab={handleNextTab}
            onPrevTab={handlePrevTab}
            isFirstTab={isFirstTab}
            isLastTab={isLastTab}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isFormComplete={isFormComplete}
          />
        )}
      </QuantumAnalysisTabs>
    </motion.div>
  );
};

export default QuantumAnalysisPage;