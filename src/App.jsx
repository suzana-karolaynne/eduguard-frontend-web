import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';

import { Alunos } from './pages/Alunos';
import { Turmas } from './pages/Turmas';
import { Ponto } from './pages/Ponto';
import { Rotina } from './pages/Rotina';
import { Medicacao } from './pages/Medicacao';
import { Avisos } from './pages/Avisos';
import { Dashboard } from './pages/Dashboard';
import { Responsaveis } from './pages/Responsaveis';
import { Funcionarios } from './pages/Funcionarios';
import { Logs } from './pages/Logs';
import { Perfil } from './pages/Perfil';
import { Historico } from './pages/Historico';
import { ResponsavelPortal } from './pages/ResponsavelPortal';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/responsavel/portal" element={<ProtectedRoute allowedTypes={['responsavel']}><ResponsavelPortal /></ProtectedRoute>} />

          <Route path="/" element={<ProtectedRoute allowedTypes={['funcionario']}><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="alunos" element={<Alunos />} />
            <Route path="responsaveis" element={<Responsaveis />} />
            <Route path="equipe" element={<Funcionarios />} />
            <Route path="turmas" element={<Turmas />} />
            <Route path="ponto" element={<Ponto />} />
            <Route path="medicacao" element={<Medicacao />} />
            <Route path="rotina" element={<Rotina />} />
            <Route path="avisos" element={<Avisos />} />
            <Route path="historico" element={<Historico />} />
            <Route path="logs" element={<Logs />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
