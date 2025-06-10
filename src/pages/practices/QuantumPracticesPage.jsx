
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { quantumPracticeTemplates } from '@/lib/config/practiceTemplates.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, Lightbulb, Zap, Brain, Smile, Heart } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const iconMap = {
  default: <Lightbulb className="h-5 w-5 mr-2 text-yellow-400" />,
  mental: <Brain className="h-5 w-5 mr-2 text-sky-400" />,
  emotional: <Smile className="h-5 w-5 mr-2 text-pink-400" />,
  energetic: <Zap className="h-5 w-5 mr-2 text-purple-400" />,
  physical: <Heart className="h-5 w-5 mr-2 text-red-400" />,
};

const PracticeCard = ({ practice, index }) => {
  const IconComponent = iconMap[practice.category] || iconMap.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="h-full"
    >
      <Card className="bg-slate-800/60 backdrop-blur-sm border-purple-500/30 shadow-xl hover:shadow-purple-500/50 transition-shadow duration-300 h-full flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center">
              {IconComponent}
              {practice.title || practice.name}
            </CardTitle>
            {practice.phase && <Badge variant="outline" className="text-xs border-purple-400 text-purple-300">Fase {practice.phase}</Badge>}
          </div>
          <CardDescription className="text-slate-400 pt-1 text-sm">{practice.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-slate-700">
              <AccordionTrigger className="text-slate-300 hover:text-purple-300 text-sm py-2">
                Ver Detalhes da Prática
              </AccordionTrigger>
              <AccordionContent className="text-slate-400 text-sm prose prose-sm prose-invert max-w-none">
                {typeof practice.content === 'string' ? (
                  <p>{practice.content}</p>
                ) : Array.isArray(practice.content) ? (
                  practice.content.map((item, idx) => (
                    <div key={idx} className="mb-2">
                      {item.type === 'subtitle' && <h4 className="font-semibold text-purple-300 mt-2 mb-1">{item.text}</h4>}
                      {item.type === 'paragraph' && <p>{item.text}</p>}
                      {item.type === 'list' && Array.isArray(item.items) && (
                        <ul className="list-disc list-inside pl-2">
                          {item.items.map((li, i) => <li key={i}>{li}</li>)}
                        </ul>
                      )}
                    </div>
                  ))
                ) : (
                  <p>Conteúdo da prática não disponível no formato esperado.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </motion.div>
  );
};


const QuantumPracticesPage = ({ userSession }) => {
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const filteredPractices = useMemo(() => {
    if (filter === 'all') {
      return quantumPracticeTemplates;
    }
    return quantumPracticeTemplates.filter(p => (p.phase && p.phase.toString() === filter) || (p.category && p.category === filter));
  }, [filter, quantumPracticeTemplates]);
  
  const phases = useMemo(() => {
    const uniquePhases = [...new Set(quantumPracticeTemplates.map(p => p.phase).filter(p => p != null))].sort((a,b) => a-b);
    return uniquePhases;
  }, [quantumPracticeTemplates]);

  const categories = useMemo(() => {
     const uniqueCategories = [...new Set(quantumPracticeTemplates.map(p => p.category).filter(c => c != null))];
     return uniqueCategories.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }));
  }, [quantumPracticeTemplates]);


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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 md:p-8"
    >
      <header className="mb-10 text-center">
        <motion.h1 
          className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 sm:text-5xl lg:text-6xl mb-3"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Práticas Quânticas
        </motion.h1>
        <motion.p 
          className="text-lg text-slate-400 max-w-2xl mx-auto"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Explore um compêndio de técnicas e práticas para harmonização e bem-estar integral.
        </motion.p>
      </header>

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <Button 
            variant={filter === 'all' ? 'default': 'outline'} 
            onClick={() => setFilter('all')}
            className={`${filter === 'all' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'text-purple-300 border-purple-500 hover:bg-purple-500/20 hover:text-purple-200'}`}
        >
            Todas
        </Button>
        {phases.map(phase => (
            <Button 
                key={`phase-${phase}`}
                variant={filter === phase.toString() ? 'default': 'outline'} 
                onClick={() => setFilter(phase.toString())}
                className={`${filter === phase.toString() ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'text-purple-300 border-purple-500 hover:bg-purple-500/20 hover:text-purple-200'}`}
            >
                Fase {phase}
            </Button>
        ))}
        {categories.map(cat => (
             <Button 
                key={`cat-${cat.value}`}
                variant={filter === cat.value ? 'default': 'outline'} 
                onClick={() => setFilter(cat.value)}
                className={`${filter === cat.value ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'text-purple-300 border-purple-500 hover:bg-purple-500/20 hover:text-purple-200'}`}
            >
                {cat.label}
            </Button>
        ))}
      </div>

      {filteredPractices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPractices.map((practice, index) => (
            <PracticeCard key={practice.id || index} practice={practice} index={index} />
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Zap className="mx-auto h-16 w-16 text-purple-400 mb-4" />
          <p className="text-xl text-slate-300">Nenhuma prática encontrada para o filtro selecionado.</p>
          <p className="text-slate-500">Tente selecionar outros filtros ou "Todas" para ver mais opções.</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuantumPracticesPage;
