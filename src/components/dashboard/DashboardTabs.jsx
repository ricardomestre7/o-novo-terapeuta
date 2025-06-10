import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Users as UsersIcon, Search as SearchIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import PatientList from '@/components/dashboard/PatientList';
import EmptyState from '@/components/dashboard/EmptyState';
import TherapistManagement from '@/components/dashboard/TherapistManagement'; 

const DashboardTabs = ({ 
  patients, 
  searchTerm, 
  setSearchTerm, 
  isLoading, 
  handlePatientAction, 
  handleNewPatient, 
  onTherapistUpdate 
}) => {
  return (
    <Tabs defaultValue="patients" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:w-1/2 lg:w-1/3 mx-auto bg-muted/50 backdrop-blur-sm">
        <TabsTrigger value="patients" className="text-base py-2.5">
          <UsersIcon className="mr-2 h-5 w-5" /> Pacientes
        </TabsTrigger>
        <TabsTrigger value="therapists" className="text-base py-2.5">
          <Settings className="mr-2 h-5 w-5" /> Terapeutas
        </TabsTrigger>
      </TabsList>
      <TabsContent value="patients" className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Lista de Pacientes</h2>
            <div className="relative w-full md:w-auto md:min-w-[300px]">
              <SearchIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar paciente ou terapeuta..."
                className="pl-12 pr-4 py-3 text-base rounded-full shadow-sm border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white dark:bg-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Carregando pacientes...</p>
            </div>
          ) : patients.length > 0 ? (
            <PatientList 
              patients={patients} 
              onPatientAction={handlePatientAction} 
            />
          ) : (
            <EmptyState 
              searchTerm={searchTerm} 
              onNewPatient={handleNewPatient} 
            />
          )}
        </motion.div>
      </TabsContent>
      <TabsContent value="therapists" className="mt-6">
         <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <TherapistManagement onTherapistUpdate={onTherapistUpdate} />
        </motion.div>
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;