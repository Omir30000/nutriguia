import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import { gerarPlanoComGroq } from '../services/groqApi';
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
    tempoObjetivo: '',
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
      // Salvar dados da Anamnese
      await db.collection('users').doc(user.uid).set({ anamnese: formData }, { merge: true });

      // Gerar Plano
      const planoGerado = await gerarPlanoComGroq(formData);

      // Salvar Plano (Garantindo que 'conteudo' e JSON estruturado sejam salvos)
      await db.collection('users').doc(user.uid).collection('plano').doc('gerado').set({
        ...planoGerado,
        uid: user.uid,
        updatedAt: new Date().toISOString()
      });

      navigate('/lista-compras');
    } catch (error) {
      console.error("Erro no fluxo de anamnese:", error);
      alert("Ocorreu um erro ao gerar seu plano. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {loading && <Loading message="A IA está montando sua dieta..." />}
      
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="border-b border-gray-200 pb-5 mb-5">
            <h3 className="text-2xl font-bold leading-6 text-gray-900">Anamnese Nutricional</h3>
            <p className="mt-2 text-sm text-gray-500">Inteligência Artificial personalizada para seu biotipo.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Idade</label>
                <input required type="number" name="idade" value={formData.idade} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gênero</label>
                <select name="genero" value={formData.genero} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border">
                  <option>Masculino</option>
                  <option>Feminino</option>
                  <option>Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                <input required type="number" step="0.1" name="peso" value={formData.peso} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Altura (cm)</label>
                <input required type="number" name="altura" value={formData.altura} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border" />
              </div>

              <div className="md:col-span-2 bg-emerald-50 p-4 rounded-md border border-emerald-100">
                <h4 className="text-emerald-800 font-medium mb-3">Seus Objetivos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-emerald-900">Objetivo Principal</label>
                    <select required name="objetivo" value={formData.objetivo} onChange={handleChange} className="mt-1 block w-full border-emerald-300 rounded-md shadow-sm p-2 bg-white border">
                      <option value="Perder peso">Perder peso</option>
                      <option value="Ganhar massa muscular">Ganhar massa muscular</option>
                      <option value="Manter peso">Manter peso</option>
                      <option value="Definição corporal">Definição corporal</option>
                      <option value="Reeducação alimentar">Reeducação alimentar</option>
                      <option value="Aumentar energia">Aumentar energia e disposição</option>
                      <option value="Saúde geral">Melhora geral da saúde</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-emerald-900">Prazo da Meta</label>
                    <input required type="text" name="tempoObjetivo" placeholder="Ex: 3 meses" value={formData.tempoObjetivo} onChange={handleChange} className="mt-1 block w-full border-emerald-300 rounded-md shadow-sm p-2 border" />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Nível de Atividade</label>
                <select name="nivelAtividade" value={formData.nivelAtividade} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border">
                  <option>Sedentário (Pouco ou nenhum exercício)</option>
                  <option>Levemente Ativo (Exercício 1-3 dias/semana)</option>
                  <option>Moderadamente Ativo (Exercício 3-5 dias/semana)</option>
                  <option>Muito Ativo (Exercício 6-7 dias/semana)</option>
                  <option>Atleta Profissional</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Restrições / Alergias</label>
                <textarea name="restricoes" rows={2} value={formData.restricoes} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="Ex: Não como carne de porco, sou intolerante a lactose..." />
              </div>
            </div>

            <div className="pt-5">
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                Gerar Plano com IA
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Anamnese;