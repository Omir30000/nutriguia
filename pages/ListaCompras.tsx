
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import { Download, ShoppingCart, FileText, Printer, CheckSquare, AlertCircle } from 'lucide-react';
import { DietPlan } from '../types';

const ListaCompras: React.FC = () => {
  const { user } = useAuth();
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDados = async () => {
      if (user) {
        try {
          // Compat Fetch
          const docRef = db.collection('users').doc(user.uid).collection('plano').doc('gerado');
          const docSnap = await docRef.get();

          if (docSnap.exists) {
            setDietPlan(docSnap.data() as DietPlan);
          }
        } catch (error) {
          console.error("Erro ao buscar lista:", error);
        }
        setLoading(false);
      }
    };

    fetchDados();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!dietPlan?.lista_compras_semana) return;
    
    const headers = "Item,Quantidade Estimada (kg),Quantidade Sugerida\n";
    const rows = dietPlan.lista_compras_semana.map(item => 
      `"${item.item}",${item.quantidade_kg || 0},"${item.quantidade_unidade || ''}"`
    ).join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lista_compras_nutriguia.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Navbar />
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        {dietPlan ? (
          <>
            {/* Cabeçalho do Plano */}
            <div className="bg-white shadow rounded-lg p-6 mb-8 border-l-4 border-emerald-500">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Resumo da Estratégia</h2>
              <p className="text-gray-700 mb-4">{dietPlan.resumo_nutricional}</p>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <span className="font-semibold text-emerald-800">Metas Macroscópicas:</span>
                <p className="text-gray-600">{dietPlan.macros_totais}</p>
              </div>
              
              {dietPlan.observacoes && (
                <div className="mt-4 text-sm text-gray-500 flex items-start">
                  <AlertCircle className="w-4 h-4 mr-1 mt-0.5" />
                  {dietPlan.observacoes}
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <ShoppingCart className="w-6 h-6 mr-2 text-emerald-600" />
                Lista Semanal
              </h2>
              <div className="flex space-x-2 no-print">
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  CSV
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  PDF / Imprimir
                </button>
              </div>
            </div>

            {/* Tabela de Compras */}
            {dietPlan.lista_compras_semana?.length > 0 ? (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">Check</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dietPlan.lista_compras_semana.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input type="checkbox" className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-medium">{item.item}</td>
                        <td className="px-6 py-4 text-gray-500">
                          {item.quantidade_unidade}
                          {item.quantidade_kg ? <span className="text-xs text-gray-400 ml-2">({item.quantidade_kg}kg)</span> : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded shadow">
                <p>Lista vazia ou formato inválido.</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-lg font-medium">Nenhum plano encontrado.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaCompras;
