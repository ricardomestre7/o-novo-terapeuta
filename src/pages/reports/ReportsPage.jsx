import React from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { useNavigate } from 'react-router-dom';

const ReportsPage = ({ userSession }) => {
  const navigate = useNavigate();

  // Placeholder data - replace with actual report data fetching logic
  const reports = []; // Example: [{ id: 1, patientName: "João Silva", date: "2024-05-10", type: "Análise Quântica Inicial" }]

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
      className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8"
    >
      <div className="flex items-center mb-10">
        <FileText className="h-10 w-10 text-pink-400 mr-4" />
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
          Relatórios Gerados
        </h1>
      </div>

      {reports.length === 0 ? (
        <Card className="bg-slate-800/60 backdrop-blur-sm border-purple-500/20 shadow-xl text-center py-12">
          <CardHeader>
            <AlertTriangle className="mx-auto h-16 w-16 text-yellow-400 mb-4" />
            <CardTitle className="text-2xl text-slate-200">Nenhum Relatório Encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-slate-400 mb-6">
              Parece que você ainda não gerou nenhum relatório. <br/>
              Comece realizando uma coleta de dados e análise quântica para um paciente.
            </CardDescription>
            <Button 
              onClick={() => navigate('/collect-data')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 text-lg"
            >
              Coletar Dados de Paciente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-slate-800/70 hover:bg-slate-700/90 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-xl text-purple-300">{report.patientName}</CardTitle>
                  <CardDescription className="text-slate-400">{report.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300">Data: {report.date}</p>
                  <Button className="mt-4 w-full bg-pink-600 hover:bg-pink-700">Ver Detalhes</Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ReportsPage;