
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import { gerarPlanoNutricional } from '../services/aiService';
import { AnamneseData } from '../types';

const Anamnese: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AnamneseData>({
    nome: user?.displayName || '',
    idade: '',
    peso: '',
    altura: '',
    genero: 'Masculino',
    objetivo: 'Perder peso',
    tempoObjetivo: '', // Novo campo obrigatório
    nivelAtividade: 'Sedentário',
    restricoes: '',
    preferencias: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.objetivo || !formData.tempoObjetivo) {
      alert("Por favor, preencha seu objetivo e o prazo desejado.");
      return;
    }

    setLoading(true);
    try {
      // 1. Salvar Anamnese (Compat)
      await db.collection('users').doc(user.uid).set({ anamnese: formData }, { merge: true });

      // 2. Gerar Plano via Google GenAI (Gemini)
      const dietPlanResult = await gerarPlanoNutricional(formData);

      // 3. Salvar Resultado (Compat)
      await db.collection('users').doc(user.uid).collection('plano').doc('gerado').set(dietPlanResult);

      navigate('/lista-compras');
    } catch (error) {
      console.error("Erro ao processar:", error);
      alert("Ocorreu um erro ao gerar seu plano. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {loading && <Loading message="Analisando seu perfil e gerando estratégias com Gemini..." />}
      
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="border-b border-gray-200 pb-5 mb-5">
            <h3 className="text-2xl font-bold leading-6 text-gray-900">Nova Anamnese</h3>
            <p className="mt-2 text-sm text-gray-500">
              Preencha seus dados para que a IA possa calcular sua dieta ideal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Campos Básicos */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Idade</label>
                <input required type="number" name="idade" value={formData.idade} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gênero</label>
                <select name="genero" value={formData.genero} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                  <option>Masculino</option>
                  <option>Feminino</option>
                  <option>Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                <input required type="number" step="0.1" name="peso" value={formData.peso} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Altura (cm)</label>
                <input required type="number" name="altura" value={formData.altura} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>

              {/* Objetivos (Novos Campos) */}
              <div className="md:col-span-2 bg-emerald-50 p-4 rounded-md border border-emerald-100">
                <h4 className="text-emerald-800 font-medium mb-3">Definição de Metas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-emerald-900">Objetivo Principal</label>
                    <select
                      required
                      name="objetivo"
                      value={formData.objetivo}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-emerald-300 rounded-md shadow-sm p-2 bg-white"
                    >
                      <option value="Perder peso">Perder peso</option>
                      <option value="Ganhar massa muscular">Ganhar massa muscular</option>
                      <option value="Manter peso">Manter peso</option>
                      <option value="Definição corporal">Definição corporal</option>
                      <option value="Reeducação alimentar">Reeducação alimentar</option>
                      <option value="Aumentar energia e disposição">Aumentar energia e disposição</option>
                      <option value="Melhora geral da saúde">Melhora geral da saúde</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-emerald-900">Prazo Desejado</label>
                    <input 
                      required 
                      type="text" 
                      name="tempoObjetivo" 
                      placeholder="Ex: 8 semanas" 
                      value={formData.tempoObjetivo} 
                      onChange={handleChange} 
                      className="mt-1 block w-full border border-emerald-300 rounded-md shadow-sm p-2" 
                    />
                  </div>
                </div>
              </div>

              {/* Atividade e Restrições */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Nível de Atividade</label>
                <select name="nivelAtividade" value={formData.nivelAtividade} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                  <option>Sedentário</option>
                  <option>Levemente Ativo</option>
                  <option>Moderadamente Ativo</option>
                  <option>Muito Ativo</option>
                  <option>Atleta Profissional</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Restrições / Alergias</label>
                <textarea name="restricoes" rows={2} value={formData.restricoes} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Ex: Intolerância à lactose..." />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Preferências Alimentares</label>
                <textarea name="preferencias" rows={2} value={formData.preferencias} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Ex: Prefiro peixe a carne vermelha..." />
              </div>
            </div>

            <div className="pt-5">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Gerar Plano Personalizado
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Anamnese;