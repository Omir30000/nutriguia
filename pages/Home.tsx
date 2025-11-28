import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Zap, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <main className="flex-grow bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Sua dieta planejada por</span>
              <span className="block text-emerald-600">Inteligência Artificial</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              O NutriGuia cria planos alimentares personalizados, listas de compras e receitas baseadas no seu perfil, objetivos e restrições. Simples, rápido e eficiente.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link to="/cadastro" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 md:py-4 md:text-lg md:px-10">
                  Criar Conta Grátis
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link to="/login" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-emerald-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                  Entrar
                </Link>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-24">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-emerald-500 rounded-md shadow-lg">
                        <Zap className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Rápido e Preciso</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Preencha sua anamnese em minutos e receba um plano completo gerado instantaneamente por nossa IA avançada.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-emerald-500 rounded-md shadow-lg">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Totalmente Personalizado</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Consideramos suas restrições, preferências e objetivos (hipertrofia, emagrecimento, saúde) para criar algo que funciona para você.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-emerald-500 rounded-md shadow-lg">
                        <Heart className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Foco na Saúde</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Receitas balanceadas e listas de compras organizadas para facilitar sua jornada rumo a uma vida mais saudável.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 NutriGuia. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;