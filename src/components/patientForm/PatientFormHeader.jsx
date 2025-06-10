import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, UserPlus } from 'lucide-react';

const PatientFormHeader = ({ onBack }) => {
  return (
    <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-700 dark:from-purple-700 dark:to-indigo-800 text-white p-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={onBack}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <CardTitle className="text-2xl font-bold tracking-tight text-center flex-grow">
          Novo Paciente
        </CardTitle>
        <UserPlus className="h-8 w-8 opacity-70" />
      </div>
    </CardHeader>
  );
};

export default PatientFormHeader;