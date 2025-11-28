import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Anamnese from './pages/Anamnese';
import ListaCompras from './pages/ListaCompras';
import Receitas from './pages/Receitas';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          
          {/* Rotas Protegidas */}
          <Route path="/anamnese" element={
            <ProtectedRoute>
              <Anamnese />
            </ProtectedRoute>
          } />
          <Route path="/lista-compras" element={
            <ProtectedRoute>
              <ListaCompras />
            </ProtectedRoute>
          } />
          <Route path="/receitas" element={
            <ProtectedRoute>
              <Receitas />
            </ProtectedRoute>
          } />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;