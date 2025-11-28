import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { LogOut, User, ShoppingCart, Utensils, ClipboardList } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <nav className="bg-emerald-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold tracking-tight">NutriGuia 🥗</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/anamnese" className="hidden md:flex items-center hover:bg-emerald-700 px-3 py-2 rounded-md text-sm font-medium">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Novo Plano
                </Link>
                <Link to="/receitas" className="flex items-center hover:bg-emerald-700 px-3 py-2 rounded-md text-sm font-medium">
                  <Utensils className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Receitas</span>
                </Link>
                <Link to="/lista-compras" className="flex items-center hover:bg-emerald-700 px-3 py-2 rounded-md text-sm font-medium">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Lista</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center bg-emerald-800 hover:bg-emerald-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="hover:text-emerald-100 font-medium">Entrar</Link>
                <Link to="/cadastro" className="bg-white text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-md font-bold text-sm transition-colors shadow-sm">
                  Criar Conta
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;