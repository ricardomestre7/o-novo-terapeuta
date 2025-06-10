import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useResultsPageLogic } from '@/hooks/useResultsPageLogic.js';
import LoadingSpinner from '@/components/quantumAnalysis/LoadingSpinner.jsx';
import { Button } from '@/components/ui/button.jsx';
import { ArrowLeft, UserCircle, FileText, BarChart3, RefreshCw, AlertTriangle, Printer, Share2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card.jsx';
import QuantumCharts from '@/components/results/QuantumCharts.jsx'; // Assuming this component exists
import PersonalizedRecommendations from '@/components/results/PersonalizedRecommendations.jsx'; // Assuming this component exists


const ResultsPage = ({ userSession }) => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const {
    patient,
    currentAnalysis,
    allAnalyses,
    isLoading,
    fetchData,
    handlePrint,
    handleShare,
    handleNewAnalysis
  } = useResultsPageLogic();

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
    return <LoadingSpinner message={`Carregando resultados para ${patientId}...`} />;
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
  
  const hasValidCurrentAnalysis = currentAnalysis && currentAnalysis.results && currentAnalysis.results.categories && Object.keys(currentAnalysis.results.categories).length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 print:p-0"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 print:hidden">
        <div className="flex items-center">
          <BarChart3 className="h-10 w-10 text-purple-400 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Resultados da Análise Quântica
            </h1>
            <p className="text-slate-400 text-lg">Paciente: {patient.full_name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button variant="outline" onClick={() => navigate(-1)} className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-slate-900">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Button variant="outline" onClick={handlePrint} className="text-teal-400 border-teal-400 hover:bg-teal-400 hover:text-slate-900">
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
          <Button variant="outline" onClick={handleShare} className="text-pink-400 border-pink-400 hover:bg-pink-400 hover:text-slate-900">
            <Share2 className="mr-2 h-4 w-4" /> Compartilhar
          </Button>
        </div>
      </div>
      
      {/* Patient Card for Print */}
      <div className="hidden print:block mb-4 p-4 border border-slate-300 rounded-lg">
          <h2 className="text-xl font-semibold text-slate-800">Paciente: {patient.full_name}</h2>
          <p className="text-sm text-slate-600">Email: {patient.email || 'N/A'}</p>
          <p className="text-sm text-slate-600">Telefone: {patient.phone || 'N/A'}</p>
          {currentAnalysis && <p className="text-sm text-slate-600">Data da Análise: {new Date(currentAnalysis.created_at).toLocaleDateString()}</p>}
      </div>


      {/* Main Content */}
      {!currentAnalysis && allAnalyses.length === 0 && (
         <Card className="bg-slate-800/60 backdrop-blur-sm border-yellow-500/30 shadow-xl text-center py-12">
          <CardHeader>
            <AlertTriangle className="mx-auto h-16 w-16 text-yellow-400 mb-4" />
            <CardTitle className="text-2xl text-slate-200">Nenhuma Análise Encontrada</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-slate-400 mb-6">
              Este paciente ainda não possui nenhuma análise quântica registrada.
            </CardDescription>
            <Button 
              onClick={handleNewAnalysis}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 text-lg"
            >
              Iniciar Nova Análise
            </Button>
          </CardContent>
        </Card>
      )}

      {currentAnalysis && (
        <Card className="bg-slate-800/60 backdrop-blur-sm border-purple-500/20 shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center">
                  <FileText size={26} className="mr-3 text-purple-400" />
                  Análise Quântica Detalhada
                </CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  Realizada em: {new Date(currentAnalysis.created_at).toLocaleString()}
                </CardDescription>
              </div>
              <Button onClick={fetchData} variant="ghost" size="icon" className="text-slate-400 hover:text-purple-300 print:hidden">
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {hasValidCurrentAnalysis ? (
              <QuantumCharts analysisData={currentAnalysis} patientName={patient.full_name} />
            ) : (
              <div className="text-center py-8 my-4 bg-amber-900/30 p-6 rounded-lg border border-amber-700">
                <AlertTriangle className="mx-auto h-12 w-12 text-amber-400 mb-3" />
                <h3 className="text-xl font-semibold text-amber-300 mb-2">Gráfico Indisponível</h3>
                <p className="text-amber-400">
                  Os dados desta análise estão incompletos para gerar o gráfico de radar.
                </p>
              </div>
            )}
            {currentAnalysis.recommendations && currentAnalysis.recommendations.length > 0 && (
              <PersonalizedRecommendations recommendations={currentAnalysis.recommendations} />
            )}
          </CardContent>
        </Card>
      )}

      {/* TODO: Adicionar Histórico de Análises aqui se houver mais de uma */}
      {allAnalyses.length > 1 && (
        <Card className="mt-8 bg-slate-800/60 backdrop-blur-sm border-teal-500/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Histórico de Análises</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {allAnalyses.map((analysis, index) => (
                <li key={analysis.id} className={`p-3 rounded-md ${index === 0 ? 'bg-purple-500/20 border border-purple-400' : 'bg-slate-700/50'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Análise de {new Date(analysis.created_at).toLocaleString()}</span>
                    {/* Adicionar botão para ver detalhes desta análise específica no futuro */}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default ResultsPage;