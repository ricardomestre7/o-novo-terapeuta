
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, getSupabaseUser, isSupabaseConnected } from '@/lib/supabaseClient.jsx';
import { Zap } from 'lucide-react';

import LoginPage from '@/pages/auth/LoginPage.jsx';
import SignupPage from '@/pages/auth/SignupPage.jsx';
import DashboardPage from '@/pages/dashboard/DashboardPage.jsx';
import PatientDataFormPage from '@/pages/patient/PatientDataFormPage.jsx';
import ReportsPage from '@/pages/reports/ReportsPage.jsx';
import QuantumPracticesPage from '@/pages/practices/QuantumPracticesPage.jsx';
import QuantumAnalysisPage from '@/pages/quantum/QuantumAnalysisPage.jsx';
import ResultsPage from '@/pages/results/ResultsPage.jsx';

import AppLayout from '@/components/layout/AppLayout.jsx'; // Corrected: Uses AppLayout
import AnimatedPage from '@/components/layout/AnimatedPage.jsx';
import { useToast } from '@/components/ui/use-toast.js';

const ProtectedRoute = ({ isAuthenticated, redirectPath = '/login' }) => {
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />;
};

const App = () => {
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!isSupabaseConnected) {
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível conectar ao Supabase. Verifique as configurações.",
        variant: "destructive",
      });
      setIsLoadingAuth(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setIsAuthenticated(!!currentSession);
      } catch(error) {
        console.error("Error fetching initial session:", error);
        toast({ title: "Erro de Autenticação", description: "Não foi possível verificar a sessão.", variant: "destructive" });
      } finally {
        setIsLoadingAuth(false);
      }
    };

    fetchSession();

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setIsAuthenticated(!!currentSession);
        if (_event === 'SIGNED_OUT') {
           // No need to navigate here, ProtectedRoute will handle redirection if on a protected route
        }
        if (_event === 'USER_DELETED' || _event === 'USER_UPDATED') {
          // Could refresh user data here if needed
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, [toast]);


  const handleLogin = async (email, password) => {
    if (!isSupabaseConnected) {
      toast({ title: "Erro de Conexão", description: "Supabase não conectado.", variant: "destructive" });
      return false;
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Erro de Login", description: error.message || "E-mail ou senha inválidos.", variant: "destructive" });
        return false;
      }
      toast({ title: "Login bem-sucedido!", description: "Bem-vindo(a) de volta!", className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white" });
      return true;
    } catch (error) {
      toast({ title: "Erro de Login", description: "Ocorreu um erro inesperado.", variant: "destructive" });
      return false;
    }
  };

  const handleLogout = async () => {
    if (!isSupabaseConnected) {
      toast({ title: "Erro de Conexão", description: "Supabase não conectado.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Erro ao Sair", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Logout realizado.", description: "Até breve!", className: "bg-gradient-to-r from-blue-500 to-sky-600 text-white" });
      // Navigation is handled by ProtectedRoute
    }
  };

  const handleSignup = async (email, password, fullName) => {
    if (!isSupabaseConnected) {
      toast({ title: "Erro de Conexão", description: "Supabase não conectado.", variant: "destructive" });
      return false;
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) {
        toast({ title: "Erro de Cadastro", description: error.message, variant: "destructive" });
        return false;
      }
      if (data.user && data.user.identities && data.user.identities.length === 0) {
         toast({ title: "Verificação Necessária", description: "Usuário já existe. Por favor, faça login ou verifique seu e-mail se for um novo cadastro pendente.", variant: "default", className: "bg-gradient-to-r from-yellow-500 to-amber-600 text-black dark:text-white" });
         return false; 
      }
       if (data.session) { 
        toast({ title: "Cadastro realizado com sucesso!", description: "Bem-vindo(a) ao 5D Therapists!", className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white" });
      } else {
        
        toast({ title: "Verifique seu E-mail", description: "Enviamos um link de confirmação para o seu e-mail.", className: "bg-gradient-to-r from-blue-500 to-sky-600 text-white" });
      }
      return true;
    } catch (error) {
      toast({ title: "Erro de Cadastro", description: "Ocorreu um erro inesperado.", variant: "destructive" });
      return false;
    }
  };
  

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white quantum-background-pattern">
        <div className="flex flex-col items-center">
          <Zap className="h-16 w-16 text-purple-400 animate-pulse mb-4" />
          <p className="text-lg text-slate-300">Carregando o universo quântico...</p>
        </div>
      </div>
    );
  }

  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen text-gray-100 ${isAuthRoute ? '' : 'bg-slate-900 quantum-subtle-pattern'}`}
    >
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<AnimatedPage pageKey="login"><LoginPage onLogin={handleLogin} isAuthenticated={isAuthenticated} /></AnimatedPage>} />
          <Route path="/signup" element={<AnimatedPage pageKey="signup"><SignupPage onSignup={handleSignup} isAuthenticated={isAuthenticated} /></AnimatedPage>} />
          
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
            <Route element={<AppLayout onLogout={handleLogout} userSession={session} />}>
              <Route path="/" element={<AnimatedPage pageKey="dashboard"><DashboardPage userSession={session} /></AnimatedPage>} />
              <Route path="/collect-data" element={<AnimatedPage pageKey="collect-data"><PatientDataFormPage userSession={session} /></AnimatedPage>} />
              <Route path="/reports" element={<AnimatedPage pageKey="reports"><ReportsPage userSession={session} /></AnimatedPage>} />
              <Route path="/practices" element={<AnimatedPage pageKey="practices"><QuantumPracticesPage userSession={session}/></AnimatedPage>} />
              <Route path="/quantum-analysis/:patientId" element={<AnimatedPage pageKey="quantum-analysis"><QuantumAnalysisPage userSession={session} /></AnimatedPage>} />
              <Route path="/results/:patientId" element={<AnimatedPage pageKey="results"><ResultsPage userSession={session} /></AnimatedPage>} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
        </Routes>
      </AnimatePresence>
    </motion.div>
  );
};

export default App;
