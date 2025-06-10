import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button.jsx';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.jsx';
import { Label } from '@/components/ui/label.jsx';
import { ArrowLeft, ArrowRight, CheckCircle, Send } from 'lucide-react';

const QuantumQuestionnaire = ({
  category,
  questions,
  answers,
  onAnswerChange,
  onNextTab,
  onPrevTab,
  isFirstTab,
  isLastTab,
  onSubmit,
  isSubmitting,
  isFormComplete,
}) => {
  return (
    <motion.div
      key={category}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {questions.map((q, index) => (
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className="p-6 bg-slate-800/70 border border-slate-700 rounded-xl shadow-lg"
        >
          <Label htmlFor={q.id} className="text-lg font-semibold text-purple-300 block mb-4">
            {q.question}
          </Label>
          <RadioGroup
            id={q.id}
            value={answers[q.id] || ""}
            onValueChange={(value) => onAnswerChange(q.id, value)}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
          >
            {q.answerOptions.map((opt) => (
              <motion.div
                key={opt.value}
                whileHover={{ scale: 1.03 }}
                className="flex items-center"
              >
                <RadioGroupItem
                  value={opt.value}
                  id={`${q.id}-${opt.value}`}
                  className="peer hidden"
                />
                <Label
                  htmlFor={`${q.id}-${opt.value}`}
                  className={`flex flex-col items-center justify-center rounded-md border-2 border-slate-600 bg-slate-700/50 p-3
                              hover:bg-purple-500/30 hover:border-purple-500 hover:text-purple-200 
                              peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-600 peer-data-[state=checked]:text-white
                              transition-all duration-200 ease-in-out cursor-pointer w-full h-full text-sm text-slate-300 text-center`}
                >
                  {opt.label}
                </Label>
              </motion.div>
            ))}
          </RadioGroup>
        </motion.div>
      ))}

      <div className="flex justify-between items-center pt-6 border-t border-slate-700">
        <Button
          onClick={onPrevTab}
          disabled={isFirstTab || isSubmitting}
          variant="outline"
          className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-slate-900 px-6 py-3"
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> Anterior
        </Button>

        {!isLastTab && (
          <Button
            onClick={onNextTab}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3"
          >
            Próximo <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        )}

        {isLastTab && (
          <Button
            onClick={onSubmit}
            disabled={!isFormComplete || isSubmitting}
            className={`px-8 py-3 text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105
                        ${isFormComplete ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                                         : 'bg-slate-600 cursor-not-allowed'}`}
          >
            {isSubmitting ? (
              <motion.div className="flex items-center" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Send className="mr-2 h-5 w-5" /> Enviando...
              </motion.div>
            ) : (
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5" /> Concluir Análise
              </div>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default QuantumQuestionnaire;