
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import { Clock, ChefHat, Info, CheckCircle } from 'lucide-react';
import { DietPlan, Receita } from '../types';

const Receitas: React.FC = () => {
  const { user } = useAuth();
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceitas = async () => {
      if (user) {
        try {
          // Compat Fetch
          const docRef = db.collection('users').doc(user.uid).collection('plano').doc('gerado');
          const docSnap = await docRef.get();

          if (docSnap.exists) {
            const data = docSnap.data() as DietPlan;
            if (data.receitas_semana) {
              setReceitas(data.receitas_semana);
            }
          }
        } catch (error) {
          console.error("Erro ao buscar receitas:", error);
        }
        setLoading(false);
      }
    };

    fetchReceitas();
  }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Receitas da Semana</h2>
          <p className="mt-2 text-gray-600">Pratos planejados para atingir seus macros.</p>
        </div>

        {receitas.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            {receitas.map((receita, index) => (
              <div key={index} className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
                <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <ChefHat className="w-6 h-6 mr-2" />
                    {receita.titulo}
                  </h3>
                  <span className="bg-emerald-700 text-white text-xs px-2 py-1 rounded-full uppercase tracking-wide">
                    {receita.tipo_refeicao || "Refeição"}
                  </span>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Clock className="w-4 h-4 mr-1" />
                    Tempo estimado: {receita.tempo_minutos} minutos
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Ingredientes */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 border-b pb-2">Ingredientes</h4>
                      <ul className="space-y-2">
                        {receita.ingredientes?.map((ing, i) => (
                          <li key={i} className="flex items-start text-gray-700 text-sm">
                            <span className="w-2 h-2 mt-1.5 mr-2 bg-emerald-400 rounded-full flex-shrink-0"></span>
                            {ing}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Modo de Preparo */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 border-b pb-2">Modo de Preparo</h4>
                      <ol className="space-y-4">
                        {receita.modo_preparo?.map((passo, i) => (
                          <li key={i} className="flex">
                            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mr-3">
                              {i + 1}
                            </span>
                            <p className="text-gray-700 text-sm">{passo}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <Info className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhuma receita disponível</h3>
            <p className="mt-1 text-gray-500">Volte e gere um novo plano para ver as sugestões.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Receitas;
